import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ConvexClient } from "convex/browser";

const convex = new ConvexClient(process.env.CONVEX_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        // TODO: Verify password against hashed password in database
        // This is a placeholder - you'll need to implement proper password hashing
        // For now, returning a basic user object

        const user = {
          id: credentials.email, // Use email as temporary ID
          email: credentials.email as string,
          name: "User",
        };

        return user;
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
            avatar: user.image,
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
