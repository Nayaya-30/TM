import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext } from "../helpers/auth";

// ============================================================================
// LIST DEPENDANTS FOR CUSTOMER
// ============================================================================

export const listByCustomer = query({
  args: {
    customerId: v.id("customers"),
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

    // Customer can only view their own dependants
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers' dependants");
    }

    // Workers cannot view dependants
    if (role === "worker") {
      throw new ConvexError("Workers cannot view dependants");
    }

    const dependants = await ctx.db
      .query("dependants")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    // Get measurement count for each dependant
    const dependantsWithCounts = await Promise.all(
      dependants.map(async (dependant) => {
        const measurementCount = await ctx.db
          .query("measurements")
          .withIndex("by_dependant", (q) => q.eq("dependantId", dependant._id))
          .collect()
          .then((measurements) => measurements.length);

        const orderCount = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("dependantId"), dependant._id))
          .collect()
          .then((orders) => orders.length);

        return {
          ...dependant,
          measurementCount,
          orderCount,
        };
      })
    );

    return dependantsWithCounts;
  },
});

// ============================================================================
// GET DEPENDANT DETAILS
// ============================================================================

export const get = query({
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

    // Customer can only view their own dependants
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers' dependants");
    }

    // Workers cannot view dependants
    if (role === "worker") {
      throw new ConvexError("Workers cannot view dependants");
    }

    return dependant;
  },
});

// ============================================================================
// LIST CURRENT CUSTOMER'S DEPENDANTS
// ============================================================================

export const listMine = query({
  handler: async (ctx) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "customer") {
      throw new ConvexError("Only customers can access this endpoint");
    }

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("organizationId"), organizationId))
      .first();

    if (!customer) {
      throw new ConvexError("Customer profile not found");
    }

    const dependants = await ctx.db
      .query("dependants")
      .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
      .collect();

    // Get counts for each dependant
    const dependantsWithCounts = await Promise.all(
      dependants.map(async (dependant) => {
        const measurementCount = await ctx.db
          .query("measurements")
          .withIndex("by_dependant", (q) => q.eq("dependantId", dependant._id))
          .collect()
          .then((measurements) => measurements.length);

        const orderCount = await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("dependantId"), dependant._id))
          .collect()
          .then((orders) => orders.length);

        return {
          ...dependant,
          measurementCount,
          orderCount,
        };
      })
    );

    return dependantsWithCounts;
  },
});