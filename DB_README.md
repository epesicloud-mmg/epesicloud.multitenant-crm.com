# EpesiCRM Database Schema Documentation

This document provides comprehensive documentation for the EpesiCRM database schema, including all tables, relationships, and multi-tenant design patterns.

## Overview

EpesiCRM uses a **multi-tenant shared database architecture** where all tenants share the same database but data is isolated using `tenant_id` columns. The system supports hierarchical role-based access control (RBAC), workspace-based data organization, AI-powered assistants, comprehensive event analytics, and cross-industry product management.

### Database Statistics
- **Total Tables**: 21
- **Multi-tenant Tables**: 21 (100%)
- **Relationship Types**: One-to-Many, Many-to-One, Self-referencing
- **Key Features**: RBAC, Workspace isolation, AI assistants, Event analytics, Products management, Audit trails

## Architecture

### Multi-Tenant Design
- **Tenant Isolation**: All data tables include a `tenant_id` column for complete data segregation
- **Shared Schema**: Single database schema shared across all tenants with logical separation
- **Data Security**: All queries automatically filter by tenant context to prevent data leakage

### Technology Stack
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Schema-first approach with `npm run db:push`

---

## Core Tables

### 1. Tenants (`tenants`)
**Purpose**: Root table for multi-tenant architecture - represents different organizations using the CRM.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique tenant identifier |
| `name` | TEXT NOT NULL | Organization name |
| `subdomain` | TEXT NOT NULL UNIQUE | Unique subdomain for tenant |
| `created_at` | TIMESTAMP | When tenant was created |

**Key Features**:
- Each tenant represents a separate organization
- Subdomain-based tenant identification (production would use this for routing)
- All other tables reference this via `tenant_id`

---

### 2. Workspaces (`workspaces`)
**Purpose**: Logical divisions within tenants for departments, branches, or teams.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique workspace identifier |
| `name` | TEXT NOT NULL | Workspace name |
| `description` | TEXT | Workspace description |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Key Features**:
- Enables departmental/branch separation within tenants
- Users can belong to specific workspaces
- Data can be scoped to workspace level

---

### 3. Projects (`projects`)
**Purpose**: Project-based organization for grouping related work activities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique project identifier |
| `name` | TEXT NOT NULL | Project name |
| `description` | TEXT | Project description |
| `status` | TEXT | Project status (active, completed, on-hold) |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### 4. Roles (`roles`)
**Purpose**: Define hierarchical permission levels within each tenant organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique role identifier |
| `name` | TEXT NOT NULL | Role name |
| `level` | INTEGER NOT NULL | Hierarchical level (1-6) |
| `permissions` | TEXT[] | Array of permission strings |
| `description` | TEXT | Role description |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

**Role Hierarchy**:
1. **Agent** (level 1) - Basic user access
2. **Sales Manager** (level 2) - Team management
3. **Super Admin** (level 3) - Advanced management
4. **Director** (level 4) - Executive access
5. **Admin** (level 5) - Cross-workspace access
6. **Workspace Admin** (level 6) - Analytics access

**Permission System**:
- `manage_users`, `view_users`, `edit_user_profile`
- `view_all_data`, `view_team_data`, `view_own_data`
- `manage_contacts`, `manage_deals`, `manage_leads`
- `manage_companies`, `manage_products`, `manage_activities`
- `view_reports`, `view_analytics`, `generate_reports`, `export_data`
- `manage_pipelines`, `manage_integrations`, `manage_assistants`
- `manage_workspaces`, `manage_projects`, `manage_setup`

---

### 5. Users (`users`)
**Purpose**: User accounts with hierarchical management structure and role-based permissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique user identifier |
| `username` | TEXT NOT NULL | Login username |
| `password` | TEXT NOT NULL | Hashed password |
| `email` | TEXT NOT NULL | User email address |
| `first_name` | TEXT NOT NULL | First name |
| `last_name` | TEXT NOT NULL | Last name |
| `role_id` | INTEGER NOT NULL | References `roles.id` |
| `manager_id` | INTEGER | References `users.id` (self-referencing) |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Key Features**:
- Hierarchical manager-subordinate relationships
- Self-referencing for organizational structure
- Role-based access control integration

---

### 6. Companies (`companies`)
**Purpose**: Store information about client companies and organizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique company identifier |
| `name` | TEXT NOT NULL | Company name |
| `type` | TEXT | Company type/category |
| `industry` | TEXT | Industry classification |
| `phone` | TEXT | Primary phone number |
| `email` | TEXT | Primary email address |
| `website` | TEXT | Company website |
| `address` | TEXT | Physical address |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## Product Management Tables

