"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ReactNode } from "react";
import { auth } from "../../../convex/auth.config"; // Password-only auth

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return (
		<ConvexAuthNextjsProvider client={convex} auth={auth}>
			{children}
		</ConvexAuthNextjsProvider>
	);
}