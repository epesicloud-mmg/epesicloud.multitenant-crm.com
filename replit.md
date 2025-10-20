# EpesiCRM - Multi-Tenant CRM Platform

## Overview

EpesiCRM is a dedicated multi-tenant Customer Relationship Management (CRM) platform built with modern web technologies. The application provides JWT-based authentication, role-based access control, sales pipeline management with 8 predefined stages, and AI-powered insights for businesses to manage their customer relationships effectively.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter with nested routing
  - Landing Page: `/` (CRM marketing landing page)
  - Authentication: `/login`, `/register` (JWT-based authentication)
  - CRM Application: `/crm/*` (complete CRM functionality, protected routes)
- **Application Structure**: 
  - `client/src/pages/` - Public pages (landing, login, register)
  - `client/src/modules/crm/` - CRM module components and pages
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with access and refresh tokens
  - **Centralized Authentication**: All CRM API routes protected via `authenticateToken` middleware applied at the CRM router level
  - **Tenant Context**: `req.tenantId` and `req.userId` automatically extracted from JWT token and set on all authenticated requests
- **Authorization**: Role-based access control (RBAC) with permission middleware
- **API Structure**: RESTful APIs for CRM entities
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless database
- **AI Integration**: Google Gemini AI for intelligent insights and recommendations

### CRM API Structure
#### Authentication APIs
- **Auth API**: `/api/auth` - Registration, login, token refresh endpoints

#### CRM Entity APIs
- **Deals API**: `/api/deals` - Complete CRUD operations for deals management
- **Contacts API**: `/api/contacts` - Contact management with search and filtering
- **Activities API**: `/api/activities` - Activity tracking and management
- **Pipelines API**: `/api/pipelines` - Sales pipeline and stage management (8 predefined stages with is_default flag)
- **Companies API**: `/api/companies` - Company management and search
- **Products API**: `/api/products` - Product catalog management with variations
- **Sales Stages API**: `/api/sales-stages` - Pipeline stage management
- **Payments API**: `/api/payments` - Payment collection, payment plans, and payment history (11 endpoints)
- **Commissions API**: `/api/commissions` - Commission creation, 4-stage approval workflow, and reporting (12 endpoints)

### Multi-Tenant Design
- **Tenant Isolation**: Each tenant has separate data through tenant_id columns
- **Subdomain/Header-based**: Tenant identification via X-Tenant-Id header (production would use subdomains)
- **Data Segregation**: All database queries are automatically filtered by tenant context

## Key Components

### Role-Based Access Control (RBAC)
- **Hierarchical Roles**: Super Admin > Sales Manager > Supervisor > Agent
- **Permission System**: Granular permissions for different actions (manage_users, view_reports, etc.)
- **Data Scoping**: Users can only access data within their permission scope (own, team, or all data)
- **Dynamic Role Switching**: Development feature for testing different permission levels

### Database Schema
- **Core Entities**: Tenants, Users, Roles, Companies, Contacts, Leads, Deals, Activities, Products
- **Payment Entities**: Payment Plans, Payments (with status tracking: pending, completed, failed, refunded)
- **Commission Entities**: Commission Statuses, Commissions, Commission Items (with 4-stage workflow: pending→verified→approved→paid)
- **Relationships**: Proper foreign key relationships with cascading rules
- **Audit Fields**: Created/updated timestamps on all entities
- **Hierarchical Users**: Manager-subordinate relationships for organizational structure

### AI-Powered Features
- **Dashboard Insights**: Revenue predictions, deal scoring, opportunity identification
- **Contact Intelligence**: Lead scoring, engagement recommendations
- **Deal Analysis**: Risk assessment, close probability predictions
- **Intelligent Summaries**: AI-generated summaries of CRM data
- **Floating AI Control Box**: Comprehensive AI services with 6 interactive modals (Forecast, Anomalies, Actions, Insights, Reports, Optimize)
- **Floating AI Orb**: Context-aware AI assistant accessible on all pages via floating orb that opens as off-canvas panel
- **Context-Aware AI**: AI assistant understands current page, recent user actions, and provides relevant suggestions
- **PostHog-Style Event Tracking**: Comprehensive behavioral analytics with flexible JSONB properties
- **Predictive Analytics**: AI-powered forecasting, anomaly detection, and business optimization recommendations

