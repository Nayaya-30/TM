"use client";

import {
  ConvexProviderWithAuth,
  ConvexReactClient,
} from "convex/react";
import { ReactNode, useMemo } from "react";
import { useSession } from "next-auth/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);

function ConvexProviderInner({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const useAuth = useMemo(() => {
    return () => ({
      isLoading: status === "loading",
      isAuthenticated: !!session?.user?.id,
      fetchAccessToken: async () => {
        if (!session?.user?.id) return null;

        // This token becomes identity.subject in Convex
        return session.user.id;
      },
    });
  }, [session?.user?.id, status]);

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <ConvexProviderInner>{children}</ConvexProviderInner>;
}