"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

// -----------------------------------------------------------------------------
// Create a server-safe Convex client
// -----------------------------------------------------------------------------
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
const convex = new ConvexReactClient(convexUrl);

// -----------------------------------------------------------------------------
// ConvexClientProvider: wraps your app
// -----------------------------------------------------------------------------
export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}