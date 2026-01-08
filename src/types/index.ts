import { Id } from "../convex/_generated/dataModel";

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export type UserRole = "admin" | "manager" | "worker" | "customer";

export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface Permission {
  resource: string;
  action: "create" | "read" | "update" | "delete";
}

// ============================================================================
// ORGANIZATION
// ============================================================================

export interface Organization {
  _id: Id<"organizations">;
  name: string;
  slug: string;
  logo?: string;
  accentColor: string;
  theme: "light" | "dark" | "system";
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  verified: boolean;
  verificationDocuments?: {
    cacDocument?: string;
    bvnVerified: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    bankVerified: boolean;
  };
  subscription: {
    tier: SubscriptionTier;
    status: "active" | "cancelled" | "past_due";
    currentPeriodEnd: number;
  };
  settings: {
    allowWorkerAdminChat: boolean;
    publicShowcase: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// USER & MEMBERSHIPS
// ============================================================================

export interface User {
  _id: Id<"users">;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: number;
}

export interface OrgMembership {
  _id: Id<"orgMemberships">;
  userId: Id<"users">;
  organizationId: Id<"organizations">;
  role: UserRole;
  invitedBy: Id<"users">;
  inviteAccepted: boolean;
  joinedAt: number;
}

// ============================================================================
// CUSTOMER (can exist without platform account)
// ============================================================================

export interface Customer {
  _id: Id<"customers">;
  organizationId: Id<"organizations">;
  userId?: Id<"users">; // null if offline/pre-platform customer
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  inviteToken?: string; // for claiming account
  claimedAt?: number;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// DEPENDANTS & MEASUREMENTS
// ============================================================================

export interface Dependant {
  _id: Id<"dependants">;
  customerId: Id<"customers">;
  organizationId: Id<"organizations">;
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: number;
  createdAt: number;
}

export interface Measurement {
  _id: Id<"measurements">;
  dependantId: Id<"dependants">;
  organizationId: Id<"organizations">;
  measurements: Record<string, number>; // e.g. { chest: 42, waist: 34, ... }
  unit: "inches" | "cm";
  notes?: string;
  takenBy: Id<"users">;
  takenAt: number;
}

// ============================================================================
// STYLES & SHOWCASE
// ============================================================================

export interface Style {
  _id: Id<"styles">;
  organizationId: Id<"organizations">;
  name: string;
  tags: string[]; // e.g. ["formal", "wedding", "male"]
  images: string[];
  videos?: string[];
  importedFrom?: "instagram" | "pinterest";
  importUrl?: string;
  createdAt: number;
}

// ============================================================================
// ORDERS
// ============================================================================

export type OrderStage = "cutting" | "sewing" | "finishing" | "delivery";

export interface Order {
  _id: Id<"orders">;
  organizationId: Id<"organizations">;
  customerId: Id<"customers">;
  dependantId: Id<"dependants">;
  styleId?: Id<"styles">;
  orderNumber: string;
  description: string;
  currentStage: OrderStage;
  estimatedDelivery: number;
  actualDelivery?: number;
  price?: number;
  paid: boolean;
  notes?: string;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// TASKS
// ============================================================================

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export interface Task {
  _id: Id<"tasks">;
  organizationId: Id<"organizations">;
  orderId: Id<"orders">;
  assignedTo: Id<"users">; // worker
  name: string;
  description?: string;
  stage: OrderStage;
  deadline: number; // custom deadline, not order delivery
  status: TaskStatus;
  materialAllocations: Array<{
    materialId: Id<"materials">;
    plannedQuantity: number;
    actualQuantity?: number;
  }>;
  rating?: number;
  ratingNotes?: string;
  completedAt?: number;
  createdBy: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// MATERIALS & INVENTORY
// ============================================================================

export type MaterialUnit = "yards" | "meters" | "units" | "pieces";

export interface Material {
  _id: Id<"materials">;
  organizationId: Id<"organizations">;
  name: string;
  description?: string;
  unit: MaterialUnit;
  quantityOnHand: number;
  reorderLevel: number;
  costPerUnit?: number;
  createdAt: number;
  updatedAt: number;
}

export type MaterialLedgerEntryType = "purchase" | "consumption" | "adjustment";

export interface MaterialLedgerEntry {
  _id: Id<"materialLedger">;
  organizationId: Id<"organizations">;
  materialId: Id<"materials">;
  type: MaterialLedgerEntryType;
  quantity: number; // positive for purchase/adjustment in, negative for consumption
  taskId?: Id<"tasks">; // if consumption
  notes?: string;
  performedBy: Id<"users">;
  createdAt: number;
}

// ============================================================================
// FABRICS (Catalog, not consumption tracking)
// ============================================================================

export interface Fabric {
  _id: Id<"fabrics">;
  organizationId: Id<"organizations">;
  name: string;
  description?: string;
  images: string[];
  color: string;
  pattern?: string;
  pricePerUnit?: number;
  unit: MaterialUnit;
  inStock: boolean;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// CHAT
// ============================================================================

export interface ChatConversation {
  _id: Id<"chatConversations">;
  organizationId: Id<"organizations">;
  participants: Id<"users">[];
  lastMessageAt: number;
  createdAt: number;
}

export interface ChatMessage {
  _id: Id<"chatMessages">;
  conversationId: Id<"chatConversations">;
  senderId: Id<"users">;
  content: string;
  readBy: Id<"users">[];
  createdAt: number;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface AnalyticsSnapshot {
  _id: Id<"analyticsSnapshots">;
  organizationId: Id<"organizations">;
  date: number;
  metrics: {
    ordersCompleted: number;
    ordersInProgress: number;
    ordersOverdue: number;
    revenue?: number;
    materialConsumption: Record<Id<"materials">, number>;
    workerProductivity: Record<Id<"users">, number>; // tasks completed
  };
  createdAt: number;
}

// ============================================================================
// FEATURE GATES (Subscription-based)
// ============================================================================

export interface FeatureGate {
  feature: string;
  requiredTier: SubscriptionTier;
}

export const FEATURE_GATES: FeatureGate[] = [
  { feature: "verification", requiredTier: "pro" },
  { feature: "style_import", requiredTier: "pro" },
  { feature: "analytics", requiredTier: "pro" },
  { feature: "unlimited_workers", requiredTier: "enterprise" },
  { feature: "api_access", requiredTier: "enterprise" },
];

// ============================================================================
// FRONTEND ROUTE MAP
// ============================================================================

export const ROUTES = {
  // Public
  HOME: "/",
  ORGANIZATIONS: "/organizations",
  ORG_SHOWCASE: (slug: string) => `/org/${slug}`,
  
  // Auth
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  ONBOARDING: "/onboarding",
  
  // Customer
  CUSTOMER_DASHBOARD: "/dashboard",
  CUSTOMER_ORDERS: "/orders",
  CUSTOMER_ORDER_DETAIL: (id: string) => `/orders/${id}`,
  CUSTOMER_DEPENDANTS: "/dependants",
  CUSTOMER_PROFILE: "/profile",
  
  // Worker
  WORKER_DASHBOARD: "/worker/dashboard",
  WORKER_TASKS: "/worker/tasks",
  WORKER_TASK_DETAIL: (id: string) => `/worker/tasks/${id}`,
  WORKER_PROFILE: "/worker/profile",
  
  // Manager
  MANAGER_DASHBOARD: "/manager/dashboard",
  MANAGER_ORDERS: "/manager/orders",
  MANAGER_WORKERS: "/manager/workers",
  
  // Admin
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_MATERIALS: "/admin/materials",
  ADMIN_FABRICS: "/admin/fabrics",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/settings",
} as const;