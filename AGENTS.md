# AGENTS.md - Agent Instructions for TeaShop

## Project Overview

TeaShop is a POS management system for tea/coffee shops. Full-stack TypeScript application with React frontend and Express.js backend.

## Project Structure

```
teashop/
├── .env / .env.example      # Environment variables
├── docker-compose.yml        # 3 services: client, server, database
├── client/                   # React + Vite + Tailwind + DaisyUI
│   ├── src/
│   │   ├── api/              # Axios instance (axios.ts)
│   │   ├── assets/           # Static assets (hero.png, icons)
│   │   ├── components/
│   │   │   ├── Layout/       # DashboardLayout, Sidebar
│   │   │   ├── ui/           # Badge, ConfirmDialog, DataTable, EmptyState, FormField, LoadingState, Modal, Skeleton, StatCard
│   │   │   ├── Pagination.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ManagerRoute.tsx
│   │   ├── contexts/         # AuthContext, ToastContext
│   │   ├── hooks/            # usePagination
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── staff/        # Dashboard, CreateOrder, OrderHistory, AttendanceHistory, Profile
│   │   │   └── manager/      # Dashboard, MenuManagement, InventoryManagement, AccountManagement, AttendanceManagement, Reports
│   │   └── types/            # TypeScript interfaces (index.ts)
│   └── package.json
└── server/                   # Express + Mongoose
    ├── src/
    │   ├── config/           # database.ts, session.ts
    │   ├── middleware/        # auth.ts, errorHandler.ts
    │   ├── models/           # Attendance, Ingredient, Order, Product, User
    │   ├── routes/           # attendance, auth, inventory, menu, orders
    │   ├── types/            # express-session.d.ts
    │   └── utils/            # calculateOrderTotal.ts, updateInventoryOnOrder.ts
    ├── seed.ts               # Database seeding script
    └── package.json
```

## Key Files

| File | Purpose |
|------|---------|
| `server/src/utils/calculateOrderTotal.ts` | Calculate order total |
| `server/src/utils/updateInventoryOnOrder.ts` | Deduct inventory on order |
| `server/src/routes/orders.ts` | Orders API endpoints |
| `client/src/pages/staff/CreateOrder.tsx` | POS page |
| `client/src/pages/staff/OrderHistory.tsx` | Order history page |

## Development Commands

```bash
# Server
cd server
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run seed         # Seed database

# Client
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production

# Docker
docker compose up    # Start all services
docker compose down  # Stop all services
```

## Code Conventions

- TypeScript strict mode
- DaisyUI components (btn, card, table, modal, badge, etc.)
- Session-based auth (cookies, withCredentials)
- RESTful API design
- Conventional commits format

## Git Branches

- `main` - Main branch
- `bugs-fixed` - Bug fixes branch
- `feature/heroui-migration` - HeroUI migration feature
- `feature/ui-redesign` - UI redesign feature
