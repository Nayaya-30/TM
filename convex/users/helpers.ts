import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx);

	if (!userId) {
		throw new ConvexError("Unauthenticated");
	}

	const user = await ctx.db.get(userId as Id<"users">);

	if (!user) {
		throw new ConvexError("User not found");
	}

	return user;
}
