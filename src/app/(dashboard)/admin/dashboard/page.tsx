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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete overview of your business operations</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.orders.active} active • {stats.orders.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customers}</div>
            <p className="text-xs text-muted-foreground">Total customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workers}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tasks.completed} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(ordersSummary.overdue > 0 || materialsSummary.lowStock > 0) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Alerts & Warnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ordersSummary.overdue > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-destructive">
                <div>
                  <p className="font-medium">Overdue Orders</p>
                  <p className="text-sm text-muted-foreground">
                    {ordersSummary.overdue} order{ordersSummary.overdue > 1 ? "s" : ""} past deadline
                  </p>
                </div>
                <Link href="/manager/orders?overdue=true">
                  <Button variant="ghost" size="sm">
                    Review
                  </Button>
                </Link>
              </div>
            )}
            {materialsSummary.lowStock > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-yellow-500">
                <div>
                  <p className="font-medium">Low Stock Materials</p>
                  <p className="text-sm text-muted-foreground">
                    {materialsSummary.lowStock} material{materialsSummary.lowStock > 1 ? "s" : ""} need reordering
                  </p>
                </div>
                <Link href="/admin/materials?lowStock=true">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Cutting</span>
                <span className="font-medium">{ordersSummary.byStage.cutting}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sewing</span>
                <span className="font-medium">{ordersSummary.byStage.sewing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Finishing</span>
                <span className="font-medium">{ordersSummary.byStage.finishing}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Delivery</span>
                <span className="font-medium">{ordersSummary.byStage.delivery}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5" />
              Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Materials</span>
                <span className="font-medium">{materialsSummary.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock</span>
                <span className="font-medium text-yellow-600">{materialsSummary.lowStock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Out of Stock</span>
                <span className="font-medium text-destructive">{materialsSummary.outOfStock}</span>
              </div>
              {materialsSummary.totalValue > 0 && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-sm font-medium">Total Value</span>
                  <span className="font-medium">₦{materialsSummary.totalValue.toFixed(2)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/materials">
              <Button variant="outline" className="w-full justify-start">
                <Boxes className="mr-2 h-4 w-4" />
                Manage Materials
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Organization Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicator */}
      <Card>
        <CardHeader>
          <CardTitle>Business Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Order Completion Rate</p>
              <p className="text-2xl font-bold">
                {stats.orders.total > 0
                  ? Math.round((stats.orders.completed / stats.orders.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Task Completion Rate</p>
              <p className="text-2xl font-bold">
                {stats.tasks.total > 0
                  ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground mb-1">Active Orders Per Worker</p>
              <p className="text-2xl font-bold">
                {stats.workers > 0
                  ? Math.round((stats.orders.active / stats.workers) * 10) / 10
                  : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}