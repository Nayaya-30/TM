import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requireFeatureAccess } from "../helpers/auth";
import { Id } from "../_generated/dataModel";
import { generateUniqueSlug, isValidHexColor } from "../helpers/utils";

// ============================================================================
// CREATE ORGANIZATION
// ============================================================================

export const create = mutation({
  args: {
    name: v.string(),
    accentColor: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    location: v.object({
      address: v.string(),
      latitude: v.float64(),
      longitude: v.float64(),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new ConvexError("Unauthenticated");
    }

    const userId = identity.subject as Id<"users">;

    // Validate accent color
    if (!isValidHexColor(args.accentColor)) {
      throw new ConvexError("Invalid hex color format");
    }

    // Generate unique slug
    const existingOrgs = await ctx.db.query("organizations").collect();
    const existingSlugs = existingOrgs.map((org) => org.slug);
    const slug = generateUniqueSlug(args.name, existingSlugs);

    const now = Date.now();

    // Create organization
    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      accentColor: args.accentColor,
      theme: args.theme,
      location: args.location,
      verified: false,
      subscription: {
        tier: "free",
        status: "active",
        currentPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, // 30 days trial
      },
      settings: {
        allowWorkerAdminChat: false,
        publicShowcase: true,
      },
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create admin membership for creator
    await ctx.db.insert("orgMemberships", {
      userId,
      organizationId,
      role: "admin",
      invitedBy: userId,
      inviteAccepted: true,
      joinedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "organization",
      resourceId: organizationId,
      createdAt: now,
    });

    return organizationId;
  },
});

// ============================================================================
// UPDATE ORGANIZATION
// ============================================================================

export const update = mutation({
  args: {
    organizationId: v.id("organizations"),
    name: v.optional(v.string()),
    logo: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"), v.literal("system"))),
    location: v.optional(
      v.object({
        address: v.string(),
        latitude: v.float64(),
        longitude: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    // Only admin can update org settings
    if (role !== "admin") {
      throw new ConvexError("Only admins can update organization settings");
    }

    if (organizationId !== args.organizationId) {
      throw new ConvexError("Cannot update organization from different org");
    }

    const org = await ctx.db.get(args.organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    // Validate accent color if provided
    if (args.accentColor && !isValidHexColor(args.accentColor)) {
      throw new ConvexError("Invalid hex color format");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
      
      // Regenerate slug if name changed
      const existingOrgs = await ctx.db.query("organizations").collect();
      const existingSlugs = existingOrgs
        .filter((o) => o._id !== args.organizationId)
        .map((o) => o.slug);
      updates.slug = generateUniqueSlug(args.name, existingSlugs);
    }

    if (args.logo !== undefined) updates.logo = args.logo;
    if (args.accentColor !== undefined) updates.accentColor = args.accentColor;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.location !== undefined) updates.location = args.location;

    await ctx.db.patch(args.organizationId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId: args.organizationId,
      userId,
      action: "update",
      resource: "organization",
      resourceId: args.organizationId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.organizationId;
  },
});

// ============================================================================
// UPDATE SETTINGS
// ============================================================================

export const updateSettings = mutation({
  args: {
    allowWorkerAdminChat: v.optional(v.boolean()),
    publicShowcase: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin") {
      throw new ConvexError("Only admins can update settings");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    const settings = { ...org.settings };

    if (args.allowWorkerAdminChat !== undefined) {
      settings.allowWorkerAdminChat = args.allowWorkerAdminChat;
    }
    if (args.publicShowcase !== undefined) {
      settings.publicShowcase = args.publicShowcase;
    }

    await ctx.db.patch(organizationId, {
      settings,
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "organization_settings",
      resourceId: organizationId,
      metadata: { settings: args },
      createdAt: Date.now(),
    });

    return organizationId;
  },
});

// ============================================================================
// SUBMIT VERIFICATION DOCUMENTS
// ============================================================================

export const submitVerification = mutation({
  args: {
    cacDocument: v.string(),
    bvnVerified: v.boolean(),
    emailVerified: v.boolean(),
    phoneVerified: v.boolean(),
    bankVerified: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin") {
      throw new ConvexError("Only admins can submit verification");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    // Check if subscription tier allows verification
    requireFeatureAccess(org.subscription.tier, "verification");

    await ctx.db.patch(organizationId, {
      verificationDocuments: {
        cacDocument: args.cacDocument,
        bvnVerified: args.bvnVerified,
        emailVerified: args.emailVerified,
        phoneVerified: args.phoneVerified,
        bankVerified: args.bankVerified,
      },
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "verification_documents",
      resourceId: organizationId,
      createdAt: Date.now(),
    });

    return organizationId;
  },
});

// ============================================================================
// UPDATE SUBSCRIPTION
// ============================================================================

export const updateSubscription = mutation({
  args: {
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due")),
    currentPeriodEnd: v.float64(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin") {
      throw new ConvexError("Only admins can update subscription");
    }

    const org = await ctx.db.get(organizationId);
    if (!org) {
      throw new ConvexError("Organization not found");
    }

    await ctx.db.patch(organizationId, {
      subscription: {
        tier: args.tier,
        status: args.status,
        currentPeriodEnd: args.currentPeriodEnd,
      },
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "subscription",
      resourceId: organizationId,
      metadata: { subscription: args },
      createdAt: Date.now(),
    });

    return organizationId;
  },
});
