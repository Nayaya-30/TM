"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FloatingChat } from "@/components/ui/floating-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const currentOrg = useQuery(api.organizations.queries.getCurrent);
  const profile = useQuery(api.users.queries.getProfile);

  if (currentUser === undefined || currentOrg === undefined || profile === undefined) {
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

  if (!currentUser) {
    router.push("/sign-in");
    return null;
  }

  const userRole = profile.organizations[0]?.role as "admin" | "manager" | "worker" | "customer";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <Sidebar userRole={userRole} accentColor={currentOrg.accentColor} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              {currentOrg.logo && (
                <img
                  src={currentOrg.logo}
                  alt={currentOrg.name}
                  className="h-8 w-8 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="font-semibold">{currentOrg.name}</h1>
                {currentOrg.verified && (
                  <span className="text-xs text-muted-foreground">✓ Verified</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg hover:bg-accent transition-colors relative"
                onClick={() => router.push("/chat")}
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
                <Bell className="h-5 w-5" />
              </button>
              <div className="hidden lg:flex items-center gap-3 ml-4 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {currentUser.firstName[0]}
                    {currentUser.lastName[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
      </div>

      <MobileNav userRole={userRole} accentColor={currentOrg.accentColor} />
      
      {/* Floating Chat */}
      <FloatingChat />
    </div>
  );
}