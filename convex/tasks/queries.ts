import { v } from "convex/values";
import { query } from "../_generated/server";
import { ConvexError } from "convex/values";
import { getCurrentUserContext, requirePermission, canAccessTask } from "../helpers/auth";
import { calculateTaskStatus, isOverdue, isAlmostDue, normalizePaginationLimit } from "../helpers/utils";

// ============================================================================
// LIST TASKS
// ============================================================================

export const list = query({
	args: {
		orderId: v.optional(v.id("orders")),
		assignedTo: v.optional(v.id("users")),
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("in_progress"),
				v.literal("completed"),
				v.literal("overdue")
			)
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const context = await getCurrentUserContext(ctx);
		const organizationId = context.organizationId;
		const role = context.role;
		const userId = context.userId;

		if (!organizationId || !role) {
			throw new ConvexError("Organization and role required for this action");
		}

		requirePermission(role, "tasks", "read");

		const limit = normalizePaginationLimit(args.limit);

		let tasks;

		// Workers only see their own tasks
		if (role === "worker") {
			tasks = await ctx.db
				.query("tasks")
				.withIndex("by_worker", (q) => q.eq("assignedTo", userId))
				.order("desc")
				.take(limit);
		} else {
			// Admin and Manager see all org tasks
			tasks = await ctx.db
				.query("tasks")
				.withIndex("by_org", (q) => q.eq("organizationId", organizationId))
				.order("desc")
				.take(limit);
		}

		// Filter by order if provided
		if (args.orderId) {
			tasks = tasks.filter((t) => t.orderId === args.orderId);
		}

		// Filter by assignedTo if provided
		if (args.assignedTo) {
			tasks = tasks.filter((t) => t.assignedTo === args.assignedTo);
		}

		// Filter by status if provided
		if (args.status) {
			tasks = tasks.filter((t) => {
				const currentStatus = calculateTaskStatus(t.status, t.deadline, t.completedAt);
				return currentStatus === args.status;
			});
		}

		// Fetch related data
		const tasksWithDetails = await Promise.all(
			tasks.map(async (task) => {
				const order = await ctx.db.get(task.orderId);
				const worker = await ctx.db.get(task.assignedTo);

				// Get material allocations with material details
				const materialDetails = await Promise.all(
					task.materialAllocations.map(async (allocation) => {
						const material = await ctx.db.get(allocation.materialId);
						return {
							materialId: allocation.materialId,
							name: material?.name ?? "Unknown",
							unit: material?.unit ?? "units",
							plannedQuantity: allocation.plannedQuantity,
							actualQuantity: allocation.actualQuantity,
						};
					})
				);

				const currentStatus = calculateTaskStatus(task.status, task.deadline, task.completedAt);

				return {
					...task,
					status: currentStatus,
					order: order
						? {
							orderNumber: order.orderNumber,
							description: order.description,
						}
						: null,
					worker: worker
						? {
							firstName: worker.firstName,
							lastName: worker.lastName,
							image: worker.image,
						}
						: null,
					materials: materialDetails,
					isOverdue: isOverdue(task.deadline) && !task.completedAt,
					isAlmostDue: isAlmostDue(task.deadline) && !task.completedAt,
				};
			})
		);

		return tasksWithDetails;
	},
});

// ============================================================================
// GET TASK DETAILS
// ============================================================================

export const get = query({
	args: {
		taskId: v.id("tasks"),
	},
	handler: async (ctx, args) => {
		const context = await getCurrentUserContext(ctx);
		const organizationId = context.organizationId;
		const role = context.role;
		const userId = context.userId;

		if (!organizationId || !role) {
			throw new ConvexError("Organization and role required for this action");
		}

		const task = await ctx.db.get(args.taskId);

		if (!task) {
			throw new ConvexError("Task not found");
		}

		if (task.organizationId !== organizationId) {
			throw new ConvexError("Task belongs to different organization");
		}

		// Check access
		const hasAccess = await canAccessTask(ctx, args.taskId, {
			userId,
			organizationId,
			role,
		});

		if (!hasAccess) {
			throw new ConvexError("Cannot view this task");
		}

		// Fetch related data
		const order = await ctx.db.get(task.orderId);
		const worker = await ctx.db.get(task.assignedTo);
		const createdBy = await ctx.db.get(task.createdBy);

		// Get material allocations with details
		const materialDetails = await Promise.all(
			task.materialAllocations.map(async (allocation) => {
				const material = await ctx.db.get(allocation.materialId);
				return {
					materialId: allocation.materialId,
					name: material?.name ?? "Unknown",
					description: material?.description,
					unit: material?.unit ?? "units",
					plannedQuantity: allocation.plannedQuantity,
					actualQuantity: allocation.actualQuantity,
				};
			})
		);

		const currentStatus = calculateTaskStatus(task.status, task.deadline, task.completedAt);

		return {
			...task,
			status: currentStatus,
			order: order
				? {
					_id: order._id,
					orderNumber: order.orderNumber,
					description: order.description,
					currentStage: order.currentStage,
				}
				: null,
			worker: worker
				? {
					_id: worker._id,
					firstName: worker.firstName,
					lastName: worker.lastName,
					image: worker.image,
				}
				: null,
			createdBy: createdBy
				? {
					firstName: createdBy.firstName,
					lastName: createdBy.lastName,
				}
				: null,
			materials: materialDetails,
			isOverdue: isOverdue(task.deadline) && !task.completedAt,
			isAlmostDue: isAlmostDue(task.deadline) && !task.completedAt,
		};
	},
});

