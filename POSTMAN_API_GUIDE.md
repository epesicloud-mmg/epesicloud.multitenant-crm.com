# API Endpoints - Postman Testing Guide

## Base URL
```
Production: https://epesicloudmultitenant-crmcom-pureplayplatfor.replit.app
Development: http://localhost:5000
```

## 🚀 Quick Start Guide

1. **Register a new user** - Saves your `accessToken` and `tenantId`
2. **Add headers to all protected endpoints:**
   - `Authorization: Bearer YOUR_ACCESS_TOKEN`
   - `X-Tenant-Id: YOUR_TENANT_ID`
3. **Create resources in the proper order** to avoid foreign key errors (see below)

## ⚠️ Important: Avoiding Foreign Key Errors

**Always create parent resources before child resources:**

✅ **Correct Order:**
1. Create Company → then Create Contact with `companyId`
2. Create Contact → then Create Deal with `contactId`
3. Create Pipeline → then Create Deal with `pipelineId`
4. Create Product → then link it in deals

❌ **Common Mistakes:**
- Creating a contact with `companyId: 1` when no company exists yet
- Creating a deal with `contactId: 5` when that contact doesn't exist
- Using hardcoded IDs without creating the resources first

💡 **Pro Tip:** You can always create contacts, deals, and activities WITHOUT specifying optional foreign keys. Only add them after you've created the parent resource.

---

## Authentication Flow

### 1. Register New User
**POST** `/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tenant": {
    "id": 1,
    "name": "John Doe's Workspace"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "random-refresh-token-string"
}
```

**📝 Note:** Save the `accessToken` and `tenant.id` from the response for subsequent requests.

---

### 2. Login
**POST** `/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tenant": {
    "id": 1,
    "name": "John Doe's Workspace"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "random-refresh-token-string"
}
```

---

### 3. Refresh Access Token
**POST** `/api/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "tenant": {
    "id": 1,
    "name": "John Doe's Tenant"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "new-refresh-token-string"
}
```

**📝 Note:** 
- Access tokens expire every **15 minutes**
- Use this endpoint to get a new access token without logging in again
- The response includes tenant information to ensure proper context
- Save the new tokens from the response for subsequent requests

---

## Required Headers for All CRM Endpoints

For all endpoints below, include these headers:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
X-Tenant-Id: YOUR_TENANT_ID
Content-Type: application/json
```

---

## CRM Module Endpoints

### Health & Stats

#### Get CRM Health
**GET** `/api/crm/health`

**Response (200):**
```json
{
  "module": "CRM",
  "status": "healthy",
  "timestamp": "2025-10-25T17:00:00.000Z",
  "features": ["contacts", "deals", "companies", "activities", "pipelines", "products"]
}
```

---

#### Get CRM Stats
**GET** `/api/crm/stats`

**Response (200):**
```json
{
  "totalContacts": 156,
  "activeDeals": 23,
  "companiesCount": 45,
  "recentActivities": 12,
  "conversionRate": 35.5,
  "averageDealValue": 15000
}
```

---

### Contacts Management

#### List All Contacts
**GET** `/api/crm/contacts`

**Response (200):**
```json
[
  {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@e/xample.com",
    "phone": "+1234567890",
    "companyId": 1,
    "tenantId": 1,
    "createdAt": "2025-10-25T10:00:00.000Z"
  }
]
```

---

#### Create Contact (Without Company) - RECOMMENDED
**POST** `/api/crm/contacts`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "jobTitle": "CTO"
}
```

**Response (201):**
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "jobTitle": "CTO",
  "companyId": null,
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

✅ **This is the safest option** - no foreign key errors!

---

#### Create Contact (With Company)
**POST** `/api/crm/contacts`

⚠️ **IMPORTANT:** You MUST create a company first using the "Create Company" endpoint below, then use the returned company ID here.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "jobTitle": "CEO",
  "companyId": 1
}
```

**Note:** Replace `1` with the actual ID returned from creating a company.

**Response (201):**
```json
{
  "id": 2,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "jobTitle": "CEO",
  "companyId": 1,
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

---

#### Get Contact by ID
**GET** `/api/crm/contacts/{id}`

Example: `/api/crm/contacts/1`

**Response (200):**
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "companyId": 1,
  "tenantId": 1
}
```

---

#### Update Contact
**PUT** `/api/crm/contacts/{id}`

Example: `/api/crm/contacts/1`

**Request Body:**
```json
{
  "phone": "+9876543210",
  "position": "VP Engineering"
}
```

**Response (200):**
```json
{
  "id": 1,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "+9876543210",
  "position": "VP Engineering",
  "tenantId": 1
}
```

---

#### Delete Contact
**DELETE** `/api/crm/contacts/{id}`

Example: `/api/crm/contacts/1`

**Response (200):**
```json
{
  "success": true
}
```

---

### Companies Management

#### List All Companies
  **GET** `/api/crm/companies`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "industry": "Technology",
    "website": "https://acme.com",
    "tenantId": 1
  }
]
```

