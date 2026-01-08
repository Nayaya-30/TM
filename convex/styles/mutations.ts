import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requireFeatureAccess } from "../helpers/auth";

// ============================================================================
// CREATE STYLE
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    tags: v.array(v.string()),
    images: v.array(v.string()),
    videos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Only admin and manager can create styles");
    }

    if (args.images.length === 0) {
      throw new ConvexError("At least one image is required");
    }

    if (args.tags.length === 0) {
      throw new ConvexError("At least one tag is required");
    }

    const now = Date.now();

    const styleId = await ctx.db.insert("styles", {
      organizationId,
      name: args.name,
      tags: args.tags,
      images: args.images,
      videos: args.videos,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "style",
      resourceId: styleId,
      metadata: { name: args.name, tags: args.tags },
      createdAt: now,
    });

    return styleId;
  },
});

// ============================================================================
// IMPORT STYLE FROM SOCIAL MEDIA
// ============================================================================

export const importFromSocial = mutation({
  args: {
    name: v.string(),
    tags: v.array(v.string()),
    images: v.array(v.string()),
    videos: v.optional(v.array(v.string())),
    source: v.union(v.literal("instagram"), v.literal("pinterest")),
    sourceUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Only admin and manager can import styles");
    }

    // Check if org has access to style import feature
    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    requireFeatureAccess(org.subscription.tier, "style_import");

    if (args.images.length === 0) {
      throw new ConvexError("At least one image is required");
    }

    const now = Date.now();

    const styleId = await ctx.db.insert("styles", {
      organizationId,
      name: args.name,
      tags: args.tags,
      images: args.images,
      videos: args.videos,
      importedFrom: args.source,
      importUrl: args.sourceUrl,
      createdAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "style_import",
      resourceId: styleId,
      metadata: { name: args.name, source: args.source },
      createdAt: now,
    });

    return styleId;
  },
});

// ============================================================================
// UPDATE STYLE
// ============================================================================

export const update = mutation({
  args: {
    styleId: v.id("styles"),
    name: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    images: v.optional(v.array(v.string())),
    videos: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Only admin and manager can update styles");
    }

    const style = await ctx.db.get(args.styleId);

    if (!style) {
      throw new ConvexError("Style not found");
    }

    if (style.organizationId !== organizationId) {
      throw new ConvexError("Style belongs to different organization");
    }

    const updates: Record<string, unknown> = {};

    if (args.name !== undefined) updates.name = args.name;
    if (args.tags !== undefined) {
      if (args.tags.length === 0) {
        throw new ConvexError("At least one tag is required");
      }
      updates.tags = args.tags;
    }
    if (args.images !== undefined) {
      if (args.images.length === 0) {
        throw new ConvexError("At least one image is required");
      }
      updates.images = args.images;
    }
    if (args.videos !== undefined) updates.videos = args.videos;

    await ctx.db.patch(args.styleId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "style",
      resourceId: args.styleId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.styleId;
  },
});

// ============================================================================
// DELETE STYLE
// ============================================================================

export const remove = mutation({
  args: {
    styleId: v.id("styles"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin") {
      throw new ConvexError("Only admin can delete styles");
    }

    const style = await ctx.db.get(args.styleId);

    if (!style) {
      throw new ConvexError("Style not found");
    }

    if (style.organizationId !== organizationId) {
      throw new ConvexError("Style belongs to different organization");
    }

    // Check if style is used in any orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_org", (q) => q.eq("organizationId", organizationId))
      .filter((q) => q.eq(q.field("styleId"), args.styleId))
      .first();

    if (orders) {
      throw new ConvexError("Cannot delete style that is used in orders");
    }

    await ctx.db.delete(args.styleId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "style",
      resourceId: args.styleId,
      metadata: { name: style.name },
      createdAt: Date.now(),
    });

    return args.styleId;
  },
});