// ============================================================================
// LIST WORKER'S TASKS
// ============================================================================

export const listMine = query({
	args: {
		status: v.optional(
			v.union(
				v.literal("pending"),
				v.literal("in_progress"),
				v.literal("completed"),
				v.literal("overdue")
			)
		),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const context = await getCurrentUserContext(ctx);
		const organizationId = context.organizationId;
		const role = context.role;
		const userId = context.userId;

		if (!organizationId || !role) {
			throw new ConvexError("Organization and role required for this action");
		}

		if (role !== "worker") {
			throw new ConvexError("Only workers can access this endpoint");
		}

		const limit = normalizePaginationLimit(args.limit);

		let tasks = await ctx.db
			.query("tasks")
			.withIndex("by_worker", (q) => q.eq("assignedTo", userId))
			.order("desc")
			.take(limit);

		// Filter by status if provided
		if (args.status) {
			tasks = tasks.filter((t) => {
				const currentStatus = calculateTaskStatus(t.status, t.deadline, t.completedAt);
				return currentStatus === args.status;
			});
		}

		// Fetch related data
		const tasksWithDetails = await Promise.all(
			tasks.map(async (task) => {
				const order = await ctx.db.get(task.orderId);

				// Get material allocations
				const materialDetails = await Promise.all(
					task.materialAllocations.map(async (allocation) => {
						const material = await ctx.db.get(allocation.materialId);
						return {
							materialId: allocation.materialId,
							name: material?.name ?? "Unknown",
							unit: material?.unit ?? "units",
							plannedQuantity: allocation.plannedQuantity,
							actualQuantity: allocation.actualQuantity,
						};
					})
				);

				const currentStatus = calculateTaskStatus(task.status, task.deadline, task.completedAt);

				return {
					...task,
					status: currentStatus,
					order: order
						? {
							orderNumber: order.orderNumber,
							description: order.description,
						}
						: null,
					materials: materialDetails,
					isOverdue: isOverdue(task.deadline) && !task.completedAt,
					isAlmostDue: isAlmostDue(task.deadline) && !task.completedAt,
				};
			})
		);

		return tasksWithDetails;
	},
});

// ============================================================================
// GET TASKS SUMMARY
// ============================================================================

export const getSummary = query({
	handler: async (ctx) => {
		const context = await getCurrentUserContext(ctx);
		const organizationId = context.organizationId;
		const role = context.role;

		if (!organizationId || !role) {
			throw new ConvexError("Organization and role required for this action");
		}

		if (role !== "admin" && role !== "manager") {
			throw new ConvexError("Insufficient permissions");
		}

		const allTasks = await ctx.db
			.query("tasks")
			.withIndex("by_org", (q) => q.eq("organizationId", organizationId))
			.collect();

		const pending = allTasks.filter((t) => t.status === "pending");
		const inProgress = allTasks.filter((t) => t.status === "in_progress");
		const completed = allTasks.filter((t) => t.status === "completed");
		const overdue = allTasks.filter((t) => isOverdue(t.deadline) && !t.completedAt);
		const almostDue = allTasks.filter((t) => isAlmostDue(t.deadline) && !t.completedAt);

		return {
			total: allTasks.length,
			pending: pending.length,
			inProgress: inProgress.length,
			completed: completed.length,
			overdue: overdue.length,
			almostDue: almostDue.length,
		};
	},
});