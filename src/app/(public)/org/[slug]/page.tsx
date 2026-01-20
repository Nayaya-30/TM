"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle2, ArrowLeft, Calendar, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";
import { ThemeToggle } from "@/components/theme-toggle";

export default function OrgShowcasePage({ params }: { params: { slug: string } }) {
  const org = useQuery(api.organizations.queries.getBySlug, { slug: params.slug });
  const styles = useQuery(
    api.styles.queries.listByOrg,
    org ? { organizationId: org._id } : "skip"
  );
  const styleTags = useQuery(
    api.styles.queries.getTags,
    org ? { organizationId: org._id } : "skip"
  );

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (org === undefined || styles === undefined || styleTags === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 mb-8 rounded-[2.5rem]" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const filteredStyles = selectedTag
    ? styles.filter((style) => style.tags.includes(selectedTag))
    : styles;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-background to-secondary/5 opacity-40" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/org" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="font-medium">Back to Organizations</span>
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

        {/* Hero Section */}
        <div className="relative border-b border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 shadow-inner border border-primary/10">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-full w-full rounded-[2rem] object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-primary">
                    {org.name[0]}
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{org.name}</h1>
                  {org.verified && (
                    <Badge variant="outline" className="px-3 py-1 rounded-full bg-primary/10 border-primary/20 text-primary gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-6 text-muted-foreground mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{org.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Member since {new Date(org._creationTime).getFullYear()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/sign-up">
                    <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all px-8">
                      Book Appointment
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-xl hover:bg-primary/5">
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Content */}
        <main className="container mx-auto px-4 py-12 flex-1">
          {/* Filter Tags */}
          {styleTags.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Our Collection</h2>
                <span className="text-muted-foreground">{filteredStyles.length} styles available</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  className={clsx(
                    "rounded-full px-6 transition-all",
                    selectedTag === null ? "shadow-md shadow-primary/20" : "hover:bg-primary/5"
                  )}
                >
                  All Styles
                </Button>
                {styleTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className={clsx(
                      "rounded-full px-6 transition-all",
                      selectedTag === tag ? "shadow-md shadow-primary/20" : "hover:bg-primary/5"
                    )}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Styles Grid */}
          {filteredStyles.length === 0 ? (
            <div className="text-center py-24 bg-card/30 rounded-[2.5rem] border border-border/50">
              <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No styles found</h3>
              <p className="text-muted-foreground">Try selecting a different category</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStyles.map((style) => (
                <div key={style._id} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image Container */}
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    {style.images.length > 0 ? (
                      <img
                        src={style.images[0]}
                        alt={style.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/20">
                        <span className="text-4xl font-bold">No Image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">{style.name}</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {style.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/10">
                            {tag}
                          </span>
                        ))}
                        {style.tags.length > 3 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/10">
                            +{style.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-sm mb-4">
                      {style.importedFrom && (
                        <span className="text-muted-foreground text-xs">
                          Via {style.importedFrom}
                        </span>
                      )}
                    </div>
                    
                    <Button className="w-full rounded-xl" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
