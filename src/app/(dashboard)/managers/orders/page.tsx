"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, Plus, Filter } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { CreateOrderModal } from "@/components/modals/create-order-modal";
import Link from "next/link";

type FilterStage = "all" | "cutting" | "sewing" | "finishing" | "delivery";

export default function ManagerOrdersPage() {
  const orders = useQuery(api.orders.queries.list, { limit: 50 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStage>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  let filteredOrders = orders;

  // Filter by stage
  if (filter !== "all") {
    filteredOrders = filteredOrders.filter((o) => o.currentStage === filter);
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredOrders = filteredOrders.filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.description.toLowerCase().includes(searchLower) ||
        order.customer?.firstName.toLowerCase().includes(searchLower) ||
        order.customer?.lastName.toLowerCase().includes(searchLower)
    );
  }

  const stageCounts = {
    all: orders.length,
    cutting: orders.filter((o) => o.currentStage === "cutting").length,
    sewing: orders.filter((o) => o.currentStage === "sewing").length,
    finishing: orders.filter((o) => o.currentStage === "finishing").length,
    delivery: orders.filter((o) => o.currentStage === "delivery").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage all customer orders</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

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

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({stageCounts.all})
        </Button>
        <Button
          variant={filter === "cutting" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("cutting")}
        >
          Cutting ({stageCounts.cutting})
        </Button>
        <Button
          variant={filter === "sewing" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("sewing")}
        >
          Sewing ({stageCounts.sewing})
        </Button>
        <Button
          variant={filter === "finishing" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("finishing")}
        >
          Finishing ({stageCounts.finishing})
        </Button>
        <Button
          variant={filter === "delivery" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("delivery")}
        >
          Delivered ({stageCounts.delivery})
        </Button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search"
                : filter !== "all"
                ? `No orders in ${filter} stage`
                : "Create your first order to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
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
                      {order.isOverdue && <Badge variant="danger">Overdue</Badge>}
                      {order.isAlmostDue && !order.isOverdue && (
                        <Badge variant="warning">Due Soon</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{order.description}</p>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Customer: </span>
                        <span className="font-medium">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">For: </span>
                        <span className="font-medium">
                          {order.dependant?.firstName} {order.dependant?.lastName}
                        </span>
                      </div>
                      {order.style && (
                        <div>
                          <span className="text-muted-foreground">Style: </span>
                          <span className="font-medium">{order.style.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>
                        Tasks: {order.taskStats.completed}/{order.taskStats.total}
                      </span>
                      <span>Created {format(order.createdAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {format(order.estimatedDelivery, "MMM d, yyyy")}
                    </p>
                    <p className="text-xs text-muted-foreground">Est. delivery</p>
                    <div className="mt-3 w-24">
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
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
