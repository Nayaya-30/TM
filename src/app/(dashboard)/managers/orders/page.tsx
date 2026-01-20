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
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="grid gap-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Orders
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Manage all customer orders</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="rounded-full shadow-lg hover:shadow-xl transition-all h-12 px-6">
          <Plus className="h-5 w-5 mr-2" />
          Create Order
        </Button>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Search */}
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:bg-background transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3 p-1">
        {[
          { key: "all", label: "All", count: stageCounts.all },
          { key: "cutting", label: "Cutting", count: stageCounts.cutting },
          { key: "sewing", label: "Sewing", count: stageCounts.sewing },
          { key: "finishing", label: "Finishing", count: stageCounts.finishing },
          { key: "delivery", label: "Delivered", count: stageCounts.delivery },
        ].map((item) => (
           <button
             key={item.key}
             onClick={() => setFilter(item.key as FilterStage)}
             className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
               filter === item.key
                 ? "bg-primary text-primary-foreground shadow-lg scale-105"
                 : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
             }`}
           >
             {item.label}
             <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
               filter === item.key ? "bg-primary-foreground/20" : "bg-background/50"
             }`}>
               {item.count}
             </span>
           </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {search
                ? "Try adjusting your search terms"
                : filter !== "all"
                ? `No orders currently in the ${filter} stage`
                : "Create your first order to get started with production tracking"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Link key={order._id} href={`/orders/${order._id}`}>
              <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-6 relative">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Status Indicator Strip */}
                    <div className={`hidden md:block w-1.5 h-16 rounded-full ${
                       order.isOverdue ? "bg-destructive" :
                       order.currentStage === "delivery" ? "bg-green-500" :
                       order.currentStage === "finishing" ? "bg-purple-500" :
                       order.currentStage === "sewing" ? "bg-blue-500" :
                       "bg-orange-500"
                    }`} />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl tracking-tight">{order.orderNumber}</h3>
                        <Badge
                          className={`rounded-full px-3 ${
                            order.isOverdue
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                              : order.currentStage === "delivery"
                              ? "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                              : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                          }`}
                          variant="outline"
                        >
                          {order.currentStage}
                        </Badge>
                        {order.isOverdue && <Badge variant="destructive" className="rounded-full">Overdue</Badge>}
                        {order.isAlmostDue && !order.isOverdue && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600 rounded-full">Due Soon</Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground mb-4 line-clamp-1">{order.description}</p>

                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {order.customer?.firstName?.[0]}
                          </div>
                          <span className="font-medium">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </span>
                        </div>
                        {order.dependant && (
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <span>for</span>
                             <span className="font-medium text-foreground">
                               {order.dependant.firstName}
                             </span>
                           </div>
                        )}
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Filter className="h-3 w-3" />
                            <span>{order.style?.name || "Custom"}</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-2 md:min-w-[180px]">
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {format(order.estimatedDelivery, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">Est. delivery</p>
                      </div>
                      
                      <div className="w-full md:w-32 bg-muted/50 rounded-full h-2 mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                             order.isOverdue ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{
                            width: `${
                              order.currentStage === "cutting" ? 25 :
                              order.currentStage === "sewing" ? 50 :
                              order.currentStage === "finishing" ? 75 :
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {order.taskStats.completed}/{order.taskStats.total} tasks done
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
