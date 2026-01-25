// convex/users/helpers.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

/**
 * Validates the current session and returns the full user document.
 * Works for both Queries and Mutations.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx) {
  // getUserId() is the primary helper for Convex Auth
  const userId = await ctx.auth.getUserId();

  if (!userId) {
    throw new ConvexError("Unauthenticated: No session found");
  }

  const user = await ctx.db.get(userId);

  if (!user) {
    throw new ConvexError("User not found in database");
  }

  return user;
}
