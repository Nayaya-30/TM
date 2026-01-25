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
import { ThemeToggle } from "@/components/theme-toggle";

/* -------------------------------------------------------------------------- */
/* ORG HEADER                                                                 */
/* -------------------------------------------------------------------------- */

function OrgHeader({ organizationId }: { organizationId: string | null }) {
	const org = useQuery(
		api.organizations.queries.get,
		organizationId ? { organizationId } : "skip"
	);

	if (!org) return null;

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
			<div className="flex items-center justify-between px-4 lg:px-6 h-16">
				<div className="flex items-center gap-3">
					{org.logo && (
						<img
							src={org.logo}
							alt={org.name}
							className="h-8 w-8 rounded-lg object-cover"
						/>
					)}
					<div>
						<h1 className="font-semibold">{org.name}</h1>
						{org.verified && (
							<span className="text-xs text-muted-foreground">
								✓ Verified
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<ThemeToggle />
					<button className="p-2 rounded-lg hover:bg-accent transition-colors">
						<MessageCircle className="h-5 w-5" />
					</button>
					<button className="p-2 rounded-lg hover:bg-accent transition-colors">
						<Bell className="h-5 w-5" />
					</button>
				</div>
			</div>
		</header>
	);
}

/* -------------------------------------------------------------------------- */
/* DASHBOARD LAYOUT                                                           */
/* -------------------------------------------------------------------------- */

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const { data: session, status } = useSession();

	// 🚨 AUTH GATE — do not touch Convex yet
	if (status === "loading") {
		return <LoadingShell />;
	}

	if (status === "unauthenticated" || !session?.user?.id) {
		router.push("/sign-in");
		return null;
	}

	const userId = session.user.id as string;

	/* --------------------------- CONVEX QUERIES --------------------------- */

	const currentUser = useQuery(
		api.users.queries.getCurrentUser,
		{ userId: userId ?? "" },
		{ enabled: !!userId }
	);

	const profile = useQuery(
		api.users.queries.getProfile,
		{ userId: userId ?? "" },
		{ enabled: !!userId }
	);

	// Still loading Convex data
	if (status === "loading" || currentUser === undefined || profile === undefined) {
  return <LoadingShell />;
}

if (!session || !userId || !currentUser || !profile) {
  router.push("/sign-in");
  return null;
}

	/* --------------------------- DERIVED STATE ---------------------------- */

	const primaryOrg = profile.organizations[0] ?? null;

	const userRole =
		(primaryOrg?.role as
			| "admin"
			| "manager"
			| "worker"
			| "customer") ?? "customer";

	const organizationId = primaryOrg?.organizationId ?? null;
	const accentColor = primaryOrg?.accentColor ?? "blue";

	/* ------------------------------ RENDER ------------------------------- */

	return (
		<div className="min-h-screen flex flex-col lg:flex-row bg-background relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
			<div className="absolute inset-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

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

/* -------------------------------------------------------------------------- */
/* LOADING SHELL                                                              */
/* -------------------------------------------------------------------------- */

function LoadingShell() {
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