import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, hasPermission } from "../helpers/auth";
import { Id } from "../_generated/dataModel";
import { generateInviteToken, isValidEmail } from "../helpers/utils";
import { requireUser } from "../users/helpers";

// ============================================================================
// INVITE USER TO ORGANIZATION
// ============================================================================

export const invite = mutation({
	args: {
		email: v.string(),
		role: v.union(
			v.literal("admin"),
			v.literal("manager"),
			v.literal("worker"),
			v.literal("customer")
		),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new ConvexError("Unauthenticated");
		}
		
		const { userId, organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

		// Check permissions
		if (!hasPermission(currentUserRole, "workers", "create")) {
			throw new ConvexError("Insufficient permissions to invite users");
		}

		// Validate email
		if (!isValidEmail(args.email)) {
			throw new ConvexError("Invalid email address");
		}

		// Check if user already exists
		const existingUser = await ctx.db
			.query("users")
			.filter((q) => q.eq(q.field("email"), args.email))
			.first();

		// Check if already a member
		if (existingUser) {
			const existingMembership = await ctx.db
				.query("orgMemberships")
				.withIndex("by_user_org", (q) =>
					q.eq("userId", existingUser._id).eq("organizationId", organizationId)
				)
				.first();

			if (existingMembership) {
				throw new ConvexError("User is already a member of this organization");
			}
		}

		const inviteToken = generateInviteToken();
		const now = Date.now();

		let targetUserId = existingUser?._id;

		// If user doesn't exist, create a placeholder
		if (!existingUser) {
			targetUserId = await ctx.db.insert("users", {
				email: args.email,
				firstName: "",
				lastName: "",
				emailVerified: false,
				phoneVerified: false,
				createdAt: now,
				updatedAt: now,
			});
		}

		// Create membership with pending invite
		const membershipId = await ctx.db.insert("orgMemberships", {
			userId: targetUserId!,
			organizationId,
			role: args.role,
			invitedBy: userId,
			inviteAccepted: false,
			inviteToken,
			joinedAt: now,
		});

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "create",
			resource: "invitation",
			resourceId: membershipId,
			metadata: { email: args.email, role: args.role },
			createdAt: now,
		});

		// TODO: Send email with invite token
		// await sendInviteEmail(args.email, inviteToken, organizationId);

		return { membershipId, inviteToken };
	},
});

// ============================================================================
// ACCEPT INVITATION
// ============================================================================

export const acceptInvite = mutation({
	args: {
		inviteToken: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();

		if (!identity) {
			throw new ConvexError("Unauthenticated");
		}

		const user = await requireUser(ctx);
		const userId = user._id;

		const membership = await ctx.db
			.query("orgMemberships")
			.withIndex("by_invite_token", (q) => q.eq("inviteToken", args.inviteToken))
			.first();

		if (!membership) {
			throw new ConvexError("Invalid invite token");
		}

		if (membership.inviteAccepted) {
			throw new ConvexError("Invitation already accepted");
		}

		// Update membership
		await ctx.db.patch(membership._id, {
			userId,
			inviteAccepted: true,
			joinedAt: Date.now(),
		});

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId: membership.organizationId,
			userId,
			action: "update",
			resource: "invitation",
			resourceId: membership._id,
			metadata: { accepted: true },
			createdAt: Date.now(),
		});

		return membership.organizationId;
	},
});

// ============================================================================
// UPDATE MEMBER ROLE
// ============================================================================

export const updateRole = mutation({
	args: {
		membershipId: v.id("orgMemberships"),
		newRole: v.union(
			v.literal("admin"),
			v.literal("manager"),
			v.literal("worker"),
			v.literal("customer")
		),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

		// Only admin can change roles
		if (currentUserRole !== "admin") {
			throw new ConvexError("Only admins can change user roles");
		}

		const membership = await ctx.db.get(args.membershipId);

		if (!membership) {
			throw new ConvexError("Membership not found");
		}

		if (membership.organizationId !== organizationId) {
			throw new ConvexError("Membership belongs to different organization");
		}

		await ctx.db.patch(args.membershipId, {
			role: args.newRole,
		});

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "update",
			resource: "membership_role",
			resourceId: args.membershipId,
			metadata: { oldRole: membership.role, newRole: args.newRole },
			createdAt: Date.now(),
		});

		return args.membershipId;
	},
});

// ============================================================================
// REMOVE MEMBER
// ============================================================================

export const remove = mutation({
	args: {
		membershipId: v.id("orgMemberships"),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role: currentUserRole } = await getCurrentUserContext(ctx);

		// Only admin can remove members
		if (currentUserRole !== "admin") {
			throw new ConvexError("Only admins can remove members");
		}

		const membership = await ctx.db.get(args.membershipId);

		if (!membership) {
			throw new ConvexError("Membership not found");
		}

		if (membership.organizationId !== organizationId) {
			throw new ConvexError("Membership belongs to different organization");
		}

		// Cannot remove yourself if you're the only admin
		if (membership.userId === userId && membership.role === "admin") {
			const adminCount = await ctx.db
				.query("orgMemberships")
				.withIndex("by_org", (q) => q.eq("organizationId", organizationId))
				.filter((q) => q.eq(q.field("role"), "admin"))
				.collect();

			if (adminCount.length === 1) {
				throw new ConvexError("Cannot remove the last admin");
			}
		}

		await ctx.db.delete(args.membershipId);

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "delete",
			resource: "membership",
			resourceId: args.membershipId,
			metadata: { removedUserId: membership.userId, role: membership.role },
			createdAt: Date.now(),
		});

		return args.membershipId;
	},
});
