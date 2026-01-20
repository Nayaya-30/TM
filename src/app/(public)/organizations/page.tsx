"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OrganizationsPage() {
	const organizations = useQuery(api.organizations.queries.list, { limit: 50 });
	const [search, setSearch] = useState("");
	const [verifiedOnly, setVerifiedOnly] = useState(false);

	if (organizations === undefined) {
		return (
			<div className="min-h-screen bg-background">
				{/* Header Skeleton */}
				<div className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50" />
				
				<div className="container mx-auto px-4 pt-32 pb-12">
					<div className="max-w-2xl mx-auto text-center mb-12">
						<Skeleton className="h-12 w-3/4 mx-auto mb-4 rounded-xl" />
						<Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
					</div>
					
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Skeleton key={i} className="h-[300px] rounded-3xl" />
						))}
					</div>
				</div>
			</div>
		);
	}

	let filteredOrgs = organizations;

	if (verifiedOnly) {
		filteredOrgs = filteredOrgs.filter((org) => org.verified);
	}

	if (search) {
		const searchLower = search.toLowerCase();
		filteredOrgs = filteredOrgs.filter(
			(org) =>
				org.name.toLowerCase().includes(searchLower) ||
				org.location.address.toLowerCase().includes(searchLower)
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Header */}
			<header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
				<div className="container mx-auto px-4 h-16 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
							<div className="h-4 w-4 rounded-full bg-primary" />
						</div>
						<span className="font-bold text-xl tracking-tight">TailorMade</span>
					</Link>
					
					<nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
						<Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
						<Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
						<Link href="/organizations" className="text-primary font-semibold">Find Tailors</Link>
					</nav>

					<div className="flex items-center gap-3">
						<ThemeToggle />
						<Link href="/sign-in">
							<Button variant="ghost" size="sm">Sign In</Button>
						</Link>
						<Link href="/sign-up">
							<Button size="sm" className="rounded-full px-6">Get Started</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-1 pt-32 pb-12">
				<div className="container mx-auto px-4">
					{/* Hero Section */}
					<div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
						<h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
							Find Your Perfect Tailor
						</h1>
						<p className="text-lg text-muted-foreground mb-8">
							Discover top-rated tailoring businesses, view their portfolios, and get your custom measurements taken by professionals.
						</p>

						{/* Search & Filters */}
						<div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
							<div className="relative flex-1 group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
								<Input
									placeholder="Search by name or location..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-11 h-12 rounded-2xl bg-muted/50 border-transparent focus:bg-background focus:border-primary/20 transition-all"
								/>
							</div>
							<Button
								variant={verifiedOnly ? "default" : "outline"}
								onClick={() => setVerifiedOnly(!verifiedOnly)}
								className={`h-12 rounded-2xl px-6 transition-all ${
									verifiedOnly ? "shadow-md shadow-primary/20" : "bg-muted/50 border-transparent hover:bg-muted"
								}`}
							>
								<CheckCircle2 className={`h-4 w-4 mr-2 ${verifiedOnly ? "text-primary-foreground" : "text-muted-foreground"}`} />
								Verified Only
							</Button>
						</div>
					</div>

					{/* Organizations Grid */}
					{filteredOrgs.length === 0 ? (
						<div className="max-w-md mx-auto text-center py-20 rounded-3xl border border-dashed border-border/50 bg-muted/30">
							<div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
								<Search className="h-8 w-8 text-muted-foreground/50" />
							</div>
							<h3 className="text-lg font-semibold mb-2">No organizations found</h3>
							<p className="text-muted-foreground">
								Try adjusting your search terms or filters
							</p>
						</div>
					) : (
						<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
							{filteredOrgs.map((org) => (
								<Link href={`/organizations/${org.slug}`} key={org._id}>
									<div className="group relative h-full overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
										<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
										
										<div className="p-6 relative flex flex-col h-full">
											<div className="flex items-start justify-between mb-4">
												<div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
													{org.logo ? (
														<img src={org.logo} alt={org.name} className="h-full w-full object-cover" />
													) : (
														<span className="text-2xl font-bold text-primary">{org.name[0]}</span>
													)}
												</div>
												{org.verified && (
													<Badge className="rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 px-3 py-1">
														<CheckCircle2 className="h-3 w-3 mr-1" />
														Verified
													</Badge>
												)}
											</div>

											<h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
												{org.name}
											</h3>
											
											<div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
												<MapPin className="h-4 w-4" />
												<span className="truncate">{org.location.address}</span>
											</div>

											<div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
												<span className="text-sm font-medium text-primary">View Profile</span>
												<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
													<ArrowRight className="h-4 w-4" />
												</div>
											</div>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
