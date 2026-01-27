// convex/users/helpers.ts
import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
	const identity = await ctx.auth.getUserIdentity();

	if (!identity) {
		throw new ConvexError("Unauthenticated");
	}

	// Look up user by email (primary method)
	const user = await ctx.db
		.query("users")
		.withIndex("by_email", (q) => q.eq("email", identity.email ?? ""))
		.first();

	if (!user) {
		throw new ConvexError("User not found");
	}

	return user;
}