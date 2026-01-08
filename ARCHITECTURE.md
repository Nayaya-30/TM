# System Architecture Documentation

## 1. ARCHITECTURE OVERVIEW

### 1.1 System Design Philosophy
This is a **true multi-tenant SaaS** platform with:
- **Org-level isolation**: Every query/mutation validates organization context
- **Role-based access control (RBAC)**: Enforced at the database layer
- **Server-driven state**: Convex handles all data operations
- **Zero trust**: Client cannot bypass server validation

### 1.2 Multi-Tenancy Strategy
**Row-Level Isolation**
- Every table (except `users`) includes `organizationId`
- All queries filter by `organizationId` before role checks
- Cross-org data access is impossible by design

**User-Org Relationship**
- Users can belong to multiple organizations
- `orgMemberships` table stores role per organization
- Authentication returns current org context

### 1.3 Tech Stack Justification
- **Next.js 15 + React 19**: Latest features, RSC support
- **Convex**: Real-time database with built-in auth, subscriptions
- **Tailwind v4**: Simplified config, better performance
- **TypeScript**: Type safety across frontend/backend boundary

---

## 2. DATA MODEL & SCHEMA DESIGN

### 2.1 Core Tables

#### users
- Platform-level user accounts
- Can belong to multiple orgs
- Email/phone verification

#### organizations
- Tenant isolation unit
- Stores branding, subscription, verification
- One owner (admin who created it)

#### orgMemberships
- Junction table: users ↔ organizations
- Stores role per user per org
- Handles invites (inviteAccepted flag)

#### customers
- **Can exist without userId** (offline/pre-platform)
- Linked to org, not user directly
- `inviteToken` for claiming accounts

#### dependants
- Belongs to customer
- Measurements stored separately (versioned)

#### orders
- Core business entity
- Links customer, dependant, style
- Tracks stage progression

#### tasks
- Work units assigned to workers
- Custom deadlines (not order deadline)
- Material allocation planning

#### materials
- Inventory tracking with ledger
- Admin/Manager only

#### fabrics
- Catalog for customers
- Not consumption-tracked

#### chatConversations & chatMessages
- Role-based access
- Real-time updates via Convex

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

### 3.1 Permission Matrix

| Resource | Customer | Worker | Manager | Admin |
|----------|----------|--------|---------|-------|
| View Orders | Own only | No | All | All |
| Create Orders | No | No | Yes | Yes |
| View Tasks | No | Own only | All | All |
| Assign Tasks | No | No | Yes | Yes |
| View Materials | No | No | Yes | Yes |
| Manage Materials | No | No | No | Yes |
| View Fabrics | Yes | No | No | Yes |
| View Workers | No | No | Summary | All |
| Org Settings | No | No | No | Yes |
| Analytics | No | No | No | Yes |
| Chat Admin | Yes | No | Yes | Yes |
| Chat Worker | No | Yes | Yes | Conditional |

### 3.2 RBAC Implementation Strategy

**Convex Query/Mutation Pattern**
```typescript
// Every function starts with:
const { userId, orgId, role } = await getCurrentUserContext(ctx);

// Then validates:
if (!hasPermission(role, "orders", "read")) {
  throw new Error("Unauthorized");
}

// Finally filters:
const orders = await ctx.db
  .query("orders")
  .filter(q => q.eq(q.field("organizationId"), orgId))
  .collect();
```

**Permission Checking**
- Centralized permission checking utilities
- Role + resource + action validation
- Never trust client-provided role

---

## 4. SUBSCRIPTION & FEATURE GATING

### 4.1 Subscription Tiers

**Free**
- 1 admin, 2 workers, 5 customers
- Basic orders & tasks
- No verification
- No analytics

**Pro**
- 10 workers, unlimited customers
- Verification eligible
- Style import (Instagram/Pinterest)
- Basic analytics

**Enterprise**
- Unlimited workers
- Advanced analytics
- API access
- Priority support

### 4.2 Feature Gate Enforcement

**Backend Gating**
```typescript
const subscription = await getOrgSubscription(ctx, orgId);
if (requiresTier("analytics", subscription.tier) === false) {
  throw new Error("Feature requires Pro or higher");
}
```

**Frontend Gating**
- Gates render based on subscription
- Show upgrade prompts
- Disable features gracefully

---

## 5. EXISTING/OFFLINE CUSTOMER SUPPORT

### 5.1 Customer Lifecycle

**Stage 1: Pre-Platform**
- Admin creates customer without `userId`
- Customer has orders, measurements, dependants
- All data linked via `customerId`

**Stage 2: Invitation**
- Admin sends invite (generates `inviteToken`)
- Token sent via email/SMS

**Stage 3: Claiming**
- Customer signs up, enters token
- System links `userId` to customer record
- Customer sees all historical data

**Stage 4: Active**
- Customer uses platform normally
- Can add dependants, view orders

### 5.2 Data Integrity Rules
- Orders/measurements never orphaned
- Customer merge on claim (no duplication)
- Audit trail of claim event

---

