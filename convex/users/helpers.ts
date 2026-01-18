// convex/users/helpers.ts
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function requireUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error("Unauthenticated");
	}

	const user = await ctx.db
		.query("users")
		.filter((q) => q.eq(q.field("authSubject"), identity.subject))
		.unique();

	if (!user) {
		throw new Error("User not found");
	}

	return user;
}