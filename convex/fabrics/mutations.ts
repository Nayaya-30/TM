import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";

// ============================================================================
// CREATE FABRIC
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    images: v.array(v.string()),
    color: v.string(),
    pattern: v.optional(v.string()),
    pricePerUnit: v.optional(v.float64()),
    unit: v.union(
      v.literal("yards"),
      v.literal("meters"),
      v.literal("units"),
      v.literal("pieces")
    ),
    inStock: v.boolean(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "fabrics", "create");

    if (args.images.length === 0) {
      throw new ConvexError("At least one image is required");
    }

    if (args.pricePerUnit !== undefined && args.pricePerUnit < 0) {
      throw new ConvexError("Price per unit cannot be negative");
    }

    const now = Date.now();

    const fabricId = await ctx.db.insert("fabrics", {
      organizationId,
      name: args.name,
      description: args.description,
      images: args.images,
      color: args.color,
      pattern: args.pattern,
      pricePerUnit: args.pricePerUnit,
      unit: args.unit,
      inStock: args.inStock,
      tags: args.tags,
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "fabric",
      resourceId: fabricId,
      metadata: { name: args.name },
      createdAt: now,
    });

    return fabricId;
  },
});

// ============================================================================
// UPDATE FABRIC
// ============================================================================

export const update = mutation({
  args: {
    fabricId: v.id("fabrics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    images: v.optional(v.array(v.string())),
    color: v.optional(v.string()),
    pattern: v.optional(v.string()),
    pricePerUnit: v.optional(v.float64()),
    inStock: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "fabrics", "update");

    const fabric = await ctx.db.get(args.fabricId);

    if (!fabric) {
      throw new ConvexError("Fabric not found");
    }

    if (fabric.organizationId !== organizationId) {
      throw new ConvexError("Fabric belongs to different organization");
    }

    if (args.images !== undefined && args.images.length === 0) {
      throw new ConvexError("At least one image is required");
    }

    if (args.pricePerUnit !== undefined && args.pricePerUnit < 0) {
      throw new ConvexError("Price per unit cannot be negative");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.images !== undefined) updates.images = args.images;
    if (args.color !== undefined) updates.color = args.color;
    if (args.pattern !== undefined) updates.pattern = args.pattern;
    if (args.pricePerUnit !== undefined) updates.pricePerUnit = args.pricePerUnit;
    if (args.inStock !== undefined) updates.inStock = args.inStock;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.fabricId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "fabric",
      resourceId: args.fabricId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.fabricId;
  },
});

// ============================================================================
// DELETE FABRIC
// ============================================================================

export const remove = mutation({
  args: {
    fabricId: v.id("fabrics"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "fabrics", "delete");

    const fabric = await ctx.db.get(args.fabricId);

    if (!fabric) {
      throw new ConvexError("Fabric not found");
    }

    if (fabric.organizationId !== organizationId) {
      throw new ConvexError("Fabric belongs to different organization");
    }

    await ctx.db.delete(args.fabricId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "fabric",
      resourceId: args.fabricId,
      metadata: { name: fabric.name },
      createdAt: Date.now(),
    });

    return args.fabricId;
  },
});