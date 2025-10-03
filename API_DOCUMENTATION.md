# EpesiCRM API Documentation

## Overview

EpesiCRM provides a comprehensive API-first, microservice architecture that allows standalone usage of all business entities without requiring the dashboard interface.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All API requests require the following headers:
- `X-Tenant-Id`: Tenant identifier (number)
- `X-User-Id`: User identifier (number, optional for development)
- `X-User-Role`: User role (string, optional for development)

## API Endpoints

### Deals API (`/api/deals`)

Complete CRUD operations for deals management.

#### GET /api/deals
Get all deals for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/deals
```

#### GET /api/deals/:id
Get specific deal by ID.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/deals/1
```

#### POST /api/deals
Create a new deal.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"title":"New Deal","value":"10000","contactId":1,"stageId":1}' \
  http://localhost:5000/api/deals
```

#### PUT /api/deals/:id
Update an existing deal.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"title":"Updated Deal","value":"15000"}' \
  http://localhost:5000/api/deals/1
```

#### DELETE /api/deals/:id
Delete a deal.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/deals/1
```

#### GET /api/deals/pipeline/:pipelineId
Get deals for specific pipeline.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/deals/pipeline/1
```

#### GET /api/deals/stage/:stageId
Get deals for specific stage.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/deals/stage/1
```

#### PUT /api/deals/:id/stage
Move deal to different stage.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"stageId":2}' \
  http://localhost:5000/api/deals/1/stage
```

### Contacts API (`/api/contacts`)

Contact management with search and filtering capabilities.

#### GET /api/contacts
Get all contacts for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/contacts
```

#### GET /api/contacts/:id
Get specific contact by ID.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/contacts/1
```

#### POST /api/contacts
Create a new contact.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com"}' \
  http://localhost:5000/api/contacts
```

#### PUT /api/contacts/:id
Update an existing contact.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith"}' \
  http://localhost:5000/api/contacts/1
```

#### DELETE /api/contacts/:id
Delete a contact.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/contacts/1
```

#### GET /api/contacts/company/:companyId
Get contacts for specific company.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/contacts/company/1
```

#### GET /api/contacts/search/:query
Search contacts by name or email.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/contacts/search/john
```

### Activities API (`/api/activities`)

Activity tracking and management.

#### GET /api/activities
Get all activities for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/activities
```

#### GET /api/activities/:id
Get specific activity by ID.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/activities/1
```

#### POST /api/activities
Create a new activity.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"type":"call","subject":"Follow up call","contactId":1}' \
  http://localhost:5000/api/activities
```

#### PUT /api/activities/:id
Update an existing activity.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"subject":"Updated call notes"}' \
  http://localhost:5000/api/activities/1
```

#### DELETE /api/activities/:id
Delete an activity.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/activities/1
```

#### GET /api/activities/contact/:contactId
Get activities for specific contact.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/activities/contact/1
```

#### GET /api/activities/deal/:dealId
Get activities for specific deal.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/activities/deal/1
```

### Pipelines API (`/api/pipelines`)

Sales pipeline and stage management.

#### GET /api/pipelines
Get all sales pipelines for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/pipelines
```

#### GET /api/pipelines/:id
Get specific pipeline with stages.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/pipelines/1
```

#### POST /api/pipelines
Create a new sales pipeline.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"title":"New Pipeline","description":"Custom sales process"}' \
  http://localhost:5000/api/pipelines
```

#### PUT /api/pipelines/:id
Update an existing pipeline.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"title":"Updated Pipeline"}' \
  http://localhost:5000/api/pipelines/1
```

#### DELETE /api/pipelines/:id
Delete a pipeline.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/pipelines/1
```

#### GET /api/pipelines/:id/stages
Get stages for specific pipeline.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/pipelines/1/stages
```

### Companies API (`/api/companies`)

Company management and search.

#### GET /api/companies
Get all companies for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/companies
```

#### GET /api/companies/:id
Get specific company by ID.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/companies/1
```

#### POST /api/companies
Create a new company.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"name":"Acme Corp","industry":"Technology","website":"acme.com"}' \
  http://localhost:5000/api/companies
```

#### PUT /api/companies/:id
Update an existing company.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"name":"Acme Corporation","phone":"555-0123"}' \
  http://localhost:5000/api/companies/1
```

#### DELETE /api/companies/:id
Delete a company.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/companies/1
```

#### GET /api/companies/search/:query
Search companies by name.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/companies/search/acme
```

### Products API (`/api/products`)

Product catalog management.

#### GET /api/products
Get all products for the tenant.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/products
```

#### GET /api/products/:id
Get specific product by ID.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/products/1
```

#### POST /api/products
Create a new product.
```bash
curl -X POST -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"name":"Widget","title":"Premium Widget","salePrice":"99.99"}' \
  http://localhost:5000/api/products
```

#### PUT /api/products/:id
Update an existing product.
```bash
curl -X PUT -H "X-Tenant-Id: 1" -H "Content-Type: application/json" \
  -d '{"salePrice":"109.99","description":"Updated description"}' \
  http://localhost:5000/api/products/1
```

#### DELETE /api/products/:id
Delete a product.
```bash
curl -X DELETE -H "X-Tenant-Id: 1" http://localhost:5000/api/products/1
```

#### GET /api/products/search/:query
Search products by name or title.
```bash
curl -H "X-Tenant-Id: 1" http://localhost:5000/api/products/search/widget
```

## Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "id": 1,
  "title": "Deal Title",
  "value": "10000",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Multi-Tenant Support

All APIs automatically filter data by tenant using the `X-Tenant-Id` header. Each tenant's data is completely isolated from other tenants.

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting per tenant/user.

## Changelog

### 2024-01-02
- **Microservice Architecture**: Implemented complete microservice architecture
- **API-First Design**: All entities now have dedicated API endpoints
- **Standalone Usage**: APIs can be used independently without dashboard
- **REST Compliance**: Proper REST endpoint naming (`/deals` instead of `/all-deals`)
- **Enhanced Filtering**: Advanced filtering capabilities for all entities