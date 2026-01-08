"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Users, Star, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
  const overview = useQuery(api.analytics.queries.getOverview);
  const workerProductivity = useQuery(api.analytics.queries.getWorkerProductivity);
  const currentOrg = useQuery(api.organizations.queries.getCurrent);

  if (overview === undefined || workerProductivity === undefined || currentOrg === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Check if analytics is available
  const hasAnalytics = currentOrg.subscription.tier === "pro" || currentOrg.subscription.tier === "enterprise";

  if (!hasAnalytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Analytics Requires Pro Plan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro or Enterprise to access detailed business analytics
            </p>
            <Badge variant="info">Current: {currentOrg.subscription.tier}</Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Business insights and performance metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              {overview.orders.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.tasks.total > 0
                ? Math.round((overview.tasks.completed / overview.tasks.total) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.tasks.completed} of {overview.tasks.total}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.customers}</div>
            <p className="text-xs text-muted-foreground">Active customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.avgCompletionTime > 0
                ? Math.round(overview.avgCompletionTime / (1000 * 60 * 60 * 24))
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Worker Productivity */}
      <Card>
        <CardHeader>
          <CardTitle>Worker Productivity</CardTitle>
        </CardHeader>
        <CardContent>
          {workerProductivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No worker data available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workerProductivity.map((worker, index) => (
                <div
                  key={worker.workerId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {worker.workerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{worker.workerName}</p>
                      <p className="text-sm text-muted-foreground">
                        {worker.completedTasks} tasks completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {worker.avgRating > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{worker.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <p className="font-medium">
                        {worker.totalTasks > 0
                          ? Math.round((worker.completedTasks / worker.totalTasks) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Health */}
      <Card>
        <CardHeader>
          <CardTitle>Business Health Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Order Completion Rate</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {overview.orders.total > 0
                    ? Math.round((overview.orders.completed / overview.orders.total) * 100)
                    : 0}
                  %
                </span>
                <Badge
                  variant={
                    overview.orders.total > 0 &&
                    (overview.orders.completed / overview.orders.total) * 100 >= 80
                      ? "success"
                      : "warning"
                  }
                >
                  {overview.orders.total > 0 &&
                  (overview.orders.completed / overview.orders.total) * 100 >= 80
                    ? "Good"
                    : "Needs Improvement"}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Active Orders per Worker</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {overview.workers > 0
                    ? (overview.orders.active / overview.workers).toFixed(1)
                    : 0}
                </span>
                <Badge variant="info">avg</Badge>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-2">Customer Retention</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {overview.customers > 0
                    ? Math.round((overview.orders.total / overview.customers) * 10) / 10
                    : 0}
                </span>
                <Badge variant="success">orders/customer</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}