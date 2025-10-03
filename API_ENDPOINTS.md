# API Endpoints Documentation

This document lists all available API endpoints in the EpesiCRM multi-module platform.

## Base URL
All endpoints are available at: `http://localhost:5000/api`

## Authentication Headers
All requests require the following header:
```
X-Tenant-Id: 1
```

---

## CRM Module Endpoints

### Module Health & Stats
- **GET** `/api/crm/health` - CRM module health check
- **GET** `/api/crm/stats` - CRM dashboard statistics

### Deals Management
- **GET** `/api/crm/deals` - List all deals
- **POST** `/api/crm/deals` - Create new deal
- **GET** `/api/crm/deals/{id}` - Get deal by ID
- **PUT** `/api/crm/deals/{id}` - Update deal
- **DELETE** `/api/crm/deals/{id}` - Delete deal

### Contacts Management
- **GET** `/api/crm/contacts` - List all contacts
- **POST** `/api/crm/contacts` - Create new contact
- **GET** `/api/crm/contacts/{id}` - Get contact by ID
- **PUT** `/api/crm/contacts/{id}` - Update contact
- **DELETE** `/api/crm/contacts/{id}` - Delete contact

### Companies Management
- **GET** `/api/crm/companies` - List all companies
- **POST** `/api/crm/companies` - Create new company
- **GET** `/api/crm/companies/{id}` - Get company by ID
- **PUT** `/api/crm/companies/{id}` - Update company
- **DELETE** `/api/crm/companies/{id}` - Delete company

### Activities Management
- **GET** `/api/crm/activities` - List all activities
- **POST** `/api/crm/activities` - Create new activity
- **GET** `/api/crm/activities/{id}` - Get activity by ID
- **PUT** `/api/crm/activities/{id}` - Update activity
- **DELETE** `/api/crm/activities/{id}` - Delete activity

### Pipelines Management
- **GET** `/api/crm/pipelines` - List all pipelines
- **POST** `/api/crm/pipelines` - Create new pipeline
- **GET** `/api/crm/pipelines/{id}` - Get pipeline by ID
- **PUT** `/api/crm/pipelines/{id}` - Update pipeline
- **DELETE** `/api/crm/pipelines/{id}` - Delete pipeline

### Products Management
- **GET** `/api/crm/products` - List all products
- **POST** `/api/crm/products` - Create new product
- **GET** `/api/crm/products/{id}` - Get product by ID
- **PUT** `/api/crm/products/{id}` - Update product
- **DELETE** `/api/crm/products/{id}` - Delete product

### Users Management
- **GET** `/api/crm/users` - List all users
- **POST** `/api/crm/users` - Create new user
- **GET** `/api/crm/users/{id}` - Get user by ID
- **PUT** `/api/crm/users/{id}` - Update user
- **DELETE** `/api/crm/users/{id}` - Delete user

---

## Finance Module Endpoints

### Module Health & Stats
- **GET** `/api/finance/health` - Finance module health check
- **GET** `/api/finance/stats` - Finance dashboard statistics

### Invoicing
- **GET** `/api/finance/invoices` - List all invoices
- **POST** `/api/finance/invoices` - Create new invoice
- **GET** `/api/finance/invoices/{id}` - Get invoice by ID
- **PUT** `/api/finance/invoices/{id}` - Update invoice
- **DELETE** `/api/finance/invoices/{id}` - Delete invoice

### Invoice Items
- **GET** `/api/finance/invoice-items` - List all invoice items
- **POST** `/api/finance/invoice-items` - Create new invoice item
- **GET** `/api/finance/invoice-items/{id}` - Get invoice item by ID
- **PUT** `/api/finance/invoice-items/{id}` - Update invoice item
- **DELETE** `/api/finance/invoice-items/{id}` - Delete invoice item

### Expenses Management
- **GET** `/api/finance/expenses` - List all expenses
- **POST** `/api/finance/expenses` - Create new expense
- **GET** `/api/finance/expenses/{id}` - Get expense by ID
- **PUT** `/api/finance/expenses/{id}` - Update expense
- **DELETE** `/api/finance/expenses/{id}` - Delete expense