## 6. TRUST & VERIFICATION

### 6.1 Verification Requirements
- Email verification (OTP)
- Phone verification (SMS)
- CAC document upload + manual review
- Bank account verification (micro-deposits or API)

### 6.2 Verification Flow
1. Admin submits documents
2. System marks `verificationPending`
3. Manual review (or automated for some checks)
4. Status changes to `verified`
5. Badge appears on org profile

### 6.3 Anti-Scam Measures
- Unverified orgs show warning banner
- Payment features require verification
- Clear org identity on all pages

---

## 7. SCALABILITY CONSIDERATIONS

### 7.1 Database Scaling
- Convex handles horizontal scaling
- Indexed queries:
  - `organizationId` on all tables
  - `userId` on memberships
  - `customerId` on orders
  - `orderId` on tasks

### 7.2 Performance Optimizations
- Paginated queries for large datasets
- Debounced search inputs
- Lazy load task history
- Material ledger pagination

### 7.3 Cost Management
- Convex bandwidth limits on file uploads
- CDN for showcase images
- Archive old orders (soft delete)

---

## 8. SECURITY CONSIDERATIONS

### 8.1 Authentication
- Convex Auth with email/password
- Session management server-side
- No JWT in localStorage

### 8.2 Authorization
- RBAC enforced in every mutation
- No direct table access from client
- Query results filtered by org + role

### 8.3 Data Validation
- Zod schemas for all inputs
- Server-side validation only
- Client validation for UX only

### 8.4 Sensitive Data
- Payment info never stored raw
- Verification docs stored with encryption flag
- Audit logs for sensitive actions

---

## 9. FRONTEND ARCHITECTURE

### 9.1 Route Structure

```
/
├── (public)
│   ├── organizations
│   └── org/[slug]
├── sign-in
├── sign-up
├── onboarding
├── (customer)
│   ├── dashboard
│   ├── orders
│   └── dependants
├── worker
│   ├── dashboard
│   └── tasks
├── manager
│   ├── dashboard
│   ├── orders
│   └── workers
└── admin
    ├── dashboard
    ├── materials
    ├── fabrics
    ├── analytics
    └── settings
```

### 9.2 State Management
- Server state via Convex real-time queries
- Client state via React 19 `useState` + `useOptimistic`
- No Redux/Zustand needed

### 9.3 Component Architecture
- Server Components by default
- Client Components for interactivity
- Shared UI components in `/components/ui`
- Role-specific layouts in `/components/layouts`

---

## 10. KEY EDGE CASES

### 10.1 Offline Customer Claims Existing Account
- Match by email/phone
- Prompt user to merge or create new
- Preserve all historical data

### 10.2 Worker Leaves Organization
- Soft delete membership
- Archive assigned tasks
- Historical data remains visible to managers

### 10.3 Organization Downgrades Subscription
- Disable gated features
- Do not delete data
- Show upgrade prompts

### 10.4 Multiple Admins
- One creator, others can be promoted
- All admins have full access
- Billing tied to creator

### 10.5 Task Deadline vs Order Deadline
- Task deadline is independent
- Order can be overdue even if tasks on time
- Alerts calculated separately

---

## 11. MONITORING & OBSERVABILITY

### 11.1 Metrics to Track
- Orders created per org
- Task completion time
- Material consumption rate
- User invite conversion rate
- Subscription upgrade rate

### 11.2 Error Handling
- Convex functions return structured errors
- Client displays user-friendly messages
- Log errors to monitoring service

### 11.3 Audit Logs
- Track sensitive actions:
  - Verification document uploads
  - Subscription changes
  - User role changes
  - Material adjustments

---

## 12. ASSUMPTIONS & TRADE-OFFS

### 12.1 Assumptions Made
1. **Single currency**: NGN assumed, multi-currency deferred
2. **Manual verification**: CAC review is manual, not automated
3. **No escrow yet**: Payment architecture prepared, not implemented
4. **Email/SMS via Convex**: Using Convex Auth's email system
5. **File storage**: Convex blob storage for images

### 12.2 Trade-Offs
- **Convex vs PostgreSQL**: Chose Convex for real-time + simplicity, trade-off is less complex query capability
- **No offline mode**: Requires internet, acceptable for business app
- **Client-side routing**: Next.js App Router, trade-off is larger bundle vs better SEO

### 12.3 Future Enhancements
- Mobile apps (React Native)
- WhatsApp integration for chat
- In-app payment processing
- Advanced analytics (ML predictions)
- Multi-language support

---

## 13. DEPLOYMENT STRATEGY

### 13.1 Environments
- **Development**: Local Convex dev instance
- **Staging**: Convex staging deployment
- **Production**: Convex prod deployment

### 13.2 CI/CD Pipeline
- GitHub Actions for Next.js build
- Convex CLI for backend deployment
- Automated tests before merge

### 13.3 Database Migrations
- Convex handles schema migrations
- Backward-compatible changes preferred
- Feature flags for risky changes

---

## END OF ARCHITECTURE DOCUMENTATION