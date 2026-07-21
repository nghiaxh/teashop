# AGENTS.md - Agent Instructions for TeaShop

## Project Overview

TeaShop is a POS management system for tea/coffee shops. Full-stack TypeScript application with React frontend and Express.js backend.

## Project Structure

```
teashop/
├── docker-compose.yml        # 3 services: client, server, database
├── client/                   # React + Vite + Tailwind + DaisyUI
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # Auth context
│   │   ├── hooks/            # Custom hooks (usePagination)
│   │   ├── pages/            # Page components
│   │   │   ├── staff/        # Staff pages (Dashboard, CreateOrder, OrderHistory, AttendanceHistory)
│   │   │   └── manager/      # Manager pages (Dashboard, Menu, Inventory, Accounts, Attendance, Reports)
│   │   └── types/            # TypeScript interfaces
│   └── package.json
└── server/                   # Express + Mongoose
    ├── src/
    │   ├── config/           # Database, session config
    │   ├── middleware/        # Auth, error handler
    │   ├── models/           # Mongoose schemas
    │   ├── routes/           # API routes
    │   └── utils/            # Business logic (calculateOrderTotal, updateInventoryOnOrder)
    └── package.json
```

## Key Files

| File | Purpose |
|------|---------|
| `server/src/utils/calculateOrderTotal.ts` | **CR01 BUG** - Calculate order total |
| `server/src/utils/updateInventoryOnOrder.ts` | **CR02 BUG** - Deduct inventory |
| `server/src/routes/orders.ts` | **PR01 BUG** - Orders API (no pagination) |
| `client/src/pages/staff/CreateOrder.tsx` | **PR02 BUG** - POS page (no search/filter) |
| `client/src/pages/staff/OrderHistory.tsx` | **PR01 BUG** - Order history (no pagination) |

## Known Bugs (See NOTES.md)

1. **CR01** - Order total doesn't include topping prices
2. **CR02** - Inventory not adjusted by size multiplier
3. **PR01** - No pagination on order history
4. **PR02** - No search/filter on POS menu

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

- `main` - Main branch (contains bugs)
- `fix/cr01-topping-price` - Fix CR01
- `fix/cr02-size-inventory` - Fix CR02
- `fix/pr01-order-pagination` - Fix PR01
- `fix/pr02-menu-search` - Fix PR02
