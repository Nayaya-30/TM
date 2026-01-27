import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { normalizePaginationLimit } from "../helpers/utils";

// ============================================================================
// LIST CUSTOMERS
// ============================================================================

export const list = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "customers", "read");

    const limit = normalizePaginationLimit(args.limit);

    const customers = await ctx.db
      .query("customers")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .take(limit);

    // Filter by search if provided
    let filteredCustomers = customers;
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredCustomers = customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(searchLower) ||
          c.lastName.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower) ||
          c.phone?.includes(args.search!)
      );
    }

    // Fetch user details for customers with accounts
    const customersWithDetails = await Promise.all(
      filteredCustomers.map(async (customer) => {
        const user = customer.userId ? await ctx.db.get(customer.userId) : null;

        // Count orders
        const orderCount = await ctx.db
          .query("orders")
          .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
          .collect()
          .then((orders) => orders.length);

        // Count dependants
        const dependantCount = await ctx.db
          .query("dependants")
          .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
          .collect()
          .then((deps) => deps.length);

        return {
          _id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          hasAccount: !!customer.userId,
          claimed: !!customer.claimedAt,
          user: user
            ? {
                image: user.image,
                emailVerified: user.emailVerified,
              }
            : null,
          orderCount,
          dependantCount,
          createdAt: customer.createdAt,
        };
      })
    );

    return customersWithDetails;
  },
});

// ============================================================================
// GET CUSTOMER DETAILS
// ============================================================================

export const get = query({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const { organizationId, role, userId } = await getCurrentUserContext(ctx);

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    if (customer.organizationId !== organizationId) {
      throw new ConvexError("Customer belongs to different organization");
    }

    // Customer can only view their own profile
    if (role === "customer" && customer.userId !== userId) {
      throw new ConvexError("Cannot view other customers");
    }

    // Workers cannot view customers
    if (role === "worker") {
      throw new ConvexError("Workers cannot view customer details");
    }

    const user = customer.userId ? await ctx.db.get(customer.userId) : null;

    return {
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      hasAccount: !!customer.userId,
      claimed: !!customer.claimedAt,
      claimedAt: customer.claimedAt,
      user: user
        ? {
            image: user.image,
            emailVerified: user.emailVerified,
            phoneVerified: user.phoneVerified,
          }
        : null,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  },
});

// ============================================================================
// GET CURRENT USER'S CUSTOMER PROFILE
// ============================================================================

export const getCurrentCustomer = query({
  handler: async (ctx) => {
    const { organizationId, userId, role } = await getCurrentUserContext(ctx);

    if (role !== "customer") {
      throw new ConvexError("Not a customer");
    }

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("organizationId"), organizationId))
      .first();

    if (!customer) {
      throw new ConvexError("Customer profile not found");
    }

    return customer;
  },
});

// ============================================================================
// GET CUSTOMER BY INVITE TOKEN
// ============================================================================

export const getByInviteToken = query({
  args: {
    inviteToken: v.string(),
  },
  handler: async (ctx, args) => {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.inviteToken))
      .first();

    if (!customer) {
      return null;
    }

    const org = await ctx.db.get(customer.organizationId);

    return {
      customerId: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      organization: org
        ? {
            name: org.name,
            logo: org.logo,
            verified: org.verified,
          }
        : null,
      alreadyClaimed: !!customer.userId,
    };
  },
});