### Expense Categories
- **GET** `/api/finance/expense-categories` - List all expense categories
- **POST** `/api/finance/expense-categories` - Create new expense category
- **GET** `/api/finance/expense-categories/{id}` - Get expense category by ID
- **PUT** `/api/finance/expense-categories/{id}` - Update expense category
- **DELETE** `/api/finance/expense-categories/{id}` - Delete expense category

### Payments Management
- **GET** `/api/finance/payments` - List all payments
- **POST** `/api/finance/payments` - Create new payment
- **GET** `/api/finance/payments/{id}` - Get payment by ID
- **PUT** `/api/finance/payments/{id}` - Update payment
- **DELETE** `/api/finance/payments/{id}` - Delete payment

### Customer Management
- **GET** `/api/finance/customers` - List all customers
- **POST** `/api/finance/customers` - Create new customer
- **GET** `/api/finance/customers/{id}` - Get customer by ID
- **PUT** `/api/finance/customers/{id}` - Update customer
- **DELETE** `/api/finance/customers/{id}` - Delete customer

### Vendor Management
- **GET** `/api/finance/vendors` - List all vendors
- **POST** `/api/finance/vendors` - Create new vendor
- **GET** `/api/finance/vendors/{id}` - Get vendor by ID
- **PUT** `/api/finance/vendors/{id}` - Update vendor
- **DELETE** `/api/finance/vendors/{id}` - Delete vendor

### Chart of Accounts
- **GET** `/api/finance/accounts` - List all accounts
- **POST** `/api/finance/accounts` - Create new account
- **GET** `/api/finance/accounts/{id}` - Get account by ID
- **PUT** `/api/finance/accounts/{id}` - Update account
- **DELETE** `/api/finance/accounts/{id}` - Delete account

### Account Categories
- **GET** `/api/finance/account-categories` - List all account categories
- **POST** `/api/finance/account-categories` - Create new account category
- **GET** `/api/finance/account-categories/{id}` - Get account category by ID
- **PUT** `/api/finance/account-categories/{id}` - Update account category
- **DELETE** `/api/finance/account-categories/{id}` - Delete account category

### Budget Management
- **GET** `/api/finance/budgets` - List all budgets
- **POST** `/api/finance/budgets` - Create new budget
- **GET** `/api/finance/budgets/{id}` - Get budget by ID
- **PUT** `/api/finance/budgets/{id}` - Update budget
- **DELETE** `/api/finance/budgets/{id}` - Delete budget

### Budget Items
- **GET** `/api/finance/budget-items` - List all budget items
- **POST** `/api/finance/budget-items` - Create new budget item
- **GET** `/api/finance/budget-items/{id}` - Get budget item by ID
- **PUT** `/api/finance/budget-items/{id}` - Update budget item
- **DELETE** `/api/finance/budget-items/{id}` - Delete budget item

### Transactions
- **GET** `/api/finance/transactions` - List all transactions
- **POST** `/api/finance/transactions` - Create new transaction
- **GET** `/api/finance/transactions/{id}` - Get transaction by ID
- **PUT** `/api/finance/transactions/{id}` - Update transaction
- **DELETE** `/api/finance/transactions/{id}` - Delete transaction

### Transaction Lines
- **GET** `/api/finance/transaction-lines` - List all transaction lines
- **POST** `/api/finance/transaction-lines` - Create new transaction line
- **GET** `/api/finance/transaction-lines/{id}` - Get transaction line by ID
- **PUT** `/api/finance/transaction-lines/{id}` - Update transaction line
- **DELETE** `/api/finance/transaction-lines/{id}` - Delete transaction line

---

## HR Module Endpoints

### Module Health & Stats
- **GET** `/api/hr/health` - HR module health check
- **GET** `/api/hr/stats` - HR dashboard statistics

### Employee Management
- **GET** `/api/hr/employees` - List all employees
- **POST** `/api/hr/employees` - Create new employee
- **GET** `/api/hr/employees/{id}` - Get employee by ID
- **PUT** `/api/hr/employees/{id}` - Update employee
- **DELETE** `/api/hr/employees/{id}` - Delete employee

### Department Management
- **GET** `/api/hr/departments` - List all departments
- **POST** `/api/hr/departments` - Create new department
- **GET** `/api/hr/departments/{id}` - Get department by ID
- **PUT** `/api/hr/departments/{id}` - Update department
- **DELETE** `/api/hr/departments/{id}` - Delete department

