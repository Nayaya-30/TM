// src/app/auth-wrapper.tsx
"use server"
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

export async function AuthWrapper({ children }: { children: React.ReactNode }) {
	return (
		<ConvexAuthNextjsServerProvider>
			{children}
		</ConvexAuthNextjsServerProvider>
	);
}
