import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL ?? process.env.CONVEX_URL!
);

const handler = NextAuth({
  providers: [
    Credentials({
      id: "password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const flow = (credentials as any).flow as "signIn" | "signUp" | undefined;

        // Derive a hash and salt for password
        const salt =
          (credentials as any).salt ??
          crypto.randomBytes(16).toString("hex");
        const hash = crypto
          .createHash("sha256")
          .update(salt + credentials.password)
          .digest("hex");

        if (flow === "signUp") {
          // Register or update password in Convex
          await convex.mutation(api.users.mutations.registerPassword, {
            email: credentials.email,
            passwordHash: hash,
            passwordSalt: salt,
          });
        }

        // Verify credentials via Convex
        const verified = await convex.mutation(api.users.mutations.verifyCredentials, {
          email: credentials.email,
          passwordHash: hash,
        });

        if (!verified) {
          return null;
        }

        return {
          id: verified.id,
          email: verified.email,
          name: verified.name ?? null,
          image: verified.image ?? null,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Sync user to Convex on sign in
      try {
        if (user.email) {
          await convex.mutation(api.users.mutations.getOrCreateUser, {
            email: user.email,
            firstName: user.name?.split(" ")[0] || "User",
            lastName: user.name?.split(" ").slice(1).join(" ") || "",
            avatar: user.image ?? undefined,
          });
        }
      } catch (error) {
        console.error("Error syncing user to Convex:", error);
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
