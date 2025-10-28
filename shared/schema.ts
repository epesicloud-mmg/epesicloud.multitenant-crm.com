import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ====================
// CORE TABLES - Multi-Tenant & Auth
// ====================

// Tenants table for multi-tenant isolation
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roles table - can be global or tenant-specific (defined before users)
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").notNull(),
  permissions: text("permissions").array().notNull().default(sql`'{}'::text[]`),
  description: text("description"),
  modules: text("modules").array().notNull().default(sql`'{}'::text[]`),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  managerId: integer("manager_id").references(() => users.id),
  department: text("department"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastTenantId: integer("last_tenant_id").references(() => tenants.id),
});

// Permissions table - granular permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  module: text("module").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Role Permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenant Users junction table - user membership in tenants with roles
export const tenantUsers = pgTable("tenant_users", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer("role_id").notNull().references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Refresh Tokens table - for JWT refresh token management
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================
// CRM TABLES
// ====================

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  jobTitle: text("job_title"),
  companyId: integer("company_id").references(() => companies.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interest Levels table
export const interestLevels = pgTable("interest_levels", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3b82f6"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Types table
export const activityTypes = pgTable("activity_types", {
  id: serial("id").primaryKey(),
  typeName: text("type_name").notNull(),
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales Pipelines table
export const salesPipelines = pgTable("sales_pipelines", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  offerDetails: text("offer_details"),
  valueProposition: text("value_proposition"),
  isDefault: boolean("is_default").notNull().default(false),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales Stages table
export const salesStages = pgTable("sales_stages", {
  id: serial("id").primaryKey(),
  salePipelineId: integer("sale_pipeline_id").notNull().references(() => salesPipelines.id),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leads table
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  jobTitle: text("job_title"),
  source: text("source").notNull().default("website"),
  status: text("status").notNull().default("new"),
  score: integer("score").default(0),
  notes: text("notes"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedById: integer("assigned_by_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product types
export const productTypes = pgTable("product_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product categories
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  salePrice: decimal("sale_price", { precision: 12, scale: 2 }),
  currency: text("currency").default("USD"),
  sku: text("sku"),
  productTypeId: integer("product_type_id").references(() => productTypes.id),
  categoryId: integer("category_id").references(() => productCategories.id),
  featuredPhoto: text("featured_photo"),
  isFeatured: boolean("is_featured").default(false),
  salesPipelineId: integer("sales_pipeline_id").references(() => salesPipelines.id),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock").default(0),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Variations table
export const productVariations = pgTable("product_variations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  sku: text("sku"),
  price: decimal("price", { precision: 10, scale: 2 }),
  stock: integer("stock").default(0),
  attributes: text("attributes"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product Offers table
export const productOffers = pgTable("product_offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  conditions: text("conditions"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  stageId: integer("stage_id").references(() => salesStages.id),
  contactId: integer("contact_id").references(() => contacts.id),
  productId: integer("product_id").references(() => products.id),
  productVariationId: integer("product_variation_id").references(() => productVariations.id),
  interestLevelId: integer("interest_level_id").references(() => interestLevels.id),
  leadSourceId: integer("lead_source_id").references(() => leadSources.id),
  probability: integer("probability").default(50),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  supervisorId: integer("supervisor_id").references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  contactId: integer("contact_id").references(() => contacts.id),
  dealId: integer("deal_id").references(() => deals.id),
  userId: integer("user_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  supervisorId: integer("supervisor_id").references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lead Sources table
export const leadSources = pgTable("lead_sources", {
  id: serial("id").primaryKey(),
  sourceName: text("source_name").notNull(),
  category: text("category").notNull(), // e.g., "Social Media", "Referral", "Digital Marketing", "Offline"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customer Types table
export const customerTypes = pgTable("customer_types", {
  id: serial("id").primaryKey(),
  typeName: text("type_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Meeting Types table
export const meetingTypes = pgTable("meeting_types", {
  id: serial("id").primaryKey(),
  typeName: text("type_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Meeting Cancellation Reasons table
export const meetingCancellationReasons = pgTable("meeting_cancellation_reasons", {
  id: serial("id").primaryKey(),
  reason: text("reason").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Methods table
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  methodName: text("method_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payment Items table
export const paymentItems = pgTable("payment_items", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ====================
// PAYMENT COLLECTION MODULE
// ====================

// Payment Plans table - installment plans for property purchases
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  planName: text("plan_name").notNull(),
  dealId: integer("deal_id").references(() => deals.id, { onDelete: 'cascade' }),
  contactId: integer("contact_id").references(() => contacts.id),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 15, scale: 2 }).default('0').notNull(),
  balanceAmount: decimal("balance_amount", { precision: 15, scale: 2 }).notNull(),
  numberOfInstallments: integer("number_of_installments").notNull(),
  installmentAmount: decimal("installment_amount", { precision: 15, scale: 2 }).notNull(),
  frequency: text("frequency").notNull().default('monthly'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: text("status").notNull().default('active'),
  notes: text("notes"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments table - actual payment transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  receiptNumber: text("receipt_number").notNull().unique(),
  dealId: integer("deal_id").references(() => deals.id),
  paymentPlanId: integer("payment_plan_id").references(() => paymentPlans.id),
  contactId: integer("contact_id").references(() => contacts.id),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  paymentItemId: integer("payment_item_id").references(() => paymentItems.id),
  paymentDate: timestamp("payment_date").notNull(),
  transactionReference: text("transaction_reference"),
  bankName: text("bank_name"),
  chequeNumber: text("cheque_number"),
  notes: text("notes"),
  status: text("status").notNull().default('completed'),
  collectedById: integer("collected_by_id").references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ====================
// COMMISSION TRACKING MODULE
// ====================

// Commission Status Types
export const commissionStatuses = pgTable("commission_statuses", {
  id: serial("id").primaryKey(),
  statusName: text("status_name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Commissions table - main commission records with approval workflow
export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  commissionNumber: text("commission_number").notNull().unique(),
  dealId: integer("deal_id").references(() => deals.id),
  paymentId: integer("payment_id").references(() => payments.id),
  userId: integer("user_id").notNull().references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  baseAmount: decimal("base_amount", { precision: 15, scale: 2 }),
  statusId: integer("status_id").references(() => commissionStatuses.id),
  status: text("status").notNull().default('pending'),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  verifiedById: integer("verified_by_id").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  approvedById: integer("approved_by_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  paidById: integer("paid_by_id").references(() => users.id),
  paidAt: timestamp("paid_at"),
  paymentReference: text("payment_reference"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Commission Items table - breakdown of commission (for split commissions)
export const commissionItems = pgTable("commission_items", {
  id: serial("id").primaryKey(),
  commissionId: integer("commission_id").notNull().references(() => commissions.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id),
  itemDescription: text("item_description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  notes: text("notes"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customers table
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Events table - PostHog-style event tracking
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventName: text("event_name").notNull(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: text("source"),
  url: text("url"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  sessionId: text("session_id"),
  eventProperties: text("event_properties"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ====================
// RELATIONS
// ====================

export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(tenantUsers),
  roles: many(roles),
  companies: many(companies),
  contacts: many(contacts),
  leads: many(leads),
  deals: many(deals),
  activities: many(activities),
  products: many(products),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  lastTenant: one(tenants, {
    fields: [users.lastTenantId],
    references: [tenants.id],
  }),
  tenantMemberships: many(tenantUsers),
  refreshTokens: many(refreshTokens),
  assignedLeads: many(leads, { relationName: "assignedTo" }),
  assignedByLeads: many(leads, { relationName: "assignedBy" }),
  assignedDeals: many(deals, { relationName: "assignedTo" }),
  supervisedDeals: many(deals, { relationName: "supervisor" }),
  activities: many(activities, { relationName: "assignedTo" }),
  supervisedActivities: many(activities, { relationName: "supervisor" }),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  tenantUsers: many(tenantUsers),
  permissions: many(rolePermissions),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

export const tenantUsersRelations = relations(tenantUsers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantUsers.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [tenantUsers.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [tenantUsers.roleId],
    references: [roles.id],
  }),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  contacts: many(contacts),
}));

export const contactsRelations = relations(contacts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [contacts.tenantId],
    references: [tenants.id],
  }),
  company: one(companies, {
    fields: [contacts.companyId],
    references: [companies.id],
  }),
  deals: many(deals),
  activities: many(activities),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  assignedBy: one(users, {
    fields: [leads.assignedById],
    references: [users.id],
    relationName: "assignedBy",
  }),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [deals.tenantId],
    references: [tenants.id],
  }),
  stage: one(salesStages, {
    fields: [deals.stageId],
    references: [salesStages.id],
  }),
  contact: one(contacts, {
    fields: [deals.contactId],
    references: [contacts.id],
  }),
  product: one(products, {
    fields: [deals.productId],
    references: [products.id],
  }),
  productVariation: one(productVariations, {
    fields: [deals.productVariationId],
    references: [productVariations.id],
  }),
  interestLevel: one(interestLevels, {
    fields: [deals.interestLevelId],
    references: [interestLevels.id],
  }),
  leadSource: one(leadSources, {
    fields: [deals.leadSourceId],
    references: [leadSources.id],
  }),
  assignedTo: one(users, {
    fields: [deals.assignedToId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  supervisor: one(users, {
    fields: [deals.supervisorId],
    references: [users.id],
    relationName: "supervisor",
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activities.tenantId],
    references: [tenants.id],
  }),
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
  assignedTo: one(users, {
    fields: [activities.assignedToId],
    references: [users.id],
    relationName: "assignedTo",
  }),
  supervisor: one(users, {
    fields: [activities.supervisorId],
    references: [users.id],
    relationName: "supervisor",
  }),
}));

export const leadSourcesRelations = relations(leadSources, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [leadSources.tenantId],
    references: [tenants.id],
  }),
  deals: many(deals),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  type: one(productTypes, {
    fields: [products.productTypeId],
    references: [productTypes.id],
  }),
  category: one(productCategories, {
    fields: [products.categoryId],
    references: [productCategories.id],
  }),
  salesPipeline: one(salesPipelines, {
    fields: [products.salesPipelineId],
    references: [salesPipelines.id],
  }),
  variations: many(productVariations),
  offers: many(productOffers),
  deals: many(deals),
}));

export const productVariationsRelations = relations(productVariations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [productVariations.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [productVariations.productId],
    references: [products.id],
  }),
}));

export const salesPipelinesRelations = relations(salesPipelines, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [salesPipelines.tenantId],
    references: [tenants.id],
  }),
  stages: many(salesStages),
  products: many(products),
}));

export const salesStagesRelations = relations(salesStages, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [salesStages.tenantId],
    references: [tenants.id],
  }),
  salesPipeline: one(salesPipelines, {
    fields: [salesStages.salePipelineId],
    references: [salesPipelines.id],
  }),
  deals: many(deals),
}));

// ====================
// INSERT SCHEMAS
// ====================

export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true });
export const insertTenantUserSchema = createInsertSchema(tenantUsers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  assignedAt: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
});
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  value: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  expectedCloseDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
  actualCloseDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
});
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  scheduledAt: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
  completedAt: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
});
export const insertLeadSourceSchema = createInsertSchema(leadSources).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertActivityTypeSchema = createInsertSchema(activityTypes).omit({ id: true, createdAt: true, tenantId: true });
export const insertInterestLevelSchema = createInsertSchema(interestLevels).omit({ id: true, createdAt: true, tenantId: true });
export const insertSalesPipelineSchema = createInsertSchema(salesPipelines).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertSalesStageSchema = createInsertSchema(salesStages).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true, createdAt: true, tenantId: true });
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true, tenantId: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  salePrice: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
});
export const insertProductVariationSchema = createInsertSchema(productVariations).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  price: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
});
export const insertProductOfferSchema = createInsertSchema(productOffers).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  discountValue: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
  startDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
  endDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
});
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, tenantId: true });
export const insertCustomerTypeSchema = createInsertSchema(customerTypes).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertMeetingTypeSchema = createInsertSchema(meetingTypes).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertMeetingCancellationReasonSchema = createInsertSchema(meetingCancellationReasons).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertPaymentItemSchema = createInsertSchema(paymentItems).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  totalAmount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  paidAmount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string().optional()
  ),
  balanceAmount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  installmentAmount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  startDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ),
  endDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ).optional(),
});
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  amount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  paymentDate: z.preprocess(
    (val) => typeof val === 'string' ? new Date(val) : val,
    z.date()
  ),
});
export const insertCommissionStatusSchema = createInsertSchema(commissionStatuses).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true });
export const insertCommissionSchema = createInsertSchema(commissions).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  totalAmount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  commissionRate: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
  baseAmount: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
});
export const insertCommissionItemSchema = createInsertSchema(commissionItems).omit({ id: true, createdAt: true, updatedAt: true, tenantId: true }).extend({
  amount: z.preprocess(
    (val) => typeof val === 'number' ? val.toString() : val,
    z.string()
  ),
  percentage: z.preprocess(
    (val) => val === null || val === undefined ? val : (typeof val === 'number' ? val.toString() : val),
    z.string().nullable().optional()
  ),
});

