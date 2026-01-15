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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const totalActiveTasks = workers.reduce((sum, w) => sum + w.stats.activeTasks, 0);
  const totalCompletedTasks = workers.reduce((sum, w) => sum + w.stats.completedTasks, 0);
  const workersWithOverdue = workers.filter((w) => w.stats.overdueTasks > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workers</h1>
          <p className="text-muted-foreground">Manage your team and performance</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Worker
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{workers.length}</div>
            <p className="text-sm text-muted-foreground">Total Workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalActiveTasks}</div>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalCompletedTasks}</div>
            <p className="text-sm text-muted-foreground">Completed Tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">{workersWithOverdue}</div>
            <p className="text-sm text-muted-foreground">With Overdue Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Workers Grid */}
      {workers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No workers yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Invite your first worker to start assigning tasks
            </p>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Invite Worker
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workers.map((worker) => (
            <Card key={worker.membershipId} className="hover:bg-accent transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-primary">
                        {worker.user?.firstName[0]}
                        {worker.user?.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {worker.user?.firstName} {worker.user?.lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {worker.user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Task Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{worker.stats.activeTasks}</div>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold">{worker.stats.completedTasks}</div>
                    <p className="text-xs text-muted-foreground">Done</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <div className="text-lg font-bold text-destructive">
                      {worker.stats.overdueTasks}
                    </div>
                    <p className="text-xs text-muted-foreground">Overdue</p>
                  </div>
                </div>

                {/* Performance */}
                {worker.stats.averageRating > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">Average Rating</span>
                    </div>
                    <span className="text-sm font-bold">
                      {worker.stats.averageRating.toFixed(1)} / 5.0
                    </span>
                  </div>
                )}

                {/* Alerts */}
                {worker.stats.overdueTasks > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {worker.stats.overdueTasks} overdue task{worker.stats.overdueTasks > 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                {/* Completion Rate */}
                {worker.stats.completedTasks > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Completion Rate</span>
                      <span>
                        {Math.round(
                          (worker.stats.completedTasks /
                            (worker.stats.completedTasks + worker.stats.activeTasks)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
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
