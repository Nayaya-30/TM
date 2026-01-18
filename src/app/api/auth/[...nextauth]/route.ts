import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
        if (!credentials?.email || !credentials?.password) return null;

        const flow = (credentials as any).flow as "signIn" | "signUp";

        if (flow === "signUp") {
          // ✅ Hash password with bcrypt
          const hash = await bcrypt.hash(credentials.password, 12);

          // Store hash in Convex
          await convex.mutation(api.users.mutations.registerPassword, {
            email: credentials.email,
            passwordHash: hash,
            passwordSalt: "", // salt handled by bcrypt
          });
        }

        // ✅ Verify credentials
        const user = await convex.mutation(
          api.users.mutations.verifyCredentials,
          {
            email: credentials.email,
            password: credentials.password, // pass raw password
          }
        );

        if (!user) return null;

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
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
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };