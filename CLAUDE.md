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
npm run preview         # Preview production build
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

### Testing
This project currently has no automated testing infrastructure. No test files, test directories, or testing frameworks are configured.

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

### Configuration Files
Key configuration files:
- `backend/db/config.js` - MySQL database configuration with environment variable support
- `nginx/food-subscription.conf` - Nginx reverse proxy configuration for production
- `backend/package.json` / `frontend-src/package.json` - Dependencies and scripts
- `update-server.py` - Python script for server updates (used in production)

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

### Database Architecture
The project initially used JSON file storage (`backend/scripts/init-db.js`) but now uses MySQL as the primary database. Both initialization scripts exist:
- `backend/db/init-mysql.js` - MySQL database initialization (creates tables and inserts seed data)
- `backend/scripts/init-db.js` - Legacy JSON file initialization (no longer used)

Database configuration is in `backend/db/config.js` with environment variable support. No database migration system exists; only initialization scripts.

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

### Environment Variables
The backend supports the following environment variables (configured in `backend/db/config.js`):
- `DB_HOST` - MySQL host (default: localhost)
- `DB_USER` - MySQL user (default: food_user)
- `DB_PASSWORD` - MySQL password (default: food123456)
- `DB_NAME` - Database name (default: food_subscription)
- `PORT` - Backend server port (default: 3001)
- `JWT_SECRET` - Secret for JWT signing
- `NODE_ENV` - Node environment (production/development)

Note: No `.env.example` file exists; environment variables must be set directly or hardcoded in config.js.

### Deployment Scripts
Multiple shell scripts are available for deployment and maintenance:
- `deploy.sh` - Main deployment script for v1.1 (JSON-based database)
- `deploy-v1.1.sh` - Similar to deploy.sh with version-specific naming
- `v1_2.sh` - v1.2 upgrade script (adds MySQL support)
- `fix-v1.2.sh` - Fix script for v1.2 issues
- `auto-deploy.sh` - Automated deployment script
- `update-server.sh` - Server update script
- `fix-login.sh` - Login issue fix script

These scripts are intended for production deployment and require sudo privileges.

## Default Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Merchant | merchant@example.com | merchant123 |
| User | user@example.com | user123 |

## Known Issues
Refer to README.md for detailed known issues. Key ongoing issues include:
- Clicking food package cards may not navigate to details page
- Homepage recommendations may not display
- Shopping cart management may have lingering issues
- Payment order creation may fail
- Orders may disappear after payment

These issues are documented in README.md with status and possible workarounds.

## Dual Repository Configuration
The project is synchronized between two Git repositories:
- **GitHub**: https://github.com/HaoChenXX/food-subscription (public backup)
- **Huawei CodeArts**: git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git (primary production repository)

Use `git remote -v` to see both remotes. Deployment scripts pull from CodeArts. For local development, you can push to both remotes with:
```bash
git push origin main  # CodeArts
git push github main # GitHub
```