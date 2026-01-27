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
			console.log("=== createOrUpdateUser START ===");
			console.log("Args:", {
				existingUserId: args.existingUserId,
				type: args.type,
				email: args.profile.email
			});

			const { firstName, lastName, role, email } = args.profile;

			// If user already exists in the auth system, return that ID
			if (args.existingUserId) {
				console.log("User exists in auth system, ID:", args.existingUserId);
				return args.existingUserId;
			}

			const ctx = ctX as MutationCtx;
			// Check if user exists in our users table by email
			const existingUser = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", email as string))
				.first();

			if (existingUser) {
				console.log("Found existing user in users table:", existingUser._id);
				return existingUser._id;
			}

			// Create new user
			console.log("Creating new user in users table");
			const now = Date.now();
			const userId = await ctx.db.insert("users", {
				email: (email as string) ?? "",
				firstName: (firstName as string) ?? ((email as string)?.split("@")[0] ?? ""),
				lastName: (lastName as string) ?? "",
				role: (role as any) ?? "customer",
				emailVerified: false,
				phoneVerified: false,
				createdAt: now,
				updatedAt: now,
			});

			console.log("Created user with ID:", userId);
			console.log("=== createOrUpdateUser END ===");
			return userId;
		},
	},
});