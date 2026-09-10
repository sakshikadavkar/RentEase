# RentEase Backend API & PostgreSQL Database Foundation

This service provides the production-ready REST API and PostgreSQL database foundation for the **RentEase** rental marketplace.

---

## 🏗️ Architecture Overview

The backend is built with:
- **Node.js & Express**: High-performance HTTP REST API server
- **PostgreSQL (`pg`)**: Relational database with connection pooling and schema migrations
- **JWT & Bcrypt**: Secure token-based authentication and salted password hashing
- **Dual-Mode Data Engine**: Seamlessly queries PostgreSQL when configured, or uses the verified 903-product catalog fallback with in-memory auth for isolated environments
- **Modular MVC/Layered Architecture**: Clear separation across Config, Middleware, Models, Controllers, Services, and Routes

---

## 📂 Backend Structure

```
backend/
├── .env.example              # Sample backend environment variables
├── package.json              # Backend dependencies and scripts
├── src/
│   ├── app.js                # Express app setup, CORS, JSON parsers, error handlers
│   ├── server.js             # HTTP server listener and DB health diagnostics
│   ├── config/
│   │   ├── database.js       # PostgreSQL Pool connection & health check logic
│   │   ├── env.js            # Environment variable validation & parsing
│   │   └── jwt.js            # JWT signing and verification utilities
│   ├── controllers/
│   │   ├── authController.js # Register, Login, Me handlers
│   │   ├── healthController.js# Database and API health check handler
│   │   └── productsController.js # Product catalog search & details handlers
│   ├── middleware/
│   │   ├── auth.js           # JWT Bearer token authentication guard
│   │   ├── errorHandler.js   # Centralized error and 404 response handler
│   │   ├── roles.js          # Role-based access control (RBAC) middleware
│   │   └── validator.js      # Request body validation schemas
│   ├── models/
│   │   ├── migrate.js        # Automated migration runner script
│   │   └── schema.sql        # 14 relational tables and enum definitions
│   ├── routes/
│   │   ├── authRoutes.js     # /api/auth routes
│   │   ├── healthRoutes.js   # /api/health route
│   │   ├── index.js          # Master API router
│   │   └── productsRoutes.js # /api/products routes
│   ├── scripts/
│   │   └── seed.js           # 903-product seed script from src/constants/theme.js
│   ├── services/
│   │   ├── authService.js    # User registration, password check, and JWT logic
│   │   ├── dbService.js      # Low-level PostgreSQL query wrapper
│   │   └── productService.js # Search, filtering, tenure pricing, and pagination
│   └── utils/
│       ├── logger.js         # Structured timestamp logger
│       └── response.js       # Standardized JSON response envelope
└── README.md
```

---

## 🗄️ Database Schema & Entities

The PostgreSQL schema (`src/models/schema.sql`) defines **14 core tables**:

1. **`users`**: Multi-role accounts (`customer`, `admin`, `technician`, `logistics`) with salted password hashes.
2. **`products`**: Catalog table preserving the exact 903 product string IDs, category, pricing, city availability, specifications, and gallery.
3. **`inventory_units`**: Physical unit tracking per warehouse with serial numbers and condition grades (`Grade A`, `in_maintenance`, `rented`).
4. **`orders`**: Customer order master records with billing details, delivery slots, and payment status.
5. **`order_items`**: Line items linked to products, quantities, and chosen tenure months.
6. **`rentals`**: Active and completed subscription tracking with start/end dates, monthly fees, and next billing schedules.
7. **`rental_extensions`**: Historical records of tenure extensions and pro-rated rent adjustments.
8. **`addresses`**: User shipping and billing addresses across service metro cities.
9. **`deliveries`**: Logistics tracking records with driver dispatch and time slots.
10. **`maintenance_tickets`**: Customer service requests with category, urgency, technician assignment, and resolution notes.
11. **`returns`**: Return requests, scheduled pickup windows, condition inspections, and refund tracking.
12. **`damage_claims`**: Post-rental inspection reports, repair cost assessments, and security deposit deductions.
13. **`service_areas`**: Operational coverage registry for the 12 Indian metro cities.
14. **`payments`**: Transaction records for initial deposits, monthly rent charges, and refunds.

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env` inside the `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Configure your PostgreSQL credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/rentease

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### 2. Install Dependencies

```bash
npm --prefix backend install
```

### 3. Run Database Migrations

Apply the 14-table schema to your PostgreSQL instance:

```bash
npm --prefix backend run db:migrate
```

### 4. Seed the 903-Product Catalog

Safely import all 903 catalog products from `src/constants/theme.js` into PostgreSQL:

```bash
npm --prefix backend run db:seed
```

### 5. Start the Backend Server

```bash
# Start in development mode (with file watching)
npm --prefix backend run dev

# Or start standard production server
npm --prefix backend start
```

---

## 📡 API Reference

### Health
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check API status, PostgreSQL connection, and catalog count | Public |

### Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Bearer JWT |

### Products
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Browse/Search 903 products with filters, sorting & pagination | Public |
| `GET` | `/api/products/:id` | Fetch detailed product metadata, specs & gallery | Public |

#### Supported Query Parameters for `GET /api/products`:
- `search`: Keyword search in title, description, and category (e.g. `?search=sofa`)
- `category`: Filter by category (e.g. `?category=Living Room`)
- `subcategory`: Filter by subcategory (e.g. `?subcategory=Sofas & Couches`)
- `city`: Filter by city availability (e.g. `?city=Bengaluru`)
- `minPrice` / `maxPrice`: Filter by monthly rental price bounds
- `sort`: `featured`, `price_asc`, `price_desc`, `rating_desc`, `newest`
- `page`: Page number (default: `1`)
- `limit`: Items per page (default: `24`, max: `100`)