---

#### Create Company
**POST** `/api/crm/companies`

**Request Body:**
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "email": "info@acme.com",
  "phone": "+1234567890",
  "address": "456 Tech Blvd",
  "city": "San Francisco",
  "state": "CA",
  "country": "USA",
  "zipCode": "94105"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

---

#### Get Company by ID
**GET** `/api/crm/companies/{id}`

---

#### Update Company
**PUT** `/api/crm/companies/{id}`

**Request Body:**
```json
{
  "website": "https://newacme.com",
  "industry": "FinTech"
}
```

---

#### Delete Company
**DELETE** `/api/crm/companies/{id}`

---

### Pipelines Management

#### List All Pipelines
**GET** `/api/crm/pipelines`

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Sales Pipeline",
    "description": "Main sales process",
    "tenantId": 1
  }
]
```

---

#### Create Pipeline with Stages
**POST** `/api/crm/pipelines`

**Request Body:**
```json
{
  "pipeline": {
    "title": "Sales Pipeline",
    "description": "Main sales process"
  },
  "stages": [
    {
      "title": "Prospecting",
      "order": 1
    },
    {
      "title": "Qualification",
      "order": 2
    },
    {
      "title": "Proposal",
      "order": 3
    },
    {
      "title": "Closed Won",
      "order": 4
    }
  ]
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Sales Pipeline",
  "description": "Main sales process",
  "tenantId": 1,
  "stages": [
    {
      "id": 1,
      "title": "Prospecting",
      "order": 1,
      "pipelineId": 1
    }
  ]
}
```

---

#### Get Pipeline by ID
**GET** `/api/crm/pipelines/{id}`

---

#### Update Pipeline
**PUT** `/api/crm/pipelines/{id}`

**Request Body:**
```json
{
  "description": "Updated sales process"
}
```

---

#### Delete Pipeline
**DELETE** `/api/crm/pipelines/{id}`

---

### Deals Management

#### List All Deals
**GET** `/api/crm/deals`

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Enterprise Software Deal",
    "value": 50000,
    "status": "open",
    "contactId": 1,
    "companyId": 1,
    "pipelineId": 1,
    "stageId": 2,
    "tenantId": 1
  }
]
```

---

#### Create Deal (Basic) - RECOMMENDED
**POST** `/api/crm/deals`

**Request Body:**
```json
{
  "title": "Enterprise Software Deal",
  "value": 50000,
  "status": "open",
  "probability": 75,
  "expectedCloseDate": "2025-12-31"
}
```

✅ **This version works without any dependencies!**

---

#### Create Deal (With References)
**POST** `/api/crm/deals`

⚠️ **IMPORTANT:** Create these resources FIRST before referencing them:
- Create a Contact (to get `contactId`)
- Create a Company (to get `companyId`)
- Create a Pipeline (to get `pipelineId` and `stageId`)

**Request Body:**
```json
{
  "title": "Enterprise Software Deal",
  "value": 50000,
  "status": "open",
  "contactId": 1,
  "companyId": 1,
  "pipelineId": 1,
  "stageId": 2,
  "expectedCloseDate": "2025-12-31",
  "probability": 75,
  "description": "Large enterprise software implementation"
}
```

**Note:** Replace the IDs with actual values from your created resources.

