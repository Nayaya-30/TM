import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// ============================================================================
// SCHEMA DEFINITION
// ============================================================================

export default defineSchema({

	...authTables,

	// ==========================================================================
	// USERS
	// ==========================================================================// Simplified users table definition for your schema.ts

users: defineTable({
  // Convex Auth required fields
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  
  // Your custom fields
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  role: v.optional(
    v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("worker"),
      v.literal("customer"),
    ),
  ),
  emailVerified: v.optional(v.boolean()),
  phoneVerified: v.optional(v.boolean()),
  createdAt: v.optional(v.float64()),
  updatedAt: v.optional(v.float64()),
}).index("by_email", ["email"]),

	// ==========================================================================
	// ORGANIZATIONS
	// ==========================================================================
	organizations: defineTable({
		name: v.string(),
		slug: v.string(),
		logo: v.optional(v.string()),
		accentColor: v.string(),
		theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
		location: v.object({
			address: v.string(),
			latitude: v.float64(),
			longitude: v.float64(),
		}),
		verified: v.boolean(),
		verificationDocuments: v.optional(
			v.object({
				cacDocument: v.optional(v.string()),
				bvnVerified: v.boolean(),
				emailVerified: v.boolean(),
				phoneVerified: v.boolean(),
				bankVerified: v.boolean(),
			})
		),
		subscription: v.object({
			tier: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
			status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("past_due")),
			currentPeriodEnd: v.float64(),
		}),
		settings: v.object({
			allowWorkerAdminChat: v.boolean(),
			publicShowcase: v.boolean(),
		}),
		createdBy: v.id("users"),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_slug", ["slug"])
		.index("by_verified", ["verified"])
		.index("by_created", ["createdAt"]),

	// ==========================================================================
	// ORG MEMBERSHIPS
	// ==========================================================================
	orgMemberships: defineTable({
		userId: v.id("users"),
		organizationId: v.id("organizations"),
		role: v.union(
			v.literal("admin"),
			v.literal("manager"),
			v.literal("worker"),
			v.literal("customer")
		),
		invitedBy: v.id("users"),
		inviteAccepted: v.boolean(),
		inviteToken: v.optional(v.string()),
		joinedAt: v.float64(),
	})
		.index("by_user", ["userId"])
		.index("by_org", ["organizationId"])
		.index("by_user_org", ["userId", "organizationId"])
		.index("by_invite_token", ["inviteToken"]),

	// ==========================================================================
	// CUSTOMERS
	// ==========================================================================
	customers: defineTable({
		organizationId: v.id("organizations"),
		userId: v.optional(v.id("users")),
		firstName: v.string(),
		lastName: v.string(),
		email: v.optional(v.string()),
		phone: v.optional(v.string()),
		inviteToken: v.optional(v.string()),
		claimedAt: v.optional(v.float64()),
		createdBy: v.id("users"),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_user", ["userId"])
		.index("by_org_email", ["organizationId", "email"])
		.index("by_invite_token", ["inviteToken"]),

	// ==========================================================================
	// DEPENDANTS
	// ==========================================================================
	dependants: defineTable({
		customerId: v.id("customers"),
		organizationId: v.id("organizations"),
		firstName: v.string(),
		lastName: v.string(),
		gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
		dateOfBirth: v.optional(v.float64()),
		createdAt: v.float64(),
	})
		.index("by_customer", ["customerId"])
		.index("by_org", ["organizationId"]),

	// ==========================================================================
	// MEASUREMENTS
	// ==========================================================================
	measurements: defineTable({
		dependantId: v.id("dependants"),
		organizationId: v.id("organizations"),
		measurements: v.record(v.string(), v.float64()),
		unit: v.union(v.literal("inches"), v.literal("cm")),
		notes: v.optional(v.string()),
		takenBy: v.id("users"),
		takenAt: v.float64(),
	})
		.index("by_dependant", ["dependantId"])
		.index("by_org", ["organizationId"])
		.index("by_taken_at", ["dependantId", "takenAt"]),

	// ==========================================================================
	// STYLES
	// ==========================================================================
	styles: defineTable({
		organizationId: v.id("organizations"),
		name: v.string(),
		tags: v.array(v.string()),
		images: v.array(v.string()),
		videos: v.optional(v.array(v.string())),
		importedFrom: v.optional(v.union(v.literal("instagram"), v.literal("pinterest"))),
		importUrl: v.optional(v.string()),
		createdAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_created", ["organizationId", "createdAt"]),

	// ==========================================================================
	// ORDERS
	// ==========================================================================
	orders: defineTable({
		organizationId: v.id("organizations"),
		customerId: v.id("customers"),
		dependantId: v.id("dependants"),
		styleId: v.optional(v.id("styles")),
		orderNumber: v.string(),
		description: v.string(),
		currentStage: v.union(
			v.literal("cutting"),
			v.literal("sewing"),
			v.literal("finishing"),
			v.literal("delivery")
		),
		estimatedDelivery: v.float64(),
		actualDelivery: v.optional(v.float64()),
		price: v.optional(v.float64()),
		paid: v.boolean(),
		notes: v.optional(v.string()),
		createdBy: v.id("users"),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_customer", ["customerId"])
		.index("by_org_stage", ["organizationId", "currentStage"])
		.index("by_org_delivery", ["organizationId", "estimatedDelivery"])
		.index("by_order_number", ["organizationId", "orderNumber"]),

	// ==========================================================================
	// TASKS
	// ==========================================================================
	tasks: defineTable({
		organizationId: v.id("organizations"),
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
		status: v.union(
			v.literal("pending"),
			v.literal("in_progress"),
			v.literal("completed"),
			v.literal("overdue")
		),
		materialAllocations: v.array(
			v.object({
				materialId: v.id("materials"),
				plannedQuantity: v.float64(),
				actualQuantity: v.optional(v.float64()),
			})
		),
		rating: v.optional(v.float64()),
		ratingNotes: v.optional(v.string()),
		completedAt: v.optional(v.float64()),
		createdBy: v.id("users"),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_order", ["orderId"])
		.index("by_worker", ["assignedTo"])
		.index("by_org_status", ["organizationId", "status"])
		.index("by_org_deadline", ["organizationId", "deadline"])
		.index("by_worker_status", ["assignedTo", "status"]),

	// ==========================================================================
	// MATERIALS
	// ==========================================================================
	materials: defineTable({
		organizationId: v.id("organizations"),
		name: v.string(),
		description: v.optional(v.string()),
		unit: v.union(
			v.literal("yards"),
			v.literal("meters"),
			v.literal("units"),
			v.literal("pieces")
		),
		quantityOnHand: v.float64(),
		reorderLevel: v.float64(),
		costPerUnit: v.optional(v.float64()),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_org_low_stock", ["organizationId", "quantityOnHand"]),

	// ==========================================================================
	// MATERIAL LEDGER
	// ==========================================================================
	materialLedger: defineTable({
		organizationId: v.id("organizations"),
		materialId: v.id("materials"),
		type: v.union(v.literal("purchase"), v.literal("consumption"), v.literal("adjustment")),
		quantity: v.float64(),
		taskId: v.optional(v.id("tasks")),
		notes: v.optional(v.string()),
		performedBy: v.id("users"),
		createdAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_material", ["materialId"])
		.index("by_task", ["taskId"])
		.index("by_created", ["organizationId", "createdAt"]),

	// ==========================================================================
	// FABRICS
	// ==========================================================================
	fabrics: defineTable({
		organizationId: v.id("organizations"),
		name: v.string(),
		description: v.optional(v.string()),
		images: v.array(v.string()),
		color: v.string(),
		pattern: v.optional(v.string()),
		pricePerUnit: v.optional(v.float64()),
		unit: v.union(
			v.literal("yards"),
			v.literal("meters"),
			v.literal("units"),
			v.literal("pieces")
		),
		inStock: v.boolean(),
		tags: v.array(v.string()),
		createdAt: v.float64(),
		updatedAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_org_in_stock", ["organizationId", "inStock"]),

	// ==========================================================================
	// CHAT
	// ==========================================================================
	chatConversations: defineTable({
		organizationId: v.id("organizations"),
		participants: v.array(v.id("users")),
		lastMessageAt: v.float64(),
		createdAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_org_last_message", ["organizationId", "lastMessageAt"]),

	chatMessages: defineTable({
		conversationId: v.id("chatConversations"),
		senderId: v.id("users"),
		content: v.string(),
		readBy: v.array(v.id("users")),
		createdAt: v.float64(),
	})
		.index("by_conversation", ["conversationId"])
		.index("by_conversation_created", ["conversationId", "createdAt"]),

	// ==========================================================================
	// ANALYTICS
	// ==========================================================================
	analyticsSnapshots: defineTable({
		organizationId: v.id("organizations"),
		date: v.float64(),
		metrics: v.object({
			ordersCompleted: v.float64(),
			ordersInProgress: v.float64(),
			ordersOverdue: v.float64(),
			revenue: v.optional(v.float64()),
			materialConsumption: v.record(v.string(), v.float64()),
			workerProductivity: v.record(v.string(), v.float64()),
		}),
		createdAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_org_date", ["organizationId", "date"]),

	// ==========================================================================
	// AUDIT LOGS
	// ==========================================================================
	auditLogs: defineTable({
		organizationId: v.id("organizations"),
		userId: v.id("users"),
		action: v.string(),
		resource: v.string(),
		resourceId: v.optional(
			v.string()
		),
		metadata: v.optional(v.record(v.string(), v.any())),
		createdAt: v.float64(),
	})
		.index("by_org", ["organizationId"])
		.index("by_org_created", ["organizationId", "createdAt"])
		.index("by_user", ["userId"]),
});
