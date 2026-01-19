"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function WorkerDashboardPage() {
  const tasks = useQuery(api.tasks.queries.listMine, { limit: 10 });

  if (tasks === undefined) {
    return (
      <div className="space-y-8 p-4">
        <div className="flex flex-col gap-2">
           <Skeleton className="h-10 w-64 rounded-xl" />
           <Skeleton className="h-5 w-96 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
             <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const dueSoon = tasks.filter((t) => t.isAlmostDue && t.status !== "completed");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            My Tasks
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Track your assigned tasks and deadlines
          </p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
               <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Not started</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
               <ListChecks className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Working on</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
               <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Finished</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden rounded-3xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
           <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
             <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
               <AlertCircle className="h-4 w-4 text-red-500" />
             </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5 rounded-2xl overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
          <CardHeader>
            <CardTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">These tasks need immediate attention.</p>
            <div className="space-y-2">
              {overdueTasks.map((task) => (
                <Link
                  key={task._id}
                  href={`/worker/tasks/${task._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-destructive hover:bg-destructive/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order: {task.order?.orderNumber}
                    </p>
                  </div>
                  <Badge variant="danger">{format(task.deadline, "MMM d")}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Soon */}
      {dueSoon.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dueSoon.map((task) => (
                <Link
                  key={task._id}
                  href={`/worker/tasks/${task._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{task.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Order: {task.order?.orderNumber}
                    </p>
                  </div>
                  <Badge variant="warning">{format(task.deadline, "MMM d, h:mm a")}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Tasks</CardTitle>
          <Link href="/worker/tasks">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {[...pendingTasks, ...inProgressTasks].length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active tasks</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...pendingTasks, ...inProgressTasks].slice(0, 5).map((task) => (
                <Link
                  key={task._id}
                  href={`/worker/tasks/${task._id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{task.name}</p>
                      <Badge
                        variant={
                          task.status === "in_progress"
                            ? "info"
                            : task.isAlmostDue
                            ? "warning"
                            : "default"
                        }
                      >
                        {task.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order: {task.order?.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stage: {task.stage}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{format(task.deadline, "MMM d")}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(task.deadline, "h:mm a")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}