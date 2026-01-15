import { query } from '../_generated/server';
import { ConvexError, v } from 'convex/values';

// ============================================================================
// GET CURRENT USER (by ID - passed from Next-Auth)
// ============================================================================

export const getCurrentUser = query({
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);

		if (!user) {
			return null;
		}

		return user;
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
	args: {
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		const user = await ctx.db.get(args.userId);

		if (!user) {
			throw new ConvexError('User not found');
		}

		// Get user's organizations
		const memberships = await ctx.db
			.query('orgMemberships')
			.withIndex('by_user', (q) => q.eq('userId', args.userId))
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
			user: {
				_id: user._id,
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				avatar: user.avatar,
				phone: user.phone,
				emailVerified: user.emailVerified,
				phoneVerified: user.phoneVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			organizations: organizations.filter((org) => org !== null),
		};
	},
});
