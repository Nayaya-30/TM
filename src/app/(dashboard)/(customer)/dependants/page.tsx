"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Users, Plus, Ruler, Package, User, Calendar, Sparkles, Search, ArrowRight } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DependantsPage() {
  const dependants = useQuery(api.dependants.queries.listMine);
  const createDependant = useMutation(api.dependants.mutations.create);
  const customer = useQuery(api.customers.queries.getCurrentCustomer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  if (dependants === undefined || customer === undefined) {
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
             <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            We couldn't find your customer profile. Please contact support or try signing in again.
          </p>
        </div>
      </div>
    );
  }

  const filteredDependants = dependants.filter(d => 
    d.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Family Members
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Manage measurements and profiles for your family
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button onClick={() => setIsModalOpen(true)} className="rounded-full h-12 px-6 shadow-lg hover:shadow-primary/25 transition-all">
            <Plus className="h-5 w-5 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
             </div>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">{dependants.length}</div>
             <p className="text-sm text-muted-foreground">Total Members</p>
           </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                <Ruler className="h-6 w-6 text-purple-500" />
             </div>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">
               {dependants.reduce((sum, d) => sum + d.measurementCount, 0)}
             </div>
             <p className="text-sm text-muted-foreground">Saved Measurements</p>
           </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative flex items-center justify-between mb-4">
             <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-500" />
             </div>
           </div>
           <div className="relative">
             <div className="text-4xl font-bold mb-1">
               {dependants.reduce((sum, d) => sum + d.orderCount, 0)}
             </div>
             <p className="text-sm text-muted-foreground">Total Orders</p>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      {dependants.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search family members..." 
            className="pl-12 h-12 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm focus:bg-card transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Dependants Grid */}
      {dependants.length === 0 ? (
        <div className="rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
          <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No family members yet</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Add your family members to start tracking their measurements and placing orders for them.
          </p>
          <Button onClick={() => setIsModalOpen(true)} size="lg" className="rounded-full px-8">
            <Plus className="h-5 w-5 mr-2" />
            Add First Member
          </Button>
        </div>
      ) : filteredDependants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No members found matching "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDependants.map((dependant) => (
            <div 
              key={dependant._id} 
              className="group relative overflow-hidden rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-2xl font-bold shadow-inner">
                    {dependant.firstName[0]}
                    {dependant.lastName[0]}
                  </div>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 capitalize bg-muted/50 backdrop-blur-md border-border/50">
                    {dependant.gender}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {dependant.firstName} {dependant.lastName}
                  </h3>
                  {dependant.dateOfBirth && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(dependant.dateOfBirth, "MMMM d, yyyy")}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                  <div className="rounded-xl bg-muted/30 p-3 text-center transition-colors group-hover:bg-primary/5">
                    <div className="text-lg font-bold text-foreground">{dependant.measurementCount}</div>
                    <div className="text-xs text-muted-foreground">Measurements</div>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-3 text-center transition-colors group-hover:bg-primary/5">
                    <div className="text-lg font-bold text-foreground">{dependant.orderCount}</div>
                    <div className="text-xs text-muted-foreground">Orders</div>
                  </div>
                </div>

                <Button variant="ghost" className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground rounded-xl transition-all">
                  View Profile
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
