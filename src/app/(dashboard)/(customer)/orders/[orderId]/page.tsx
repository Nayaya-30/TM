"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { ArrowLeft, User, Calendar, Package, CheckCircle2, ArrowRight, Plus, Clock, Scissors, Truck, Ruler, FileText, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { clsx } from "clsx";

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
      <div className="space-y-8 p-6">
        <div className="flex justify-between">
           <Skeleton className="h-10 w-32 rounded-xl" />
           <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-32 rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  const userRole = profile?.organizations[0]?.role as "admin" | "manager" | "worker" | "customer" | undefined;
  const canManageOrder = userRole === "admin" || userRole === "manager";
  const canAdvance = canManageOrder && order.currentStage !== "delivery";

  const stages = [
    { name: "Cutting", value: "cutting", icon: Scissors },
    { name: "Sewing", value: "sewing", icon: Ruler },
    { name: "Finishing", value: "finishing", icon: CheckCircle2 },
    { name: "Delivery", value: "delivery", icon: Truck },
  ];

  const currentStageIndex = stages.findIndex((s) => s.value === order.currentStage);

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-4xl font-bold tracking-tight">{order.orderNumber}</h1>
              <Badge
                variant="outline"
                className={clsx(
                  "rounded-full px-3 py-1 border-2 text-sm",
                  order.isOverdue ? "border-destructive/20 bg-destructive/10 text-destructive" :
                  order.currentStage === "delivery" ? "border-green-500/20 bg-green-500/10 text-green-600" :
                  "border-primary/20 bg-primary/10 text-primary"
                )}
              >
                {order.currentStage}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground">{order.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <ThemeToggle />
           {canManageOrder && (
            <div className="flex gap-2">
              {canAdvance && (
                <Button onClick={handleAdvanceStage} isLoading={isAdvancing} className="rounded-full shadow-lg hover:shadow-primary/25">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Advance Stage
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsTaskModalOpen(true)} className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
           )}
        </div>
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
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <h3 className="text-xl font-bold mb-8 relative">Order Progress</h3>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-2 bg-muted/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
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
              const Icon = stage.icon;

              return (
                <div key={stage.value} className="flex flex-col items-center gap-4">
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 z-10 border-4 border-background",
                      isComplete
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p
                      className={clsx(
                        "text-sm font-bold transition-colors",
                        isCurrent ? "text-primary" : isComplete ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {stage.name}
                    </p>
                    {isCurrent && (
                      <Badge variant="secondary" className="mt-1 text-[10px] rounded-full px-2">Current</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer & Dependant Info */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="relative space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                 <User className="h-5 w-5 text-blue-500" />
               </div>
               <h3 className="text-xl font-bold">Customer Information</h3>
             </div>

             <div className="space-y-4">
               {order.customer && (
                 <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Customer</p>
                   <p className="font-bold text-lg">
                     {order.customer.firstName} {order.customer.lastName}
                   </p>
                   {order.customer.email && (
                     <p className="text-sm text-muted-foreground mt-1">{order.customer.email}</p>
                   )}
                   {order.customer.phone && (
                     <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                   )}
                 </div>
               )}

               {order.dependant && (
                 <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">For Dependant</p>
                   <div className="flex items-center justify-between">
                     <p className="font-bold text-lg">
                       {order.dependant.firstName} {order.dependant.lastName}
                     </p>
                     <Badge variant="outline" className="capitalize rounded-full">{order.dependant.gender}</Badge>
                   </div>
                 </div>
               )}
             </div>
           </div>
        </div>

        {/* Order Details */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="relative space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                 <Calendar className="h-5 w-5 text-purple-500" />
               </div>
               <h3 className="text-xl font-bold">Order Details</h3>
             </div>

             <div className="grid gap-4">
               <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30">
                 <div>
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Estimated Delivery</p>
                   <p className="font-bold text-lg">{format(order.estimatedDelivery, "MMMM d, yyyy")}</p>
                 </div>
                 {order.isOverdue ? (
                   <Badge variant="destructive" className="rounded-full">Overdue</Badge>
                 ) : order.isAlmostDue && !order.isOverdue ? (
                   <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20 rounded-full">Due Soon</Badge>
                 ) : null}
               </div>

               {order.actualDelivery && (
                 <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30">
                   <div>
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Actual Delivery</p>
                     <p className="font-bold text-lg text-green-600">{format(order.actualDelivery, "MMMM d, yyyy")}</p>
                   </div>
                   <CheckCircle2 className="h-5 w-5 text-green-500" />
                 </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                   <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Order Date</p>
                   <p className="font-medium">{format(order.createdAt, "MMM d, yyyy")}</p>
                 </div>
                 
                 {order.price && (
                   <div className="p-4 rounded-2xl bg-muted/30 border border-border/30">
                     <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Price</p>
                     <div className="flex flex-col">
                       <p className="font-bold">₦{order.price.toFixed(2)}</p>
                       <span className={clsx("text-xs font-medium", order.paid ? "text-green-500" : "text-orange-500")}>
                         {order.paid ? "Paid" : "Pending Payment"}
                       </span>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Style Reference */}
      {order.style && (
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="relative space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                 <Scissors className="h-5 w-5 text-pink-500" />
               </div>
               <h3 className="text-xl font-bold">Style Reference</h3>
             </div>

             <div className="flex flex-col md:flex-row gap-6">
               {order.style.images.length > 0 && (
                 <div className="h-48 w-48 rounded-2xl overflow-hidden shadow-md border border-border/50 flex-shrink-0">
                   <img
                     src={order.style.images[0]}
                     alt={order.style.name}
                     className="w-full h-full object-cover"
                   />
                 </div>
               )}
               <div className="flex-1 space-y-4">
                 <div>
                   <h4 className="text-2xl font-bold">{order.style.name}</h4>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {order.style.tags.map((tag) => (
                       <Badge key={tag} variant="secondary" className="rounded-full px-3">
                         {tag}
                       </Badge>
                     ))}
                   </div>
                 </div>
                 <p className="text-muted-foreground leading-relaxed">
                   {/* Description placeholder if style had one, or generic text */}
                   Style reference for this order.
                 </p>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* Tasks Progress */}
      {order.tasks.length > 0 && (
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
           
           <div className="relative space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                 <Package className="h-5 w-5 text-indigo-500" />
               </div>
               <h3 className="text-xl font-bold">Production Tasks</h3>
             </div>

             <div className="grid gap-3 md:grid-cols-2">
               {order.tasks.map((task) => (
                 <div
                   key={task._id}
                   className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/30 transition-colors hover:bg-muted/50"
                 >
                   <div className="flex items-center gap-4">
                     <div
                       className={clsx(
                         "w-10 h-10 rounded-full flex items-center justify-center",
                         task.status === "completed"
                           ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                           : "bg-background border border-border"
                       )}
                     >
                       {task.status === "completed" ? (
                         <CheckCircle2 className="h-5 w-5" />
                       ) : (
                         <Package className="h-5 w-5 text-muted-foreground" />
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
                         ? "destructive"
                         : "secondary"
                     }
                     className="rounded-full"
                   >
                     {task.status.replace("_", " ")}
                   </Badge>
                 </div>
               ))}
             </div>
           </div>
        </div>
      )}

      {/* Notes */}
      {order.notes && (
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:shadow-lg">
           <div className="relative space-y-4">
             <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                 <FileText className="h-5 w-5 text-yellow-500" />
               </div>
               <h3 className="text-xl font-bold">Notes</h3>
             </div>
             <div className="p-6 rounded-2xl bg-muted/30 border border-border/30">
               <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                 {order.notes}
               </p>
             </div>
           </div>
        </div>
      )}

      {/* Contact Action */}
      <div className="rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground shadow-lg shadow-primary/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">Need assistance?</h3>
              <p className="text-white/80">
                Contact your tailor for updates or questions about this order.
              </p>
            </div>
          </div>
          <Link href="/chat">
            <Button size="lg" variant="secondary" className="rounded-full px-8 shadow-lg">
              Start Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
