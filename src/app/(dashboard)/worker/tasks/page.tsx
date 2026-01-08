"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListChecks, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useState } from "react";

type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "overdue";

export default function WorkerTasksPage() {
  const tasks = useQuery(api.tasks.queries.listMine);
  const [filter, setFilter] = useState<FilterStatus>("all");

  if (tasks === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const statusCounts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground">Manage your assigned production tasks</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({statusCounts.all})
        </Button>
        <Button
          variant={filter === "pending" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({statusCounts.pending})
        </Button>
        <Button
          variant={filter === "in_progress" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("in_progress")}
        >
          In Progress ({statusCounts.in_progress})
        </Button>
        <Button
          variant={filter === "completed" ? "primary" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed ({statusCounts.completed})
        </Button>
        {statusCounts.overdue > 0 && (
          <Button
            variant={filter === "overdue" ? "destructive" : "outline"}
            size="sm"
            onClick={() => setFilter("overdue")}
          >
            Overdue ({statusCounts.overdue})
          </Button>
        )}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ListChecks className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === "all"
                ? "You don't have any tasks assigned yet"
                : `No tasks with status: ${filter.replace("_", " ")}`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <Link key={task._id} href={`/worker/tasks/${task._id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Task Header */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                              : task.status === "overdue"
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                              : task.status === "in_progress"
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {task.status === "completed" ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : task.status === "overdue" ? (
                            <AlertCircle className="h-5 w-5" />
                          ) : (
                            <Clock className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{task.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order: {task.order?.orderNumber}
                          </p>
                        </div>
                        <Badge
                          variant={
                            task.status === "completed"
                              ? "success"
                              : task.status === "overdue"
                              ? "danger"
                              : task.status === "in_progress"
                              ? "info"
                              : "default"
                          }
                        >
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>

                      {/* Task Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Stage:</span>
                            <span className="font-medium capitalize">{task.stage}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Deadline:</span>
                            <span
                              className={`font-medium ${
                                task.isOverdue
                                  ? "text-destructive"
                                  : task.isAlmostDue
                                  ? "text-yellow-600"
                                  : ""
                              }`}
                            >
                              {format(task.deadline, "MMM d, yyyy h:mm a")}
                            </span>
                          </div>
                        </div>

                        {/* Materials */}
                        {task.materials.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Materials:</span>
                            <div className="flex flex-wrap gap-2">
                              {task.materials.map((material, index) => (
                                <Badge key={index} variant="default">
                                  {material.name} ({material.plannedQuantity} {material.unit})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rating */}
                        {task.rating !== undefined && task.status === "completed" && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{task.rating.toFixed(1)}</span>
                              <span className="text-muted-foreground">/ 5.0</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}