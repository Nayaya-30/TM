import { QueryCtx, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";

export type UserRole = "admin" | "manager" | "worker" | "customer";

export interface AuthContext {
  userId: Id<"users">;
  organizationId: Id<"organizations">;
  role: UserRole;
}

// ============================================================================
// GET CURRENT USER CONTEXT
// ============================================================================

export async function getCurrentUserContext(
  ctx: QueryCtx | MutationCtx
): Promise<AuthContext> {
  const identity = await ctx.auth.getUserIdentity();
  
  if (!identity) {
    throw new ConvexError("Unauthenticated");
  }

  const userId = identity.subject as Id<"users">;

  // Get user's current organization from session or default
  // In practice, this would come from a session store or user preference
  const membership = await ctx.db
    .query("orgMemberships")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("inviteAccepted"), true))
    .first();

  if (!membership) {
    throw new ConvexError("No organization membership found");
  }

  return {
    userId,
    organizationId: membership.organizationId,
    role: membership.role as UserRole,
  };
}

// ============================================================================
// PERMISSION CHECKING
// ============================================================================

export type Resource =
  | "orders"
  | "tasks"
  | "materials"
  | "fabrics"
  | "customers"
  | "workers"
  | "analytics"
  | "settings"
  | "chat";

export type Action = "create" | "read" | "update" | "delete";

interface PermissionRule {
  resource: Resource;
  action: Action;
  roles: UserRole[];
}

const PERMISSION_RULES: PermissionRule[] = [
  // Orders
  { resource: "orders", action: "create", roles: ["admin", "manager"] },
  { resource: "orders", action: "read", roles: ["admin", "manager", "customer"] },
  { resource: "orders", action: "update", roles: ["admin", "manager"] },
  { resource: "orders", action: "delete", roles: ["admin"] },

  // Tasks
  { resource: "tasks", action: "create", roles: ["admin", "manager"] },
  { resource: "tasks", action: "read", roles: ["admin", "manager", "worker"] },
  { resource: "tasks", action: "update", roles: ["admin", "manager", "worker"] },
  { resource: "tasks", action: "delete", roles: ["admin", "manager"] },

  // Materials
  { resource: "materials", action: "create", roles: ["admin"] },
  { resource: "materials", action: "read", roles: ["admin", "manager"] },
  { resource: "materials", action: "update", roles: ["admin"] },
  { resource: "materials", action: "delete", roles: ["admin"] },

  // Fabrics
  { resource: "fabrics", action: "create", roles: ["admin"] },
  { resource: "fabrics", action: "read", roles: ["admin", "customer"] },
  { resource: "fabrics", action: "update", roles: ["admin"] },
  { resource: "fabrics", action: "delete", roles: ["admin"] },

  // Customers
  { resource: "customers", action: "create", roles: ["admin", "manager"] },
  { resource: "customers", action: "read", roles: ["admin", "manager"] },
  { resource: "customers", action: "update", roles: ["admin", "manager"] },
  { resource: "customers", action: "delete", roles: ["admin"] },

  // Workers
  { resource: "workers", action: "create", roles: ["admin", "manager"] },
  { resource: "workers", action: "read", roles: ["admin", "manager"] },
  { resource: "workers", action: "update", roles: ["admin", "manager"] },
  { resource: "workers", action: "delete", roles: ["admin"] },

  // Analytics
  { resource: "analytics", action: "read", roles: ["admin"] },

  // Settings
  { resource: "settings", action: "read", roles: ["admin"] },
  { resource: "settings", action: "update", roles: ["admin"] },

  // Chat
  { resource: "chat", action: "create", roles: ["admin", "manager", "worker", "customer"] },
  { resource: "chat", action: "read", roles: ["admin", "manager", "worker", "customer"] },
];

export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  return PERMISSION_RULES.some(
    (rule) =>
      rule.resource === resource &&
      rule.action === action &&
      rule.roles.includes(role)
  );
}

export function requirePermission(
  role: UserRole,
  resource: Resource,
  action: Action
): void {
  if (!hasPermission(role, resource, action)) {
    throw new ConvexError(
      `Insufficient permissions: ${role} cannot ${action} ${resource}`
    );
  }
}

// ============================================================================
// SUBSCRIPTION GATING
// ============================================================================

