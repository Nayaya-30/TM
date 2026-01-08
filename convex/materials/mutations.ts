import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";

// ============================================================================
// CREATE MATERIAL
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    unit: v.union(
      v.literal("yards"),
      v.literal("meters"),
      v.literal("units"),
      v.literal("pieces")
    ),
    quantityOnHand: v.float64(),
    reorderLevel: v.float64(),
    costPerUnit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "create");

    if (args.quantityOnHand < 0) {
      throw new ConvexError("Quantity cannot be negative");
    }

    if (args.reorderLevel < 0) {
      throw new ConvexError("Reorder level cannot be negative");
    }

    if (args.costPerUnit !== undefined && args.costPerUnit < 0) {
      throw new ConvexError("Cost per unit cannot be negative");
    }

    const now = Date.now();

    const materialId = await ctx.db.insert("materials", {
      organizationId,
      name: args.name,
      description: args.description,
      unit: args.unit,
      quantityOnHand: args.quantityOnHand,
      reorderLevel: args.reorderLevel,
      costPerUnit: args.costPerUnit,
      createdAt: now,
      updatedAt: now,
    });

    // Create initial ledger entry if quantity > 0
    if (args.quantityOnHand > 0) {
      await ctx.db.insert("materialLedger", {
        organizationId,
        materialId,
        type: "purchase",
        quantity: args.quantityOnHand,
        notes: "Initial stock",
        performedBy: userId,
        createdAt: now,
      });
    }

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "material",
      resourceId: materialId,
      metadata: { name: args.name, quantity: args.quantityOnHand },
      createdAt: now,
    });

    return materialId;
  },
});

// ============================================================================
// UPDATE MATERIAL
// ============================================================================

export const update = mutation({
  args: {
    materialId: v.id("materials"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    reorderLevel: v.optional(v.float64()),
    costPerUnit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "update");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    if (args.reorderLevel !== undefined && args.reorderLevel < 0) {
      throw new ConvexError("Reorder level cannot be negative");
    }

    if (args.costPerUnit !== undefined && args.costPerUnit < 0) {
      throw new ConvexError("Cost per unit cannot be negative");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.reorderLevel !== undefined) updates.reorderLevel = args.reorderLevel;
    if (args.costPerUnit !== undefined) updates.costPerUnit = args.costPerUnit;

    await ctx.db.patch(args.materialId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "material",
      resourceId: args.materialId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.materialId;
  },
});

// ============================================================================
// PURCHASE MATERIAL (ADD STOCK)
// ============================================================================

export const purchase = mutation({
  args: {
    materialId: v.id("materials"),
    quantity: v.float64(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "update");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    if (args.quantity <= 0) {
      throw new ConvexError("Quantity must be positive");
    }

    const now = Date.now();

    // Update material quantity
    await ctx.db.patch(args.materialId, {
      quantityOnHand: material.quantityOnHand + args.quantity,
      updatedAt: now,
    });

    // Create ledger entry
    await ctx.db.insert("materialLedger", {
      organizationId,
      materialId: args.materialId,
      type: "purchase",
      quantity: args.quantity,
      notes: args.notes,
      performedBy: userId,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "material_purchase",
      resourceId: args.materialId,
      metadata: { quantity: args.quantity },
      createdAt: now,
    });

    return args.materialId;
  },
});

// ============================================================================
// ADJUST MATERIAL (CORRECTION)
// ============================================================================

export const adjust = mutation({
  args: {
    materialId: v.id("materials"),
    quantity: v.float64(), // Can be positive or negative
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "update");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    const newQuantity = material.quantityOnHand + args.quantity;

    if (newQuantity < 0) {
      throw new ConvexError("Adjustment would result in negative quantity");
    }

    const now = Date.now();

    // Update material quantity
    await ctx.db.patch(args.materialId, {
      quantityOnHand: newQuantity,
      updatedAt: now,
    });

    // Create ledger entry
    await ctx.db.insert("materialLedger", {
      organizationId,
      materialId: args.materialId,
      type: "adjustment",
      quantity: args.quantity,
      notes: args.notes,
      performedBy: userId,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "material_adjustment",
      resourceId: args.materialId,
      metadata: { quantity: args.quantity, reason: args.notes },
      createdAt: now,
    });

    return args.materialId;
  },
});

// ============================================================================
// DELETE MATERIAL
// ============================================================================

export const remove = mutation({
  args: {
    materialId: v.id("materials"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "materials", "delete");

    const material = await ctx.db.get(args.materialId);

    if (!material) {
      throw new ConvexError("Material not found");
    }

    if (material.organizationId !== organizationId) {
      throw new ConvexError("Material belongs to different organization");
    }

    // Check if material is used in any tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    const isUsedInTasks = tasks.some((task) =>
      task.materialAllocations.some((alloc) => alloc.materialId === args.materialId)
    );

    if (isUsedInTasks) {
      throw new ConvexError("Cannot delete material that is used in tasks");
    }

    // Delete ledger entries
    const ledgerEntries = await ctx.db
      .query("materialLedger")
      .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
      .collect();

    for (const entry of ledgerEntries) {
      await ctx.db.delete(entry._id);
    }

    await ctx.db.delete(args.materialId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "material",
      resourceId: args.materialId,
      metadata: { name: material.name },
      createdAt: Date.now(),
    });

    return args.materialId;
  },
});