### API Structure - Microservice Architecture
- **RESTful Design**: Standard HTTP methods with consistent response formats
- **Microservice Modules**: Each entity has its own dedicated API module
- **Authentication Middleware**: Mock authentication system (headers-based for development)
- **Permission Middleware**: Route-level permission checks based on user roles
- **Data Filtering**: Automatic tenant and permission-based data filtering
- **Standalone APIs**: Each microservice can operate independently

## Data Flow

1. **Client Request**: React components make API calls using TanStack Query
2. **Authentication**: Express middleware validates user identity and role
3. **Permission Check**: Route-specific permission validation
4. **Data Access**: Drizzle ORM queries with automatic tenant filtering
5. **Response**: JSON data returned to client with proper error handling

### AI Data Flow
1. **Data Collection**: Aggregated CRM data (deals, contacts, activities)
2. **AI Processing**: Google Gemini API analyzes patterns and generates insights
3. **Insight Generation**: AI creates actionable recommendations and predictions
4. **Client Display**: Insights presented in dashboard and modal interfaces

## Documentation

### Database Documentation
- **DB_README.md**: Comprehensive documentation of all 14 database tables
- **Schema Reference**: Complete table structures, relationships, and data flow
- **Multi-Tenant Design**: Details on tenant isolation and security patterns
- **Performance Guide**: Indexing strategy and query optimization notes

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **@google/genai**: Google Gemini AI integration
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: UI component primitives
- **react-hook-form**: Form handling with validation
- **zod**: Schema validation
- **recharts**: Data visualization charts

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production build bundling
- **tailwindcss**: CSS framework
- **@replit/***: Replit-specific development tools

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon serverless PostgreSQL with migrations
- **Environment**: NODE_ENV=development with tsx for TypeScript execution

### Production
- **Build Process**: 
  1. Vite builds React frontend to `dist/public`
  2. esbuild bundles Express server to `dist/index.js`
- **Startup**: Node.js serves static files and API from single process
- **Database**: Production Neon database with connection pooling
- **Environment Variables**: DATABASE_URL, GEMINI_API_KEY required

### Recent Development Progress (2025)
- **Frontend-Backend Integration**: Complete CRUD operations working for all CRM entities
- **API Testing**: All endpoints tested and verified working (companies, contacts, products, deals, activities)
- **Form Validation**: Enhanced form schemas and error handling across all entity creation forms
- **Modal System**: Component modals integrated with proper API calls
- **Data Flow**: TanStack Query mutations and cache invalidation working correctly
- **Authentication**: JWT-based authentication with access and refresh tokens
- **Setup Module**: Complete management of sales stages, pipelines, interest levels, activity types, and products

### Latest Features (October 2025)
- **CRM-Only Platform**: Transformed from multi-module to dedicated CRM application
- **Landing Page**: Professional CRM marketing page with features and benefits
- **Authentication Flow**: JWT-based login and registration with token management
- **Protected Routes**: CRM dashboard accessible only after authentication
- **Multi-Chat AI Assistant**: Enhanced floating AI orb with multiple conversation support
- **Enhanced Event Tracking**: Added old_data and new_data fields to event_logs for comprehensive change tracking
- **Pipeline Kanban View**: Full 6-stage pipeline view with drag-and-drop functionality
- **Global Search**: Sectioned autocomplete search across contacts, deals, companies, activities
- **Complete CRUD Functionality**: All entity buttons now have actual functionality
  - CRM: Contacts, Companies, Deals, Activities with comprehensive forms
  - Setup: Sales Stages, Interest Levels, Pipelines, Activity Types, Products
  - Advanced filtering and search capabilities
- **Payment Collection Module** (October 20, 2025):
  - Payment Plans: Create and manage installment plans with schedules
  - Collect Payment: Record payments with method tracking, bank details, and transaction references
  - Payment History: View all payment transactions with status filtering and search
  - 11 API endpoints for complete payment workflow management
- **Commission Tracking Module** (October 20, 2025):
  - New Commission: Create commissions with multiple line items and product associations
  - 4-Stage Approval Workflow: pending → verified → approved → paid with timestamp tracking
  - Pending Approval: Review and manage commissions awaiting approval with status updates
  - Commission Reports: Comprehensive reporting with search, filtering, and analytics
  - 12 API endpoints for complete commission lifecycle management
- **Production-Ready Demo Data Seeding** (October 20, 2025):
  - Idempotent seeding script: `scripts/seed-demo-data.ts` safely creates or reuses tenant/user/pipeline
  - Complete demo tenant: "Comfort Urban Residence" with realistic real estate data
  - 4 property products: Studio (1.9M), 1 Bed (2.95M), 2 Bed Convertible (9M), 3 Bed Premium (11M)
  - 7-stage sales pipeline: Lead Generation → Qualification → Site Visit → Negotiation → Reservation → Documentation → Handover
  - 15 contacts, 8 companies, 12 deals distributed across pipeline stages
  - All setup tables populated: 10 lead sources, 13 activity types, 4 customer types, 4 meeting types, 4 payment methods
  - Demo credentials: hello@epesicloud.com / Hello123???
  - Foreign key integrity verified: All products linked to pipeline, all deals linked to users and products
- **Unified Professional Sidebar**: All CRM pages now use ProfessionalSidebar component
  - Consistent navigation across all pages
  - Products menu with submenu: All Products, Product Types, Categories, Offers & Deals
  - Setup menu with submenu: Activity Types, Sales Pipelines, Sales Stages, Interest Levels
  - Collapsible sidebar with persistent state
  - MainLayout and CRMLayout both use ProfessionalSidebar for consistency
- **Product Setup Configuration Modal** (October 7, 2025):
  - Comprehensive product creation and editing form with "Product" terminology
  - Sale price field with decimal validation and proper backend type conversion
  - Support for sales pipeline assignment, categories, and product types
  - File upload areas for product images (4 upload slots)
  - Product description, title, and marketing fields
  - Both create and edit modes with proper form reset behavior
  - Integrated into Products Setup page replacing legacy form

### Key Architectural Decisions

#### Database Choice: PostgreSQL with Drizzle
- **Problem**: Need for type-safe database operations with multi-tenant support
- **Solution**: Drizzle ORM provides excellent TypeScript integration and migration support
- **Benefits**: Type safety, excellent performance, easy tenant isolation
- **Trade-offs**: Learning curve compared to simpler ORMs

#### Frontend State Management: TanStack Query
- **Problem**: Complex server state management with caching and synchronization
- **Solution**: TanStack Query handles server state, caching, and background updates
- **Benefits**: Automatic caching, optimistic updates, background refetching
- **Trade-offs**: Additional complexity for simple use cases

#### AI Integration: Google Gemini
- **Problem**: Need for intelligent insights and recommendations
- **Solution**: Google Gemini API for natural language processing and analysis
- **Benefits**: Advanced AI capabilities, cost-effective, reliable service
- **Trade-offs**: External dependency, API rate limits

#### Multi-Tenancy: Shared Database with Tenant ID
- **Problem**: Need to isolate data for different organizations
- **Solution**: Single database with tenant_id column on all tables
- **Benefits**: Cost-effective, easier maintenance, shared resources
- **Trade-offs**: Requires careful query filtering, potential data leakage risks

The application follows modern full-stack development practices with emphasis on type safety, developer experience, and scalable architecture patterns suitable for a multi-tenant SaaS application.