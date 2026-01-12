import { mutation } from "../_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { ConvexError } from "convex/values";

// ========================================
// CREATE USER / SIGN-UP
// ========================================
export const createUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("customer"),
      v.literal("worker"),
      v.literal("manager")
    ),
  },
  handler: async (ctx, args) => {
    // Check if user exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) throw new ConvexError("Email already in use");

    const passwordHash = await bcrypt.hash(args.password, 10);
    const now = Date.now();

    const id = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      firstName: args.firstName,
      lastName: args.lastName,
      role: args.role,
      createdAt: now,
      updatedAt: now,
      emailVerified: false,
      phoneVerified: false,
    });

    return { id };
  },
});

// ========================================
// UPDATE USER PROFILE
// ========================================
export const updateUserProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject;
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found");

    const updatedAt = Date.now();

    await ctx.db.patch(userId, {
      ...args,
      updatedAt,
    });

    return { success: true };
  },
});

// ========================================
// CHANGE PASSWORD
// ========================================
export const changePassword = mutation({
  args: {
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");

    const userId = identity.subject;
    const user = await ctx.db.get(userId);
    if (!user || !user.passwordHash)
      throw new ConvexError("Cannot change password");

    const valid = await bcrypt.compare(args.oldPassword, user.passwordHash);
    if (!valid) throw new ConvexError("Old password incorrect");

    const newHash = await bcrypt.hash(args.newPassword, 10);
    await ctx.db.patch(userId, { passwordHash: newHash, updatedAt: Date.now() });

    return { success: true };
  },
});