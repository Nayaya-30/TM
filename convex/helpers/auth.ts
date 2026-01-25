import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export async function getCurrentUserContext(
  ctx: QueryCtx | MutationCtx
): Promise<AuthContext> {
  const userId = await ctx.auth.getUserId(); // Built-in Convex Auth helper
  
  if (!userId) {
    throw new ConvexError("Unauthenticated");
  }

  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("User not found");

  const membership = await ctx.db
    .query("orgMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("inviteAccepted"), true))
    .first();

  // If they are admin but haven't finished onboarding, membership might be null
  // We handle that in the UI/Onboarding flow
  return {
    userId,
    organizationId: membership?.organizationId as Id<"organizations">,
    role: (user.role ?? "customer") as UserRole,
  };
}
