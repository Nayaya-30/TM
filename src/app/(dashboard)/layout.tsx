"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FloatingChat } from "@/components/ui/floating-chat";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useEffect } from "react";

/* -------------------------------------------------------------------------- */
/* ORG HEADER                                                                 */
/* -------------------------------------------------------------------------- */

function OrgHeader({ organizationId }: { organizationId: string | null }) {
	const org = useQuery(
		api.organizations.queries.get,
		organizationId ? { organizationId: organizationId as any } : "skip"
	);

	// If no org (common for pure customers), show a default brand header or nothing
	if (!org) return (
		<header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm h-16 flex items-center px-4 lg:px-6">
			<h1 className="font-bold text-xl text-primary">TailorFlow</h1>
		</header>
	);

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
			<div className="flex items-center justify-between px-4 lg:px-6 h-16">
				<div className="flex items-center gap-3">
					{org.logo ? (
						<img src={org.logo} alt={org.name} className="h-8 w-8 rounded-lg object-cover" />
					) : (
						<div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
							{org.name[0]}
						</div>
					)}
					<div>
						<h1 className="font-semibold">{org.name}</h1>
						{org.verified && <span className="text-[10px] uppercase tracking-wider text-green-600 font-bold">Verified</span>}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<ThemeToggle />
					<button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
						<MessageCircle className="h-5 w-5" />
					</button>
					<button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
						<Bell className="h-5 w-5" />
						<span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-card" />
					</button>
				</div>
			</div>
		</header>
	);
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD LAYOUT                                                           */
/* -------------------------------------------------------------------------- */

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();

	// Only fetch profile if authenticated - this prevents the "Unauthenticated" error
	const profile = useQuery(
		api.users.queries.getProfile,
		isAuthenticated ? {} : "skip"
	);

	// Redirect logic in a useEffect to avoid side effects during render
	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push("/sign-in");
		}
	}, [isLoading, isAuthenticated, router]);

	// Wait for Auth check to complete
	if (isLoading) {
		return <LoadingShell />;
	}

	// If not authenticated after loading, don't render (will redirect)
	if (!isAuthenticated) {
		return null;
	}

	// Wait for Profile data to load
	if (profile === undefined) {
		return <LoadingShell />;
	}

	// Handle case where profile doesn't exist (shouldn't happen but good to check)
	if (profile === null) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="text-center space-y-4">
					<h1 className="text-2xl font-bold">Profile Not Found</h1>
					<p className="text-muted-foreground">
						Your account exists but your profile is missing. Please contact support.
					</p>
				</div>
			</div>
		);
	}

	/* --------------------------- DERIVED STATE ---------------------------- */
	// Check if user has an organization (Admins/Managers/Workers)
	const primaryOrg = profile.organizations?.[0] ?? null;
	
	// Default to 'customer' if no specific org-role is found
	const userRole = primaryOrg?.role ?? profile.user?.role ?? "customer";
	const organizationId = primaryOrg?.organizationId ?? null;
	const accentColor = "blue"; // You can add this to your org data if needed

	return (
		<div className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden">
			<Sidebar userRole={userRole} accentColor={accentColor} />

			<div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300 relative z-10">
				<OrgHeader organizationId={organizationId} />
				<main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
					{children}
				</main>
			</div>

			<MobileNav userRole={userRole} accentColor={accentColor} />
			<FloatingChat />
		</div>
	);
}

function LoadingShell() {
	return (
		<div className="min-h-screen flex bg-background">
			<div className="hidden lg:block w-72 border-r border-border bg-card p-6 space-y-8">
				<Skeleton className="h-10 w-32" />
				<div className="space-y-4">
					<Skeleton className="h-12 w-full rounded-xl" />
					<Skeleton className="h-12 w-full rounded-xl" />
					<Skeleton className="h-12 w-full rounded-xl" />
				</div>
			</div>
			<div className="flex-1 flex flex-col">
				<div className="h-16 border-b border-border px-6 flex items-center justify-between">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-10 w-24 rounded-full" />
				</div>
				<div className="p-6 space-y-6">
					<Skeleton className="h-10 w-64" />
					<div className="grid gap-6 md:grid-cols-3">
						<Skeleton className="h-32 rounded-3xl" />
						<Skeleton className="h-32 rounded-3xl" />
						<Skeleton className="h-32 rounded-3xl" />
					</div>
				</div>
			</div>
		</div>
	);
}