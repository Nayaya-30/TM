"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { ArrowLeft, User, Calendar, Package, CheckCircle2, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function OrderDetailPage({ params }: { params: { orderId: string } }) {
  const router = useRouter();
  const order = useQuery(
    api.orders.queries.get,
    { orderId: params.orderId as Id<"orders"> }
  );
  const advanceStage = useMutation(api.orders.mutations.advanceStage);
  const profile = useQuery(api.users.queries.getProfile);

  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  async function handleAdvanceStage() {
    setIsAdvancing(true);
    try {
      await advanceStage({ orderId: params.orderId as Id<"orders"> });
    } catch (error) {
      console.error("Failed to advance stage:", error);
    } finally {
      setIsAdvancing(false);
    }
  }

  if (order === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const userRole = profile?.organizations[0]?.role as "admin" | "manager" | "worker" | "customer" | undefined;
  const canManageOrder = userRole === "admin" || userRole === "manager";
  const canAdvance = canManageOrder && order.currentStage !== "delivery";

  const stages = [
    { name: "Cutting", value: "cutting" },
    { name: "Sewing", value: "sewing" },
    { name: "Finishing", value: "finishing" },
    { name: "Delivery", value: "delivery" },
  ];

  const currentStageIndex = stages.findIndex((s) => s.value === order.currentStage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{order.orderNumber}</h1>
            <Badge
              variant={
                order.isOverdue
                  ? "danger"
                  : order.currentStage === "delivery"
                  ? "success"
                  : "info"
              }
            >
              {order.currentStage}
            </Badge>
          </div>
          <p className="text-muted-foreground">{order.description}</p>
        </div>
        {canManageOrder && (
          <div className="flex gap-2">
            {canAdvance && (
              <Button onClick={handleAdvanceStage} isLoading={isAdvancing}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Advance Stage
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        )}
      </div>
      
      {/* Create Task Modal */}
      {canManageOrder && (
        <CreateTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          orderId={params.orderId as Id<"orders">}
          onSuccess={() => {
            // no-op: Convex real-time updates will refresh order.tasks automatically
          }}
        />
      )}

      {/* Progress Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
                }}
              />
            </div>

            {/* Stages */}
            <div className="relative grid grid-cols-4 gap-4">
              {stages.map((stage, index) => {
                const isComplete = index <= currentStageIndex;
                const isCurrent = index === currentStageIndex;

                return (
                  <div key={stage.value} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isComplete
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-sm font-medium text-center ${
                        isCurrent ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer & Dependant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.customer && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer</p>
                <p className="font-medium">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                {order.customer.email && (
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                )}
                {order.customer.phone && (
                  <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                )}
              </div>
            )}

            {order.dependant && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">For</p>
                <p className="font-medium">
                  {order.dependant.firstName} {order.dependant.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {order.dependant.gender}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
              <p className="font-medium">
                {format(order.estimatedDelivery, "MMMM d, yyyy")}
              </p>
              {order.isOverdue && (
                <Badge variant="danger" className="mt-1">
                  Overdue
                </Badge>
              )}
              {order.isAlmostDue && !order.isOverdue && (
                <Badge variant="warning" className="mt-1">
                  Due Soon
                </Badge>
              )}
            </div>

            {order.actualDelivery && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Actual Delivery</p>
                <p className="font-medium">
                  {format(order.actualDelivery, "MMMM d, yyyy")}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="font-medium">{format(order.createdAt, "MMMM d, yyyy")}</p>
            </div>

            {order.price && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="font-medium">₦{order.price.toFixed(2)}</p>
                <Badge variant={order.paid ? "success" : "warning"} className="mt-1">
                  {order.paid ? "Paid" : "Pending Payment"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Style Reference */}
      {order.style && (
        <Card>
          <CardHeader>
            <CardTitle>Style Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              {order.style.images.length > 0 && (
                <img
                  src={order.style.images[0]}
                  alt={order.style.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <p className="font-medium mb-2">{order.style.name}</p>
                <div className="flex flex-wrap gap-2">
                  {order.style.tags.map((tag) => (
                    <Badge key={tag} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks Progress */}
      {order.tasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Production Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.tasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        task.status === "completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {task.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{task.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {task.stage}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      task.status === "completed"
                        ? "success"
                        : task.status === "overdue"
                        ? "danger"
                        : "info"
                    }
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {order.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Contact Action */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium mb-1">Need assistance with this order?</p>
              <p className="text-sm text-muted-foreground">
                Contact your tailor for updates or questions
              </p>
            </div>
            <Link href="/chat">
              <Button>Start Chat</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
