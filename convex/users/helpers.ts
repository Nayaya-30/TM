// convex/users/helpers.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

/**
 * Returns the currently authenticated user.
 * Throws ConvexError if not authenticated or user not found.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  // Get typed user ID
  const userId = await getAuthUserId(ctx);

  if (!userId) {
    throw new ConvexError("Unauthenticated");
  }

  // Fetch user from the DB
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}