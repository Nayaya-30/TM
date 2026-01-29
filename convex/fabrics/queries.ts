import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { normalizePaginationLimit } from "../helpers/utils";

// ============================================================================
// LIST FABRICS
// ============================================================================

export const list = query({
  args: {
    inStockOnly: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    requirePermission(role, "fabrics", "read");

    const limit = normalizePaginationLimit(args.limit);

    let fabricsQuery = ctx.db
      .query("fabrics")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId));

    // Filter by in stock if requested
    if (args.inStockOnly) {
      fabricsQuery = ctx.db
        .query("fabrics")
        .withIndex("by_org_in_stock", (q) =>
          q.eq("organizationId", organizationId).eq("inStock", true)
        );
    }

    let fabrics = await fabricsQuery.order("desc").take(limit);

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      fabrics = fabrics.filter((fabric) =>
        args.tags!.some((tag) => fabric.tags.includes(tag))
      );
    }

    return fabrics;
  },
});

// ============================================================================
// GET FABRIC DETAILS
// ============================================================================

export const get = query({
  args: {
    fabricId: v.id("fabrics"),
  },
  handler: async (ctx, args) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    requirePermission(role, "fabrics", "read");

    const fabric = await ctx.db.get(args.fabricId);

    if (!fabric) {
      throw new ConvexError("Fabric not found");
    }

    if (fabric.organizationId !== organizationId) {
      throw new ConvexError("Fabric belongs to different organization");
    }

    return fabric;
  },
});

// ============================================================================
// GET FABRIC CATALOG SUMMARY
// ============================================================================

export const getSummary = query({
  handler: async (ctx) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    requirePermission(role, "fabrics", "read");

    const fabrics = await ctx.db
      .query("fabrics")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    const total = fabrics.length;
    const inStock = fabrics.filter((f) => f.inStock).length;
    const outOfStock = fabrics.filter((f) => !f.inStock).length;

    // Get unique colors
    const uniqueColors = Array.from(new Set(fabrics.map((f) => f.color)));

    return {
      total,
      inStock,
      outOfStock,
      uniqueColors: uniqueColors.length,
    };
  },
});

// ============================================================================
// GET ALL UNIQUE TAGS
// ============================================================================

export const getTags = query({
  handler: async (ctx) => {
    const context = await getCurrentUserContext(ctx);
    const organizationId = context.organizationId;
    const role = context.role;

    if (!organizationId || !role) {
      throw new ConvexError("Organization and role required for this action");
    }

    requirePermission(role, "fabrics", "read");

    const fabrics = await ctx.db
      .query("fabrics")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .collect();

    const allTags = fabrics.flatMap((fabric) => fabric.tags);
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return uniqueTags;
  },
});