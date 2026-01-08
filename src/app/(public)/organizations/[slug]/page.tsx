"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, CheckCircle2, Phone, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
          <Skeleton className="h-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  const filteredStyles = selectedTag
    ? styles.filter((style) => style.tags.includes(selectedTag))
    : styles;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/organizations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Button>
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

      {/* Hero Section */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            {org.logo ? (
              <img
                src={org.logo}
                alt={org.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-4xl font-bold text-primary">{org.name[0]}</span>
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{org.name}</h1>
                {org.verified && (
                  <Badge variant="success" className="text-base">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-4 w-4" />
                <p>{org.location.address}</p>
              </div>

              <div className="flex gap-4">
                <Link href="/sign-up">
                  <Button>Book an Appointment</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filter Tags */}
        {styleTags.length > 0 && (
          <div className="mb-8">
            <p className="text-sm font-medium mb-3">Filter by Style</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All ({styles.length})
              </Button>
              {styleTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Styles Grid */}
        {filteredStyles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No styles to display</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStyles.map((style) => (
              <Card key={style._id} className="overflow-hidden">
                {style.images.length > 0 && (
                  <img
                    src={style.images[0]}
                    alt={style.name}
                    className="w-full h-64 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{style.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {style.tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  {style.importedFrom && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Imported from {style.importedFrom}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}