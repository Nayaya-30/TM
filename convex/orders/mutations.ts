import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { generateOrderNumber, getNextStage } from "../helpers/utils";

// ============================================================================
// CREATE ORDER
// ============================================================================

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    dependantId: v.id("dependants"),
    styleId: v.optional(v.id("styles")),
    description: v.string(),
    estimatedDelivery: v.float64(),
    price: v.optional(v.float64()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "orders", "create");

    // Validate customer
    const customer = await ctx.db.get(args.customerId);
    if (!customer || customer.organizationId !== organizationId) {
      throw new ConvexError("Customer not found");
    }

    // Validate dependant belongs to customer
    const dependant = await ctx.db.get(args.dependantId);
    if (!dependant || dependant.customerId !== args.customerId) {
      throw new ConvexError("Dependant not found or doesn't belong to customer");
    }

    // Validate style if provided
    if (args.styleId) {
      const style = await ctx.db.get(args.styleId);
      if (!style || style.organizationId !== organizationId) {
        throw new ConvexError("Style not found");
      }
    }

    // Validate delivery date is in the future
    if (args.estimatedDelivery <= Date.now()) {
      throw new ConvexError("Estimated delivery must be in the future");
    }

    const now = Date.now();
    const orderNumber = generateOrderNumber();

    const orderId = await ctx.db.insert("orders", {
      organizationId,
      customerId: args.customerId,
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

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "order",
      resourceId: orderId,
      metadata: { orderNumber, customerId: args.customerId },
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