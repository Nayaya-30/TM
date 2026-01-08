import { query } from "../_generated/server";
import { ConvexError } from "convex/values";

// ============================================================================
// GET CURRENT USER
// ============================================================================

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return null;
    }

    const userId = identity.subject;
    const user = await ctx.db.get(userId);

    return user;
  },
});

// ============================================================================
// GET USER PROFILE
// ============================================================================

export const getProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    const userId = identity.subject;
    const user = await ctx.db.get(userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Get user's organizations
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
              organizationId: org._id,
              name: org.name,
              slug: org.slug,
              logo: org.logo,
              role: membership.role,
              joinedAt: membership.joinedAt,
            }
          : null;
      })
    );

    return {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      organizations: organizations.filter((org) => org !== null),
    };
  },
});