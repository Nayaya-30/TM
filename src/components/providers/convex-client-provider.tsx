// src/components/providers/convex-client-provider.tsx
"use client";

import { initEruda } from "../../utils/initEruda";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useEffect } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		if (process.env.NODE_ENV === "development") {
			initEruda();
		}
	}, [])

	return (

		<ConvexAuthProvider client={convex}>

			{children}

		</ConvexAuthProvider>

	);
}
