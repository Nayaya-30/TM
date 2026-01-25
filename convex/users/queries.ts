import { query } from '../_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireUser } from './helpers';

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await getAuthUserId(ctx);
		if (!userId) return null;
		return await ctx.db.get(userId);
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
		const user = await requireUser(ctx);

		const memberships = await ctx.db
			.query('orgMemberships')
			.withIndex('by_user', (q) => q.eq('userId', user._id))
			.filter((q) => q.eq(q.field('inviteAccepted'), true))
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
			user,
			organizations: organizations.filter((org): org is NonNullable<typeof org> => org !== null),
		};
	},
});
