"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Users, Plus, Ruler, Package } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function CustomerDashboardPage() {
  const dependants = useQuery(api.dependants.queries.listMine);
  const createDependant = useMutation(api.dependants.mutations.create);
  const customer = useQuery(api.customers.queries.getCurrentCustomer);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
  });

  if (dependants === undefined || customer === undefined) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-5 w-96 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createDependant({
        customerId: customer._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).getTime() : undefined,
      });

      setIsModalOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        gender: "male",
        dateOfBirth: "",
      });
    } catch (error) {
      console.error("Failed to create dependant:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Overview
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Welcome back, {customer.firstName}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Add Family Member
        </Button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-500" />
               </div>
               <Badge variant="secondary" className="rounded-full">Active</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">{dependants.length}</div>
            <p className="text-sm text-muted-foreground">Family Members</p>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
             <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-2xl bg-pink-500/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-pink-500" />
               </div>
               <Badge variant="secondary" className="rounded-full">Total</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">
              {dependants.reduce((sum, d) => sum + d.measurementCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Saved Measurements</p>
          </CardContent>
        </Card>
        
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6">
             <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-500" />
               </div>
               <Badge variant="secondary" className="rounded-full">Recent</Badge>
            </div>
            <div className="text-4xl font-bold mb-1">
              {dependants.reduce((sum, d) => sum + d.orderCount, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Dependants Grid */}
      {dependants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No family members yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add family members to track their measurements and orders
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dependants.map((dependant) => (
            <Card key={dependant._id} className="hover:bg-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {dependant.firstName} {dependant.lastName}
                    </CardTitle>
                    <Badge variant="default" className="mt-2 capitalize">
                      {dependant.gender}
                    </Badge>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary">
                      {dependant.firstName[0]}
                      {dependant.lastName[0]}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dependant.dateOfBirth && (
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-sm font-medium">
                      {format(dependant.dateOfBirth, "MMMM d, yyyy")}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-1 text-sm">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {dependant.measurementCount} measurement{dependant.measurementCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {dependant.orderCount} order{dependant.orderCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dependant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Family Member"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Birth (Optional)</label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Add Member
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

//