// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

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
		async createOrUpdateUser(ctx, args) {
			if (args.existingUserId) return args.existingUserId;

			const { firstName, lastName, role, email } = args.profile;

			// Base user object with your specific required fields
			const newUser = {
				email: email as string,
				firstName: (firstName as string) ?? "",
				lastName: (lastName as string) ?? "",
				role: (role as any) ?? "customer",
				emailVerified: false,
				phoneVerified: false,
				createdAt: Date.now(),
				updatedAt: Date.now(),
			};

			// TYPE GUARD: If this is a password-based signup, add the hash/salt
			if (args.type === "credentials") {
				return await ctx.db.insert("users", {
					...newUser,
					// passwordHash: args.passwordHash,
					// passwordSalt: args.passwordSalt,
				});
			}

			// For other providers (OAuth/Magic Link), insert without password fields
			return await ctx.db.insert("users", newUser);
		},
	},
});
