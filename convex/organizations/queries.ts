import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";
import { Id } from "../_generated/dataModel";

// ============================================================================
// GET ORGANIZATION BY ID
// ============================================================================

export const get = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db.get(args.organizationId);
    
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    return org;
  },
});

// ============================================================================
// GET ORGANIZATION BY SLUG (PUBLIC)
// ============================================================================

export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!org) {
      throw new ConvexError("Organization not found");
    }

    return org;
  },
});

// ============================================================================
// LIST ALL ORGANIZATIONS (PUBLIC)
// ============================================================================

export const list = query({
  args: {
    verifiedOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let orgsQuery = ctx.db.query("organizations").withIndex("by_created");
    if (args.verifiedOnly) {
      orgsQuery = orgsQuery.filter((q) => q.eq(q.field("verified"), true));
    }
    const orgs = await orgsQuery.order("desc").take(args.limit ?? 50);

    return orgs.map((org) => ({
      _id: org._id,
      name: org.name,
      slug: org.slug,
      logo: org.logo,
      location: org.location,
      verified: org.verified,
      accentColor: org.accentColor,
    }));
  },
});

// ============================================================================
// GET CURRENT USER'S ORGANIZATION
// ============================================================================

export const getCurrent = query({
  handler: async (ctx) => {
    const { organizationId } = await getCurrentUserContext(ctx);
    
    const org = await ctx.db.get(organizationId);
    
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    return org;
  },
});

// ============================================================================
// GET USER'S ORGANIZATIONS
// ============================================================================

export const getUserOrganizations = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return [];
    }

    const userId = identity.subject as Id<"users">;

    const memberships = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("inviteAccepted"), true))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        return org
          ? {
              ...org,
              userRole: membership.role,
            }
          : null;
      })
    );

    return organizations.filter((org) => org !== null);
  },
});

// ============================================================================
// GET ORGANIZATION STATS
// ============================================================================

export const getStats = query({
  handler: async (ctx) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Insufficient permissions");
    }

    const [
      totalOrders,
      activeOrders,
      completedOrders,
      totalCustomers,
      totalWorkers,
      totalTasks,
      completedTasks,
    ] = await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect()
        .then((orders) => orders.length),
      ctx.db
        .query("orders")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .filter((q) => q.neq(q.field("currentStage"), "delivery"))
        .collect()
        .then((orders) => orders.length),
      ctx.db
        .query("orders")
        .withIndex("by_org_stage", (q) =>
          q.eq("organizationId", organizationId).eq("currentStage", "delivery")
        )
        .collect()
        .then((orders) => orders.length),
      ctx.db
        .query("customers")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect()
        .then((customers) => customers.length),
      ctx.db
        .query("orgMemberships")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .filter((q) => q.eq(q.field("role"), "worker"))
        .collect()
        .then((workers) => workers.length),
      ctx.db
        .query("tasks")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect()
        .then((tasks) => tasks.length),
      ctx.db
        .query("tasks")
        .withIndex("by_org_status", (q) =>
          q.eq("organizationId", organizationId).eq("status", "completed")
        )
        .collect()
        .then((tasks) => tasks.length),
    ]);

    return {
      orders: {
        total: totalOrders,
        active: activeOrders,
        completed: completedOrders,
      },
      customers: totalCustomers,
      workers: totalWorkers,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
      },
    };
  },
});
