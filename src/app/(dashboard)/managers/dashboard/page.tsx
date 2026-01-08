"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, Users, ListChecks, AlertTriangle } from "lucide-react";
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
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
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Oversee orders, tasks, and team performance</p>
        </div>
        <Link href="/manager/orders">
          <Button>Create Order</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersSummary.active}</div>
            <p className="text-xs text-muted-foreground">
              {ordersSummary.overdue} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksSummary.total - tasksSummary.completed}</div>
            <p className="text-xs text-muted-foreground">
              {tasksSummary.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {ordersSummary.overdue + tasksSummary.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
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