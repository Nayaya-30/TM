"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Package, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function WorkerTaskDetailPage({ params }: { params: { taskId: string } }) {
  const router = useRouter();
  const task = useQuery(api.tasks.queries.get, { taskId: params.taskId as Id<"tasks"> });
  const updateStatus = useMutation(api.tasks.mutations.updateStatus);
  const recordConsumption = useMutation(api.tasks.mutations.recordMaterialConsumption);

  const [isUpdating, setIsUpdating] = useState(false);
  const [materialConsumption, setMaterialConsumption] = useState<Record<string, number>>({});

  if (task === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  async function handleStatusChange(newStatus: "in_progress" | "completed") {
    setIsUpdating(true);
    try {
      await updateStatus({ taskId: params.taskId as Id<"tasks">, status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRecordConsumption(materialId: Id<"materials">, quantity: number) {
    try {
      await recordConsumption({
        taskId: params.taskId as Id<"tasks">,
        materialId,
        actualQuantity: quantity,
      });
    } catch (error) {
      console.error("Failed to record consumption:", error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{task.name}</h1>
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
          <p className="text-muted-foreground">Order: {task.order?.orderNumber}</p>
        </div>
      </div>

      {/* Status Actions */}
      {task.status !== "completed" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium mb-1">Update Task Status</p>
                <p className="text-sm text-muted-foreground">
                  Mark your progress on this task
                </p>
              </div>
              <div className="flex gap-2">
                {task.status === "pending" && (
                  <Button
                    onClick={() => handleStatusChange("in_progress")}
                    isLoading={isUpdating}
                  >
                    Start Working
                  </Button>
                )}
                {task.status === "in_progress" && (
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    isLoading={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Task Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Task Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Stage</p>
              <p className="font-medium capitalize">{task.stage}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Deadline</p>
              <p
                className={`font-medium ${
                  task.isOverdue ? "text-destructive" : task.isAlmostDue ? "text-yellow-600" : ""
                }`}
              >
                {format(task.deadline, "MMMM d, yyyy 'at' h:mm a")}
              </p>
              {task.isOverdue && (
                <Badge variant="danger" className="mt-1">
                  Overdue
                </Badge>
              )}
              {task.isAlmostDue && !task.isOverdue && (
                <Badge variant="warning" className="mt-1">
                  Due Soon
                </Badge>
              )}
            </div>

            {task.completedAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Completed At</p>
                <p className="font-medium">
                  {format(task.completedAt, "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            )}

            {task.createdBy && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Assigned By</p>
                <p className="font-medium">
                  {task.createdBy.firstName} {task.createdBy.lastName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Info */}
        {task.order && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                <p className="font-medium">{task.order.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="font-medium">{task.order.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Order Stage</p>
                <Badge variant="info">{task.order.currentStage}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <Card>
          <CardHeader>
            <CardTitle>Task Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {task.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {task.materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Materials Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {task.materials.map((material) => (
                <div
                  key={material.materialId}
                  className="p-4 rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{material.name}</p>
                      {material.description && (
                        <p className="text-sm text-muted-foreground">
                          {material.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Planned</p>
                      <p className="font-medium">
                        {material.plannedQuantity} {material.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Actual</p>
                      <p className="font-medium">
                        {material.actualQuantity
                          ? `${material.actualQuantity} ${material.unit}`
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>

                  {!material.actualQuantity && task.status !== "completed" && (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Quantity in ${material.unit}`}
                        value={materialConsumption[material.materialId] || ""}
                        onChange={(e) =>
                          setMaterialConsumption({
                            ...materialConsumption,
                            [material.materialId]: parseFloat(e.target.value) || 0,
                          })
                        }
                        min={0}
                        step={0.1}
                      />
                      <Button
                        onClick={() =>
                          handleRecordConsumption(
                            material.materialId as Id<"materials">,
                            materialConsumption[material.materialId] || 0
                          )
                        }
                        disabled={!materialConsumption[material.materialId]}
                      >
                        Record
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating */}
      {task.rating !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{task.rating.toFixed(1)}</div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">out of 5.0</p>
                {task.ratingNotes && (
                  <p className="text-sm mt-2">{task.ratingNotes}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}