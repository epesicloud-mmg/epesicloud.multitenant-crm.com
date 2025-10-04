# Database Tables Documentation

## Current Database Structure

Total Tables: 60

---

## Tables by Module

### CRM Module (14 tables)
Core customer relationship management functionality

| Table Name | Purpose |
|------------|---------|
| `companies` | Business organizations and corporate contacts |
| `contacts` | Individual contact persons |
| `leads` | Potential customers in early stages |
| `deals` | Sales opportunities and transactions |
| `activities` | Customer interactions (calls, meetings, emails) |
| `activity_types` | Types of customer activities |
| `sales_pipelines` | Sales process workflows |
| `sales_stages` | Stages within sales pipelines |
| `interest_levels` | Customer interest classification |
| `products` | Products and services offered |
| `product_categories` | Product categorization |
| `product_offers` | Special offers and promotions |
| `product_types` | Product type classification |
| `customers` | Converted customers |

---

### Finance/Accounting Module (17 tables)
Financial management and accounting

| Table Name | Purpose |
|------------|---------|
| `account_categories` | Chart of accounts categories |
| `accounts` | Individual accounts |
| `ledger_accounts` | General ledger accounts |
| `transactions` | Financial transactions |
| `transaction_lines` | Transaction line items |
| `invoices` | Customer invoices |
| `invoice_items` | Invoice line items |
| `payments` | Payment records |
| `credit_notes` | Credit note records |
| `bills` | Vendor bills |
| `budgets` | Budget records |
| `budget_items` | Budget line items |
| `expenses` | Expense records |
| `expense_categories` | Expense categorization |
| `bank_accounts` | Bank account information |
| `vendors` | Vendor/supplier records |
| `finance_roles` | Finance-specific roles |

---

### HR & Payroll Module (9 tables)
Human resources and payroll management

| Table Name | Purpose |
|------------|---------|
| `employees` | Employee records |
| `departments` | Company departments |
| `job_positions` | Job position definitions |
| `attendance_records` | Employee attendance tracking |
| `leave_requests` | Leave/vacation requests |
| `performance_reviews` | Performance evaluation records |
| `training_programs` | Training program catalog |
| `training_enrollments` | Employee training enrollments |
| `payroll_records` | Payroll processing records |

---

### Access Management (AAM) Module (6 tables)
User access and permissions

| Table Name | Purpose |
|------------|---------|
| `tenants` | Multi-tenant organization records |
| `workspaces` | Departmental/branch workspaces within tenants |
| `users` | User accounts |
| `roles` | User role definitions |
| `role_permissions` | Role-based permissions |
| `user_roles` | User-role assignments |

---

### Analytics & AI Module (13 tables)
Analytics tracking and AI assistants

| Table Name | Purpose |
|------------|---------|
| `events` | System event tracking |
| `event_logs` | Event log records |
| `instant_searches` | Instant search functionality |
| `instant_search_events` | Search event tracking |
| `assistants` | AI assistant configurations |
| `assistant_conversations` | AI conversation records |
| `assistant_messages` | AI conversation messages |
| `assistant_documents` | AI assistant documents |
| `assistant_prospects` | AI prospect analysis |
| `agent_conversations` | Agent conversation records |
| `agent_messages` | Agent messages |
| `chat_conversations` | General chat conversations |
| `chat_messages` | Chat message records |

---

### Projects Module (1 table)
Project management

| Table Name | Purpose |
|------------|---------|
| `projects` | Project records |

---

## Proposed CRM-Only Structure

### Tables to RETAIN (CRM Core):
1. `companies` - Business contacts
2. `contacts` - Individual contacts
3. `leads` - Potential customers
4. `deals` - Sales opportunities
5. `activities` - Customer interactions
6. `activity_types` - Activity classifications
7. `sales_pipelines` - Sales workflows
8. `sales_stages` - Pipeline stages
9. `interest_levels` - Interest classifications
10. `products` - Product catalog
11. `product_categories` - Product categories
12. `product_offers` - Offers and promotions
13. `product_types` - Product types
14. `customers` - Customer records
15. `tenants` - Organization/tenant records (renamed from workspaces)
16. `users` - User accounts
17. `roles` - User roles
18. `role_permissions` - Permissions
19. `user_roles` - User-role assignments
20. `projects` - Projects (optional for CRM)

### Tables to REMOVE:
- **Finance (17 tables)**: All accounting-related tables
- **HR & Payroll (9 tables)**: All HR-related tables  
- **Analytics & AI (13 tables)**: All analytics/AI tables
- **Workspaces**: Will be consolidated into tenants

**Total to remove: 39 tables**
**Total to retain: 20-21 tables**
