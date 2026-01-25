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
          role: (params.role as any) ?? "customer",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
  ],
});
