# EpesiCRM - Multi-Tenant CRM Platform

### Overview
EpesiCRM is a multi-tenant Customer Relationship Management (CRM) platform designed to help businesses manage customer relationships efficiently. It features JWT-based authentication, role-based access control, sales pipeline management with predefined stages, and AI-powered insights. The platform aims to provide a comprehensive solution for managing deals, contacts, activities, and payments, with a strong focus on data segregation for each tenant.

### User Preferences
Preferred communication style: Simple, everyday language.

### System Architecture

#### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for navigation, including public pages and protected CRM routes.
- **State Management**: TanStack Query (React Query) for server state.
- **UI**: Radix UI primitives and shadcn/ui components, styled with Tailwind CSS.
- **Build**: Vite.

#### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript.
- **Authentication**: JWT-based with access and refresh tokens, centralizing protection for CRM API routes. Tenant and user IDs are extracted from JWT.
- **Authorization**: Role-based access control (RBAC) with granular permissions and data scoping.
- **Database**: PostgreSQL via Neon serverless database, managed with Drizzle ORM for type-safe operations.
- **AI Integration**: Google Gemini AI for intelligent insights.
- **Multi-Tenancy**: Data isolation achieved through `tenant_id` columns on all relevant tables, identified via an `X-Tenant-Id` header.

#### Key Features
- **CRM API Structure**: RESTful APIs for core CRM entities: Authentication, Deals, Contacts, Activities, Pipelines, Companies, Products, Sales Stages, Payments (11 endpoints), and Commissions (12 endpoints with a 4-stage approval workflow).
- **AI-Powered Features**: Dashboard insights (revenue predictions, deal scoring), contact intelligence, deal analysis, and intelligent summaries. A floating AI orb provides context-aware assistance and interactive modals for forecasting, anomalies, actions, insights, reports, and optimization.
- **Sales Pipeline Management**: Full Kanban view with drag-and-drop functionality for 6 stages.
- **Comprehensive CRUD**: Complete Create, Read, Update, Delete functionality for all CRM entities (Contacts, Companies, Deals, Activities, Products, Sales Stages, etc.).
- **Payment Collection Module**: Management of payment plans, recording payments, and history tracking.
- **Commission Tracking Module**: Creation, 4-stage approval workflow, and reporting for commissions.
- **Global Search**: Sectioned autocomplete search across key CRM entities.
- **Event Tracking**: PostHog-style behavioral analytics with `old_data` and `new_data` fields for comprehensive change tracking.

#### Architectural Decisions
- **Database**: PostgreSQL with Drizzle ORM for type safety and multi-tenant support.
- **Frontend State Management**: TanStack Query for efficient server state handling, caching, and synchronization.
- **AI Integration**: Google Gemini for advanced AI capabilities and insights.
- **Multi-Tenancy**: Shared database with tenant_id for cost-effectiveness and easier maintenance, requiring careful query filtering.

### External Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection.
- **@google/genai**: Google Gemini AI integration.
- **drizzle-orm**: Type-safe database ORM.
- **@tanstack/react-query**: Server state management.
- **@radix-ui/**: UI component primitives.
- **react-hook-form**: Form handling with validation.
- **zod**: Schema validation.
- **recharts**: Data visualization charts.
- **vite**: Build tool and development server.
- **tsx**: TypeScript execution for development.
- **esbuild**: Production build bundling.
- **tailwindcss**: CSS framework.