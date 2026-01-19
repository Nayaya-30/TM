"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, Users, ListChecks, AlertTriangle, Plus } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function ManagerDashboardPage() {
  const ordersSummary = useQuery(api.orders.queries.getSummary);
  const tasksSummary = useQuery(api.tasks.queries.getSummary);
  const orders = useQuery(api.orders.queries.list, { limit: 5 });
  const workers = useQuery(api.members.queries.listWorkersWithStats);

  if (
    ordersSummary === undefined ||
    tasksSummary === undefined ||
    orders === undefined ||
    workers === undefined
  ) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-5 w-96 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Manager Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Oversee orders, tasks, and team performance
          </p>
        </div>
        <Link href="/manager/orders">
          <Button className="rounded-full shadow-lg hover:shadow-xl transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </Link>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
               <Package className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ordersSummary.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {ordersSummary.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
               <ListChecks className="h-4 w-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasksSummary.total - tasksSummary.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {tasksSummary.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
            <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
               <Users className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active team members</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
               <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {ordersSummary.overdue + tasksSummary.overdue}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(ordersSummary.overdue > 0 || tasksSummary.overdue > 0) && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ordersSummary.overdue > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-destructive">
                  <span className="text-sm">
                    {ordersSummary.overdue} overdue order{ordersSummary.overdue > 1 ? "s" : ""}
                  </span>
                  <Link href="/manager/orders?overdue=true">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}
              {tasksSummary.overdue > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-destructive">
                  <span className="text-sm">
                    {tasksSummary.overdue} overdue task{tasksSummary.overdue > 1 ? "s" : ""}
                  </span>
                  <Link href="/manager/tasks?overdue=true">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/manager/orders">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{order.orderNumber}</p>
                      <Badge
                        variant={
                          order.isOverdue
                            ? "danger"
                            : order.currentStage === "delivery"
                            ? "success"
                            : "info"
                        }
                      >
                        {order.currentStage}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Tasks: {order.taskStats.completed}/{order.taskStats.total}</span>
                      {order.isOverdue && (
                        <span className="text-destructive">Overdue</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(order.estimatedDelivery, "MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Worker Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Performance</CardTitle>
          <Link href="/manager/workers">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {workers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No workers assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workers.slice(0, 5).map((worker) => (
                <div
                  key={worker.membershipId}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {worker.user?.firstName[0]}
                        {worker.user?.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {worker.user?.firstName} {worker.user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {worker.stats.activeTasks} active • {worker.stats.completedTasks} completed
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {worker.stats.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">
                          {worker.stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ 5.0</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}