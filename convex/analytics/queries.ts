import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requireFeatureAccess } from "../helpers/auth";
import { startOfDay, calculateAverageCompletionTime } from "../helpers/utils";
import { Id, Doc } from "../_generated/dataModel";

// ============================================================================
// GET ANALYTICS OVERVIEW
// ============================================================================

export const getOverview = query({
  handler: async (ctx) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    if (role !== "admin") {
      throw new ConvexError("Only admins can view analytics");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "analytics");

    const [orders, tasks, customers, workers] = await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect(),
      ctx.db
        .query("customers")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .collect(),
      ctx.db
        .query("orgMemberships")
        .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
        .filter((q) => q.eq(q.field("role"), "worker"))
        .collect(),
    ]);

    const completedOrders = orders.filter((o) => o.currentStage === "delivery");
    const activeOrders = orders.filter((o) => o.currentStage !== "delivery");
    const completedTasks = tasks.filter((t) => t.status === "completed");

    const avgCompletionTime = calculateAverageCompletionTime(completedOrders);

    return {
      orders: {
        total: orders.length,
        active: activeOrders.length,
        completed: completedOrders.length,
      },
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
      },
      customers: customers.length,
      workers: workers.length,
      avgCompletionTime,
    };
  },
});

// ============================================================================
// GET ORDERS TREND
// ============================================================================

export const getOrdersTrend = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    if (role !== "admin") {
      throw new ConvexError("Only admins can view analytics");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "analytics");

    const days = args.days ?? 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.gte(q.field("createdAt"), startDate))
      .collect();

    // Group by day
    const ordersByDay: Record<string, number> = {};

    for (const order of orders) {
      const dayStart = startOfDay(order.createdAt);
      const dateKey = new Date(dayStart).toISOString().split("T")[0];
      ordersByDay[dateKey] = (ordersByDay[dateKey] ?? 0) + 1;
    }

    // Convert to array format
    const trend = Object.entries(ordersByDay)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trend;
  },
});

// ============================================================================
// GET WORKER PRODUCTIVITY
// ============================================================================

export const getWorkerProductivity = query({
  handler: async (ctx) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    if (role !== "admin") {
      throw new ConvexError("Only admins can view analytics");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "analytics");

    const workers = await ctx.db
      .query("orgMemberships")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("role"), "worker"))
      .collect();

    const productivity = await Promise.all(
      workers.map(async (worker) => {
        const user = await ctx.db.get(worker.userId);
        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_worker", (q) => q.eq("assignedTo", worker.userId))
          .collect();

        const completedTasks = tasks.filter((t) => t.status === "completed");
        const tasksWithRating = completedTasks.filter((t) => t.rating !== undefined);
        const avgRating =
          tasksWithRating.length > 0
            ? tasksWithRating.reduce((sum, t) => sum + (t.rating ?? 0), 0) /
              tasksWithRating.length
            : 0;

        // Calculate average completion time
        const completionTimes = completedTasks
          .filter((t) => t.completedAt)
          .map((t) => t.completedAt! - t.createdAt);

        const avgCompletionTime =
          completionTimes.length > 0
            ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
            : 0;

        return {
          workerId: worker.userId,
          workerName: user
            ? `\( {user.firstName} \){user.lastName}`
            : "Unknown",
          totalTasks: tasks.length,
          completedTasks: completedTasks.length,
          avgRating,
          avgCompletionTime,
        };
      })
    );

    return productivity.sort((a, b) => b.completedTasks - a.completedTasks);
  },
});

// ============================================================================
// GET MATERIAL CONSUMPTION
// ============================================================================

export const getMaterialConsumption = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    if (role !== "admin") {
      throw new ConvexError("Only admins can view analytics");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "analytics");

    const days = args.days ?? 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const ledgerEntries = await ctx.db
      .query("materialLedger")
      .withIndex("by_created", (q) => q.eq("organizationId", organizationId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.eq(q.field("type"), "consumption")
        )
      )
      .collect();

    // Group by material
    const consumptionByMaterial: Record<Id<"materials">, number> = {};

    for (const entry of ledgerEntries) {
      const materialId = entry.materialId;
      consumptionByMaterial[materialId] =
        (consumptionByMaterial[materialId] ?? 0) + Math.abs(entry.quantity);
    }

    // Get material details
    const uniqueMaterialIds = new Set<Id<"materials">>(
      ledgerEntries.map((e) => e.materialId)
    );
    const consumption = await Promise.all(
      Array.from(uniqueMaterialIds).map(async (materialId: Id<"materials">) => {
        const material = await ctx.db.get(materialId);
        const quantity = consumptionByMaterial[materialId] ?? 0;
        return {
          materialId,
          materialName: material?.name ?? "Unknown",
          unit: material?.unit ?? "units",
          quantity,
        };
      })
    );

    return consumption.sort((a, b) => b.quantity - a.quantity);
  },
});

// ============================================================================
// GET REVENUE TREND (IF ENABLED)
// ============================================================================

export const getRevenueTrend = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    if (role !== "admin") {
      throw new ConvexError("Only admins can view analytics");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "analytics");

    const days = args.days ?? 30;
    const now = Date.now();
    const startDate = now - days * 24 * 60 * 60 * 1000;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), startDate),
          q.eq(q.field("paid"), true)
        )
      )
      .collect();

    // Group by day
    const revenueByDay: Record<string, number> = {};

    for (const order of orders) {
      if (order.price) {
        const dayStart = startOfDay(order.createdAt);
        const dateKey = new Date(dayStart).toISOString().split("T")[0];
        revenueByDay[dateKey] = (revenueByDay[dateKey] ?? 0) + order.price;
      }
    }

    // Convert to array format
    const trend = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({
        date,
        revenue,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trend;
  },
});