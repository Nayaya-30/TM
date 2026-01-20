"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Palette, 
  Scissors, 
  Filter,
  MoreVertical,
  Package,
  AlertTriangle,
  TrendingDown,
  Layers
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FabricsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Queries
  const fabrics = useQuery(api.fabrics.queries.list, {
    inStockOnly: filter === "in_stock" ? true : undefined
  });
  const summary = useQuery(api.fabrics.queries.getSummary);

  // Filter logic
  const filteredFabrics = fabrics?.filter(fabric => {
    // Search filter
    const matchesSearch = search === "" || 
      fabric.name.toLowerCase().includes(search.toLowerCase()) ||
      fabric.color.toLowerCase().includes(search.toLowerCase()) ||
      fabric.pattern?.toLowerCase().includes(search.toLowerCase());

    // Status filter (out_of_stock needs manual filter since API only has inStockOnly)
    const matchesStatus = filter === "out_of_stock" ? !fabric.inStock : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Fabrics Library
          </h1>
          <p className="text-lg text-muted-foreground mt-2 font-medium">Manage fabric collection, patterns, and stock</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-105" size="lg">
          <Plus className="mr-2 h-5 w-5" /> Add Fabric
        </Button>
      </div>

      {/* Summary Stats */}
      {summary ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { 
              title: "Total Fabrics", 
              value: summary.total, 
              icon: Layers, 
              color: "text-blue-500", 
              bg: "bg-blue-500/10",
              trend: "Collection Size"
            },
            { 
              title: "In Stock", 
              value: summary.inStock, 
              icon: Package, 
              color: "text-green-500", 
              bg: "bg-green-500/10",
              trend: "Available"
            },
            { 
              title: "Out of Stock", 
              value: summary.outOfStock, 
              icon: AlertTriangle, 
              color: "text-red-500", 
              bg: "bg-red-500/10",
              trend: "Restock Needed"
            },
            { 
              title: "Low Stock", 
              value: "0", // TODO: Add low stock logic to summary query
              icon: TrendingDown, 
              color: "text-yellow-600", 
              bg: "bg-yellow-500/10",
              trend: "Monitor"
            }
          ].map((stat, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between mb-4">
                <div className={clsx("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110", stat.bg)}>
                  <stat.icon className={clsx("h-6 w-6", stat.color)} />
                </div>
                <Badge variant="outline" className="rounded-lg bg-background/50 backdrop-blur-sm border-border/50">
                  {stat.trend}
                </Badge>
              </div>
              <div className="relative">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-[2rem] bg-muted/20 animate-pulse" />
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/30 p-2 rounded-[2rem] border border-border/50 backdrop-blur-xl shadow-sm">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          <Input 
            placeholder="Search fabrics..." 
            className="pl-12 h-12 bg-background/50 border-transparent focus:border-primary/20 rounded-3xl transition-all duration-300 focus:bg-background/80"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-background/50 h-10 w-10">
            <Filter className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div className="flex bg-muted/30 p-1.5 rounded-3xl border border-border/10">
            {["all", "in_stock", "out_of_stock"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-300",
                  filter === f 
                    ? "bg-background shadow-md text-foreground scale-105 ring-1 ring-border/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                {f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fabrics Grid */}
      {filteredFabrics ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFabrics.map((fabric) => (
            <div key={fabric._id} className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Image Area */}
              <div className="aspect-[4/3] relative overflow-hidden m-2 rounded-[2rem]">
                <div className="absolute inset-0 bg-muted/20 animate-pulse" />
                {fabric.images && fabric.images.length > 0 ? (
                  <img 
                    src={fabric.images[0]} 
                    alt={fabric.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30 text-muted-foreground">
                    <Layers className="h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-border/50 bg-background/80 backdrop-blur-xl">
                      <DropdownMenuItem className="rounded-xl cursor-pointer">Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl cursor-pointer">Update Stock</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive rounded-xl cursor-pointer focus:bg-destructive/10">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {!fabric.inStock && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-0">
                    <Badge variant="destructive" className="text-sm px-4 py-1.5 rounded-full shadow-lg animate-in zoom-in">Out of Stock</Badge>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 pt-2">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-xl group-hover:text-primary transition-colors duration-300">{fabric.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg border border-border/30">
                        <Palette className="h-3.5 w-3.5 text-primary/70" />
                        <span>{fabric.color}</span>
                      </div>
                      {fabric.pattern && (
                        <div className="flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-lg border border-border/30">
                          <Scissors className="h-3.5 w-3.5 text-primary/70" />
                          <span>{fabric.pattern}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30 group-hover:border-primary/10 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-2xl text-foreground">
                        {fabric.pricePerUnit ? `₦${fabric.pricePerUnit.toFixed(2)}` : "N/A"}
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">/{fabric.unit}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={fabric.inStock ? "default" : "secondary"} 
                    className={clsx(
                      "rounded-xl px-5 shadow-lg transition-all duration-300",
                      fabric.inStock ? "shadow-primary/20 hover:shadow-primary/40 hover:scale-105" : "opacity-80"
                    )}
                  >
                    {fabric.inStock ? "Details" : "Restock"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Card */}
          <button className="group relative overflow-hidden rounded-[2.5rem] border-2 border-dashed border-border/50 bg-card/30 hover:bg-card/50 hover:border-primary/50 transition-all duration-500 flex flex-col items-center justify-center min-h-[400px] gap-6 hover:shadow-xl hover:-translate-y-2">
            <div className="h-20 w-20 rounded-[2rem] bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
              <Plus className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors duration-300" />
            </div>
            <div className="text-center space-y-1">
               <span className="font-bold text-lg text-muted-foreground group-hover:text-primary transition-colors duration-300">Add New Fabric</span>
               <p className="text-sm text-muted-foreground/60">Add to your collection</p>
            </div>
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[500px] rounded-[2.5rem] bg-muted/20 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  );
}
