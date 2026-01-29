import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { normalizePaginationLimit } from "../helpers/utils";
import { Id } from "../_generated/dataModel";
import { requireUser } from "../users/helpers";

// ============================================================================
// LIST STYLES (PUBLIC - FOR SHOWCASE)
// ============================================================================

export const listByOrg = query({
  args: {
    organizationId: v.id("organizations"),
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // This is a public query for the showcase page
    const org = await ctx.db.get(args.organizationId);

    if (!org) {
      throw new ConvexError("Organization not found");
    }

    if (!org.settings.publicShowcase) {
      throw new ConvexError("Showcase is not public");
    }

    const limit = normalizePaginationLimit(args.limit);

    let styles = await ctx.db
      .query("styles")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .order("desc")
      .take(limit);

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      styles = styles.filter((style) =>
        args.tags!.some((tag) => style.tags.includes(tag))
      );
    }

    return styles;
  },
});

// ============================================================================
// GET STYLE DETAILS (PUBLIC)
// ============================================================================

export const get = query({
  args: {
    styleId: v.id("styles"),
  },
  handler: async (ctx, args) => {
    const style = await ctx.db.get(args.styleId);

    if (!style) {
      throw new ConvexError("Style not found");
    }

    // Check if showcase is public
    const org = await ctx.db.get(style.organizationId);

    if (!org || !org.settings.publicShowcase) {
      throw new ConvexError("Style not available");
    }

    return style;
  },
});

// ============================================================================
// LIST STYLES (INTERNAL - FOR ADMIN/MANAGER)
// ============================================================================

export const listInternal = query({
  args: {
    tags: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    const user = await requireUser(ctx);
    const userId = user._id;

    // Get user's organization
    const membership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("inviteAccepted"), true))
      .first();

    if (!membership) {
      throw new ConvexError("No organization membership found");
    }

    const limit = normalizePaginationLimit(args.limit);

    let styles = await ctx.db
      .query("styles")
      .withIndex("by_org", (q) => q.eq("organizationId", membership.organizationId!))
      .order("desc")
      .take(limit);

    // Filter by tags if provided
    if (args.tags && args.tags.length > 0) {
      styles = styles.filter((style) =>
        args.tags!.some((tag) => style.tags.includes(tag))
      );
    }

    // Add usage count
    const stylesWithUsage = await Promise.all(
      styles.map(async (style) => {
        const orderCount = await ctx.db
          .query("orders")
          .withIndex("by_org", (q) => q.eq("organizationId", membership.organizationId!))
          .filter((q) => q.eq(q.field("styleId"), style._id))
          .collect()
          .then((orders) => orders.length);

        return {
          ...style,
          orderCount,
        };
      })
    );

    return stylesWithUsage;
  },
});

// ============================================================================
// GET ALL UNIQUE TAGS FOR ORGANIZATION
// ============================================================================

export const getTags = query({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const styles = await ctx.db
      .query("styles")
      .withIndex("by_org", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    const allTags = styles.flatMap((style) => style.tags);
    const uniqueTags = Array.from(new Set(allTags)).sort();

    return uniqueTags;
  },
});
