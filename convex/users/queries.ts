import { query } from '../_generated/server';
import { v } from 'convex/values';
import { Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from "../users/helpers";

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);

		if (!userId) return null;

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
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.filter((q) => q.eq(q.field('inviteAccepted'), true))
			.collect();

		const organizations = await Promise.all(
  memberships.map(async (membership) => {
    const org = await ctx.db.get(membership.organizationId!); // membership always has orgId
    if (!org) return null;
    return {
      organizationId: org._id,
      name: org.name,
      slug: org.slug,
      logo: org.logo ?? null,
      role: membership.role,
      joinedAt: membership.joinedAt,
    };
  })
);

return {
  user,
  organizations: organizations.filter((o): o is NonNullable<typeof o> => o !== null),
};
	},
});