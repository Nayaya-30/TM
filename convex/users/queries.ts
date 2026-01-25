import { query } from '../_generated/server';
import { ConvexError, v } from 'convex/values';
import { requireUser } from './helpers';

// ============================================================================
// GET CURRENT USER (by ID - passed from Next-Auth)
// ============================================================================

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const userId = await ctx.auth.getUserId();
		if (!userId) return null;
		return await ctx.db.get(userId);
	},
});

// ============================================================================
// GET USER BY EMAIL
// ============================================================================

export const getUserByEmail = query({
	args: {
		email: v.string(),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first();

		return user || null;
	},
});

// ============================================================================
// GET USER PROFILE (by ID - passed from Next-Auth)
// ============================================================================

export const getProfile = query({
	args: {}, // Removed args.userId
	handler: async (ctx) => {
		const user = await requireUser(ctx); // Use the helper!

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