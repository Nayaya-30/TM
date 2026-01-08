"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Palette, Plus, Package } from "lucide-react";

export default function AdminFabricsPage() {
  const fabrics = useQuery(api.fabrics.queries.list);
  const summary = useQuery(api.fabrics.queries.getSummary);

  if (fabrics === undefined || summary === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fabric Catalog</h1>
          <p className="text-muted-foreground">Manage fabrics visible to customers</p>
        </div>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Fabric (Coming Soon)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fabrics</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.inStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Colors</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.uniqueColors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Fabrics Grid */}
      {fabrics.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Palette className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No fabrics yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add fabrics to your catalog for customers to browse
            </p>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Fabric
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fabrics.map((fabric) => (
            <Card key={fabric._id}>
              <CardContent className="p-0">
                {fabric.images.length > 0 && (
                  <img
                    src={fabric.images[0]}
                    alt={fabric.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{fabric.name}</h3>
                      {fabric.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {fabric.description}
                        </p>
                      )}
                    </div>
                    <Badge variant={fabric.inStock ? "success" : "danger"}>
                      {fabric.inStock ? "In Stock" : "Out"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Color</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className="w-4 h-4 rounded border border-border"
                          style={{ backgroundColor: fabric.color }}
                        />
                        <span className="font-medium">{fabric.color}</span>
                      </div>
                    </div>
                    {fabric.pricePerUnit && (
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium mt-1">
                          ₦{fabric.pricePerUnit}/{fabric.unit}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {fabric.tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}