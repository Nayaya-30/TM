"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, Users, Star, Clock } from "lucide-react";

export default function AdminAnalyticsPage() {
  const overview = useQuery(api.analytics.queries.getOverview);
  const workerProductivity = useQuery(api.analytics.queries.getWorkerProductivity);
  const currentOrg = useQuery(api.organizations.queries.getCurrent);

  if (overview === undefined || workerProductivity === undefined || currentOrg === undefined) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Skeleton className="h-8 w-64 rounded-xl bg-muted/50" />
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem] bg-muted/50" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-[2rem] bg-muted/50" />
      </div>
    );
  }

  // Check if analytics is available
  const hasAnalytics = currentOrg.subscription.tier === "pro" || currentOrg.subscription.tier === "enterprise";

  if (!hasAnalytics) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Analytics</h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Business insights and performance metrics</p>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-12 hover:shadow-xl transition-all duration-300 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative">
            <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Analytics Requires Pro Plan</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Upgrade to Pro or Enterprise to access detailed business analytics, worker performance tracking, and growth insights.
            </p>
            <Badge variant="secondary" className="text-sm px-4 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-border/50">
              Current Plan: <span className="capitalize ml-1 font-bold text-primary">{currentOrg.subscription.tier}</span>
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Analytics</h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">Business insights and performance metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            title: "Total Orders",
            value: overview.orders.total,
            subtext: `${overview.orders.completed} completed`,
            icon: Package,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
          },
          {
            title: "Task Completion",
            value: `${overview.tasks.total > 0 ? Math.round((overview.tasks.completed / overview.tasks.total) * 100) : 0}%`,
            subtext: `${overview.tasks.completed} of ${overview.tasks.total}`,
            icon: TrendingUp,
            color: "text-green-500",
            bg: "bg-green-500/10"
          },
          {
            title: "Total Customers",
            value: overview.customers,
            subtext: "Active customer base",
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
          },
          {
            title: "Avg Completion Time",
            value: overview.avgCompletionTime > 0 ? Math.round(overview.avgCompletionTime / (1000 * 60 * 60 * 24)) : 0,
            subtext: "days average",
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-500/10"
          }
        ].map((stat, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <div className={`h-10 w-10 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="relative">
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Worker Productivity */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Worker Productivity
          </h2>
          
          {workerProductivity.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-background/30 rounded-[1.5rem] border border-border/30">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No worker data available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {workerProductivity.map((worker, index) => (
                <div
                  key={worker.workerId}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-3xl bg-background/40 border border-border/30 hover:bg-background/60 transition-colors duration-300 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-muted-foreground/50 w-8">
                      #{index + 1}
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                      <span className="text-sm font-bold text-primary">
                        {worker.workerName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{worker.workerName}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {worker.completedTasks} tasks completed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pl-12 md:pl-0">
                    {worker.avgRating > 0 && (
                      <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-yellow-700 dark:text-yellow-400">{worker.avgRating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="text-right min-w-[100px]">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Completion Rate</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xl font-bold text-foreground">
                          {worker.totalTasks > 0
                            ? Math.round((worker.completedTasks / worker.totalTasks) * 100)
                            : 0}
                          %
                        </span>
                        <div className="h-8 w-1 bg-border/50 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Health */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Business Health Indicators
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                label: "Order Completion Rate",
                value: overview.orders.total > 0 ? Math.round((overview.orders.completed / overview.orders.total) * 100) : 0,
                unit: "%",
                badge: (val: number) => ({
                  text: val >= 80 ? "Good" : "Needs Improvement",
                  variant: val >= 80 ? "success" : "warning" as "success" | "warning" | "default" | "destructive" | "secondary" | "outline"
                })
              },
              {
                label: "Active Orders per Worker",
                value: overview.workers > 0 ? (overview.orders.active / overview.workers).toFixed(1) : "0",
                unit: "",
                badge: () => ({ text: "avg", variant: "secondary" as const })
              },
              {
                label: "Customer Retention",
                value: overview.customers > 0 ? Math.round((overview.orders.total / overview.customers) * 10) / 10 : "0",
                unit: "",
                badge: () => ({ text: "orders/customer", variant: "success" as const })
              }
            ].map((item, i) => {
               const badgeInfo = item.badge(Number(item.value));
               return (
                <div key={i} className="p-6 rounded-[2rem] bg-background/40 border border-border/30 hover:bg-background/60 transition-all duration-300 hover:scale-[1.02]">
                  <p className="text-sm font-medium text-muted-foreground mb-3">{item.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-4xl font-bold tracking-tight">
                      {item.value}
                      <span className="text-lg text-muted-foreground ml-1 font-medium">{item.unit}</span>
                    </span>
                    <Badge variant={badgeInfo.variant} className="mb-1 rounded-lg px-2.5">
                      {badgeInfo.text}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
