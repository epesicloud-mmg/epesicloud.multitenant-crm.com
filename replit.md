# EpesiCRM - Multi-Tenant CRM Platform

## Overview

EpesiCRM is a comprehensive multi-tenant Customer Relationship Management (CRM) platform built with modern web technologies. The application provides role-based access control, sales pipeline management, and AI-powered insights for businesses to manage their customer relationships effectively.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Multi-module routing with Wouter
  - Module Selector: `/` (landing page for module selection)
  - CRM Module: `/crm/*` (complete CRM functionality)
  - Finance Module: `/finance/*` (financial management)
- **Module Structure**: Self-contained modules with lazy loading
  - `client/src/modules/crm/` - CRM module components and pages
  - `client/src/modules/finance/` - Finance module components and pages
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture - Multi-Module Microservices
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Architecture**: Multi-module microservice architecture
  - Module-level APIs: `/api/crm`, `/api/finance` with organized sub-routes
  - Individual microservices: Backward-compatible direct API access
  - Module isolation: Each module can scale independently
- **Module Structure**: 
  - `server/modules/crm/` - CRM module APIs and services
  - `server/modules/finance/` - Finance module APIs and services
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Neon serverless database
- **AI Integration**: Google Gemini AI for intelligent insights and recommendations

### Multi-Module Microservice Architecture
#### Module API Structure
- **CRM Module API**: `/api/crm` - Aggregated CRM services and health checks
- **Finance Module API**: `/api/finance` - Financial services and reporting endpoints
- **Module Health**: Each module provides `/health` and `/stats` endpoints

#### Individual Microservice APIs (Backward Compatible)
- **Deals API**: `/api/deals` - Complete CRUD operations for deals management
- **Contacts API**: `/api/contacts` - Contact management with search and filtering
- **Activities API**: `/api/activities` - Activity tracking and management
- **Pipelines API**: `/api/pipelines` - Sales pipeline and stage management
- **Companies API**: `/api/companies` - Company management and search
- **Products API**: `/api/products` - Product catalog management
- **Standalone Usage**: All APIs can be used independently without the dashboard

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

### Recent Development Progress (January 2025)
- **Frontend-Backend Integration**: Complete CRUD operations working for all entities
- **API Testing**: All endpoints tested and verified working (companies, contacts, products, deals)
- **Form Validation**: Enhanced form schemas and error handling across all entity creation forms
- **Modal System**: NewContactModal component integrated with proper API calls
- **Data Flow**: TanStack Query mutations and cache invalidation working correctly
- **Authentication**: Mock authentication system with proper headers working
- **Bills Module Enhancement**: Upgraded from mock data to full API integration with create/edit/delete operations
- **Tasks Module Enhancement**: Complete CRUD functionality with API integration and create dialog forms
- **Data Manager Integration**: Universal entity management with search, edit, and delete across all record types

### Latest Features (August 2025)
- **Complete 6-Module Platform**: Full implementation of all business modules
  - **CRM Module**: Complete customer relationship management with deals, contacts, companies
  - **Finance Module**: Financial management with budgets, expenses, invoices
  - **Projects & Workflows Module**: Task management, project tracking, and workflow automation
  - **HR Module**: Human resources management with employee records and payroll
  - **AI & Analytics Module**: AI-driven analytics and business intelligence features
  - **AAM Module**: Advanced Access Manager with user/role management and permissions
- **Rebranding to Epesicloud**: Platform renamed from EpesiCRM to Epesicloud
- **Simplified Module Selector**: Clean interface showing only module names and icons
- **Multi-Module Microservice Architecture**: Each module with independent frontend/backend/API structure
- **Comprehensive API Routes**: All modules mounted under /api/[module] with health checks and stats
- **Database Schema**: Complete multi-tenant database with role permissions and user management tables
- **Multi-Chat AI Assistant**: Enhanced floating AI orb with multiple conversation support
- **Enhanced Event Tracking**: Added old_data and new_data fields to event_logs for comprehensive change tracking
- **Pipeline Kanban View**: Full 6-stage pipeline view with drag-and-drop functionality
- **Global Search**: Sectioned autocomplete search across contacts, deals, companies, activities
- **Complete CRUD Functionality**: All entity buttons now have actual functionality instead of placeholders
  - Finance: Bills, Expenses, Invoices with full API integration
  - CRM: Contacts, Companies, Deals, Activities with comprehensive forms
  - HR: Employee management with departments and positions
  - Workflows: Tasks and project management with status tracking
  - Universal Data Manager: Cross-module data access and management

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