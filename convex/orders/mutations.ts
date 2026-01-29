import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { generateOrderNumber, getNextStage } from "../helpers/utils";
import { Id } from "../_generated/dataModel";

// ============================================================================
// CREATE ORDER
// ============================================================================

export const create = mutation({
	args: {
		dependantId: v.id("dependants"),
		styleId: v.optional(v.id("styles")),
		description: v.string(),
		estimatedDelivery: v.float64(),
		price: v.optional(v.float64()),
		notes: v.optional(v.string()),
		organizationId: v.id("organizations"), // ← NEW REQUIRED ARG: customer chooses tailor/business
	},
	handler: async (ctx, args) => {
		const { userId } = await getCurrentUserContext(ctx, { requireOrg: false });

		// Find or ensure customer profile exists
		let customer = await ctx.db
			.query("customers")
			.withIndex("by_user", (q) => q.eq("userId", userId))
			.first();

		if (!customer) {
			throw new ConvexError("Please complete your customer profile first");
		}

		// Validate the chosen organization exists
		const selectedOrg = await ctx.db.get(args.organizationId);
		if (!selectedOrg) {
			throw new ConvexError("Selected business/tailor not found");
		}

		let finalOrganizationId: Id<"organizations">;

		if (customer.organizationId) {
			if (customer.organizationId !== args.organizationId) {
				throw new ConvexError("Already associated with different org");
			}
			finalOrganizationId = customer.organizationId;
		} else {
			finalOrganizationId = args.organizationId;

			await ctx.db.patch(customer._id, { organizationId: finalOrganizationId });

			await ctx.db.insert("orgMemberships", {
				userId,
				organizationId: finalOrganizationId,
				role: "customer",
				invitedBy: undefined as any, // TS fix: schema allows Id<"users"> but undefined is ok at runtime
				inviteAccepted: true,
				joinedAt: Date.now(),
			});
		}

		// Validate dependant belongs to this customer
		const dependant = await ctx.db.get(args.dependantId);
		if (!dependant || dependant.customerId !== customer._id) {
			throw new ConvexError("Dependant not found or does not belong to you");
		}

		// Optional: validate style belongs to the org
		if (args.styleId) {
			const style = await ctx.db.get(args.styleId);
			if (!style || style.organizationId !== finalOrganizationId) {
				throw new ConvexError("Style not available for this business");
			}
		}

		// Validate future delivery date
		if (args.estimatedDelivery <= Date.now()) {
			throw new ConvexError("Estimated delivery must be in the future");
		}

		const now = Date.now();
		const orderNumber = generateOrderNumber();

		const orderId = await ctx.db.insert("orders", {
			organizationId: finalOrganizationId,
			customerId: customer._id,
			dependantId: args.dependantId,
			styleId: args.styleId,
			orderNumber,
			description: args.description,
			currentStage: "cutting",
			estimatedDelivery: args.estimatedDelivery,
			price: args.price,
			paid: false,
			notes: args.notes,
			createdBy: userId,
			createdAt: now,
			updatedAt: now,
		});

		// Audit log for order creation
		await ctx.db.insert("auditLogs", {
			organizationId: finalOrganizationId,
			userId,
			action: "create",
			resource: "order",
			resourceId: orderId,
			metadata: { orderNumber, customerId: customer._id, dependantId: args.dependantId },
			createdAt: now,
		});

		return { orderId, orderNumber };
	},
});

// ============================================================================
// UPDATE ORDER
// ============================================================================

export const update = mutation({
	args: {
		orderId: v.id("orders"),
		description: v.optional(v.string()),
		estimatedDelivery: v.optional(v.float64()),
		price: v.optional(v.float64()),
		paid: v.optional(v.boolean()),
		notes: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role } = await getCurrentUserContext(ctx);

		requirePermission(role, "orders", "update");

		const order = await ctx.db.get(args.orderId);

		if (!order) {
			throw new ConvexError("Order not found");
		}

		if (order.organizationId !== organizationId) {
			throw new ConvexError("Order belongs to different organization");
		}

		// Validate delivery date if provided
		if (args.estimatedDelivery && args.estimatedDelivery <= Date.now()) {
			throw new ConvexError("Estimated delivery must be in the future");
		}

		const updates: Record<string, unknown> = {
			updatedAt: Date.now(),
		};

		if (args.description !== undefined) updates.description = args.description;
		if (args.estimatedDelivery !== undefined) updates.estimatedDelivery = args.estimatedDelivery;
		if (args.price !== undefined) updates.price = args.price;
		if (args.paid !== undefined) updates.paid = args.paid;
		if (args.notes !== undefined) updates.notes = args.notes;

		await ctx.db.patch(args.orderId, updates);

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "update",
			resource: "order",
			resourceId: args.orderId,
			metadata: updates,
			createdAt: Date.now(),
		});

		return args.orderId;
	},
});

