"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InviteCustomerModal } from "@/components/modals/invite-customer-modal";
import { Users, Plus, Search, Mail, Phone, Package } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function ManagerCustomersPage() {
  const customers = useQuery(api.customers.queries.list);
  const [search, setSearch] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (customers === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const filteredCustomers = search
    ? customers.filter(
        (c) =>
          c.firstName.toLowerCase().includes(search.toLowerCase()) ||
          c.lastName.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  const customersWithAccounts = customers.filter((c) => c.hasAccount);
  const customersWithoutAccounts = customers.filter((c) => !c.hasAccount);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-sm text-muted-foreground">Total Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customersWithAccounts.length}</div>
            <p className="text-sm text-muted-foreground">With Platform Access</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{customersWithoutAccounts.length}</div>
            <p className="text-sm text-muted-foreground">Offline Customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No customers found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try adjusting your search" : "Invite your first customer to get started"}
            </p>
            {!search && (
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Customer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer._id} className="hover:bg-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {customer.firstName[0]}
                        {customer.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {customer.firstName} {customer.lastName}
                      </CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={customer.hasAccount ? "success" : "warning"}>
                          {customer.hasAccount ? "Active" : "Offline"}
                        </Badge>
                        {customer.claimed && (
                          <Badge variant="info">Claimed</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{customer.orderCount}</div>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{customer.dependantCount}</div>
                    <p className="text-xs text-muted-foreground">Family</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Added {format(customer.createdAt, "MMM d, yyyy")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Customer Modal */}
      <InviteCustomerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}