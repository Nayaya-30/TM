import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";

// ============================================================================
// LIST MEASUREMENTS FOR DEPENDANT
// ============================================================================

export const listByDependant = query({
  args: {
    dependantId: v.id("dependants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx, { requireOrg: false });
    const organizationId = context.organizationId;
    const role = context.role ?? "customer"; // Default to customer if no role
    const userId = context.userId;

    const dependant = await ctx.db.get(args.dependantId);

    if (!dependant) {
      throw new ConvexError("Dependant not found");
    }

    if (dependant.organizationId && dependant.organizationId !== organizationId) {
      throw new ConvexError("Dependant belongs to different organization");
    }

    // Get customer to check ownership
    const customer = await ctx.db.get(dependant.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    // Customer can only view their own dependants' measurements
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers' measurements");
    }

    // Workers cannot view measurements
    if (role === "worker") {
      throw new ConvexError("Workers cannot view measurements");
    }

    const measurements = await ctx.db
      .query("measurements")
      .withIndex("by_dependant", (q) => q.eq("dependantId", args.dependantId))
      .order("desc")
      .take(args.limit ?? 10);

    // Get user details for who took the measurement
    const measurementsWithDetails = await Promise.all(
      measurements.map(async (measurement) => {
        const takenByUser = await ctx.db.get(measurement.takenBy);

        return {
          ...measurement,
          takenBy: takenByUser
            ? {
                userId: takenByUser._id,
                firstName: takenByUser.firstName,
                lastName: takenByUser.lastName,
              }
            : null,
        };
      })
    );

    return measurementsWithDetails;
  },
});

// ============================================================================
// GET MEASUREMENT DETAILS
// ============================================================================

export const get = query({
  args: {
    measurementId: v.id("measurements"),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx, { requireOrg: false });
    const organizationId = context.organizationId;
    const role = context.role ?? "customer";
    const userId = context.userId;

    const measurement = await ctx.db.get(args.measurementId);

    if (!measurement) {
      throw new ConvexError("Measurement not found");
    }

    if (measurement.organizationId && measurement.organizationId !== organizationId) {
      throw new ConvexError("Measurement belongs to different organization");
    }

    // Get dependant
    const dependant = await ctx.db.get(measurement.dependantId);

    if (!dependant) {
      throw new ConvexError("Dependant not found");
    }

    // Get customer to check ownership
    const customer = await ctx.db.get(dependant.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    // Customer can only view their own measurements
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers' measurements");
    }

    // Workers cannot view measurements
    if (role === "worker") {
      throw new ConvexError("Workers cannot view measurements");
    }

    // Get user details
    const takenByUser = await ctx.db.get(measurement.takenBy);

    return {
      ...measurement,
      takenBy: takenByUser
        ? {
            userId: takenByUser._id,
            firstName: takenByUser.firstName,
            lastName: takenByUser.lastName,
          }
        : null,
    };
  },
});

// ============================================================================
// GET LATEST MEASUREMENT FOR DEPENDANT
// ============================================================================

export const getLatest = query({
  args: {
    dependantId: v.id("dependants"),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx, { requireOrg: false });
    const organizationId = context.organizationId;
    const role = context.role ?? "customer";
    const userId = context.userId;

    const dependant = await ctx.db.get(args.dependantId);

    if (!dependant) {
      throw new ConvexError("Dependant not found");
    }

    if (dependant.organizationId && dependant.organizationId !== organizationId) {
      throw new ConvexError("Dependant belongs to different organization");
    }

    // Get customer to check ownership
    const customer = await ctx.db.get(dependant.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    // Customer can only view their own dependants' measurements
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers' measurements");
    }

    // Workers cannot view measurements
    if (role === "worker") {
      throw new ConvexError("Workers cannot view measurements");
    }

    const latestMeasurement = await ctx.db
      .query("measurements")
      .withIndex("by_dependant", (q) => q.eq("dependantId", args.dependantId))
      .order("desc")
      .first();

    if (!latestMeasurement) {
      return null;
    }

    // Get user details
    const takenByUser = await ctx.db.get(latestMeasurement.takenBy);

    return {
      ...latestMeasurement,
      takenBy: takenByUser
        ? {
            userId: takenByUser._id,
            firstName: takenByUser.firstName,
            lastName: takenByUser.lastName,
          }
        : null,
    };
  },
});