// ============================================================================
// UPDATE ORDER STAGE
// ============================================================================

export const updateStage = mutation({
	args: {
		orderId: v.id("orders"),
		newStage: v.union(
			v.literal("cutting"),
			v.literal("sewing"),
			v.literal("finishing"),
			v.literal("delivery")
		),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role } = await getCurrentUserContext(ctx);

		requirePermission(role, "orders", "update");

		const order = await ctx.db.get(args.orderId);

		if (!order) {
			throw new ConvexError("Order not found");
		}

		if (order.organizationId !== organizationId) {
			throw new ConvexError("Order belongs to different organization");
		}

		const now = Date.now();
		const updates: Record<string, unknown> = {
			currentStage: args.newStage,
			updatedAt: now,
		};

		// If moving to delivery, mark actual delivery time
		if (args.newStage === "delivery" && !order.actualDelivery) {
			updates.actualDelivery = now;
		}

		await ctx.db.patch(args.orderId, updates);

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "update",
			resource: "order_stage",
			resourceId: args.orderId,
			metadata: { oldStage: order.currentStage, newStage: args.newStage },
			createdAt: now,
		});

		return args.orderId;
	},
});

// ============================================================================
// ADVANCE ORDER TO NEXT STAGE
// ============================================================================

export const advanceStage = mutation({
	args: {
		orderId: v.id("orders"),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role } = await getCurrentUserContext(ctx);

		requirePermission(role, "orders", "update");

		const order = await ctx.db.get(args.orderId);

		if (!order) {
			throw new ConvexError("Order not found");
		}

		if (order.organizationId !== organizationId) {
			throw new ConvexError("Order belongs to different organization");
		}

		if (order.currentStage === "delivery") {
			throw new ConvexError("Order is already at final stage");
		}

		const nextStage = getNextStage(order.currentStage);

		if (!nextStage) {
			throw new ConvexError("Cannot advance stage");
		}

		const now = Date.now();
		const updates: Record<string, unknown> = {
			currentStage: nextStage,
			updatedAt: now,
		};

		// If moving to delivery, mark actual delivery time
		if (nextStage === "delivery") {
			updates.actualDelivery = now;
		}

		await ctx.db.patch(args.orderId, updates);

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "update",
			resource: "order_stage",
			resourceId: args.orderId,
			metadata: { oldStage: order.currentStage, newStage: nextStage },
			createdAt: now,
		});

		return args.orderId;
	},
});

// ============================================================================
// DELETE ORDER
// ============================================================================

export const remove = mutation({
	args: {
		orderId: v.id("orders"),
	},
	handler: async (ctx, args) => {
		const { userId, organizationId, role } = await getCurrentUserContext(ctx);

		requirePermission(role, "orders", "delete");

		const order = await ctx.db.get(args.orderId);

		if (!order) {
			throw new ConvexError("Order not found");
		}

		if (order.organizationId !== organizationId) {
			throw new ConvexError("Order belongs to different organization");
		}

		// Check if order has tasks
		const tasks = await ctx.db
			.query("tasks")
			.withIndex("by_order", (q) => q.eq("orderId", args.orderId))
			.first();

		if (tasks) {
			throw new ConvexError("Cannot delete order with existing tasks. Delete tasks first.");
		}

		await ctx.db.delete(args.orderId);

		// Create audit log
		await ctx.db.insert("auditLogs", {
			organizationId,
			userId,
			action: "delete",
			resource: "order",
			resourceId: args.orderId,
			metadata: { orderNumber: order.orderNumber },
			createdAt: Date.now(),
		});

		return args.orderId;
	},
});