export type SubscriptionTier = "free" | "pro" | "enterprise";

interface FeatureGate {
  feature: string;
  requiredTier: SubscriptionTier;
}

const FEATURE_GATES: FeatureGate[] = [
  { feature: "verification", requiredTier: "pro" },
  { feature: "style_import", requiredTier: "pro" },
  { feature: "analytics", requiredTier: "pro" },
  { feature: "unlimited_workers", requiredTier: "enterprise" },
  { feature: "api_access", requiredTier: "enterprise" },
];

const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

export function hasFeatureAccess(
  currentTier: SubscriptionTier,
  feature: string
): boolean {
  const gate = FEATURE_GATES.find((g) => g.feature === feature);
  
  if (!gate) {
    return true; // Feature not gated
  }

  return TIER_HIERARCHY[currentTier] >= TIER_HIERARCHY[gate.requiredTier];
}

export function requireFeatureAccess(
  currentTier: SubscriptionTier,
  feature: string
): void {
  if (!hasFeatureAccess(currentTier, feature)) {
    const gate = FEATURE_GATES.find((g) => g.feature === feature);
    throw new ConvexError(
      `Feature "${feature}" requires ${gate?.requiredTier} subscription or higher`
    );
  }
}

// ============================================================================
// RESOURCE OWNERSHIP CHECKS
// ============================================================================

export async function canAccessOrder(
  ctx: QueryCtx | MutationCtx,
  orderId: Id<"orders">,
  authContext: AuthContext
): Promise<boolean> {
  const order = await ctx.db.get(orderId);
  
  if (!order) {
    return false;
  }

  // Must be in same org
  if (order.organizationId !== authContext.organizationId) {
    return false;
  }

  // Admin and Manager can access all orders
  if (authContext.role === "admin" || authContext.role === "manager") {
    return true;
  }

  // Customer can only access their own orders
  if (authContext.role === "customer") {
    const customer = await ctx.db
      .query("customers")
      .withIndex("by_user", (q) => q.eq("userId", authContext.userId))
      .filter((q) => q.eq(q.field("organizationId"), authContext.organizationId))
      .first();

    return customer?._id === order.customerId;
  }

  return false;
}

export async function canAccessTask(
  ctx: QueryCtx | MutationCtx,
  taskId: Id<"tasks">,
  authContext: AuthContext
): Promise<boolean> {
  const task = await ctx.db.get(taskId);
  
  if (!task) {
    return false;
  }

  // Must be in same org
  if (task.organizationId !== authContext.organizationId) {
    return false;
  }

  // Admin and Manager can access all tasks
  if (authContext.role === "admin" || authContext.role === "manager") {
    return true;
  }

  // Worker can only access their assigned tasks
  if (authContext.role === "worker") {
    return task.assignedTo === authContext.userId;
  }

  return false;
}

// ============================================================================
// CHAT ACCESS VALIDATION
// ============================================================================

export async function canChatWith(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  targetUserId: Id<"users">,
  organizationId: Id<"organizations">
): Promise<boolean> {
  const userMembership = await ctx.db
    .query("orgMemberships")
    .withIndex("by_user_org", (q) =>
      q.eq("userId", userId).eq("organizationId", organizationId)
    )
    .first();

  const targetMembership = await ctx.db
    .query("orgMemberships")
    .withIndex("by_user_org", (q) =>
      q.eq("userId", targetUserId).eq("organizationId", organizationId)
    )
    .first();

  if (!userMembership || !targetMembership) {
    return false;
  }

  const userRole = userMembership.role as UserRole;
  const targetRole = targetMembership.role as UserRole;

  // Customer can chat with Admin/Manager
  if (userRole === "customer") {
    return targetRole === "admin" || targetRole === "manager";
  }

  // Worker can chat with Manager
  if (userRole === "worker") {
    if (targetRole === "manager") {
      return true;
    }
    
    // Worker can chat with Admin only if enabled
    if (targetRole === "admin") {
      const org = await ctx.db.get(organizationId);
      return org?.settings.allowWorkerAdminChat ?? false;
    }
    
    return false;
  }

  // Manager can chat with everyone
  if (userRole === "manager") {
    return true;
  }

  // Admin can chat with everyone
  if (userRole === "admin") {
    return true;
  }

  return false;
}