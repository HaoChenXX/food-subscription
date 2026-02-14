# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a food subscription platform (食材包订阅平台) - a Chinese meal kit subscription e-commerce system with three user roles: customers, merchants, and administrators.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js 20 + Express + MySQL
- **Deployment**: Nginx + systemd + GitHub Actions

## Common Development Commands

### Frontend Development
```bash
cd frontend-src
npm install              # Install dependencies
npm run dev             # Start dev server (Vite)
npm run build           # Build for production
npm run lint            # Run ESLint
```

### Backend Development
```bash
cd backend
npm install             # Install dependencies
npm start               # Start production server
npm run dev             # Start with nodemon for development
npm run init-db         # Initialize MySQL database
```

### Deployment
```bash
# One-click deployment (requires sudo)
sudo bash deploy.sh

# Version 1.2 deployment with MySQL
sudo bash v1_2.sh
```

## Architecture Overview

### Directory Structure
- `backend/` - Express API server with MySQL database
  - `routes/` - API route handlers (auth, orders, products, etc.)
  - `middleware/` - Express middleware (auth, upload)
  - `db/` - Database connection and initialization
  - `uploads/` - Product images storage
- `frontend-src/` - React TypeScript source code
  - `src/pages/` - Page components organized by role (admin/, merchant/, user/)
  - `src/components/ui/` - shadcn/ui component library (50+ components)
  - `src/api/` - API client functions
  - `src/store/` - Zustand state management
- `frontend/dist/` - Production build output (served by Nginx)
- `nginx/` - Nginx configuration

### API Architecture
The backend follows RESTful conventions with these main endpoints:
- `/api/auth` - Authentication (login, register, profile)
- `/api/food-packages` - Product management
- `/api/orders` - Order processing
- `/api/subscriptions` - Subscription management
- `/api/admin` - Admin operations
- `/api/upload` - File uploads (images)

### Authentication Flow
JWT-based authentication with tokens stored in localStorage. The auth middleware (`backend/middleware/auth.js`) validates tokens on protected routes.

### Database Schema
MySQL database with tables for:
- users (with role field: admin, merchant, user)
- food_packages (products)
- orders and order_items
- subscriptions
- diet_profiles (user dietary preferences)
- addresses
- payments
- inventory_logs

### Frontend Routing
React Router with role-based route protection:
- `/` - Customer portal
- `/merchant/*` - Merchant dashboard
- `/admin/*` - Admin dashboard
- `/login` - Login page with role selection

### State Management
Zustand stores in `frontend-src/src/store/`:
- `useAuthStore` - Authentication state
- `useCartStore` - Shopping cart
- `useOrderStore` - Order management

## Key Implementation Details

### Image Uploads
- Uses Multer middleware for file uploads
- Images saved to `backend/uploads/`
- Served statically at `/uploads/` path
- Product images referenced in food_packages table

### Form Validation
- React Hook Form for form handling
- Zod schemas for validation (see `frontend-src/src/types/`)
- Server-side validation on API routes

### Error Handling
- Backend: Centralized error handler in server.js
- Frontend: Toast notifications using sonner library
- API errors displayed with user-friendly messages

### Deployment Process
1. Frontend built with Vite, output to `frontend/dist/`
2. Backend runs on port 3001 (configurable via PORT env var)
3. Nginx reverse proxy on port 8080
4. systemd service for automatic startup
5. GitHub Actions for automated deployment

## Default Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Merchant | merchant@example.com | merchant123 |
| User | user@example.com | user123 |