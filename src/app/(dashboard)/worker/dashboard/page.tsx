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
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");
  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const dueSoon = tasks.filter((t) => t.isAlmostDue && t.status !== "completed");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Track your assigned tasks and deadlines</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">Not started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">Working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">Finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
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