// ====================
// SELECT TYPES
// ====================

export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type TenantUser = typeof tenantUsers.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type LeadSource = typeof leadSources.$inferSelect;
export type ActivityType = typeof activityTypes.$inferSelect;
export type InterestLevel = typeof interestLevels.$inferSelect;
export type SalesPipeline = typeof salesPipelines.$inferSelect;
export type SalesStage = typeof salesStages.$inferSelect;
export type ProductType = typeof productTypes.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductVariation = typeof productVariations.$inferSelect;
export type ProductOffer = typeof productOffers.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Event = typeof events.$inferSelect;
export type CustomerType = typeof customerTypes.$inferSelect;
export type MeetingType = typeof meetingTypes.$inferSelect;
export type MeetingCancellationReason = typeof meetingCancellationReasons.$inferSelect;
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type PaymentItem = typeof paymentItems.$inferSelect;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type CommissionStatus = typeof commissionStatuses.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export type CommissionItem = typeof commissionItems.$inferSelect;

// ====================
// INSERT TYPES
// ====================

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertTenantUser = z.infer<typeof insertTenantUserSchema>;
export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;
export type InsertActivityType = z.infer<typeof insertActivityTypeSchema>;
export type InsertInterestLevel = z.infer<typeof insertInterestLevelSchema>;
export type InsertSalesPipeline = z.infer<typeof insertSalesPipelineSchema>;
export type InsertSalesStage = z.infer<typeof insertSalesStageSchema>;
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductVariation = z.infer<typeof insertProductVariationSchema>;
export type InsertProductOffer = z.infer<typeof insertProductOfferSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertCustomerType = z.infer<typeof insertCustomerTypeSchema>;
export type InsertMeetingType = z.infer<typeof insertMeetingTypeSchema>;
export type InsertMeetingCancellationReason = z.infer<typeof insertMeetingCancellationReasonSchema>;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type InsertPaymentItem = z.infer<typeof insertPaymentItemSchema>;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type InsertCommissionStatus = z.infer<typeof insertCommissionStatusSchema>;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type InsertCommissionItem = z.infer<typeof insertCommissionItemSchema>;
