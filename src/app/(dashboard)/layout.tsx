"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FloatingChat } from "@/components/ui/floating-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Bell } from "lucide-react";

function OrgHeader({ organizationId }: { organizationId: any }) {
  const org = useQuery(
    api.organizations.queries.get,
    { organizationId }
  );
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        <div className="flex items-center gap-3">
          {org?.logo && (
            <img
              src={org.logo}
              alt={org.name}
              className="h-8 w-8 rounded-lg object-cover"
            />
          )}
          <div>
            <h1 className="font-semibold">{org?.name ?? "Organization"}</h1>
            {org?.verified && (
              <span className="text-xs text-muted-foreground">✓ Verified</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-accent transition-colors relative"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id as any;
  const currentUser = useQuery(
    api.users.queries.getCurrentUser,
    userId ? { userId } : undefined
  );
  const profile = useQuery(
    api.users.queries.getProfile,
    userId ? { userId } : undefined
  );
  const orgId = profile?.organizations?.[0]?.organizationId;
  // Header fetch moved to child OrgHeader to avoid calling get without args

  if (status === "loading" || currentUser === undefined || profile === undefined) {
    return (
      <div className="min-h-screen flex">
        <div className="hidden lg:block w-64 border-r border-border bg-card p-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="grid gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || !currentUser) {
    router.push("/sign-in");
    return null;
  }

  const userRole = profile.organizations[0]?.role as "admin" | "manager" | "worker" | "customer";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar userRole={userRole} accentColor={"blue"} />

      <div className="flex-1 flex flex-col">
        <OrgHeader organizationId={orgId} />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      <MobileNav userRole={userRole} accentColor={currentOrg?.accentColor ?? "blue"} />
      
      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}
