import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { Id } from "../_generated/dataModel";
import { generateInviteToken, isValidEmail, isValidPhone } from "../helpers/utils";

// ============================================================================
// CREATE CUSTOMER (WITH OR WITHOUT PLATFORM ACCOUNT)
// ============================================================================

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    sendInvite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "customers", "create");

    // Validate email if provided
    if (args.email && !isValidEmail(args.email)) {
      throw new ConvexError("Invalid email address");
    }

    // Validate phone if provided
    if (args.phone && !isValidPhone(args.phone)) {
      throw new ConvexError("Invalid phone number");
    }

    // Check for duplicate email in this org
    if (args.email) {
      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_org_email", (q) =>
          q.eq("organizationId", organizationId).eq("email", args.email!)
        )
        .first();

      if (existingCustomer) {
        throw new ConvexError("Customer with this email already exists");
      }
    }

    const now = Date.now();
    const inviteToken = args.sendInvite ? generateInviteToken() : undefined;

    // Check if user with this email already has a platform account
    let platformUserId: Id<"users"> | undefined = undefined;
    if (args.email) {
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email!))
        .first();

      if (existingUser) {
        platformUserId = existingUser._id;
      }
    }

    const customerId = await ctx.db.insert("customers", {
      organizationId,
      userId: platformUserId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      inviteToken,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // If user already has platform account, create customer role membership
    if (platformUserId) {
      const existingMembership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", platformUserId).eq("organizationId", organizationId)
        )
        .first();

      if (!existingMembership) {
        await ctx.db.insert("orgMemberships", {
          userId: platformUserId,
          organizationId,
          role: "customer",
          invitedBy: userId,
          inviteAccepted: true,
          joinedAt: now,
        });
      }
    }

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "customer",
      resourceId: customerId,
      metadata: { 
        hasAccount: !!platformUserId,
        inviteSent: !!inviteToken 
      },
      createdAt: now,
    });

    // TODO: Send invite email if requested
    // if (args.sendInvite && args.email && inviteToken) {
    //   await sendCustomerInvite(args.email, inviteToken, organizationId);
    // }

    return { customerId, inviteToken };
  },
});

// ============================================================================
// UPDATE CUSTOMER
// ============================================================================

export const update = mutation({
  args: {
    customerId: v.id("customers"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "customers", "update");

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    if (customer.organizationId !== organizationId) {
      throw new ConvexError("Customer belongs to different organization");
    }

    // Validate email if provided
    if (args.email && !isValidEmail(args.email)) {
      throw new ConvexError("Invalid email address");
    }

    // Validate phone if provided
    if (args.phone && !isValidPhone(args.phone)) {
      throw new ConvexError("Invalid phone number");
    }

    // Check for duplicate email if changing
    if (args.email && args.email !== customer.email) {
      const existingCustomer = await ctx.db
        .query("customers")
        .withIndex("by_org_email", (q) =>
          q.eq("organizationId", organizationId).eq("email", args.email!)
        )
        .first();

      if (existingCustomer && existingCustomer._id !== args.customerId) {
        throw new ConvexError("Another customer with this email already exists");
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.email !== undefined) updates.email = args.email;
    if (args.phone !== undefined) updates.phone = args.phone;

    await ctx.db.patch(args.customerId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "customer",
      resourceId: args.customerId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.customerId;
  },
});

// ============================================================================
// CLAIM CUSTOMER ACCOUNT
// ============================================================================

export const claimAccount = mutation({
  args: {
    inviteToken: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    const userId = identity.subject as Id<"users">;

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_invite_token", (q) => q.eq("inviteToken", args.inviteToken))
      .first();

    if (!customer) {
      throw new ConvexError("Invalid invite token");
    }

    if (customer.userId) {
      throw new ConvexError("Customer account already claimed");
    }

    const now = Date.now();

    // Link customer to user account
    await ctx.db.patch(customer._id, {
      userId,
      claimedAt: now,
      updatedAt: now,
    });

    // Create customer membership if doesn't exist
    const existingMembership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", userId).eq("organizationId", customer.organizationId)
      )
      .first();

    if (!existingMembership) {
      await ctx.db.insert("orgMemberships", {
        userId,
        organizationId: customer.organizationId,
        role: "customer",
        invitedBy: customer.createdBy,
        inviteAccepted: true,
        joinedAt: now,
      });
    }

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId: customer.organizationId,
      userId,
      action: "update",
      resource: "customer_claim",
      resourceId: customer._id,
      createdAt: now,
    });

    return {
      customerId: customer._id,
      organizationId: customer.organizationId,
    };
  },
});

// ============================================================================
// DELETE CUSTOMER
// ============================================================================

export const remove = mutation({
  args: {
    customerId: v.id("customers"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "customers", "delete");

    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new ConvexError("Customer not found");
    }

    if (customer.organizationId !== organizationId) {
      throw new ConvexError("Customer belongs to different organization");
    }

    // Check if customer has orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first();

    if (orders) {
      throw new ConvexError("Cannot delete customer with existing orders");
    }

    // Delete customer's dependants first
    const dependants = await ctx.db
      .query("dependants")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    for (const dependant of dependants) {
      // Delete measurements for each dependant
      const measurements = await ctx.db
        .query("measurements")
        .withIndex("by_dependant", (q) => q.eq("dependantId", dependant._id))
        .collect();

      for (const measurement of measurements) {
        await ctx.db.delete(measurement._id);
      }

      await ctx.db.delete(dependant._id);
    }

    await ctx.db.delete(args.customerId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "customer",
      resourceId: args.customerId,
      createdAt: Date.now(),
    });

    return args.customerId;
  },
});
