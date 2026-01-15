import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission } from "../helpers/auth";
import { calculateTaskStatus } from "../helpers/utils";

// ============================================================================
// CREATE TASK
// ============================================================================

export const create = mutation({
  args: {
    orderId: v.id("orders"),
    assignedTo: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    stage: v.union(
      v.literal("cutting"),
      v.literal("sewing"),
      v.literal("finishing"),
      v.literal("delivery")
    ),
    deadline: v.float64(),
    materialAllocations: v.optional(
      v.array(
        v.object({
          materialId: v.id("materials"),
          plannedQuantity: v.float64(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "tasks", "create");

    // Validate order
    const order = await ctx.db.get(args.orderId);
    if (!order || order.organizationId !== organizationId) {
      throw new ConvexError("Order not found");
    }

    // Validate assigned worker exists and is a worker
    const workerMembership = await ctx.db
      .query("orgMemberships")
      .withIndex("by_user_org", (q) =>
        q.eq("userId", args.assignedTo).eq("organizationId", organizationId)
      )
      .first();

    if (!workerMembership || workerMembership.role !== "worker") {
      throw new ConvexError("Assigned user is not a worker in this organization");
    }

    // Validate deadline is in the future
    if (args.deadline <= Date.now()) {
      throw new ConvexError("Deadline must be in the future");
    }

    // Validate material allocations
    if (args.materialAllocations) {
      for (const allocation of args.materialAllocations) {
        const material = await ctx.db.get(allocation.materialId);
        if (!material || material.organizationId !== organizationId) {
          throw new ConvexError("Invalid material in allocation");
        }
        if (allocation.plannedQuantity <= 0) {
          throw new ConvexError("Material quantity must be positive");
        }
      }
    }

    const now = Date.now();

    const taskId = await ctx.db.insert("tasks", {
      organizationId,
      orderId: args.orderId,
      assignedTo: args.assignedTo,
      name: args.name,
      description: args.description,
      stage: args.stage,
      deadline: args.deadline,
      status: "pending",
      materialAllocations: args.materialAllocations ?? [],
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "create",
      resource: "task",
      resourceId: taskId,
      metadata: { orderId: args.orderId, assignedTo: args.assignedTo },
      createdAt: now,
    });

    return taskId;
  },
});

// ============================================================================
// UPDATE TASK
// ============================================================================

export const update = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    deadline: v.optional(v.float64()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "tasks", "update");

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    // Workers can only update their own tasks
    if (role === "worker" && task.assignedTo !== userId) {
      throw new ConvexError("Cannot update other workers' tasks");
    }

    // Validate deadline if provided
    if (args.deadline && args.deadline <= Date.now()) {
      throw new ConvexError("Deadline must be in the future");
    }

    // Validate new assignee if provided
    if (args.assignedTo) {
      const workerMembership = await ctx.db
        .query("orgMemberships")
        .withIndex("by_user_org", (q) =>
          q.eq("userId", args.assignedTo!).eq("organizationId", organizationId)
        )
        .first();

      if (!workerMembership || workerMembership.role !== "worker") {
        throw new ConvexError("Assigned user is not a worker in this organization");
      }
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.deadline !== undefined) updates.deadline = args.deadline;
    if (args.assignedTo !== undefined) updates.assignedTo = args.assignedTo;

    await ctx.db.patch(args.taskId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "task",
      resourceId: args.taskId,
      metadata: updates,
      createdAt: Date.now(),
    });

    return args.taskId;
  },
});

// ============================================================================
// UPDATE TASK STATUS
// ============================================================================

export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    // Workers can only update their own tasks
    if (role === "worker" && task.assignedTo !== userId) {
      throw new ConvexError("Cannot update other workers' tasks");
    }

    const now = Date.now();
    const updates: Record<string, unknown> = {
      status: args.status,
      updatedAt: now,
    };

    // Set completion time if marking completed
    if (args.status === "completed" && !task.completedAt) {
      updates.completedAt = now;
    }

    await ctx.db.patch(args.taskId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "task_status",
      resourceId: args.taskId,
      metadata: { oldStatus: task.status, newStatus: args.status },
      createdAt: now,
    });

    return args.taskId;
  },
});

// ============================================================================
// RECORD MATERIAL CONSUMPTION
// ============================================================================

export const recordMaterialConsumption = mutation({
  args: {
    taskId: v.id("tasks"),
    materialId: v.id("materials"),
    actualQuantity: v.float64(),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    // Workers can only update their own tasks
    if (role === "worker" && task.assignedTo !== userId) {
      throw new ConvexError("Cannot update other workers' tasks");
    }

    if (args.actualQuantity <= 0) {
      throw new ConvexError("Quantity must be positive");
    }

    // Find the material allocation
    const allocationIndex = task.materialAllocations.findIndex(
      (a) => a.materialId === args.materialId
    );

    if (allocationIndex === -1) {
      throw new ConvexError("Material not allocated to this task");
    }

    // Update the allocation
    const updatedAllocations = [...task.materialAllocations];
    updatedAllocations[allocationIndex] = {
      ...updatedAllocations[allocationIndex],
      actualQuantity: args.actualQuantity,
    };

    await ctx.db.patch(args.taskId, {
      materialAllocations: updatedAllocations,
      updatedAt: Date.now(),
    });

    // Create material ledger entry
    await ctx.db.insert("materialLedger", {
      organizationId,
      materialId: args.materialId,
      type: "consumption",
      quantity: -args.actualQuantity, // Negative for consumption
      taskId: args.taskId,
      performedBy: userId,
      createdAt: Date.now(),
    });

    // Update material quantity
    const material = await ctx.db.get(args.materialId);
    if (material) {
      await ctx.db.patch(args.materialId, {
        quantityOnHand: material.quantityOnHand - args.actualQuantity,
        updatedAt: Date.now(),
      });
    }

    return args.taskId;
  },
});

// ============================================================================
// RATE TASK
// ============================================================================

export const rateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    rating: v.float64(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    if (role !== "admin" && role !== "manager") {
      throw new ConvexError("Only admin and manager can rate tasks");
    }

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    if (task.status !== "completed") {
      throw new ConvexError("Can only rate completed tasks");
    }

    if (args.rating < 0 || args.rating > 5) {
      throw new ConvexError("Rating must be between 0 and 5");
    }

    await ctx.db.patch(args.taskId, {
      rating: args.rating,
      ratingNotes: args.notes,
      updatedAt: Date.now(),
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "update",
      resource: "task_rating",
      resourceId: args.taskId,
      metadata: { rating: args.rating },
      createdAt: Date.now(),
    });

    return args.taskId;
  },
});

// ============================================================================
// DELETE TASK
// ============================================================================

export const remove = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const { userId, organizationId, role } = await getCurrentUserContext(ctx);

    requirePermission(role, "tasks", "delete");

    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError("Task not found");
    }

    if (task.organizationId !== organizationId) {
      throw new ConvexError("Task belongs to different organization");
    }

    await ctx.db.delete(args.taskId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      organizationId,
      userId,
      action: "delete",
      resource: "task",
      resourceId: args.taskId,
      createdAt: Date.now(),
    });

    return args.taskId;
  },
});
