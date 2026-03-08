# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a food subscription platform (食材包订阅平台) - a Chinese meal kit subscription e-commerce system with three user roles: customers, merchants, and administrators. The platform supports browsing food packages, managing subscriptions, processing orders, and includes separate dashboards for each role.

## Tech Stack

**Frontend** (`frontend-src/`):
- **Framework**: React 19.2.0 + TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 3.4.19 + tailwindcss-animate
- **UI Components**: shadcn/ui (based on Radix UI primitives)
- **State Management**: Zustand 5.0.11
- **Routing**: React Router DOM 7.13.0
- **Data Fetching**: TanStack Query 5.90.20 + Axios 1.13.4
- **Forms**: React Hook Form 7.70.0 + Zod 4.3.5
- **Charts**: Recharts 2.15.4
- **Icons**: Lucide React 0.562.0
- **Notifications**: Sonner 2.0.7

**Backend** (`backend/`):
- **Runtime**: Node.js 18+ with Express 4.18.2
- **Database**: MySQL 8.0+ via mysql2 3.6.5
- **Authentication**: JWT + bcryptjs 2.4.3
- **File Upload**: Multer 1.4.5
- **Development**: Nodemon 3.0.1 for hot reload

**Deployment**:
- **Web Server**: Nginx reverse proxy
- **Process Management**: systemd service
- **CI/CD**: GitHub Actions workflows

## Common Development Commands

### Frontend Development
```bash
cd frontend-src
npm install              # Install dependencies
npm run dev             # Start Vite dev server (port 5173)
npm run build           # Build for production (output to frontend/dist/)
npm run lint            # Run ESLint
npm run preview         # Preview production build locally
```

### Backend Development
```bash
cd backend
npm install             # Install dependencies
npm run init-db         # Initialize MySQL database (creates tables and seed data)
npm start               # Start production server (port 3001)
npm run dev             # Start with nodemon for development (hot reload)
```

### Deployment
```bash
# One‑click deployment (requires sudo)
sudo bash deploy.sh

# Version 1.2 deployment with MySQL support
sudo bash v1_2.sh

# Production server update (pulls from Huawei CodeArts, fixes line endings, restarts services)
python3 update-server.py
```

### Testing
This project currently has no automated testing infrastructure. No test files, test directories, or testing frameworks are configured.

## Architecture Overview

### Directory Structure
```
food-subscription-v01.1-backup/
├── backend/                    # Node.js Express backend
│   ├── db/                    # Database configuration
│   │   ├── config.js          # MySQL config with environment variable support
│   │   ├── connection.js      # Database connection pool
│   │   ├── init-mysql.js      # MySQL initialization script (creates tables + seed data)
│   │   └── memory-db.js       # Legacy JSON storage (no longer used)
│   ├── middleware/            # Express middleware
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── upload.js          # File upload handling (Multer)
│   ├── routes/                # API route handlers
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── food-packages.js   # Product management
│   │   ├── orders.js          # Order processing
│   │   ├── subscriptions.js   # Subscription management
│   │   ├── diet-profile.js    # User dietary preferences
│   │   ├── addresses.js       # Delivery addresses
│   │   ├── admin.js           # Admin operations
│   │   └── upload.js          # File upload endpoints
│   ├── uploads/               # Uploaded images storage
│   ├── scripts/               # Utility scripts
│   ├── server.js              # Main Express server
│   └── package.json
├── frontend-src/              # React TypeScript source
│   ├── src/
│   │   ├── api/               # API client and mock data
│   │   │   ├── api.ts         # Real API client (Axios)
│   │   │   └── mock.ts        # Mock data for development
│   │   ├── components/        # UI components (shadcn/ui)
│   │   ├── pages/             # Page components
│   │   │   ├── user/          # User pages
│   │   │   ├── merchant/      # Merchant pages
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── Login.tsx      # Login page
│   │   │   └── Register.tsx   # Registration page
│   │   ├── store/             # Zustand state management
│   │   │   └── index.ts       # All Zustand stores (see below)
│   │   ├── types/             # TypeScript type definitions
│   │   ├── hooks/             # Custom React hooks
│   │   └── lib/               # Utility functions
│   ├── public/                # Static assets
│   ├── dist/                  # Production build output
│   ├── vite.config.ts         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── package.json
├── frontend/                  # Production build (served by Nginx)
│   └── dist/
├── nginx/                     # Nginx configuration
│   └── food-subscription.conf
├── .github/workflows/         # GitHub Actions workflows
└── Various deployment and utility scripts
```

### Configuration Files
Key configuration files:
- `backend/db/config.js` – MySQL database configuration (supports environment variables)
- `nginx/food-subscription.conf` – Nginx reverse proxy configuration for production
- `frontend-src/vite.config.ts` – Vite configuration with path alias `@/` for `src/`
- `frontend-src/tailwind.config.js` – Tailwind CSS configuration
- `update-server.py` – Python script for server updates (used in production)

### API Architecture
RESTful API with JWT authentication. Main endpoints:
- `POST /api/auth/login` – User login
- `POST /api/auth/register` – User registration
- `GET /api/food-packages` – Get food packages
- `GET /api/orders` – Get user orders
- `POST /api/orders` – Create order
- `POST /api/orders/:id/pay` – Pay for order
- `GET /api/admin/users` – Admin: get all users
- `POST /api/upload/image` – Upload images

