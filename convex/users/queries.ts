import { query } from '../_generated/server';
import { v } from 'convex/values';

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Look up user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    return user || null;
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first();
    return user || null;
  },
});

export const getProfile = query({
  args: {}, 
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    // Return null if not authenticated (instead of throwing error)
    if (!identity) {
      return null;
    }

    // Look up user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
      .first();

    if (!user) {
      return null;
    }

    // Get user's organization memberships
    const memberships = await ctx.db
      .query('orgMemberships')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .filter((q) => q.eq(q.field('inviteAccepted'), true))
      .collect();

    // Fetch organization details for each membership
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
      user,
      organizations: organizations.filter((org): org is NonNullable<typeof org> => org !== null),
    };
  },
});