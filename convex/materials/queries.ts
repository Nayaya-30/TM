import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { normalizePaginationLimit } from "../helpers/utils";
import { Id } from "../_generated/dataModel";

// ============================================================================
// LIST MATERIALS
// ============================================================================

export const list = query({
  args: {
    lowStock: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "read");

    const limit = normalizePaginationLimit(args.limit);

    let materials = await ctx.db
      .query("materials")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .order("desc")
      .take(limit);

    // Filter low stock if requested
    if (args.lowStock) {
      materials = materials.filter((m) => m.quantityOnHand <= m.reorderLevel);
    }

    return materials.map((material) => ({
      ...material,
      needsReorder: material.quantityOnHand <= material.reorderLevel,
      stockStatus:
        material.quantityOnHand === 0
          ? "out_of_stock"
          : material.quantityOnHand <= material.reorderLevel
          ? "low_stock"
          : "in_stock",
    }));
  },
});

// ============================================================================
// GET MATERIAL DETAILS
// ============================================================================

export const get = query({
  args: {
    materialId: v.id("materials"),
  },
  handler: async (ctx, args) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "read");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    return {
      ...material,
      needsReorder: material.quantityOnHand <= material.reorderLevel,
      stockStatus:
        material.quantityOnHand === 0
          ? "out_of_stock"
          : material.quantityOnHand <= material.reorderLevel
          ? "low_stock"
          : "in_stock",
    };
  },
});

// ============================================================================
// GET MATERIAL LEDGER
// ============================================================================

export const getLedger = query({
  args: {
    materialId: v.id("materials"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "read");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    const limit = normalizePaginationLimit(args.limit);

    const ledgerEntries = await ctx.db
      .query("materialLedger")
      .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
      .order("desc")
      .take(limit);

    // Fetch user and task details
    const ledgerWithDetails = await Promise.all(
      ledgerEntries.map(async (entry) => {
        const user = await ctx.db.get(entry.performedBy);
        const task = entry.taskId ? await ctx.db.get(entry.taskId) : null;

        return {
          ...entry,
          performedBy: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
              }
            : null,
          task: task
            ? {
                name: task.name,
                orderId: task.orderId,
              }
            : null,
        };
      })
    );

    return ledgerWithDetails;
  },
});

// ============================================================================
// GET MATERIALS SUMMARY
// ============================================================================

export const getSummary = query({
  handler: async (ctx) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "read");

    const materials = await ctx.db
      .query("materials")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    const total = materials.length;
    const lowStock = materials.filter((m) => m.quantityOnHand <= m.reorderLevel).length;
    const outOfStock = materials.filter((m) => m.quantityOnHand === 0).length;

    const totalValue = materials.reduce((sum, m) => {
      return sum + (m.costPerUnit ?? 0) * m.quantityOnHand;
    }, 0);

    return {
      total,
      lowStock,
      outOfStock,
      totalValue,
    };
  },
});

// ============================================================================
// GET MATERIAL CONSUMPTION BY TASK
// ============================================================================

export const getConsumptionByTask = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { organizationId, role } = await getCurrentUserContext(ctx);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    // Workers can only view their own tasks' material consumption
    const identity = await ctx.auth.getUserIdentity();
    const currentUserId = identity?.subject as Id<"users"> | undefined;
    if (role === "worker" && (!currentUserId || task.assignedTo !== currentUserId)) {
      throw new ConvexError("Cannot view other workers' material consumption");
    }

    const ledgerEntries = await ctx.db
      .query("materialLedger")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    const consumptionWithDetails = await Promise.all(
      ledgerEntries.map(async (entry) => {
        const material = await ctx.db.get(entry.materialId);

        return {
          materialId: entry.materialId,
          name: material?.name ?? "Unknown",
          unit: material?.unit ?? "units",
          quantity: Math.abs(entry.quantity), // Show as positive
          performedAt: entry.createdAt,
        };
      })
    );

    return consumptionWithDetails;
  },
});
