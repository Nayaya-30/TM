"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function OrganizationsPage() {
	const organizations = useQuery(api.organizations.queries.list, { limit: 50 });
	const [search, setSearch] = useState("");
	const [verifiedOnly, setVerifiedOnly] = useState(false);

	if (organizations === undefined) {
		return (
			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8">
					<Skeleton className="h-12 w-64 mb-8" />
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						<Skeleton className="h-64" />
						<Skeleton className="h-64" />
						<Skeleton className="h-64" />
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
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
			{/* Header */}
			<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<Link href="/">
						<h1 className="text-2xl font-bold">Tailoring Platform</h1>
					</Link>
					<div className="flex gap-2">
						<Link href="/sign-in">
							<Button variant="ghost">Sign In</Button>
						</Link>
						<Link href="/sign-up">
							<Button>Get Started</Button>
						</Link>
					</div>
				</div>
			</header>

			<div className="container mx-auto px-4 py-12">
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-4">Find Your Tailor</h1>
					<p className="text-lg text-muted-foreground">
						Browse verified tailoring businesses and view their work
					</p>
				</div>

				{/* Search & Filters */}
				<div className="flex flex-col md:flex-row gap-4 mb-8">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search by name or location..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-10"
						/>
					</div>
					<Button
						variant={verifiedOnly ? "primary" : "outline"}
						onClick={() => setVerifiedOnly(!verifiedOnly)}
					>
						<CheckCircle2 className="h-4 w-4 mr-2" />
						Verified Only
					</Button>
				</div>

				{/* Organizations Grid */}
				{filteredOrgs.length === 0 ? (
					<Card>
						<CardContent className="text-center py-12">
							<p className="text-muted-foreground">No organizations found</p>
						</CardContent>
					</Card>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{filteredOrgs.map((org) => (
							<Link key={org._id} href={`/org/${org.slug}`}>
								<Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
									<CardContent className="p-6">
										<div className="flex items-start gap-4 mb-4">
											{org.logo ? (
												<img
													src={org.logo}
													alt={org.name}
													className="h-16 w-16 rounded-lg object-cover"
												/>
											) : (
												<div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
													<span className="text-2xl font-bold text-primary">
														{org.name[0]}
													</span>
												</div>
											)}
											<div className="flex-1">
												<div className="flex items-start justify-between gap-2">
													<h3 className="font-semibold text-lg">{org.name}</h3>
													{org.verified && (
														<Badge variant="success" className="flex-shrink-0">
															<CheckCircle2 className="h-3 w-3 mr-1" />
															Verified
														</Badge>
													)}
												</div>
											</div>
										</div>

										<div className="flex items-start gap-2 text-sm text-muted-foreground">
											<MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
											<p>{org.location.address}</p>
										</div>

										<div className="mt-4 pt-4 border-t border-border">
											<Button variant="outline" className="w-full">
												View Showcase
											</Button>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}