// convex/auth.ts
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        const firstName = (params.firstName as string) || "";
        const lastName = (params.lastName as string) || "";
        
        return {
          email: params.email as string,
          name: `${firstName} ${lastName}`.trim() || (params.email as string).split("@")[0],
          firstName,
          lastName,
          role: (params.role as any) || "customer",
          emailVerified: false,
          phoneVerified: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      },
    }),
  ],
});