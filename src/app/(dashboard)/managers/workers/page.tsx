"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Star, TrendingUp, AlertCircle } from "lucide-react";
import { InviteWorkerModal } from "@/components/modals/invite-worker-modal";
import { useState } from "react";

export default function ManagerWorkersPage() {
  const workers = useQuery(api.members.queries.listWorkersWithStats);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (workers === undefined) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const totalActiveTasks = workers.reduce((sum, w) => sum + w.stats.activeTasks, 0);
  const totalCompletedTasks = workers.reduce((sum, w) => sum + w.stats.completedTasks, 0);
  const workersWithOverdue = workers.filter((w) => w.stats.overdueTasks > 0).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Workers
          </h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your team and performance</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="rounded-full shadow-lg hover:shadow-xl transition-all h-12 px-6">
          <Plus className="h-5 w-5 mr-2" />
          Invite Worker
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6 relative">
            <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <Users className="h-5 w-5 text-blue-500" />
               </div>
               <span className="text-xs font-medium bg-blue-500/10 text-blue-600 px-2 py-1 rounded-full">Total</span>
            </div>
            <div className="text-3xl font-bold">{workers.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Workers</p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6 relative">
             <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                 <TrendingUp className="h-5 w-5 text-yellow-500" />
               </div>
               <span className="text-xs font-medium bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="text-3xl font-bold">{totalActiveTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">Active Tasks</p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6 relative">
             <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                 <Star className="h-5 w-5 text-green-500" />
               </div>
               <span className="text-xs font-medium bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Completed</span>
            </div>
            <div className="text-3xl font-bold">{totalCompletedTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">Completed Tasks</p>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="pt-6 relative">
             <div className="flex items-center justify-between mb-4">
               <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                 <AlertCircle className="h-5 w-5 text-red-500" />
               </div>
               <span className="text-xs font-medium bg-red-500/10 text-red-600 px-2 py-1 rounded-full">Alerts</span>
            </div>
            <div className="text-3xl font-bold text-red-500">{workersWithOverdue}</div>
            <p className="text-sm text-muted-foreground mt-1">With Overdue Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <Card className="rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-20">
            <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No workers yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              Invite your first worker to start assigning tasks and tracking performance
            </p>
            <Button disabled className="rounded-full">
              <Plus className="h-4 w-4 mr-2" />
              Invite Worker
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <Card key={worker.membershipId} className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center shadow-inner">
                      <span className="text-xl font-bold text-primary">
                        {worker.user?.firstName[0]}
                        {worker.user?.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {worker.user?.firstName} {worker.user?.lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 bg-muted/50 px-2 py-0.5 rounded-full inline-block">
                        {worker.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="text-xl font-bold">{worker.stats.activeTasks}</div>
                    <p className="text-xs text-muted-foreground font-medium">Active</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="text-xl font-bold">{worker.stats.completedTasks}</div>
                    <p className="text-xs text-muted-foreground font-medium">Done</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 transition-colors">
                    <div className="text-xl font-bold text-red-500">
                      {worker.stats.overdueTasks}
                    </div>
                    <p className="text-xs text-red-500/80 font-medium">Overdue</p>
                  </div>
                </div>

                {/* Performance */}
                {worker.stats.averageRating > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-background/50">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">Average Rating</span>
                    </div>
                    <span className="text-lg font-bold bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full">
                      {worker.stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}

                {/* Alerts */}
                {worker.stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      {worker.stats.overdueTasks} overdue task{worker.stats.overdueTasks > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Completion Rate */}
                {worker.stats.completedTasks > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span className="font-medium">Completion Rate</span>
                      <span className="font-bold text-foreground">
                        {Math.round(
                          (worker.stats.completedTasks /
                            (worker.stats.completedTasks + worker.stats.activeTasks)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-1000 ease-out"
                        style={{
                          width: `${Math.round(
                            (worker.stats.completedTasks /
                              (worker.stats.completedTasks + worker.stats.activeTasks)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Invite Worker Modal */}
      <InviteWorkerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
