'use node';

import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password({
      verify: async ({ email, code }) => {
        console.log(`Verification code for ${email}: ${code}`);
      },
    }),
  ],
  experimental: {
    skipProviderDefaults: true, // ⚠️ skips loading Google/GitHub defaults
  },
});