### Authentication Flow
1. User logs in via `POST /api/auth/login`
2. Server returns JWT token
3. Token stored in localStorage (via Zustand persisted store)
4. Subsequent requests include `Authorization: Bearer <token>` header
5. `backend/middleware/auth.js` validates tokens on protected routes

### Database Schema
MySQL database `food_subscription` with tables:
- `users` (with role field: admin, merchant, user)
- `food_packages` (products)
- `orders` and `order_items`
- `subscriptions`
- `diet_profiles` (user dietary preferences)
- `addresses`
- `payments`
- `inventory_logs`

### Database Architecture
- **Primary Database**: MySQL 8.0+
- **Default User**: `food_user` with password `food123456`
- **Initialization**: `backend/db/init-mysql.js` creates tables and inserts seed data
- **Legacy**: `backend/scripts/init-db.js` (JSON file storage) no longer used
- **Configuration**: `backend/db/config.js` supports environment variables
- **No migration system** – only initialization scripts

### Frontend Routing
React Router with role‑based route protection:
- `/` – Customer portal (auto‑redirects based on role)
- `/merchant/*` – Merchant dashboard (merchant/admin roles)
- `/admin/*` – Admin dashboard (admin role only)
- `/login` – Login page with role selection
- `/packages`, `/cart`, `/checkout`, `/orders`, `/subscriptions` – User shopping flow

### State Management (Zustand)
Zustand stores in `frontend-src/src/store/index.ts`:
- `useAuthStore` – Authentication state (persisted)
- `useCartStore` – Shopping cart (persisted)
- `useOrderStore` – Order management
- `useSubscriptionStore` – Subscriptions data
- `useDietProfileStore` – User diet profile (persisted)
- `useAddressStore` – Delivery addresses (persisted)
- `useFoodPackageStore` – Food packages data
- `useUIStore` – UI state (sidebar, theme, language) (persisted)

### Data Fetching Pattern
- Uses TanStack Query for server‑state management
- Mock API (`src/api/mock.ts`) provides development data without backend
- Real API (`src/api/api.ts`) uses Axios for actual backend integration
- When integrating with real backend, replace mock calls with Axios requests

## Key Implementation Details

### Image Uploads
- Uses Multer middleware for file uploads
- Images saved to `backend/uploads/` with timestamped filenames
- Served statically at `/uploads/` path
- Product images referenced in `food_packages` table

### Form Validation
- React Hook Form for form handling
- Zod schemas for validation (see `frontend-src/src/types/`)
- Server‑side validation on API routes

### Error Handling
- **Backend**: Centralized error handler in `server.js`
- **Frontend**: Toast notifications using sonner library
- **API errors**: Displayed with user‑friendly messages

### Deployment Process
1. Frontend built with Vite, output to `frontend/dist/`
2. Backend runs on port 3001 (configurable via `PORT` env var)
3. Nginx reverse proxy on port 8080
4. systemd service (`food-subscription.service`) for automatic startup
5. GitHub Actions for automated deployment

### Environment Variables
Backend supports the following environment variables (configured in `backend/db/config.js`):
- `DB_HOST` – MySQL host (default: `localhost`)
- `DB_USER` – MySQL user (default: `food_user`)
- `DB_PASSWORD` – MySQL password (default: `food123456`)
- `DB_NAME` – Database name (default: `food_subscription`)
- `PORT` – Backend server port (default: `3001`)
- `JWT_SECRET` – Secret for JWT signing
- `NODE_ENV` – Node environment (`production`/`development`)

**Note**: No `.env.example` file exists; environment variables must be set directly or hardcoded in `config.js`.

### Deployment Scripts
Multiple shell scripts are available for deployment and maintenance:
- `deploy.sh` – Main deployment script for v1.1 (JSON‑based database)
- `deploy-v1.1.sh` – Similar to `deploy.sh` with version‑specific naming
- `v1_2.sh` – v1.2 upgrade script (adds MySQL support)
- `fix-v1.2.sh` – Fix script for v1.2 issues
- `auto-deploy.sh` – Automated deployment script
- `update-server.sh` – Server update script
- `fix-login.sh` – Login issue fix script

These scripts are intended for production deployment and require sudo privileges.

### Cross‑Platform Line Endings
- Deployment scripts assume Linux environment (LF line endings)
- Use `fix-line-endings.py` to convert Windows CRLF to Linux LF
- For Windows development, use Git Bash or WSL

## Default Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Merchant | merchant@example.com | merchant123 |
| User | user@example.com | user123 |

## Known Issues
Refer to `README.md` for detailed known issues. Key ongoing issues include:
- Clicking food package cards may not navigate to details page
- Homepage recommendations may not display
- Shopping cart management may have lingering issues
- Payment order creation may fail
- Orders may disappear after payment

These issues are documented in `README.md` with status and possible workarounds.

## Dual Repository Configuration
The project is synchronized between two Git repositories:
- **GitHub**: `https://github.com/HaoChenXX/food-subscription` (public backup)
- **Huawei CodeArts**: `git@codehub.devcloud.cn-north-4.huaweicloud.com:a384bf0b99f140dbaa16281939ab38b1/huawei_food_subscription.git` (primary production repository)

Use `git remote -v` to see both remotes. Deployment scripts pull from CodeArts. For local development, you can push to both remotes with:
```bash
git push origin main   # CodeArts
git push github main   # GitHub
```