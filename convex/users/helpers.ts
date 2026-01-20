// convex/users/helpers.ts
import { Id } from "../_generated/dataModel";
import { QueryCtx } from "../_generated/server";

export async function requireUser(ctx: QueryCtx) {
	const identity = await ctx.auth.getUserIdentity();
	if (!identity) {
		throw new Error("Unauthenticated");
	}

	// 1. Try treating subject as User ID (NextAuth flow)
	try {
		// Verify it looks like a valid ID before querying to avoid errors
		const userById = await ctx.db.get(identity.subject as Id<"users">);
		if (userById) return userById;
	} catch (error) {
		// Subject wasn't a valid ID format, continue to other checks
	}

	// 2. Try finding by authSubject field (Legacy/External Auth flow)
	const userBySubject = await ctx.db
		.query("users")
		.filter((q) => q.eq(q.field("authSubject"), identity.subject))
		.unique();

	if (userBySubject) return userBySubject;

	// 3. Try finding by email (Fallback for consistency)
	if (identity.email) {
		const userByEmail = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", identity.email!))
			.unique();
		
		if (userByEmail) return userByEmail;
	}

	throw new Error("User not found");
}