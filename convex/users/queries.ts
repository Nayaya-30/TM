import { query } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";


export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return null; // <-- exit early if no user

		// Now TypeScript knows userId is Id<"users">, not null
		const user = await ctx.db.get(userId);
		return user;
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
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    const memberships = await ctx.db
      .query('orgMemberships')
      .withIndex('by_user', (q) => q.eq('userId', user._id)) // ✅ no cast
      .filter((q) => q.eq(q.field('inviteAccepted'), true))
      .collect();

    const organizations = await Promise.all(
      memberships.map(async (membership) => {
        const org = await ctx.db.get(membership.organizationId);
        if (!org) return null;
        return {
          organizationId: org._id,
          name: org.name,
          slug: org.slug,
          logo: org.logo,
          role: membership.role,
          joinedAt: membership.joinedAt,
        };
      })
    );

    return {
      user,
      organizations: organizations.filter(Boolean),
    };
  },
});