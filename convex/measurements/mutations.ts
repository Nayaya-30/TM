import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";

// ============================================================================
// CREATE MEASUREMENT
// ============================================================================

export const create = mutation({
  args: {
    dependantId: v.id("dependants"),
    measurements: v.record(v.string(), v.float64()),
    unit: v.union(v.literal("inches"), v.literal("cm")),
    notes: v.optional(v.string()),
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

    // Customers cannot take measurements (only view)
    if (role === "customer") {
      throw new ConvexError("Customers cannot take measurements");
    }

    // Workers cannot take measurements
    if (role === "worker") {
      throw new ConvexError("Workers cannot take measurements");
    }

    // Validate measurements (at least one measurement required)
    if (Object.keys(args.measurements).length === 0) {
      throw new ConvexError("At least one measurement is required");
    }

    // Validate all measurements are positive numbers
    for (const [key, value] of Object.entries(args.measurements)) {
      if (value <= 0) {
        throw new ConvexError(`Invalid measurement for ${key}: must be positive`);
      }
    }

    const now = Date.now();

    const measurementId = await ctx.db.insert("measurements", {
      dependantId: args.dependantId,
      organizationId,
      measurements: args.measurements,
      unit: args.unit,
      notes: args.notes,
      takenBy: userId,
      takenAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "measurement",
      resourceId: measurementId,
      metadata: { dependantId: args.dependantId, unit: args.unit },
      createdAt: now,
    });

    return measurementId;
  },
});

// ============================================================================
// UPDATE MEASUREMENT
// ============================================================================

export const update = mutation({
  args: {
    measurementId: v.id("measurements"),
    measurements: v.optional(v.record(v.string(), v.float64())),
    unit: v.optional(v.union(v.literal("inches"), v.literal("cm"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const measurement = await ctx.db.get(args.measurementId);

    if (!measurement) {
      throw new ConvexError("Measurement not found");
    }

    if (measurement.organizationId !== organizationId) {
      throw new ConvexError("Measurement belongs to different organization");
    }

    // Customers cannot update measurements
    if (role === "customer") {
      throw new ConvexError("Customers cannot update measurements");
    }

    // Workers cannot update measurements
    if (role === "worker") {
      throw new ConvexError("Workers cannot update measurements");
    }

    // Validate measurements if provided
    if (args.measurements) {
      if (Object.keys(args.measurements).length === 0) {
        throw new ConvexError("At least one measurement is required");
      }

      for (const [key, value] of Object.entries(args.measurements)) {
        if (value <= 0) {
          throw new ConvexError(`Invalid measurement for ${key}: must be positive`);
        }
      }
    }

    const updates: Record<string, unknown> = {};

    if (args.measurements !== undefined) updates.measurements = args.measurements;
    if (args.unit !== undefined) updates.unit = args.unit;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.measurementId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "measurement",
      resourceId: args.measurementId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.measurementId;
  },
});

// ============================================================================
// DELETE MEASUREMENT
// ============================================================================

export const remove = mutation({
  args: {
    measurementId: v.id("measurements"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const measurement = await ctx.db.get(args.measurementId);

    if (!measurement) {
      throw new ConvexError("Measurement not found");
    }

    if (measurement.organizationId !== organizationId) {
      throw new ConvexError("Measurement belongs to different organization");
    }

    // Only admins can delete measurements
    if (role !== "admin") {
      throw new ConvexError("Only admins can delete measurements");
    }

    await ctx.db.delete(args.measurementId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "measurement",
      resourceId: args.measurementId,
      createdAt: Date.now(),
    });

    return args.measurementId;
  },
});