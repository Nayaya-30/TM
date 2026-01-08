import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, hasPermission } from "../helpers/auth";

// ============================================================================
// LIST ORGANIZATION MEMBERS
// ============================================================================

export const list = query({
  args: {
    role: v.optional(
      v.union(
        v.literal("admin"),
        v.literal("manager"),
        v.literal("worker"),
        v.literal("customer")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

    // Check permissions
    if (!hasPermission(currentUserRole, "workers", "read")) {
      throw new ConvexError("Insufficient permissions to view members");
    }

    let membershipsQuery = ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId));

    const memberships = await membershipsQuery
      .filter((q) => q.eq(q.field("inviteAccepted"), true))
      .collect();

    // Filter by role if specified
    const filteredMemberships = args.role
      ? memberships.filter((m) => m.role === args.role)
      : memberships;

    // Fetch user details
    const membersWithDetails = await Promise.all(
      filteredMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        return {
          membershipId: membership._id,
          userId: membership.userId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          user: user
            ? {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
              }
            : null,
        };
      })
    );

    return membersWithDetails;
  },
});

// ============================================================================
// GET MEMBER DETAILS
// ============================================================================

export const get = query({
  args: {
    membershipId: v.id("orgMemberships"),
  },
  handler: async (ctx, args) => {
    const { organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

    const membership = await ctx.db.get(args.membershipId);

    if (!membership) {
      throw new ConvexError("Membership not found");
    }

    if (membership.organizationId !== organizationId) {
      throw new ConvexError("Membership belongs to different organization");
    }

    // Check permissions
    if (!hasPermission(currentUserRole, "workers", "read")) {
      throw new ConvexError("Insufficient permissions");
    }

    const user = await ctx.db.get(membership.userId);

    return {
      membershipId: membership._id,
      userId: membership.userId,
      role: membership.role,
      joinedAt: membership.joinedAt,
      invitedBy: membership.invitedBy,
      user: user
        ? {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            phone: user.phone,
          }
        : null,
    };
  },
});

// ============================================================================
// LIST WORKERS WITH STATS
// ============================================================================

export const listWorkersWithStats = query({
  handler: async (ctx) => {
    const { organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

    if (!hasPermission(currentUserRole, "workers", "read")) {
      throw new ConvexError("Insufficient permissions");
    }

    const workerMemberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), "worker"),
          q.eq(q.field("inviteAccepted"), true)
        )
      )
      .collect();

    const workersWithStats = await Promise.all(
      workerMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);

        // Get task stats
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_worker", (q) => q.eq("assignedTo", membership.userId))
          .collect();

        const activeTasks = allTasks.filter((t) => t.status !== "completed");
        const completedTasks = allTasks.filter((t) => t.status === "completed");
        const overdueTasks = allTasks.filter((t) => t.status === "overdue");

        // Calculate average rating
        const tasksWithRating = completedTasks.filter((t) => t.rating !== undefined);
        const averageRating =
          tasksWithRating.length > 0
            ? tasksWithRating.reduce((sum, t) => sum + (t.rating ?? 0), 0) /
              tasksWithRating.length
            : 0;

        return {
          membershipId: membership._id,
          userId: membership.userId,
          joinedAt: membership.joinedAt,
          user: user
            ? {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
              }
            : null,
          stats: {
            activeTasks: activeTasks.length,
            completedTasks: completedTasks.length,
            overdueTasks: overdueTasks.length,
            averageRating,
          },
        };
      })
    );

    return workersWithStats;
  },
});

// ============================================================================
// LIST PENDING INVITATIONS
// ============================================================================

export const listPendingInvites = query({
  handler: async (ctx) => {
    const { organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

    if (currentUserRole !== "admin" && currentUserRole !== "manager") {
      throw new ConvexError("Insufficient permissions");
    }

    const pendingMemberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("inviteAccepted"), false))
      .collect();

    const invitesWithDetails = await Promise.all(
      pendingMemberships.map(async (membership) => {
        const user = await ctx.db.get(membership.userId);
        const inviter = await ctx.db.get(membership.invitedBy);

        return {
          membershipId: membership._id,
          email: user?.email,
          role: membership.role,
          invitedAt: membership.joinedAt,
          invitedBy: inviter
            ? {
                firstName: inviter.firstName,
                lastName: inviter.lastName,
              }
            : null,
        };
      })
    );

    return invitesWithDetails;
  },
});