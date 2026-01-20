"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Users, DollarSign, TrendingUp, Boxes, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = useQuery(api.organizations.queries.getStats);
  const materialsSummary = useQuery(api.materials.queries.getSummary);
  const ordersSummary = useQuery(api.orders.queries.getSummary);

  if (stats === undefined || materialsSummary === undefined || ordersSummary === undefined) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Skeleton className="h-12 w-64 rounded-2xl bg-muted/50" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-40 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-40 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-40 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-40 rounded-[2rem] bg-muted/50" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-[2rem] bg-muted/50" />
          <Skeleton className="h-64 rounded-[2rem] bg-muted/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">
            Complete overview of your business operations
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="relative">
            <div className="text-3xl font-bold tracking-tight">{stats.orders.total}</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              {stats.orders.active} active • {stats.orders.completed} completed
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Customers</h3>
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="relative">
            <div className="text-3xl font-bold tracking-tight">{stats.customers}</div>
            <p className="text-xs text-muted-foreground mt-2">Total customer base</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Workers</h3>
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Users className="h-5 w-5 text-indigo-500" />
            </div>
          </div>
          <div className="relative">
            <div className="text-3xl font-bold tracking-tight">{stats.workers}</div>
            <p className="text-xs text-muted-foreground mt-2">Active team members</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Tasks</h3>
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="relative">
            <div className="text-3xl font-bold tracking-tight">{stats.tasks.total}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.tasks.completed} completed
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(ordersSummary.overdue > 0 || materialsSummary.lowStock > 0) && (
        <div className="group relative overflow-hidden rounded-[2rem] border-destructive/20 bg-destructive/5 backdrop-blur-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-destructive">Alerts & Warnings</h3>
          </div>
          <div className="space-y-3">
            {ordersSummary.overdue > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-destructive/20 hover:border-destructive/40 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">Overdue Orders</p>
                  <p className="text-sm text-muted-foreground">
                    {ordersSummary.overdue} order{ordersSummary.overdue > 1 ? "s" : ""} past deadline
                  </p>
                </div>
                <Link href="/manager/orders?overdue=true">
                  <Button variant="ghost" size="sm" className="hover:bg-destructive/10 hover:text-destructive rounded-xl">
                    Review
                  </Button>
                </Link>
              </div>
            )}
            {materialsSummary.lowStock > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                <div>
                  <p className="font-semibold text-foreground">Low Stock Materials</p>
                  <p className="text-sm text-muted-foreground">
                    {materialsSummary.lowStock} material{materialsSummary.lowStock > 1 ? "s" : ""} need reordering
                  </p>
                </div>
                <Link href="/admin/materials?lowStock=true">
                  <Button variant="ghost" size="sm" className="hover:bg-yellow-500/10 hover:text-yellow-600 rounded-xl">
                    View
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold">Order Stages</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
              <span className="text-sm font-medium">Cutting</span>
              <span className="font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs">{ordersSummary.byStage.cutting}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
              <span className="text-sm font-medium">Sewing</span>
              <span className="font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-xs">{ordersSummary.byStage.sewing}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-purple-200 dark:hover:border-purple-900/50 transition-colors">
              <span className="text-sm font-medium">Finishing</span>
              <span className="font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full text-xs">{ordersSummary.byStage.finishing}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50 hover:border-green-200 dark:hover:border-green-900/50 transition-colors">
              <span className="text-sm font-medium">Delivery</span>
              <span className="font-bold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs">{ordersSummary.byStage.delivery}</span>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-pink-500/10 flex items-center justify-center">
              <Boxes className="h-5 w-5 text-pink-500" />
            </div>
            <h3 className="text-lg font-semibold">Inventory</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50">
              <span className="text-sm font-medium">Total Materials</span>
              <span className="font-bold">{materialsSummary.total}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50">
              <span className="text-sm font-medium">Low Stock</span>
              <span className="font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full text-xs">{materialsSummary.lowStock}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-background/50 border border-border/50">
              <span className="text-sm font-medium">Out of Stock</span>
              <span className="font-bold text-destructive bg-destructive/10 px-3 py-1 rounded-full text-xs">{materialsSummary.outOfStock}</span>
            </div>
            {materialsSummary.totalValue > 0 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/50">
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
                <span className="font-bold text-xl text-primary">₦{materialsSummary.totalValue.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
               <TrendingUp className="h-5 w-5 text-cyan-500" />
            </div>
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="space-y-4">
            <Link href="/admin/materials">
              <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-background/80 hover:border-blue-500/30 transition-all group/btn">
                <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                   <Boxes className="h-4 w-4 text-blue-500" />
                </div>
                Manage Materials
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-background/80 hover:border-purple-500/30 transition-all group/btn">
                <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                   <TrendingUp className="h-4 w-4 text-purple-500" />
                </div>
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-border/50 hover:bg-background/80 hover:border-gray-500/30 transition-all group/btn">
                <div className="h-8 w-8 rounded-xl bg-gray-500/10 flex items-center justify-center mr-3 group-hover/btn:scale-110 transition-transform duration-300">
                   <Package className="h-4 w-4 text-gray-500" />
                </div>
                Organization Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300">
         <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-center gap-3 mb-6">
           <div className="h-10 w-10 rounded-2xl bg-teal-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-teal-500" />
           </div>
           <h3 className="text-lg font-semibold">Business Health</h3>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-3xl bg-background/40 border border-border/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 hover:bg-background/60 hover:shadow-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Order Completion</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
              {stats.orders.total > 0
                ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                : 0}
              <span className="text-2xl ml-1 text-muted-foreground/50">%</span>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-background/40 border border-border/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 hover:bg-background/60 hover:shadow-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Task Completion</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              {stats.tasks.total > 0
                ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
                : 0}
              <span className="text-2xl ml-1 text-muted-foreground/50">%</span>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-background/40 border border-border/50 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300 hover:bg-background/60 hover:shadow-lg">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Orders Per Worker</p>
            <div className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {stats.workers > 0
                ? Math.round((stats.orders.active / stats.workers) * 10) / 10
                : 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}