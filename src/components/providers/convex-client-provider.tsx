"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";
import { useSession } from "next-auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function ConvexProviderInner({ children }: { children: ReactNode }) {
	const { data: session } = useSession();

	return (
		<ConvexProvider
			client={convex}
			useAuth={() => {
				if (!session?.user?.id) {
					return { isLoading: false };
				}
				return {
					isLoading: false,
					token: session.user.id,
				};
			}}
		>
			{children}
		</ConvexProvider>
	);
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return <ConvexProviderInner>{children}</ConvexProviderInner>;
}