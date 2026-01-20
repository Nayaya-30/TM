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
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";

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
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/5 opacity-40" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-lg font-bold text-primary">TM</span>
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                TailorMaster
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2 border-l border-border/50 pl-4">
                <Link href="/sign-in">
                  <Button variant="ghost" className="hover:bg-primary/5">Sign In</Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 flex-1">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4 px-4 py-1 rounded-full bg-primary/5 border-primary/20 text-primary animate-fade-in">
              Verified Tailors
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 tracking-tight">
              Find Your Perfect <br />
              <span className="text-primary">Tailoring Partner</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our curated list of verified tailoring businesses. View their portfolios, 
              check reviews, and book appointments directly.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="p-2 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-12 bg-transparent border-transparent focus-visible:ring-0 text-base"
                />
              </div>
              <Button
                variant={verifiedOnly ? "default" : "ghost"}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={clsx(
                  "h-12 px-6 rounded-xl transition-all",
                  verifiedOnly ? "shadow-lg shadow-primary/25" : "hover:bg-primary/5"
                )}
              >
                <CheckCircle2 className={clsx("h-4 w-4 mr-2", verifiedOnly ? "text-primary-foreground" : "text-primary")} />
                Verified Only
              </Button>
            </div>
          </div>

          {/* Organizations Grid */}
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-24 w-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No organizations found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrgs.map((org) => (
                <Link key={org._id} href={`/org/${org.slug}`} className="block h-full">
                  <div className="group relative h-full overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative flex items-start gap-4 mb-6">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10 group-hover:scale-105 transition-transform duration-500">
                        {org.logo ? (
                          <img
                            src={org.logo}
                            alt={org.name}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        ) : (
                          <span className="text-3xl font-bold text-primary">
                            {org.name[0]}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-lg truncate pr-2">{org.name}</h3>
                          {org.verified && (
                            <div className="flex-shrink-0 text-primary" title="Verified">
                              <CheckCircle2 className="h-5 w-5 fill-primary/10" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <p className="truncate">{org.location.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="relative pt-6 border-t border-border/50 mt-auto">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-muted-foreground group-hover:text-primary transition-colors">View Showcase</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
