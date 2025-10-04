import { pgTable, text, serial, integer, boolean, timestamp, decimal, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Tenants table for multi-tenant isolation
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workspaces table - top level organization
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  icon: text("icon").default("Building"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects table - project-level organization within workspaces
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#10b981"),
  icon: text("icon").default("FolderOpen"),
  status: text("status").default("active"), // active, inactive, archived
  workspaceId: integer("workspace_id").notNull().references(() => workspaces.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roles table for hierarchical permissions
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: integer("level").notNull(), // 1=Agent, 2=Sales Manager, 3=Super Admin, 4=Director, 5=Admin, 6=Workspace Admin
  permissions: text("permissions").array().notNull().default([]), // Array of permission strings
  description: text("description"),
  modules: text("modules").array().notNull().default([]), // Array of module access (crm, finance, hr, aam, analytics)
  isActive: boolean("is_active").default(true),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  managerId: integer("manager_id").references(() => users.id), // Self-referencing for hierarchy
  department: text("department").default("sales"),
  phone: text("phone"),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  currentWorkspaceId: integer("current_workspace_id").references(() => workspaces.id),
  currentProjectId: integer("current_project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AAM Module Tables - User Role Management

// User Roles junction table for many-to-many relationship
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  assignedBy: integer("assigned_by").references(() => users.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
});

// Role Permissions for granular module access control
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  module: text("module").notNull(), // crm, finance, hr, aam, analytics
  permissions: jsonb("permissions").notNull().default({}), // { view: true, edit: false, delete: false, admin: false }
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product types - classify products by nature
export const productTypes = pgTable("product_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // physical, digital, service
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product categories - organize products
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#3b82f6"),
  icon: text("icon").default("Package"),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products table - enhanced for cross-industry use
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  sku: text("sku"), // Stock keeping unit
  productTypeId: integer("product_type_id").references(() => productTypes.id),
  categoryId: integer("category_id").references(() => productCategories.id),
  featuredPhoto: text("featured_photo"),
  isFeatured: boolean("is_featured").default(false),
  salesPipelineId: integer("sales_pipeline_id").references(() => salesPipelines.id),
  isActive: boolean("is_active").notNull().default(true),
  stock: integer("stock").default(0),
  specifications: jsonb("specifications").default({}), // Flexible product specs
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Product offers - promotions and deals
export const productOffers = pgTable("product_offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(), // percentage, fixed_amount
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  conditions: jsonb("conditions").default({}), // Flexible offer conditions
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
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activity Types table (renamed from interaction_types)
export const activityTypes = pgTable("activity_types", {
  id: serial("id").primaryKey(),
  typeName: text("type_name").notNull(),
  description: text("description"),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales Pipelines table
export const salesPipelines = pgTable("sales_pipelines", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sales Stages table (replaces deal_stages)
export const salesStages = pgTable("sales_stages", {
  id: serial("id").primaryKey(),
  salePipelineId: integer("sale_pipeline_id").notNull().references(() => salesPipelines.id),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  source: text("source").notNull().default("website"), // website, referral, cold-call, social-media, event, advertisement
  status: text("status").notNull().default("new"), // new, contacted, qualified, unqualified, converted
  score: integer("score").default(0), // lead scoring 0-100
  notes: text("notes"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  assignedById: integer("assigned_by_id").references(() => users.id),
  assignedAt: timestamp("assigned_at"),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contacts table
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  jobTitle: text("job_title"),
  status: text("status").notNull().default("lead"), // lead, prospect, active, inactive
  companyId: integer("company_id").references(() => companies.id),
  assignedToId: integer("assigned_to_id").references(() => users.id), // Agent managing contact
  supervisorId: integer("supervisor_id").references(() => users.id), // Supervisor overseeing contact
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastContactDate: timestamp("last_contact_date"),
});

// Deals table
export const deals = pgTable("deals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  stageId: integer("stage_id").references(() => salesStages.id),
  contactId: integer("contact_id").references(() => contacts.id),
  productId: integer("product_id").references(() => products.id),
  interestLevelId: integer("interest_level_id").references(() => interestLevels.id),
  probability: integer("probability").default(50),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  notes: text("notes"),
  assignedToId: integer("assigned_to_id").references(() => users.id), // Agent assigned to deal
  supervisorId: integer("supervisor_id").references(() => users.id), // Supervisor overseeing deal
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // call, email, meeting, note
  subject: text("subject").notNull(),
  description: text("description"),
  contactId: integer("contact_id").references(() => contacts.id),
  dealId: integer("deal_id").references(() => deals.id),
  userId: integer("user_id").notNull().references(() => users.id), // Agent performing activity
  supervisorId: integer("supervisor_id").references(() => users.id), // Supervisor overseeing activity
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  projectId: integer("project_id").references(() => projects.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table for PostHog-style event tracking
export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: text("event_name").notNull(), // e.g. user.login, page.view, report.download
  userId: integer("user_id").references(() => users.id),
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  source: text("source").default("web"), // web, mobile, API
  url: text("url"), // Full URL if applicable
  userAgent: text("user_agent"), // Browser/device info
  ipAddress: text("ip_address"), // User IP for analytics
  sessionId: text("session_id"), // Session tracking
  eventProperties: jsonb("event_properties").default({}), // Flexible JSON metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Event Logs table for CRUD auditing and AI context
export const eventLogs = pgTable("event_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sourceEntity: text("source_entity").notNull(), // e.g. "deals", "contacts", "companies"
  sourceEntityReference: integer("source_entity_reference"), // ID of the affected record
  description: text("description").notNull(), // Human-readable description of what was done
  eventType: text("event_type").notNull(), // e.g. "created", "updated", "deleted", "page_viewed"
  oldData: jsonb("old_data"), // JSON representation of data before changes
  newData: jsonb("new_data"), // JSON representation of data after changes
  metadata: jsonb("metadata").default({}), // Additional context data
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Epesi Agent conversations (scoped per user) - separate from tenant admin assistants
export const agentConversations = pgTable("agent_conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Epesi Agent messages (scoped per user and conversation)
export const agentMessages = pgTable("agent_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => agentConversations.id, { onDelete: 'cascade' }).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Finance Module Tables

// Chart of Accounts - backbone of financial system
export const accountCategories = pgTable("account_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Assets, Liabilities, Equity, Revenue, Expenses
  type: text("type").notNull(), // asset, liability, equity, revenue, expense
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(), // 1000, 1100, etc.
  name: text("name").notNull(), // Cash, Accounts Receivable, etc.
  categoryId: integer("category_id").notNull().references(() => accountCategories.id),
  parentAccountId: integer("parent_account_id").references(() => accounts.id), // For sub-accounts
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Customers (extends contacts for financial purposes)
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id),
  customerNumber: text("customer_number").notNull(),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }).default("0.00"),
  paymentTerms: integer("payment_terms").default(30), // days
  taxExempt: boolean("tax_exempt").default(false),
  currency: text("currency").default("USD"),
  billingAddress: jsonb("billing_address").default({}),
  shippingAddress: jsonb("shipping_address").default({}),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Vendors/Suppliers
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vendorNumber: text("vendor_number").notNull(),
  email: text("email"),
  phone: text("phone"),
  website: text("website"),
  taxId: text("tax_id"),
  paymentTerms: integer("payment_terms").default(30),
  currency: text("currency").default("USD"),
  address: jsonb("address").default({}),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoices
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  dealId: integer("deal_id").references(() => deals.id), // Link to CRM deals
  status: text("status").default("draft"), // draft, sent, paid, overdue, cancelled
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0.00"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  notes: text("notes"),
  terms: text("terms"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice Line Items
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  productId: integer("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lineTotal: decimal("line_total", { precision: 10, scale: 2 }).notNull(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  accountId: integer("account_id").references(() => accounts.id),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  expenseNumber: text("expense_number").notNull(),
  categoryId: integer("category_id").notNull().references(() => expenseCategories.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  userId: integer("user_id").references(() => users.id), // Who incurred the expense
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  paymentMethod: text("payment_method"), // cash, credit_card, bank_transfer, etc.
  receipt: text("receipt"), // File path or URL
  status: text("status").default("pending"), // pending, approved, rejected, paid
  isReimbursable: boolean("is_reimbursable").default(false),
  notes: text("notes"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  paymentNumber: text("payment_number").notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  customerId: integer("customer_id").references(() => customers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, check, credit_card, bank_transfer, paypal, etc.
  reference: text("reference"), // Check number, transaction ID, etc.
  status: text("status").default("completed"), // pending, completed, failed, refunded
  notes: text("notes"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Budget and Forecasting
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  year: integer("year").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalBudget: decimal("total_budget", { precision: 15, scale: 2 }).notNull(),
  status: text("status").default("draft"), // draft, active, closed
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const budgetItems = pgTable("budget_items", {
  id: serial("id").primaryKey(),
  budgetId: integer("budget_id").notNull().references(() => budgets.id, { onDelete: 'cascade' }),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  categoryId: integer("category_id").references(() => expenseCategories.id),
  budgetedAmount: decimal("budgeted_amount", { precision: 10, scale: 2 }).notNull(),
  actualAmount: decimal("actual_amount", { precision: 10, scale: 2 }).default("0.00"),
  variance: decimal("variance", { precision: 10, scale: 2 }).default("0.00"),
  period: text("period"), // monthly, quarterly, yearly
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Financial Transactions (Central Transaction System)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionNumber: text("transaction_number").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  description: text("description").notNull(),
  reference: text("reference"), // Invoice number, payment reference, etc.
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("posted"), // draft, posted, reversed
  
  // Enhanced source tracking
  source: text("source").notNull(), // 'invoice', 'payment', 'expense', 'bill', 'credit'
  sourceId: integer("source_id"), // ID of the source record
  sourceReference: text("source_reference"), // Reference number from source
  
  // Additional tracking
  reconciled: boolean("reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionLines = pgTable("transaction_lines", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  debitAmount: decimal("debit_amount", { precision: 15, scale: 2 }).default("0.00"),
  creditAmount: decimal("credit_amount", { precision: 15, scale: 2 }).default("0.00"),
  description: text("description"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// HR Module Tables

// Departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  managerId: integer("manager_id").references(() => employees.id),
  budget: decimal("budget", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Job Positions
export const jobPositions = pgTable("job_positions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  departmentId: integer("department_id").notNull().references(() => departments.id),
  description: text("description"),
  requirements: text("requirements"),
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }),
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Employees (extends users for HR purposes)
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  employeeNumber: text("employee_number").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  departmentId: integer("department_id").references(() => departments.id),
  positionId: integer("position_id").references(() => jobPositions.id),
  managerId: integer("manager_id").references(() => employees.id),
  hireDate: timestamp("hire_date").notNull(),
  terminationDate: timestamp("termination_date"),
  salary: decimal("salary", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  employmentType: text("employment_type").default("full_time"), // full_time, part_time, contract, intern
  status: text("status").default("active"), // active, inactive, terminated
  address: jsonb("address").default({}),
  emergencyContact: jsonb("emergency_contact").default({}),
  benefits: jsonb("benefits").default({}),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Employee Performance Reviews
export const performanceReviews = pgTable("performance_reviews", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  reviewerId: integer("reviewer_id").notNull().references(() => employees.id),
  reviewPeriodStart: timestamp("review_period_start").notNull(),
  reviewPeriodEnd: timestamp("review_period_end").notNull(),
  overallRating: decimal("overall_rating", { precision: 3, scale: 2 }), // 1.00 to 5.00
  goals: jsonb("goals").default({}),
  achievements: text("achievements"),
  areasForImprovement: text("areas_for_improvement"),
  managerComments: text("manager_comments"),
  employeeComments: text("employee_comments"),
  status: text("status").default("draft"), // draft, submitted, completed
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Leave Requests
export const leaveRequests = pgTable("leave_requests", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(), // vacation, sick, personal, maternity, paternity, bereavement
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: decimal("total_days", { precision: 4, scale: 2 }).notNull(),
  reason: text("reason"),
  status: text("status").default("pending"), // pending, approved, rejected, cancelled
  approvedBy: integer("approved_by").references(() => employees.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Attendance Records
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  date: timestamp("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  hoursWorked: decimal("hours_worked", { precision: 4, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 4, scale: 2 }).default("0.00"),
  status: text("status").default("present"), // present, absent, late, half_day
  notes: text("notes"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payroll Records
export const payrollRecords = pgTable("payroll_records", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  payPeriodStart: timestamp("pay_period_start").notNull(),
  payPeriodEnd: timestamp("pay_period_end").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtimePay: decimal("overtime_pay", { precision: 10, scale: 2 }).default("0.00"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0.00"),
  deductions: decimal("deductions", { precision: 10, scale: 2 }).default("0.00"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  status: text("status").default("draft"), // draft, processed, paid
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Training Programs
export const trainingPrograms = pgTable("training_programs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instructorName: text("instructor_name"),
  duration: integer("duration"), // in hours
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  maxParticipants: integer("max_participants"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Training Enrollments
export const trainingEnrollments = pgTable("training_enrollments", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  trainingId: integer("training_id").notNull().references(() => trainingPrograms.id),
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  completionDate: timestamp("completion_date"),
  status: text("status").default("enrolled"), // enrolled, in_progress, completed, dropped
  score: decimal("score", { precision: 5, scale: 2 }),
  certificate: text("certificate"), // URL to certificate
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assistants table - tenant admin created assistants (separate from Epesi Agent)
export const assistants = pgTable("assistants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  scope: text("scope").notNull(), // 'tenant' or 'workspace'
  workspaceId: integer("workspace_id").references(() => workspaces.id),
  systemPrompt: text("system_prompt").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  widgetCode: text("widget_code"), // Embed code for websites
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assistant conversations - visitor interactions with tenant assistants
export const assistantConversations = pgTable("assistant_conversations", {
  id: serial("id").primaryKey(),
  assistantId: integer("assistant_id").references(() => assistants.id, { onDelete: 'cascade' }).notNull(),
  visitorId: text("visitor_id").notNull(), // UUID for anonymous visitors
  visitorEmail: text("visitor_email"),
  visitorName: text("visitor_name"),
  visitorCompany: text("visitor_company"),
  status: text("status").default("active").notNull(), // 'active', 'completed', 'abandoned'
  leadCaptured: boolean("lead_captured").default(false).notNull(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Assistant messages - messages in assistant conversations
export const assistantMessages = pgTable("assistant_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => assistantConversations.id, { onDelete: 'cascade' }).notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  messageType: text("message_type").default("text"), // 'text', 'lead_form', 'file'
  metadata: jsonb("metadata"), // Additional message data
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assistant documents - knowledge base for assistants
export const assistantDocuments = pgTable("assistant_documents", {
  id: serial("id").primaryKey(),
  assistantId: integer("assistant_id").references(() => assistants.id, { onDelete: 'cascade' }).notNull(),
  type: text("type").notNull(), // 'products', 'projects', 'documents', 'faq'
  name: text("name").notNull(),
  description: text("description"),
  content: text("content"), // Document content or reference
  itemCount: integer("item_count").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  lastSynced: timestamp("last_synced").defaultNow(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat Conversations table - for multi-chat functionality
export const chatConversations = pgTable("chat_conversations", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("New Chat"),
  summary: text("summary"), // AI-generated summary of conversation
  isActive: boolean("is_active").default(true),
  lastMessageAt: timestamp("last_message_at"),
  messageCount: integer("message_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chat Messages table - for storing individual messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => chatConversations.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: text("role").notNull(), // "user" or "assistant"
  messageType: text("message_type").default("text"), // "text", "system", "error"
  context: jsonb("context"), // Page context, recent events, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Assistant prospects - leads captured by assistants
export const assistantProspects = pgTable("assistant_prospects", {
  id: serial("id").primaryKey(),
  assistantId: integer("assistant_id").references(() => assistants.id, { onDelete: 'cascade' }).notNull(),
  conversationId: integer("conversation_id").references(() => assistantConversations.id, { onDelete: 'cascade' }).notNull(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  phone: text("phone"),
  source: text("source").default("assistant_chat"),
  leadQuality: text("lead_quality").default("unqualified"), // 'hot', 'warm', 'cold', 'unqualified'
  notes: text("notes"),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enhanced Financial Module - Additional Tables

// Chart of accounts for proper financial tracking
export const ledgerAccounts = pgTable("ledger_accounts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  accountType: text("account_type").notNull(), // 'asset', 'liability', 'equity', 'income', 'expense'
  parentAccountId: integer("parent_account_id").references(() => ledgerAccounts.id),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bank accounts
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  bankName: text("bank_name").notNull(),
  accountType: text("account_type").notNull(),
  currency: text("currency").default("USD"),
  currentBalance: decimal("current_balance", { precision: 12, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  ledgerAccountId: integer("ledger_account_id").references(() => ledgerAccounts.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Bills (vendor invoices) - enhanced with transaction integration
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  vendorId: integer("vendor_id").references(() => vendors.id).notNull(),
  billNumber: text("bill_number").notNull(),
  referenceNumber: text("reference_number"),
  
  // Bill details
  billDate: timestamp("bill_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).default("0.00"),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0.00"),
  balanceAmount: decimal("balance_amount", { precision: 12, scale: 2 }).notNull(),
  
  status: text("status").default("pending").notNull(),
  currency: text("currency").default("USD"),
  
  // Transaction tracking
  transactionId: integer("transaction_id").references(() => transactions.id),
  
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Credit notes - for refunds and credits
export const creditNotes = pgTable("credit_notes", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  creditNoteNumber: text("credit_note_number").notNull(),
  
  // Credit note details
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("USD"),
  reason: text("reason"),
  description: text("description"),
  
  // Reference to original invoice
  invoiceId: integer("invoice_id").references(() => invoices.id),
  
  status: text("status").default("active").notNull(),
  
  // Transaction tracking
  transactionId: integer("transaction_id").references(() => transactions.id),
  
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Financial user roles - specific roles for finance module
export const financeRoles = pgTable("finance_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Administrator, Accountant, Manager, Accounts Payable, Accounts Receivable, Read-only User
  description: text("description"),
  permissions: jsonb("permissions").default({}),
  tenantId: integer("tenant_id").references(() => tenants.id).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  workspaces: many(workspaces),
  projects: many(projects),
  users: many(users),
  companies: many(companies),
  products: many(products),
  productTypes: many(productTypes),
  productCategories: many(productCategories),
  productOffers: many(productOffers),
  leads: many(leads),
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
  events: many(events),
  assistants: many(assistants),
  assistantConversations: many(assistantConversations),
  assistantMessages: many(assistantMessages),
  assistantDocuments: many(assistantDocuments),
  assistantProspects: many(assistantProspects),
  agentConversations: many(agentConversations),
  agentMessages: many(agentMessages),
  transactions: many(transactions),
  ledgerAccounts: many(ledgerAccounts),
  bankAccounts: many(bankAccounts),
  bills: many(bills),
  creditNotes: many(creditNotes),
  financeRoles: many(financeRoles),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [workspaces.tenantId],
    references: [tenants.id],
  }),
  projects: many(projects),
  users: many(users),
  companies: many(companies),
  products: many(products),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [projects.tenantId],
    references: [tenants.id],
  }),
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  companies: many(companies),
  products: many(products),
  leads: many(leads),
  contacts: many(contacts),
  deals: many(deals),
  activities: many(activities),
}));

export const rolesRelations = relations(roles, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [roles.tenantId],
    references: [tenants.id],
  }),
  workspace: one(workspaces, {
    fields: [roles.workspaceId],
    references: [workspaces.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  currentWorkspace: one(workspaces, {
    fields: [users.currentWorkspaceId],
    references: [workspaces.id],
  }),
  currentProject: one(projects, {
    fields: [users.currentProjectId],
    references: [projects.id],
  }),
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  subordinates: many(users, { relationName: "manager_subordinates" }),
  activities: many(activities),
  assignedLeads: many(leads, { relationName: "assigned_leads" }),
  allocatedLeads: many(leads, { relationName: "allocated_leads" }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [companies.tenantId],
    references: [tenants.id],
  }),
  contacts: many(contacts),
  deals: many(deals),
}));

export const productTypesRelations = relations(productTypes, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [productTypes.tenantId],
    references: [tenants.id],
  }),
  products: many(products),
}));

export const productCategoriesRelations = relations(productCategories, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [productCategories.tenantId],
    references: [tenants.id],
  }),
  workspace: one(workspaces, {
    fields: [productCategories.workspaceId],
    references: [workspaces.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [products.tenantId],
    references: [tenants.id],
  }),
  workspace: one(workspaces, {
    fields: [products.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [products.projectId],
    references: [projects.id],
  }),
  productType: one(productTypes, {
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
  offers: many(productOffers),
  deals: many(deals),
}));

export const productOffersRelations = relations(productOffers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [productOffers.tenantId],
    references: [tenants.id],
  }),
  product: one(products, {
    fields: [productOffers.productId],
    references: [products.id],
  }),
}));

// Instant Search Tables
export const instantSearches = pgTable("instant_searches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").notNull(), // Search config, facets, UI settings
  embedCode: text("embed_code"),
  isActive: boolean("is_active").default(true),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const instantSearchEvents = pgTable("instant_search_events", {
  id: serial("id").primaryKey(),
  instantSearchId: integer("instant_search_id").notNull().references(() => instantSearches.id),
  eventType: text("event_type").notNull(), // search, click, view, conversion
  query: text("query"),
  filters: jsonb("filters"),
  results: jsonb("results"), // search results metadata
  clickPosition: integer("click_position"),
  productId: integer("product_id").references(() => products.id),
  sessionId: text("session_id"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  tenantId: integer("tenant_id").notNull().references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const instantSearchesRelations = relations(instantSearches, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [instantSearches.tenantId],
    references: [tenants.id],
  }),
  events: many(instantSearchEvents),
}));

export const instantSearchEventsRelations = relations(instantSearchEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [instantSearchEvents.tenantId],
    references: [tenants.id],
  }),
  instantSearch: one(instantSearches, {
    fields: [instantSearchEvents.instantSearchId],
    references: [instantSearches.id],
  }),
  product: one(products, {
    fields: [instantSearchEvents.productId],
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

export const leadsRelations = relations(leads, ({ one }) => ({
  tenant: one(tenants, {
    fields: [leads.tenantId],
    references: [tenants.id],
  }),
  assignedTo: one(users, {
    fields: [leads.assignedToId],
    references: [users.id],
    relationName: "assigned_leads",
  }),
  assignedBy: one(users, {
    fields: [leads.assignedById],
    references: [users.id],
    relationName: "allocated_leads",
  }),
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
  assignedTo: one(users, {
    fields: [contacts.assignedToId],
    references: [users.id],
  }),
  supervisor: one(users, {
    fields: [contacts.supervisorId],
    references: [users.id],
  }),
  deals: many(deals),
  activities: many(activities),
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
  interestLevel: one(interestLevels, {
    fields: [deals.interestLevelId],
    references: [interestLevels.id],
  }),
  assignedTo: one(users, {
    fields: [deals.assignedToId],
    references: [users.id],
  }),
  supervisor: one(users, {
    fields: [deals.supervisorId],
    references: [users.id],
  }),
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activities.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  supervisor: one(users, {
    fields: [activities.supervisorId],
    references: [users.id],
  }),
  contact: one(contacts, {
    fields: [activities.contactId],
    references: [contacts.id],
  }),
  deal: one(deals, {
    fields: [activities.dealId],
    references: [deals.id],
  }),
}));

export const activityTypesRelations = relations(activityTypes, ({ one }) => ({
  tenant: one(tenants, {
    fields: [activityTypes.tenantId],
    references: [tenants.id],
  }),
}));

export const interestLevelsRelations = relations(interestLevels, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [interestLevels.tenantId],
    references: [tenants.id],
  }),
  deals: many(deals),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  tenant: one(tenants, {
    fields: [events.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [events.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [events.workspaceId],
    references: [workspaces.id],
  }),
}));

export const agentConversationsRelations = relations(agentConversations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agentConversations.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [agentConversations.userId],
    references: [users.id],
  }),
  messages: many(agentMessages),
}));

export const agentMessagesRelations = relations(agentMessages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [agentMessages.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [agentMessages.userId],
    references: [users.id],
  }),
  conversation: one(agentConversations, {
    fields: [agentMessages.conversationId],
    references: [agentConversations.id],
  }),
}));

// Assistant relations
export const assistantsRelations = relations(assistants, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [assistants.tenantId],
    references: [tenants.id],
  }),
  workspace: one(workspaces, {
    fields: [assistants.workspaceId],
    references: [workspaces.id],
  }),
  conversations: many(assistantConversations),
  documents: many(assistantDocuments),
  prospects: many(assistantProspects),
}));

export const assistantConversationsRelations = relations(assistantConversations, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [assistantConversations.tenantId],
    references: [tenants.id],
  }),
  assistant: one(assistants, {
    fields: [assistantConversations.assistantId],
    references: [assistants.id],
  }),
  messages: many(assistantMessages),
  prospects: many(assistantProspects),
}));

export const assistantMessagesRelations = relations(assistantMessages, ({ one }) => ({
  tenant: one(tenants, {
    fields: [assistantMessages.tenantId],
    references: [tenants.id],
  }),
  conversation: one(assistantConversations, {
    fields: [assistantMessages.conversationId],
    references: [assistantConversations.id],
  }),
}));

export const assistantDocumentsRelations = relations(assistantDocuments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [assistantDocuments.tenantId],
    references: [tenants.id],
  }),
  assistant: one(assistants, {
    fields: [assistantDocuments.assistantId],
    references: [assistants.id],
  }),
}));

export const assistantProspectsRelations = relations(assistantProspects, ({ one }) => ({
  tenant: one(tenants, {
    fields: [assistantProspects.tenantId],
    references: [tenants.id],
  }),
  assistant: one(assistants, {
    fields: [assistantProspects.assistantId],
    references: [assistants.id],
  }),
  conversation: one(assistantConversations, {
    fields: [assistantProspects.conversationId],
    references: [assistantConversations.id],
  }),
}));

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export const insertWorkspaceSchema = createInsertSchema(workspaces).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, assignedAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true, createdAt: true });
export const insertProductCategorySchema = createInsertSchema(productCategories).omit({ id: true, createdAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductOfferSchema = createInsertSchema(productOffers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export const insertSalesPipelineSchema = createInsertSchema(salesPipelines).omit({ id: true, createdAt: true });
export const insertSalesStageSchema = createInsertSchema(salesStages).omit({ id: true, createdAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertActivityTypeSchema = createInsertSchema(activityTypes).omit({ id: true, createdAt: true });
export const insertInterestLevelSchema = createInsertSchema(interestLevels).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true, timestamp: true });
export const insertEventLogSchema = createInsertSchema(eventLogs).omit({ id: true, createdAt: true });
export const insertChatConversationSchema = createInsertSchema(chatConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });
export const insertAgentConversationSchema = createInsertSchema(agentConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentMessageSchema = createInsertSchema(agentMessages).omit({ id: true, createdAt: true });
export const insertAccountCategorySchema = createInsertSchema(accountCategories).omit({ id: true, createdAt: true });
export const insertAccountSchema = createInsertSchema(accounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertVendorSchema = createInsertSchema(vendors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, createdAt: true });
export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBudgetItemSchema = createInsertSchema(budgetItems).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTransactionLineSchema = createInsertSchema(transactionLines).omit({ id: true, createdAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertJobPositionSchema = createInsertSchema(jobPositions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaveRequestSchema = createInsertSchema(leaveRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({ id: true, createdAt: true });
export const insertPayrollRecordSchema = createInsertSchema(payrollRecords).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainingProgramSchema = createInsertSchema(trainingPrograms).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTrainingEnrollmentSchema = createInsertSchema(trainingEnrollments).omit({ id: true, createdAt: true });
export const insertAssistantSchema = createInsertSchema(assistants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssistantConversationSchema = createInsertSchema(assistantConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssistantMessageSchema = createInsertSchema(assistantMessages).omit({ id: true, createdAt: true });
export const insertAssistantDocumentSchema = createInsertSchema(assistantDocuments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAssistantProspectSchema = createInsertSchema(assistantProspects).omit({ id: true, createdAt: true, updatedAt: true });

// Enhanced Financial Schemas - Additional Financial Tables
export const insertLedgerAccountSchema = createInsertSchema(ledgerAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCreditNoteSchema = createInsertSchema(creditNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinanceRoleSchema = createInsertSchema(financeRoles).omit({ id: true, createdAt: true });

// Enhanced existing schemas with transaction integration
export const insertEnhancedInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  autoCreateTransaction: z.boolean().optional().default(true),
});

export const insertEnhancedPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  autoCreateTransaction: z.boolean().optional().default(true),
});
export const insertInstantSearchSchema = createInsertSchema(instantSearches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInstantSearchEventSchema = createInsertSchema(instantSearchEvents).omit({ id: true, createdAt: true });

// Types
export type Tenant = typeof tenants.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type ProductType = typeof productTypes.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductOffer = typeof productOffers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type SalesPipeline = typeof salesPipelines.$inferSelect;
export type SalesStage = typeof salesStages.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type ActivityType = typeof activityTypes.$inferSelect;
export type InterestLevel = typeof interestLevels.$inferSelect;
export type Event = typeof events.$inferSelect;
export type EventLog = typeof eventLogs.$inferSelect;
export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type AgentConversation = typeof agentConversations.$inferSelect;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type AccountCategory = typeof accountCategories.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
export type BudgetItem = typeof budgetItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type TransactionLine = typeof transactionLines.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type JobPosition = typeof jobPositions.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type PayrollRecord = typeof payrollRecords.$inferSelect;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type TrainingEnrollment = typeof trainingEnrollments.$inferSelect;
export type Assistant = typeof assistants.$inferSelect;
export type AssistantConversation = typeof assistantConversations.$inferSelect;
export type AssistantMessage = typeof assistantMessages.$inferSelect;
export type AssistantDocument = typeof assistantDocuments.$inferSelect;
export type AssistantProspect = typeof assistantProspects.$inferSelect;
export type InstantSearch = typeof instantSearches.$inferSelect;
export type InstantSearchEvent = typeof instantSearchEvents.$inferSelect;

// Enhanced financial types
export type LedgerAccount = typeof ledgerAccounts.$inferSelect;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type Bill = typeof bills.$inferSelect;
export type CreditNote = typeof creditNotes.$inferSelect;
export type FinanceRole = typeof financeRoles.$inferSelect;

export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type InsertProductCategory = z.infer<typeof insertProductCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertProductOffer = z.infer<typeof insertProductOfferSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertSalesPipeline = z.infer<typeof insertSalesPipelineSchema>;
export type InsertSalesStage = z.infer<typeof insertSalesStageSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertActivityType = z.infer<typeof insertActivityTypeSchema>;
export type InsertInterestLevel = z.infer<typeof insertInterestLevelSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertEventLog = z.infer<typeof insertEventLogSchema>;
export type InsertChatConversation = z.infer<typeof insertChatConversationSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertAgentConversation = z.infer<typeof insertAgentConversationSchema>;
export type InsertAgentMessage = z.infer<typeof insertAgentMessageSchema>;
export type InsertAssistant = z.infer<typeof insertAssistantSchema>;
export type InsertAssistantConversation = z.infer<typeof insertAssistantConversationSchema>;
export type InsertAssistantMessage = z.infer<typeof insertAssistantMessageSchema>;
export type InsertAssistantDocument = z.infer<typeof insertAssistantDocumentSchema>;
export type InsertAssistantProspect = z.infer<typeof insertAssistantProspectSchema>;
export type InsertInstantSearch = z.infer<typeof insertInstantSearchSchema>;
export type InsertInstantSearchEvent = z.infer<typeof insertInstantSearchEventSchema>;

// Enhanced financial insert types
export type InsertLedgerAccount = z.infer<typeof insertLedgerAccountSchema>;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type InsertCreditNote = z.infer<typeof insertCreditNoteSchema>;
export type InsertFinanceRole = z.infer<typeof insertFinanceRoleSchema>;

// Extended types for the multi-level CRM structure
export type UserWithRole = User & { role: Role };
export type UserWithManager = User & { 
  role: Role; 
  manager?: User & { role: Role };
  subordinates?: User[];
};

// Permission constants
export const PERMISSIONS = {
  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  EDIT_USER_PROFILE: 'edit_user_profile',
  
  // Data access
  VIEW_ALL_DATA: 'view_all_data',
  VIEW_TEAM_DATA: 'view_team_data',
  VIEW_OWN_DATA: 'view_own_data',
  
  // CRM operations
  MANAGE_CONTACTS: 'manage_contacts',
  MANAGE_DEALS: 'manage_deals',
  MANAGE_LEADS: 'manage_leads',
  MANAGE_COMPANIES: 'manage_companies',
  MANAGE_PRODUCTS: 'manage_products',
  MANAGE_ACTIVITIES: 'manage_activities',
  
  // Reports and analytics
  VIEW_REPORTS: 'view_reports',
  EXPORT_DATA: 'export_data',
  
  // AI features
  USE_AI_INSIGHTS: 'use_ai_insights',
  
  // System administration
  MANAGE_ROLES: 'manage_roles',
  MANAGE_TENANT: 'manage_tenant',
} as const;

// Role level hierarchy
export const ROLE_LEVELS = {
  AGENT: 1,
  SALES_MANAGER: 2,
  SUPER_ADMIN: 3,
  DIRECTOR: 4,
  ADMIN: 5,
} as const;
