import { customAlphabet } from "nanoid";

// ============================================================================
// ID GENERATION
// ============================================================================

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6);
  return `ORD-${timestamp}-${random}`;
}

export function generateInviteToken(): string {
  return nanoid(32);
}

// ============================================================================
// SLUG GENERATION
// ============================================================================

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

export function generateUniqueSlug(base: string, existingSlugs: string[]): string {
  let slug = generateSlug(base);
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(base)}-${counter}`;
    counter++;
  }

  return slug;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

export function isOverdue(deadline: number): boolean {
  return deadline < Date.now();
}

export function isAlmostDue(deadline: number, hoursThreshold: number = 24): boolean {
  const threshold = Date.now() + hoursThreshold * 60 * 60 * 1000;
  return deadline <= threshold && deadline > Date.now();
}

export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

// ============================================================================
// VALIDATION
// ============================================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Basic international phone validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ""));
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginationArgs {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export function normalizePaginationLimit(limit?: number): number {
  if (!limit) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
}

// ============================================================================
// TASK STATUS CALCULATION
// ============================================================================

export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";

export function calculateTaskStatus(
  currentStatus: TaskStatus,
  deadline: number,
  completedAt?: number
): TaskStatus {
  if (completedAt) {
    return "completed";
  }

  if (isOverdue(deadline) && currentStatus !== "completed") {
    return "overdue";
  }

  return currentStatus;
}

// ============================================================================
// ORDER STAGE HELPERS
// ============================================================================

export type OrderStage = "cutting" | "sewing" | "finishing" | "delivery";

export const ORDER_STAGES: OrderStage[] = ["cutting", "sewing", "finishing", "delivery"];

export function getStageIndex(stage: OrderStage): number {
  return ORDER_STAGES.indexOf(stage);
}

export function getNextStage(currentStage: OrderStage): OrderStage | null {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex === -1 || currentIndex === ORDER_STAGES.length - 1) {
    return null;
  }
  return ORDER_STAGES[currentIndex + 1];
}

export function getStageProgress(stage: OrderStage): number {
  const index = getStageIndex(stage);
  return ((index + 1) / ORDER_STAGES.length) * 100;
}

// ============================================================================
// MATERIAL CALCULATIONS
// ============================================================================

export function calculateTotalPlannedMaterial(
  allocations: Array<{ plannedQuantity: number }>
): number {
  return allocations.reduce((sum, alloc) => sum + alloc.plannedQuantity, 0);
}

export function calculateTotalConsumedMaterial(
  allocations: Array<{ actualQuantity?: number }>
): number {
  return allocations.reduce((sum, alloc) => sum + (alloc.actualQuantity ?? 0), 0);
}

export function calculateMaterialVariance(
  allocations: Array<{ plannedQuantity: number; actualQuantity?: number }>
): number {
  const planned = calculateTotalPlannedMaterial(allocations);
  const consumed = calculateTotalConsumedMaterial(allocations);
  return consumed - planned;
}

// ============================================================================
// ANALYTICS HELPERS
// ============================================================================

export function calculateCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return (completed / total) * 100;
}

export function calculateAverageCompletionTime(
  orders: Array<{ createdAt: number; actualDelivery?: number }>
): number {
  const completedOrders = orders.filter((o) => o.actualDelivery);
  
  if (completedOrders.length === 0) return 0;

  const totalTime = completedOrders.reduce(
    (sum, order) => sum + (order.actualDelivery! - order.createdAt),
    0
  );

  return totalTime / completedOrders.length;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

export function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function getContrastColor(hex: string): "light" | "dark" {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "dark" : "light";
}