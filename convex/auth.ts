// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          firstName: params.firstName as string,
          lastName: params.lastName as string,
          role: params.role as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctX, args) {
      console.log("createOrUpdateUser called with:", { 
        existingUserId: args.existingUserId,
        type: args.type,
        email: args.profile.email 
      });

      // Check if user already exists by email
      const { firstName, lastName, role, email } = args.profile;
      
      const ctx = ctX as MutationCtx;
      
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email as string))
        .first();

      if (existingUser) {
        console.log("Found existing user:", existingUser._id);
        // Update authSubject if it's not set
        if (!existingUser.authSubject && args.existingUserId) {
          await ctx.db.patch(existingUser._id, {
            authSubject: args.existingUserId,
            updatedAt: Date.now(),
          });
        }
        return existingUser._id;
      }

      // Create new user
      console.log("Creating new user for email:", email);
      const now = Date.now();
      const userId = await ctx.db.insert("users", {
        email: (email as string) ?? "",
        firstName: (firstName as string) ?? ((email as string)?.split("@")[0] ?? ""),
        lastName: (lastName as string) ?? "",
        role: (role as any) ?? "customer",
        emailVerified: false,
        phoneVerified: false,
        authSubject: args.existingUserId ?? undefined,
        createdAt: now,
        updatedAt: now,
      });

      console.log("Created user with ID:", userId);
      return userId;
    },
  },
});