import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";

// ============================================================================
// CREATE DEPENDANT
// ============================================================================

export const create = mutation({
  args: {
    customerId: v.id("customers"),
    firstName: v.string(),
    lastName: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    dateOfBirth: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    if (customer.organizationId !== organizationId) {
      throw new ConvexError("Customer belongs to different organization");
    }

    // Customer can only create dependants for themselves
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot create dependants for other customers");
    }

    // Workers cannot create dependants
    if (role === "worker") {
      throw new ConvexError("Workers cannot create dependants");
    }

    const now = Date.now();

    const dependantId = await ctx.db.insert("dependants", {
      customerId: args.customerId,
      organizationId,
      firstName: args.firstName,
      lastName: args.lastName,
      gender: args.gender,
      dateOfBirth: args.dateOfBirth,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "dependant",
      resourceId: dependantId,
      metadata: { customerId: args.customerId },
      createdAt: now,
    });

    return dependantId;
  },
});

// ============================================================================
// UPDATE DEPENDANT
// ============================================================================

export const update = mutation({
  args: {
    dependantId: v.id("dependants"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    gender: v.optional(v.union(v.literal("male"), v.literal("female"), v.literal("other"))),
    dateOfBirth: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const dependant = await ctx.db.get(args.dependantId);

    if (!dependant) {
      throw new ConvexError("Dependant not found");
    }

    if (dependant.organizationId !== organizationId) {
      throw new ConvexError("Dependant belongs to different organization");
    }

    // Get customer to check ownership
    const customer = await ctx.db.get(dependant.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    // Customer can only update their own dependants
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot update other customers' dependants");
    }

    // Workers cannot update dependants
    if (role === "worker") {
      throw new ConvexError("Workers cannot update dependants");
    }

    const updates: Record<string, unknown> = {};

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.gender !== undefined) updates.gender = args.gender;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;

    await ctx.db.patch(args.dependantId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "dependant",
      resourceId: args.dependantId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.dependantId;
  },
});

// ============================================================================
// DELETE DEPENDANT
// ============================================================================

export const remove = mutation({
  args: {
    dependantId: v.id("dependants"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const dependant = await ctx.db.get(args.dependantId);

    if (!dependant) {
      throw new ConvexError("Dependant not found");
    }

    if (dependant.organizationId !== organizationId) {
      throw new ConvexError("Dependant belongs to different organization");
    }

    // Get customer to check ownership
    const customer = await ctx.db.get(dependant.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    // Customer can only delete their own dependants
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot delete other customers' dependants");
    }

    // Workers cannot delete dependants
    if (role === "worker") {
      throw new ConvexError("Workers cannot delete dependants");
    }

    // Check if dependant has orders
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("dependantId"), args.dependantId))
      .first();

    if (orders) {
      throw new ConvexError("Cannot delete dependant with existing orders");
    }

    // Delete measurements first
    const measurements = await ctx.db
      .query("measurements")
      .withIndex("by_dependant", (q) => q.eq("dependantId", args.dependantId))
      .collect();

    for (const measurement of measurements) {
      await ctx.db.delete(measurement._id);
    }

    await ctx.db.delete(args.dependantId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "dependant",
      resourceId: args.dependantId,
      createdAt: Date.now(),
    });

    return args.dependantId;
  },
});