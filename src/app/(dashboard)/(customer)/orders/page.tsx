"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, CheckCircle2, Clock, Truck, Scissors, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { clsx } from "clsx";

export default function OrdersListPage() {
  const orders = useQuery(api.orders.queries.listMine);
  const [search, setSearch] = useState("");

  if (orders === undefined) {
    return (
      <div className="space-y-8 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
           <div className="space-y-2">
             <Skeleton className="h-10 w-64 rounded-xl" />
             <Skeleton className="h-4 w-96 rounded-xl" />
           </div>
           <Skeleton className="h-12 w-32 rounded-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
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
    <div className="space-y-8 pb-10 animate-fade-in">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Track and manage your tailoring orders
          </p>
        </div>
        <ThemeToggle />
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
             </div>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">{orders.length}</div>
             <p className="text-sm text-muted-foreground">Total Orders</p>
           </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-500" />
             </div>
             <Badge variant="secondary" className="rounded-full bg-orange-500/10 text-orange-600 border-orange-500/20">In Progress</Badge>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">{activeOrders.length}</div>
             <p className="text-sm text-muted-foreground">Active Orders</p>
           </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
             </div>
             <Badge variant="secondary" className="rounded-full bg-green-500/10 text-green-600 border-green-500/20">Done</Badge>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">{completedOrders.length}</div>
             <p className="text-sm text-muted-foreground">Completed</p>
           </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:bg-card transition-all"
        />
      </div>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold px-2">Active Orders</h2>
          <div className="grid gap-4">
            {activeOrders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 block"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0">
                      <Scissors className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-lg">{order.orderNumber}</span>
                        <Badge
                          variant="outline"
                          className={clsx(
                            "capitalize rounded-full border-2",
                            order.isOverdue ? "border-destructive/20 bg-destructive/10 text-destructive" :
                            order.isAlmostDue ? "border-orange-500/20 bg-orange-500/10 text-orange-600" :
                            "border-primary/20 bg-primary/10 text-primary"
                          )}
                        >
                          {order.currentStage}
                        </Badge>
                        {order.isOverdue && (
                          <Badge variant="destructive" className="rounded-full">Overdue</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1 line-clamp-1">{order.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>For: <span className="font-medium text-foreground">{order.dependant?.firstName} {order.dependant?.lastName}</span></span>
                        {order.style && (
                          <>
                            <span>•</span>
                            <span>Style: {order.style.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-2 md:min-w-[200px]">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(order.estimatedDelivery, "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground">Est. Delivery</p>
                    </div>
                    
                    <div className="w-full md:w-32 h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${
                            order.currentStage === "cutting" ? 25 :
                            order.currentStage === "sewing" ? 50 :
                            order.currentStage === "finishing" ? 75 : 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold px-2">Completed History</h2>
          <div className="grid gap-4">
            {completedOrders.map((order) => (
              <Link
                key={order._id}
                href={`/orders/${order._id}`}
                className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:bg-muted/30 block opacity-80 hover:opacity-100"
              >
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{order.orderNumber}</span>
                        <Badge variant="outline" className="rounded-full border-green-500/20 bg-green-500/5 text-green-600">Delivered</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{order.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {order.actualDelivery && (
                      <>
                        <p className="text-sm font-medium">
                          {format(order.actualDelivery, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">Delivered on</p>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
          <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {search ? "No orders found" : "No orders yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {search
              ? "Try adjusting your search criteria"
              : "Your active and past orders will appear here once you place an order with your tailor."}
          </p>
        </div>
      )}
    </div>
  );
}
