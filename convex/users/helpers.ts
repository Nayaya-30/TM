// convex/users/helpers.ts
import { QueryCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function requireUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }

  let user = await ctx.db
    .query("users")
    .withIndex("by_authSubject", (q) => q.eq("authSubject", identity.subject))
    .unique();

  if (user) return user;

  throw new ConvexError("User not found");
}