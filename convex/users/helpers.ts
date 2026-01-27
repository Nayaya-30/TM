import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx);

	if (!userId) {
		throw new ConvexError("Unauthenticated");
	}

	// First try: Treat userId as the actual document ID (Standard Convex Auth)
	const user = await ctx.db.get(userId as Id<"users">);
	if (user) return user;

	// Second try: Treat userId as the authSubject (Identity Crisis Fallback)
	// This handles cases where 'userId' is actually the token identifier
	const userBySubject = await ctx.db
		.query("users")
		.withIndex("by_authSubject", (q) => q.eq("authSubject", userId))
		.first();

	if (userBySubject) return userBySubject;

	throw new ConvexError("User not found");
}
