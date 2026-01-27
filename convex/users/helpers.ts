// convex/users/helpers.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }

  // In Convex Auth, identity.subject IS the user ID in the users table
  // because Convex Auth is using our custom users table
  const user = await ctx.db.get(identity.subject as Id<"users">);

  if (!user) {
    throw new ConvexError("User not found");
  }

  return user;
}