### Job Positions
- **GET** `/api/hr/positions` - List all job positions
- **POST** `/api/hr/positions` - Create new job position
- **GET** `/api/hr/positions/{id}` - Get job position by ID
- **PUT** `/api/hr/positions/{id}` - Update job position
- **DELETE** `/api/hr/positions/{id}` - Delete job position

### Leave Requests
- **GET** `/api/hr/leave-requests` - List all leave requests
- **POST** `/api/hr/leave-requests` - Create new leave request
- **GET** `/api/hr/leave-requests/{id}` - Get leave request by ID
- **PUT** `/api/hr/leave-requests/{id}` - Update leave request
- **DELETE** `/api/hr/leave-requests/{id}` - Delete leave request

### Performance Reviews
- **GET** `/api/hr/performance-reviews` - List all performance reviews
- **POST** `/api/hr/performance-reviews` - Create new performance review
- **GET** `/api/hr/performance-reviews/{id}` - Get performance review by ID
- **PUT** `/api/hr/performance-reviews/{id}` - Update performance review
- **DELETE** `/api/hr/performance-reviews/{id}` - Delete performance review

### Attendance Records
- **GET** `/api/hr/attendance` - List all attendance records
- **POST** `/api/hr/attendance` - Create new attendance record
- **GET** `/api/hr/attendance/{id}` - Get attendance record by ID
- **PUT** `/api/hr/attendance/{id}` - Update attendance record
- **DELETE** `/api/hr/attendance/{id}` - Delete attendance record

### Payroll Records
- **GET** `/api/hr/payroll` - List all payroll records
- **POST** `/api/hr/payroll` - Create new payroll record
- **GET** `/api/hr/payroll/{id}` - Get payroll record by ID
- **PUT** `/api/hr/payroll/{id}` - Update payroll record
- **DELETE** `/api/hr/payroll/{id}` - Delete payroll record

### Training Programs
- **GET** `/api/hr/training-programs` - List all training programs
- **POST** `/api/hr/training-programs` - Create new training program
- **GET** `/api/hr/training-programs/{id}` - Get training program by ID
- **PUT** `/api/hr/training-programs/{id}` - Update training program
- **DELETE** `/api/hr/training-programs/{id}` - Delete training program

### Training Enrollments
- **GET** `/api/hr/training-enrollments` - List all training enrollments
- **POST** `/api/hr/training-enrollments` - Create new training enrollment
- **GET** `/api/hr/training-enrollments/{id}` - Get training enrollment by ID
- **PUT** `/api/hr/training-enrollments/{id}` - Update training enrollment
- **DELETE** `/api/hr/training-enrollments/{id}` - Delete training enrollment

---

## Global/Utility Endpoints

### Event Tracking
- **POST** `/api/events` - Track user events and page interactions

### Search
- **GET** `/api/search` - Global search across all modules
  - Query parameter: `q` (search term)
  - Returns sectioned results from contacts, deals, companies, etc.

### AI Assistant
- **POST** `/api/ai/chat` - Multi-chat AI assistant conversations
- **GET** `/api/ai/conversations` - List user conversations
- **POST** `/api/ai/conversations` - Create new conversation
- **DELETE** `/api/ai/conversations/{id}` - Delete conversation

---

## Response Formats

### Success Response
```json
{
  "id": 1,
  "data": { ... },
  "message": "Success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### List Response
```json
[
  { "id": 1, "data": { ... } },
  { "id": 2, "data": { ... } }
]
```

---

## Authentication & Permissions

All endpoints require:
1. **Tenant ID Header**: `X-Tenant-Id: 1`
2. **Multi-tenant data isolation**: All data is automatically filtered by tenant
3. **Role-based access control**: Some endpoints may require specific permissions

---

## Module Architecture

The API follows a microservice architecture:
- **Module-level routes**: `/api/{module}/*` (aggregated APIs)
- **Individual microservices**: Direct API access for backward compatibility
- **Cross-module functionality**: Search, AI, and event tracking work across all modules

Each module is self-contained and can scale independently while maintaining data consistency through the shared database layer.