"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";

export default function OrdersListPage() {
  const orders = useQuery(api.orders.queries.listMine);
  const [search, setSearch] = useState("");

  if (orders === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.description.toLowerCase().includes(search.toLowerCase()) ||
      order.dependant?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      order.dependant?.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const activeOrders = filteredOrders.filter((o) => o.currentStage !== "delivery");
  const completedOrders = filteredOrders.filter((o) => o.currentStage === "delivery");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track all your tailoring orders</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedOrders.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{order.orderNumber}</p>
                      <Badge
                        variant={
                          order.isOverdue
                            ? "danger"
                            : order.isAlmostDue
                            ? "warning"
                            : "info"
                        }
                      >
                        {order.currentStage}
                      </Badge>
                      {order.isOverdue && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{order.description}</p>
                    <p className="text-xs text-muted-foreground">
                      For: {order.dependant?.firstName} {order.dependant?.lastName}
                    </p>
                    {order.style && (
                      <p className="text-xs text-muted-foreground">
                        Style: {order.style.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(order.estimatedDelivery, "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">Est. delivery</p>
                    {/* Progress Bar */}
                    <div className="mt-2 w-24">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{
                            width: `${
                              order.currentStage === "cutting"
                                ? 25
                                : order.currentStage === "sewing"
                                ? 50
                                : order.currentStage === "finishing"
                                ? 75
                                : 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/orders/${order._id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{order.orderNumber}</p>
                      <Badge variant="success">Delivered</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{order.description}</p>
                    <p className="text-xs text-muted-foreground">
                      For: {order.dependant?.firstName} {order.dependant?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    {order.actualDelivery && (
                      <>
                        <p className="text-sm font-medium">
                          {format(order.actualDelivery, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">Delivered</p>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {search ? "No orders found" : "No orders yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search"
                : "Your orders will appear here once created"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}