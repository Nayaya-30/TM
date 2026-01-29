import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { normalizePaginationLimit, isOverdue, isAlmostDue } from "../helpers/utils";

// ============================================================================
// LIST ORDERS
// ============================================================================

export const list = query({
  args: {
    stage: v.optional(
      v.union(
        v.literal("cutting"),
        v.literal("sewing"),
        v.literal("finishing"),
        v.literal("delivery")
      )
    ),
    customerId: v.optional(v.id("customers")),
    overdue: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "orders", "read");

    const limit = normalizePaginationLimit(args.limit);

    let ordersQuery = ctx.db
      .query("orders")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId!));

    // Filter by stage if provided
    if (args.stage) {
      ordersQuery = ctx.db
        .query("orders")
        .withIndex("by_org_stage", (q) =>
          q.eq("organizationId", organizationId!).eq("currentStage", args.stage!)
        );
    }

    let orders = await ordersQuery.order("desc").take(limit);

    // Filter by customer if provided
    if (args.customerId) {
      orders = orders.filter((o) => o.customerId === args.customerId);
    }

    // If customer role, only show their orders
    if (role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("organizationId"), organizationId!))
        .first();

      if (customer) {
        orders = orders.filter((o) => o.customerId === customer._id);
      } else {
        return [];
      }
    }

    // Filter overdue if requested
    if (args.overdue) {
      orders = orders.filter((o) => isOverdue(o.estimatedDelivery) && o.currentStage !== "delivery");
    }

    // Fetch related data
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const customer = await ctx.db.get(order.customerId);
        const dependant = await ctx.db.get(order.dependantId);
        const style = order.styleId ? await ctx.db.get(order.styleId) : null;

        // Get task count
        const taskCount = await ctx.db
          .query("tasks")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect()
          .then((tasks) => tasks.length);

        const completedTaskCount = await ctx.db
          .query("tasks")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .filter((q) => q.eq(q.field("status"), "completed"))
          .collect()
          .then((tasks) => tasks.length);

        return {
          ...order,
          customer: customer
            ? {
                firstName: customer.firstName,
                lastName: customer.lastName,
              }
            : null,
          dependant: dependant
            ? {
                firstName: dependant.firstName,
                lastName: dependant.lastName,
              }
            : null,
          style: style
            ? {
                name: style.name,
                images: style.images,
              }
            : null,
          isOverdue: isOverdue(order.estimatedDelivery) && order.currentStage !== "delivery",
          isAlmostDue: isAlmostDue(order.estimatedDelivery),
          taskStats: {
            total: taskCount,
            completed: completedTaskCount,
          },
        };
      })
    );

    return ordersWithDetails;
  },
});

// ============================================================================
// GET ORDER DETAILS
// ============================================================================

export const get = query({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new ConvexError("Order not found");
    }

    if (order.organizationId !== organizationId) {
      throw new ConvexError("Order belongs to different organization");
    }

    // Check access for customers
    if (role === "customer") {
      const customer = await ctx.db
        .query("customers")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("organizationId"), organizationId!))
        .first();

      if (!customer || customer._id !== order.customerId) {
        throw new ConvexError("Cannot view other customers' orders");
      }
    }

    // Workers cannot view order details (only tasks)
    if (role === "worker") {
      throw new ConvexError("Workers cannot view order details");
    }

    // Fetch related data
    const customer = await ctx.db.get(order.customerId);
    const dependant = await ctx.db.get(order.dependantId);
    const style = order.styleId ? await ctx.db.get(order.styleId) : null;
    const createdByUser = await ctx.db.get(order.createdBy);

    // Get tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();

    return {
      ...order,
      customer: customer
        ? {
            _id: customer._id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
          }
        : null,
      dependant: dependant
        ? {
            _id: dependant._id,
            firstName: dependant.firstName,
            lastName: dependant.lastName,
            gender: dependant.gender,
          }
        : null,
      style: style
        ? {
            _id: style._id,
            name: style.name,
            images: style.images,
            tags: style.tags,
          }
        : null,
      createdBy: createdByUser
        ? {
            firstName: createdByUser.firstName,
            lastName: createdByUser.lastName,
          }
        : null,
      tasks: tasks.map((t) => ({
        _id: t._id,
        name: t.name,
        stage: t.stage,
        status: t.status,
        deadline: t.deadline,
      })),
      isOverdue: isOverdue(order.estimatedDelivery) && order.currentStage !== "delivery",
      isAlmostDue: isAlmostDue(order.estimatedDelivery),
    };
  },
});

// ============================================================================
// GET CUSTOMER'S ORDERS
// ============================================================================

export const listMine = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "customer") {
      throw new ConvexError("Only customers can access this endpoint");
    }

    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("organizationId"), organizationId!))
      .first();

    if (!customer) {
      return [];
    }

    const limit = normalizePaginationLimit(args.limit);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_customer", (q) => q.eq("customerId", customer._id))
      .order("desc")
      .take(limit);

    // Fetch related data
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const dependant = await ctx.db.get(order.dependantId);
        const style = order.styleId ? await ctx.db.get(order.styleId) : null;

        return {
          ...order,
          dependant: dependant
            ? {
                firstName: dependant.firstName,
                lastName: dependant.lastName,
              }
            : null,
          style: style
            ? {
                name: style.name,
                images: style.images,
              }
            : null,
          isOverdue: isOverdue(order.estimatedDelivery) && order.currentStage !== "delivery",
          isAlmostDue: isAlmostDue(order.estimatedDelivery),
        };
      })
    );

    return ordersWithDetails;
  },
});

// ============================================================================
// GET ORDERS SUMMARY
// ============================================================================

export const getSummary = query({
  handler: async (ctx) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Insufficient permissions");
    }

    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId!))
      .collect();

    const active = allOrders.filter((o) => o.currentStage !== "delivery");
    const completed = allOrders.filter((o) => o.currentStage === "delivery");
    const overdue = active.filter((o) => isOverdue(o.estimatedDelivery));
    const almostDue = active.filter((o) => isAlmostDue(o.estimatedDelivery));

    const byStage = {
      cutting: allOrders.filter((o) => o.currentStage === "cutting").length,
      sewing: allOrders.filter((o) => o.currentStage === "sewing").length,
      finishing: allOrders.filter((o) => o.currentStage === "finishing").length,
      delivery: completed.length,
    };

    return {
      total: allOrders.length,
      active: active.length,
      completed: completed.length,
      overdue: overdue.length,
      almostDue: almostDue.length,
      byStage,
    };
  },
});