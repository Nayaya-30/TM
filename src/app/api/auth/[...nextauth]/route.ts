import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ConvexReactClient } from "convex/react"; // server-safe

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL not set");

const convex = new ConvexReactClient(convexUrl);

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		Credentials({
			name: "credentials",
			credentials: {
				email: { type: "email" },
				password: { type: "password" },
			},

			async authorize(credentials) {
				if (!credentials?.email || !credentials.password) return null;

				// Convex query: get user by email
				const user = await convex.query("users/by_email", { email: credentials.email });

				if (!user) return null;

				// Compare hashed password
				if (!user.passwordHash) return null;
				const valid = await bcrypt.compare(credentials.password, user.passwordHash);
				if (!valid) return null;

				return {
					id: user._id,
					email: user.email,
					name: `${user.firstName} ${user.lastName}`,
					role: user.role,
				};
			},
		}),
	],

	session: { strategy: "jwt" },

	callbacks: {
		jwt({ token, user }) {
			if (user) token.role = user.role;
			return token;
		},
		session({ session, token }) {
			session.user.role = token.role;
			return session;
		},
	},
});