**Response (201):**
```json
{
  "id": 1,
  "title": "Enterprise Software Deal",
  "value": 50000,
  "status": "open",
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

---

#### Get Deal by ID
**GET** `/api/crm/deals/{id}`

---

#### Update Deal
**PUT** `/api/crm/deals/{id}`

**Request Body:**
```json
{
  "value": 75000,
  "stageId": 3,
  "probability": 85
}
```

---

#### Delete Deal
**DELETE** `/api/crm/deals/{id}`

---

### Activities Management

#### List All Activities
**GET** `/api/crm/activities`

**Response (200):**
```json
[
  {
    "id": 1,
    "type": "meeting",
    "subject": "Product Demo",
    "description": "Demo of enterprise features",
    "userId": 1,
    "contactId": 1,
    "dealId": 1,
    "scheduledAt": "2025-10-26T14:00:00.000Z",
    "tenantId": 1
  }
]
```

---

#### Create Activity (Basic) - RECOMMENDED
**POST** `/api/crm/activities`

**Request Body:**
```json
{
  "type": "meeting",
  "subject": "Product Demo",
  "description": "Demo of enterprise features",
  "scheduledAt": "2025-10-26T14:00:00.000Z",
  "duration": 60,
  "location": "Zoom",
  "status": "scheduled"
}
```

✅ **This version works without any dependencies!**

---

#### Create Activity (With References)
**POST** `/api/crm/activities`

⚠️ **IMPORTANT:** Create Contact and Deal first if you want to reference them.

**Request Body:**
```json
{
  "type": "meeting",
  "subject": "Product Demo",
  "description": "Demo of enterprise features",
  "contactId": 1,
  "dealId": 1,
  "scheduledAt": "2025-10-26T14:00:00.000Z",
  "duration": 60,
  "location": "Zoom",
  "status": "scheduled"
}
```

**Note:** Replace the IDs with actual values from your created resources.

**Response (201):**
```json
{
  "id": 1,
  "type": "meeting",
  "subject": "Product Demo",
  "userId": 1,
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

---

#### Get Activity by ID
**GET** `/api/crm/activities/{id}`

---

#### Update Activity
**PUT** `/api/crm/activities/{id}`

**Request Body:**
```json
{
  "description": "Updated demo agenda",
  "status": "completed"
}
```

---

#### Delete Activity
**DELETE** `/api/crm/activities/{id}`

---

### Products Management

#### List All Products
**GET** `/api/crm/products`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Enterprise Plan",
    "title": "Enterprise Plan",
    "sku": "ENT-001",
    "salePrice": 999.99,
    "costPrice": 500.00,
    "tenantId": 1
  }
]
```

---

#### Create Product
**POST** `/api/crm/products`

**Request Body:**
```json
{
  "name": "Enterprise Plan",
  "title": "Enterprise Plan",
  "sku": "ENT-001",
  "description": "Full enterprise features",
  "salePrice": 999.99,
  "costPrice": 500.00,
  "category": "Software",
  "isActive": true,
  "stockQuantity": 100
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Enterprise Plan",
  "title": "Enterprise Plan",
  "sku": "ENT-001",
  "salePrice": 999.99,
  "tenantId": 1,
  "createdAt": "2025-10-25T10:00:00.000Z"
}
```

---

#### Get Product by ID
**GET** `/api/crm/products/{id}`

---

#### Update Product
**PUT** `/api/crm/products/{id}`

**Request Body:**
```json
{
  "salePrice": 1099.99,
  "stockQuantity": 150
}
```

---

#### Delete Product
**DELETE** `/api/crm/products/{id}`

---

### Users Management

#### List All Users (Tenant-Scoped)
**GET** `/api/crm/users`

**Response (200):**
```json
[
  {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "tenantId": 1,
    "isActive": true
  }
]
```

---

#### Get User by ID
**GET** `/api/crm/users/{id}`

**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "tenantId": 1,
  "isActive": true,
  "createdAt": "2025-10-25T09:00:00.000Z"
}
```

---

## Finance Module Endpoints (Not Yet Implemented)

⚠️ **Note:** Finance module requires database schemas to be created before these endpoints will work.

### Customers
- **GET** `/api/finance/customers` - List all customers
- **POST** `/api/finance/customers` - Create customer
- **GET** `/api/finance/customers/{id}` - Get customer
- **PUT** `/api/finance/customers/{id}` - Update customer
- **DELETE** `/api/finance/customers/{id}` - Delete customer

**Sample Customer Payload:**
```json
{
  "name": "Client Corp",
  "email": "billing@clientcorp.com",
  "phone": "+1234567890",
  "address": "789 Client St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "taxId": "12-3456789"
}
```

---

### Invoices
- **GET** `/api/finance/invoices` - List all invoices
- **POST** `/api/finance/invoices` - Create invoice
- **GET** `/api/finance/invoices/{id}` - Get invoice
- **PUT** `/api/finance/invoices/{id}` - Update invoice
- **DELETE** `/api/finance/invoices/{id}` - Delete invoice

**Sample Invoice Payload:**
```json
{
  "invoiceNumber": "INV-2025-001",
  "customerId": 1,
  "issueDate": "2025-10-25",
  "dueDate": "2025-11-25",
  "status": "draft",
  "subtotal": 1000.00,
  "taxAmount": 100.00,
  "totalAmount": 1100.00,
  "currency": "USD",
  "notes": "Payment terms: Net 30"
}
```