### 7. Product Types (`product_types`)
**Purpose**: Classify products by their nature (physical, digital, service).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique product type identifier |
| `name` | TEXT NOT NULL | Type name (physical, digital, service) |
| `description` | TEXT | Type description |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 8. Product Categories (`product_categories`)
**Purpose**: Organize products into visual categories with colors and icons.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique category identifier |
| `name` | TEXT NOT NULL | Category name |
| `description` | TEXT | Category description |
| `color` | TEXT | Category color (default: #3b82f6) |
| `icon` | TEXT | Category icon (default: Package) |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 9. Products (`products`)
**Purpose**: Enhanced product management for cross-industry use with flexible specifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique product identifier |
| `name` | TEXT NOT NULL | Product name |
| `title` | TEXT NOT NULL | Product title/display name |
| `description` | TEXT | Product description |
| `sale_price` | DECIMAL(10,2) NOT NULL | Sale price |
| `currency` | TEXT | Currency code (default: USD) |
| `sku` | TEXT | Stock keeping unit |
| `product_type_id` | INTEGER | References `product_types.id` |
| `category_id` | INTEGER | References `product_categories.id` |
| `featured_photo` | TEXT | Product image URL |
| `is_featured` | BOOLEAN | Featured product flag |
| `sales_pipeline_id` | INTEGER | References `sales_pipelines.id` |
| `is_active` | BOOLEAN | Active status |
| `stock` | INTEGER | Stock quantity |
| `specifications` | JSONB | Flexible product specifications |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Key Features**:
- Cross-industry design (retail, legal, real estate, etc.)
- Flexible JSONB specifications for industry-specific fields
- Stock tracking ready for inventory extensions
- Featured products support for marketing

---

### 10. Product Offers (`product_offers`)
**Purpose**: Manage promotions, discounts, and special deals for products.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique offer identifier |
| `product_id` | INTEGER NOT NULL | References `products.id` |
| `name` | TEXT NOT NULL | Offer name |
| `description` | TEXT | Offer description |
| `discount_type` | TEXT NOT NULL | Discount type (percentage, fixed_amount) |
| `discount_value` | DECIMAL(10,2) NOT NULL | Discount value |
| `start_date` | TIMESTAMP | Offer start date |
| `end_date` | TIMESTAMP | Offer end date |
| `is_active` | BOOLEAN | Active status |
| `conditions` | JSONB | Flexible offer conditions |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

## Customer Management Tables

### 11. Leads (`leads`)
**Purpose**: Track potential customers before they become qualified contacts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique lead identifier |
| `first_name` | TEXT NOT NULL | First name |
| `last_name` | TEXT NOT NULL | Last name |
| `email` | TEXT NOT NULL | Email address |
| `phone` | TEXT | Phone number |
| `company` | TEXT | Company name |
| `job_title` | TEXT | Job title |
| `source` | TEXT | Lead source (website, referral, etc.) |
| `status` | TEXT | Lead status (new, contacted, qualified, etc.) |
| `score` | INTEGER | Lead scoring (0-100) |
| `notes` | TEXT | Additional notes |
| `assigned_to_id` | INTEGER | References `users.id` |
| `assigned_by_id` | INTEGER | References `users.id` |
| `assigned_at` | TIMESTAMP | Assignment timestamp |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 12. Contacts (`contacts`)
**Purpose**: Manage qualified customer contacts with company relationships.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique contact identifier |
| `first_name` | TEXT NOT NULL | First name |
| `last_name` | TEXT NOT NULL | Last name |
| `email` | TEXT NOT NULL | Email address |
| `phone` | TEXT | Phone number |
| `job_title` | TEXT | Job title |
| `status` | TEXT | Contact status (lead, prospect, active, inactive) |
| `company_id` | INTEGER | References `companies.id` |
| `assigned_to_id` | INTEGER | References `users.id` |
| `supervisor_id` | INTEGER | References `users.id` |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## Sales Pipeline Tables

### 13. Activity Types (`activity_types`)
**Purpose**: Define types of activities that can be performed in the CRM.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique activity type identifier |
| `type_name` | TEXT NOT NULL | Activity type name |
| `description` | TEXT | Type description |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 14. Sales Pipelines (`sales_pipelines`)
**Purpose**: Define different sales processes with multiple stages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique pipeline identifier |
| `title` | TEXT NOT NULL | Pipeline title |
| `description` | TEXT | Pipeline description |
| `is_default` | BOOLEAN | Default pipeline flag |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 15. Sales Stages (`sales_stages`)
**Purpose**: Define individual stages within sales pipelines.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique stage identifier |
| `sale_pipeline_id` | INTEGER NOT NULL | References `sales_pipelines.id` |
| `title` | TEXT NOT NULL | Stage title |
| `description` | TEXT | Stage description |
| `order` | INTEGER NOT NULL | Stage order in pipeline |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 16. Interest Levels (`interest_levels`)
**Purpose**: Define customer interest levels for better lead qualification.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique interest level identifier |
| `level` | TEXT NOT NULL | Interest level (Hot, Warm, Cold) |
| `description` | TEXT | Level description |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 17. Deals (`deals`)
**Purpose**: Track sales opportunities through the pipeline stages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique deal identifier |
| `title` | TEXT NOT NULL | Deal title |
| `description` | TEXT | Deal description |
| `value` | DECIMAL(10,2) | Deal value |
| `stage_id` | INTEGER | References `sales_stages.id` |
| `probability` | INTEGER | Close probability (0-100) |
| `expected_close_date` | DATE | Expected close date |
| `company_id` | INTEGER | References `companies.id` |
| `contact_id` | INTEGER | References `contacts.id` |
| `product_id` | INTEGER | References `products.id` |
| `interest_level_id` | INTEGER | References `interest_levels.id` |
| `assigned_to_id` | INTEGER | References `users.id` |
| `supervisor_id` | INTEGER | References `users.id` |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 18. Activities (`activities`)
**Purpose**: Track all activities related to contacts, deals, and sales processes.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique activity identifier |
| `subject` | TEXT NOT NULL | Activity subject |
| `description` | TEXT | Activity description |
| `activity_type` | TEXT | Activity type |
| `status` | TEXT | Activity status |
| `priority` | TEXT | Activity priority |
| `due_date` | DATE | Due date |
| `completed_date` | DATE | Completion date |
| `user_id` | INTEGER | References `users.id` |
| `supervisor_id` | INTEGER | References `users.id` |
| `contact_id` | INTEGER | References `contacts.id` |
| `deal_id` | INTEGER | References `deals.id` |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `project_id` | INTEGER | References `projects.id` |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## Analytics & AI Tables

### 19. Events (`events`)
**Purpose**: PostHog-style event tracking for comprehensive behavioral analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique event identifier |
| `event_name` | TEXT NOT NULL | Event name (page.view, button.click, etc.) |
| `user_id` | INTEGER | References `users.id` |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `timestamp` | TIMESTAMP | Event timestamp |
| `source` | TEXT | Event source (web, mobile, API) |
| `url` | TEXT | Full URL if applicable |
| `user_agent` | TEXT | Browser/device info |
| `ip_address` | TEXT | User IP for analytics |
| `session_id` | TEXT | Session tracking |
| `event_properties` | JSONB | Flexible JSON metadata |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

**Key Features**:
- PostHog-style flexible event tracking
- JSONB properties for unlimited custom data
- Session and user behavior analytics
- Real-time event processing

---

### 20. Agent Conversations (`agent_conversations`)
**Purpose**: Store conversations with the floating Epesi Agent (user-scoped personal AI assistant).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique conversation identifier |
| `user_id` | INTEGER NOT NULL | References `users.id` |
| `title` | TEXT NOT NULL | Conversation title |
| `is_active` | BOOLEAN | Active conversation flag |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### 21. Agent Messages (`agent_messages`)
**Purpose**: Store individual messages within agent conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique message identifier |
| `conversation_id` | INTEGER NOT NULL | References `agent_conversations.id` |
| `user_id` | INTEGER NOT NULL | References `users.id` |
| `role` | TEXT NOT NULL | Message role (user, assistant) |
| `content` | TEXT NOT NULL | Message content |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

## Assistant Management Tables (Future Extension)

### 22. Assistants (`assistants`)
**Purpose**: Store tenant admin created assistants for customer support and lead generation.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique assistant identifier |
| `name` | TEXT NOT NULL | Assistant name |
| `description` | TEXT | Assistant description |
| `scope` | TEXT NOT NULL | Scope (tenant, workspace) |
| `workspace_id` | INTEGER | References `workspaces.id` |
| `system_prompt` | TEXT NOT NULL | AI system prompt |
| `is_active` | BOOLEAN | Active status |
| `widget_code` | TEXT | Embed code for websites |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### 23. Assistant Conversations (`assistant_conversations`)
**Purpose**: Store visitor interactions with tenant assistants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique conversation identifier |
| `assistant_id` | INTEGER NOT NULL | References `assistants.id` |
| `visitor_id` | TEXT NOT NULL | UUID for anonymous visitors |
| `visitor_email` | TEXT | Visitor email |
| `visitor_name` | TEXT | Visitor name |
| `visitor_company` | TEXT | Visitor company |
| `status` | TEXT | Conversation status |
| `lead_captured` | BOOLEAN | Lead capture flag |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### 24. Assistant Messages (`assistant_messages`)
**Purpose**: Store messages in assistant conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique message identifier |
| `conversation_id` | INTEGER NOT NULL | References `assistant_conversations.id` |
| `role` | TEXT NOT NULL | Message role (user, assistant) |
| `content` | TEXT NOT NULL | Message content |
| `message_type` | TEXT | Message type (text, lead_form, file) |
| `metadata` | JSONB | Additional message data |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |

---

### 25. Assistant Documents (`assistant_documents`)
**Purpose**: Knowledge base documents for assistants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique document identifier |
| `assistant_id` | INTEGER NOT NULL | References `assistants.id` |
| `type` | TEXT NOT NULL | Document type (products, projects, documents, faq) |
| `name` | TEXT NOT NULL | Document name |
| `description` | TEXT | Document description |
| `content` | TEXT | Document content |
| `item_count` | INTEGER | Number of items |
| `is_active` | BOOLEAN | Active status |
| `last_synced` | TIMESTAMP | Last sync timestamp |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### 26. Assistant Prospects (`assistant_prospects`)
**Purpose**: Store leads captured by assistants.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique prospect identifier |
| `assistant_id` | INTEGER NOT NULL | References `assistants.id` |
| `conversation_id` | INTEGER NOT NULL | References `assistant_conversations.id` |
| `email` | TEXT NOT NULL | Prospect email |
| `name` | TEXT | Prospect name |
| `company` | TEXT | Prospect company |
| `phone` | TEXT | Prospect phone |
| `source` | TEXT | Lead source |
| `lead_quality` | TEXT | Lead quality (hot, warm, cold, unqualified) |
| `notes` | TEXT | Additional notes |
| `tenant_id` | INTEGER NOT NULL | References `tenants.id` |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

## Key Relationships

### Primary Relationships
1. **Tenants** → All tables (1:many via `tenant_id`)
2. **Workspaces** → Users, Companies, Products, etc. (1:many)
3. **Users** → Users (self-referencing for manager hierarchy)
4. **Companies** → Contacts, Deals (1:many)
5. **Products** → Deals, Product Offers (1:many)
6. **Sales Pipelines** → Sales Stages → Deals (1:many:many)
7. **Contacts** → Deals, Activities (1:many)
8. **Agent Conversations** → Agent Messages (1:many)
9. **Assistants** → Assistant Conversations → Assistant Messages (1:many:many)

### Data Flow Patterns
1. **Lead → Contact → Deal → Activity** (Sales funnel)
2. **Tenant → Workspace → Project → Users/Data** (Organizational hierarchy)
3. **User → Role → Permissions** (Access control)
4. **Product → Category → Type → Offers** (Product organization)
5. **Assistant → Conversation → Messages → Prospects** (AI lead capture)

---

## Security & Performance

### Multi-Tenant Security
- All queries automatically filter by `tenant_id`
- No cross-tenant data access possible
- Workspace-level isolation within tenants
- Role-based permission checking on all operations

### Performance Optimizations
- Indexed foreign keys for fast joins
- Compound indexes on `tenant_id` + frequently queried columns
- JSONB indexes for flexible property searches
- Cascading deletes for data consistency

### Audit Trail
- `created_at` timestamps on all tables
- `updated_at` timestamps where needed
- Event tracking for user behavior analytics
- Activity logging for compliance

---

## Migration Strategy

### Schema Management
- Use `npm run db:push` for schema updates
- Drizzle ORM handles type safety
- Incremental schema changes
- Rollback capabilities via checkpoints

### Data Integrity
- Foreign key constraints enforced
- NOT NULL constraints on critical fields
- Default values for optional fields
- Cascading deletes where appropriate

---

## Usage Examples

### Common Query Patterns

```sql
-- Get all deals for a tenant
SELECT * FROM deals WHERE tenant_id = $1;

-- Get user's assigned contacts with company info
SELECT c.*, co.name as company_name 
FROM contacts c 
LEFT JOIN companies co ON c.company_id = co.id 
WHERE c.assigned_to_id = $1 AND c.tenant_id = $2;

-- Get pipeline performance
SELECT sp.title, ss.title as stage, COUNT(d.id) as deal_count
FROM sales_pipelines sp
JOIN sales_stages ss ON sp.id = ss.sale_pipeline_id
LEFT JOIN deals d ON ss.id = d.stage_id
WHERE sp.tenant_id = $1
GROUP BY sp.title, ss.title;

-- Event analytics for user behavior
SELECT event_name, COUNT(*) as event_count
FROM events 
WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY event_count DESC;
```

This database schema provides a comprehensive foundation for a multi-tenant CRM system with advanced features including AI assistants, event analytics, and flexible product management suitable for any industry.