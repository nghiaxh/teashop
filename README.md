# TeaShop POS Management System

![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-database-47A248?logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)

A modern Point of Sale (POS) management system for tea and coffee shops, built with React, Express.js, and MongoDB.

## Tech Stack

| Layer | Package | Version |
|-------|---------|---------|
| Language | TypeScript | 7.0.2 |
| Frontend | React | 19.2.7 |
| Router | React Router | 7.18.1 |
| Build | Vite | 8.1.5 |
| CSS | Tailwind CSS | 4.x |
| UI | HeroUI | 3.2.2 |
| Backend | Express | 5.2.1 |
| ODM | Mongoose | 9.8.0 |
| Auth | express-session | latest |
| Database | MongoDB | 8.x |
| Docker | Node.js | 24 |

## Features

### Staff
- Check-in/out attendance
- Create orders with size, toppings, sugar/ice levels
- View order history
- View attendance history

### Manager
- All staff features
- Menu management (CRUD)
- Inventory management
- Account management
- Attendance management (view all, edit)
- Revenue reports

## Quick Start

### Docker (Recommended)

```bash
docker compose up
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### Local Development

**Server:**
```bash
cd server
npm install
cp ../.env.example ../.env   # edit with your values
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

## Default Accounts

| Username | Password | Role |
|----------|----------|------|
| staff01 - staff15 | 123456 | Staff |
| manager01 - manager03 | 123456 | Manager |

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/register` - Register (Manager only)

### Menu
- `GET /api/menu` - Get products
- `POST /api/menu` - Create product (Manager)
- `PUT /api/menu/:id` - Update product (Manager)
- `DELETE /api/menu/:id` - Delete product (Manager)

### Inventory
- `GET /api/inventory` - Get ingredients
- `POST /api/inventory` - Create ingredient (Manager)
- `PUT /api/inventory/:id` - Update ingredient (Manager)

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (Manager)

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance` - Get attendance records
- `PUT /api/attendance/:id` - Update attendance (Manager)

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/teashop
SESSION_SECRET=teashop-secret-key-2026
PORT=5000
NODE_ENV=development
```
