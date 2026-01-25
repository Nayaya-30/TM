// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
	process.env.NEXT_PUBLIC_CONVEX_URL! ?? process.env.CONVEX_URL!
);

export const authOptions = {
	providers: [
		Credentials({
			id: "password",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
				firstName: { label: "First Name", type: "text" },
				lastName: { label: "Last Name", type: "text" },
				role: { label: "Role", type: "text" },
				flow: { label: "Flow", type: "text" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				const flow = (credentials as any).flow as "signIn" | "signUp" | undefined;
				const normalizedEmail = credentials.email.toLowerCase();

				if (flow === "signUp") {
					try {
						await convex.mutation(api.users.mutations.signUpUser, {
							email: normalizedEmail,
							password: credentials.password,
							firstName: (credentials as any).firstName,
							lastName: (credentials as any).lastName,
							role: (credentials as any).role ?? "customer",
						});
					} catch (err: any) {
						console.error("Sign-up failed:", err);
						return null;
					}
				}

				const user = await convex.mutation(api.users.mutations.verifyCredentials, {
					email: normalizedEmail,
					password: credentials.password,
				});

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
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.email = token.email as string;
				session.user.role = token.role as "admin" | "manager" | "worker" | "customer" | undefined;
			}
			return session;
		},
	},
	session: { strategy: "jwt" },
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };