import { mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";

// ============================================================================
// CREATE USER
// ============================================================================

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    avatar: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    // Create new user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      emailVerified: false,
      phone: args.phone,
      phoneVerified: false,
      firstName: args.firstName,
      lastName: args.lastName,
      avatar: args.avatar,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updateData } = args;

    // Verify user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update only provided fields
    const updateFields: any = {
      updatedAt: Date.now(),
    };

    if (updateData.firstName) updateFields.firstName = updateData.firstName;
    if (updateData.lastName) updateFields.lastName = updateData.lastName;
    if (updateData.phone !== undefined) updateFields.phone = updateData.phone;
    if (updateData.avatar !== undefined) updateFields.avatar = updateData.avatar;

    await ctx.db.patch(userId, updateFields);

    return await ctx.db.get(userId);
  },
});

// ============================================================================
// VERIFY EMAIL
// ============================================================================

export const verifyEmail = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      emailVerified: true,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// ============================================================================
// VERIFY PHONE
// ============================================================================

export const verifyPhone = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      phoneVerified: true,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// ============================================================================
// UPDATE AVATAR
// ============================================================================

export const updateAvatar = mutation({
  args: {
    userId: v.id("users"),
    avatar: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      avatar: args.avatar,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// ============================================================================
// GET OR CREATE USER (for Next-Auth integration)
// ============================================================================

export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser;
    }

    // Create new user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      email: args.email,
      emailVerified: false,
      phone: undefined,
      phoneVerified: false,
      firstName: args.firstName || args.email.split("@")[0],
      lastName: args.lastName || "",
      avatar: args.avatar,
      createdAt: now,
      updatedAt: now,
    });

    return await ctx.db.get(userId);
  },
});

// ============================================================================
// DELETE USER (Admin only)
// ============================================================================

export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Soft delete by checking cascade concerns if needed
    // For now, just delete the user record
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

// ============================================================================
// UPDATE EMAIL
// ============================================================================

export const updateEmail = mutation({
  args: {
    userId: v.id("users"),
    newEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    // Check if new email is already in use
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.newEmail))
      .first();

    if (existingUser && existingUser._id !== args.userId) {
      throw new ConvexError("Email already in use");
    }

    await ctx.db.patch(args.userId, {
      email: args.newEmail,
      emailVerified: false, // Reset verification on email change
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

// ============================================================================
// UPDATE PHONE
// ============================================================================

export const updatePhone = mutation({
  args: {
    userId: v.id("users"),
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(args.userId, {
      phone: args.phone,
      phoneVerified: false, // Reset verification on phone change
      updatedAt: Date.now(),
    });

    return await ctx.db.get(args.userId);
  },
});

export const registerPassword = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        updatedAt: now,
      });
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      email: args.email,
      emailVerified: false,
      phone: undefined,
      phoneVerified: false,
      firstName: "",
      lastName: "",
      avatar: undefined,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const verifyCredentials = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || !user.passwordHash) {
      return null;
    }

    if (user.passwordHash !== args.passwordHash) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || undefined,
      image: user.avatar,
    };
  },
});
