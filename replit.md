# SproutDrive - Mung Bean Sprout Business Management System

## Overview

SproutDrive is a cloud-based web application designed to manage medium-scale mung bean sprout business operations. The system replaces manual Excel-based tracking with a comprehensive solution for managing suppliers, planting cycles, inventory, customer orders, deliveries, and business analytics.

## Recent Changes (December 2025)

1. **Role Assignment Security**: Implemented first-user-becomes-owner logic where the first user to sign up gets owner role, subsequent users get staff role. Owner-only authorization added to role change endpoint.

2. **Owner Navigation**: Added "Deliveries" to owner navigation menu so owners have full access to all features including the delivery workflow.

3. **QueryClient Fix**: Fixed the TanStack Query client to properly handle queryKey arrays with object parameters (e.g., `['/api/orders', { date: today }]` now correctly builds URL as `/api/orders?date=2025-12-03` instead of `/api/orders/[object Object]`).

**Core Business Model:**
- Purchase mung beans and other produce from suppliers
- Plant mung beans on beds (6-day growth cycle from planting to harvest)
- Process daily orders from customers
- Manage delivery operations and cash collection
- Track analytics and predict demand for planning

**Target Users:**
- Owner/Admin: Full system access for business management
- Staff/Delivery: Limited access for delivery operations and order fulfillment

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type safety
- Vite as build tool and development server
- Wouter for client-side routing (lightweight React Router alternative)
- Single Page Application (SPA) architecture

**UI Component Library:**
- shadcn/ui components (New York style variant) built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Linear-inspired design system emphasizing functional clarity and information hierarchy
- Responsive mobile-first design for delivery staff

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks
- No global state management library (relying on React Query's cache)

**Key Design Decisions:**
- **Rationale:** shadcn/ui provides accessible, customizable components without runtime overhead
- **Alternatives Considered:** Material-UI, Chakra UI
- **Pros:** Better performance, smaller bundle size, full control over components
- **Cons:** More manual component management compared to full UI libraries

### Backend Architecture

**Server Framework:**
- Express.js REST API
- Node.js runtime with ES modules
- TypeScript for type safety across stack

**Database Layer:**
- Drizzle ORM for type-safe database queries
- PostgreSQL via Neon serverless database
- WebSocket connection pooling for serverless compatibility
- Schema-first approach with shared types between frontend/backend

**Authentication & Sessions:**
- Replit Auth (OpenID Connect) for user authentication
- Passport.js with custom OIDC strategy
- PostgreSQL-backed session storage (connect-pg-simple)
- Role-based access control (owner/admin vs staff/delivery)

**API Design:**
- RESTful endpoints organized by resource type
- Shared schema validation using Zod and drizzle-zod
- Consistent error handling with appropriate HTTP status codes
- Session-based authentication with secure cookies

**Key Design Decisions:**
- **Problem:** Need scalable authentication for multi-user system
- **Solution:** Replit Auth provides OAuth flow without custom user management
- **Alternatives:** Local auth with bcrypt, Auth0, Clerk
- **Pros:** Zero-config authentication, no password management burden
- **Cons:** Dependency on Replit platform

### Data Architecture

**Database Schema:**

Core tables:
- `users` - User accounts with role-based permissions
- `suppliers` - Supplier contact and business information
- `purchases` - Raw material procurement records
- `planting_batches` - Mung bean planting cycles with expected harvest dates
- `customers` - Customer profiles with delivery routes and pricing
- `orders` - Daily customer orders with bagging/delivery tracking
- `vans` - Delivery vehicle management with maintenance tracking
- `stock_items` - Inventory levels for raw materials and finished products
- `stock_transactions` - Audit trail for stock movements
- `settings` - Configurable business parameters (conversion ratios, growth cycles)
- `sessions` - User session persistence

**Key Relationships:**
- Orders → Customers (many-to-one)
- Purchases → Suppliers (many-to-one)
- Stock Transactions → Stock Items (many-to-one)
- All major entities include timestamps for audit trails

**Key Design Decisions:**
- **Problem:** Need to track 6-day planting cycle with demand forecasting
- **Solution:** Separate `planting_batches` table with calculated ready dates and configurable conversion ratios
- **Pros:** Flexible planning, supports what-if scenarios, historical tracking
- **Cons:** Requires date calculations and aggregations for forecasting

### External Dependencies

**Core Services:**
- **Neon Database** - Serverless PostgreSQL hosting
  - Purpose: Primary data storage with serverless WebSocket connections
  - Integration: Via `@neondatabase/serverless` driver with connection pooling

**Authentication:**
- **Replit Auth** - OAuth-based authentication service
  - Purpose: User authentication and session management
  - Integration: OpenID Connect with Passport.js strategy

**Development Tools:**
- **Replit Dev Tools** - Development environment plugins
  - Runtime error overlay
  - Cartographer (code navigation)
  - Dev banner for environment awareness

**UI & Visualization:**
- **Recharts** - Chart library for analytics dashboard
  - Purpose: Sales charts, product breakdowns, customer analytics
  - Components: Line charts, bar charts, pie charts

**Date Handling:**
- **date-fns** - Date utility library
  - Purpose: Date formatting, calculations for planting cycles
  - Used for: 6-day growth cycle calculations, date range filters

**Form Management:**
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation shared between client and server
- **@hookform/resolvers** - Zod integration for React Hook Form

**Key Design Decisions:**
- **Problem:** Need production-ready components without building from scratch
- **Solution:** shadcn/ui components provide copy-paste architecture with full customization
- **Alternatives:** Pre-built component libraries (MUI, Ant Design)
- **Pros:** No runtime dependency, full control, smaller bundle size
- **Cons:** More initial setup, manual updates for components