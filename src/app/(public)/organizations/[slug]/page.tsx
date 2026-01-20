"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle2, ArrowLeft, Calendar, Mail, Phone, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
        <div className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl fixed top-0 w-full z-50" />
        <div className="container mx-auto px-4 pt-32 pb-12">
          <Skeleton className="h-64 mb-12 rounded-3xl" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredStyles = selectedTag
    ? styles.filter((style) => style.tags.includes(selectedTag))
    : styles;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/organizations">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">TailorMade</span>
            </Link>
          </div>

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

      <main className="flex-1 pt-24 pb-12">
        {/* Hero Section */}
        <div className="container mx-auto px-4 mb-16">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-8">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden shadow-xl">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-primary">{org.name[0]}</span>
                )}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {org.name}
                  </h1>
                  {org.verified && (
                    <Badge className="rounded-full bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 px-3 py-1 text-sm">
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      Verified Business
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{org.location.address}</span>
                  </div>
                  {/* Placeholder for future contact info if available in schema */}
                  {/* <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>contact@{org.slug}.com</span>
                  </div> */}
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href={`/sign-up?org=${org.slug}`}>
                    <Button size="lg" className="rounded-full px-8 h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-full px-8 h-12 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Content */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Portfolio Showcase</h2>
              <p className="text-muted-foreground">Explore our latest work and available styles</p>
            </div>

            {/* Filter Tags */}
            {styleTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTag === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(null)}
                  className="rounded-full"
                >
                  All Styles
                  <Badge variant="secondary" className="ml-2 rounded-full bg-background/20 text-current">
                    {styles.length}
                  </Badge>
                </Button>
                {styleTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="rounded-full"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Styles Grid */}
          {filteredStyles.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-20 rounded-3xl border border-dashed border-border/50 bg-muted/30">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No styles found</h3>
              <p className="text-muted-foreground">
                This organization hasn't uploaded any styles yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredStyles.map((style) => (
                <div key={style._id} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  {/* Image Aspect Ratio Container */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                    {style.images.length > 0 ? (
                      <img
                        src={style.images[0]}
                        alt={style.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted/50">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl tracking-tight">{style.name}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {style.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {style.importedFrom && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
                        <ExternalLink className="h-3 w-3" />
                        <span>Imported from {style.importedFrom}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