---

### Expenses
- **GET** `/api/finance/expenses` - List all expenses
- **POST** `/api/finance/expenses` - Create expense
- **GET** `/api/finance/expenses/{id}` - Get expense
- **PUT** `/api/finance/expenses/{id}` - Update expense
- **DELETE** `/api/finance/expenses/{id}` - Delete expense

**Sample Expense Payload:**
```json
{
  "expenseNumber": "EXP-2025-001",
  "categoryId": 1,
  "vendorId": 1,
  "amount": 250.00,
  "expenseDate": "2025-10-25",
  "description": "Office supplies",
  "status": "pending",
  "paymentMethod": "credit_card"
}
```

---

## HR Module Endpoints (Not Yet Implemented)

⚠️ **Note:** HR module requires database schemas to be created before these endpoints will work.

### Employees
- **GET** `/api/hr/employees` - List all employees
- **POST** `/api/hr/employees` - Create employee
- **GET** `/api/hr/employees/{id}` - Get employee
- **PUT** `/api/hr/employees/{id}` - Update employee
- **DELETE** `/api/hr/employees/{id}` - Delete employee

**Sample Employee Payload:**
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah@company.com",
  "phone": "+1234567890",
  "departmentId": 1,
  "positionId": 1,
  "hireDate": "2025-01-15",
  "salary": 75000,
  "employmentType": "full-time",
  "status": "active"
}
```

---

### Departments
- **GET** `/api/hr/departments` - List all departments
- **POST** `/api/hr/departments` - Create department
- **GET** `/api/hr/departments/{id}` - Get department
- **PUT** `/api/hr/departments/{id}` - Update department
- **DELETE** `/api/hr/departments/{id}` - Delete department

**Sample Department Payload:**
```json
{
  "name": "Engineering",
  "description": "Software development team",
  "managerId": 1,
  "budget": 500000,
  "location": "San Francisco"
}
```

---

### Leave Requests
- **GET** `/api/hr/leave-requests` - List all leave requests
- **POST** `/api/hr/leave-requests` - Create leave request
- **GET** `/api/hr/leave-requests/{id}` - Get leave request
- **PUT** `/api/hr/leave-requests/{id}` - Update leave request
- **DELETE** `/api/hr/leave-requests/{id}` - Delete leave request

**Sample Leave Request Payload:**
```json
{
  "employeeId": 1,
  "leaveType": "vacation",
  "startDate": "2025-12-20",
  "endDate": "2025-12-27",
  "reason": "Year-end vacation",
  "status": "pending"
}
```

---

## Postman Environment Variables

Create these variables in Postman for easier testing:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `baseUrl` | API base URL | `http://localhost:5000` |
| `accessToken` | JWT access token | `eyJhbGciOiJIUzI1NiIs...` |
| `tenantId` | Your tenant ID | `1` |
| `userId` | Your user ID | `1` |
| `contactId` | Test contact ID | `1` |
| `companyId` | Test company ID | `1` |
| `dealId` | Test deal ID | `1` |

---

## Testing Workflow

### Option 1: Quick Testing (No Dependencies)
1. **Register/Login** to get your access token and tenant ID
2. Create Contact (without company)
3. Create Deal (basic version)
4. Create Activity (basic version)
5. Create Product
6. Test CRUD operations

### Option 2: Full Testing (With Relationships)
1. **Register/Login** to get your access token and tenant ID
2. **Create test data IN THIS EXACT ORDER:**
   - ✅ Create Company (save the `id` from response)
   - ✅ Create Contact with `companyId` from step above
   - ✅ Create Pipeline with stages (save `pipelineId` and `stageId`)
   - ✅ Create Deal with `contactId`, `companyId`, `pipelineId`
   - ✅ Create Activity with `contactId` and `dealId`
   - ✅ Create Product
3. **Test CRUD operations** for each entity
4. **Clean up** by deleting test data (in reverse order)

### Common Testing Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Foreign key constraint violated` | Referenced resource doesn't exist | Create parent resource first |
| `Invalid or expired token` | Token expired (15 min) | Register a new user or refresh token |
| `User already exists` | Duplicate email | Use a different email address |
| `Access token required` | Missing Authorization header | Add `Authorization: Bearer TOKEN` |

---

## Common Error Responses

**401 Unauthorized:**
```json
{
  "error": "Invalid token"
}
```

**400 Bad Request:**
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `500` - Internal Server Error
