# 🌾 AgriConnect — Agriculture Management Platform

A **full-stack production-ready agriculture management platform** connecting Farmers, Equipment Owners, Agricultural Workers, and Administrators on a single unified platform.

Built as a university final-year major project and professional portfolio piece.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [System Design](#-system-design)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Internationalization](#-internationalization)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Docker Deployment](#-docker-deployment)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Production Deployment](#-production-deployment)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Screenshots](#-screenshots)
- [Postman Collection](#-postman-collection)
- [Interview & Viva Preparation](#-interview--viva-preparation)
- [License](#-license)

---

## 🌍 Overview

**AgriConnect** addresses critical gaps in agricultural operations by providing:

- **Produce Marketplace** — Farmers list fresh produce (vegetables, fruits, grains), buyers purchase directly with order tracking
- **Equipment Rental Marketplace** — Farmers rent tractors, harvesters, irrigation systems from Equipment Owners
- **Worker Hiring Platform** — Farmers hire skilled agricultural workers with verified profiles and ratings
- **Crop Profitability Prediction** — Rule-based prediction engine with inputs: crop type, area, soil, water source, region, investment
- **Feedback & Support System** — Bug reports, suggestions, general feedback with admin resolution workflow
- **Admin Moderation Dashboard** — Approve equipment listings, worker profiles, produce listings, manage users, resolve feedback
- **Multilingual Support** — Full i18n for English (en), Hindi (hi), and Telugu (te) on both frontend and backend

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.4.5, Spring Security, Spring Data JPA, Hibernate |
| **Frontend** | React 18, React Router 6, Material UI 6, Axios, React Hook Form, Framer Motion, Recharts |
| **Database** | MySQL 8 |
| **Auth** | JWT (Access + Refresh Tokens), BCrypt, Role-Based Authorization |
| **API Docs** | OpenAPI / Swagger (springdoc-openapi) |
| **Build** | Maven (backend), Vite (frontend) |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker, Docker Compose |
| **Deployment** | Vercel (frontend), Render (backend), Railway (database) |

---

## 🏗 Architecture

### Clean Architecture (Layered)

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  React.js (MUI, Axios, Context API)     │
└──────────────┬──────────────────────────┘
               │ REST / JSON
┌──────────────▼──────────────────────────┐
│          Controller Layer               │
│  Spring REST Controllers                │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Service Layer                  │
│  Business Logic, Validation, DTOs       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Repository Layer               │
│  Spring Data JPA Repositories           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Domain Layer                   │
│  JPA Entities, Enums, Constants          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Infrastructure                 │
│  MySQL 8, JWT, BCrypt, CORS, Mail       │
└─────────────────────────────────────────┘
```

### Backend Package Structure
```
com.agriconnect
├── config          → App properties, security, CORS, data init
├── controller      → REST controllers (Auth, Equipment, Worker, Admin, etc.)
├── dto
│   ├── request     → Incoming request DTOs with validation
│   └── response    → Standardized API response DTOs
├── entity          → JPA entities mapped to database tables
├── repository      → Spring Data JPA repository interfaces
├── service         → Business logic service interfaces
├── service.impl    → Service implementations
├── mapper          → MapStruct mappers (Entity ↔ DTO)
├── security        → JWT filter, user details, auth entry point
├── jwt             → JWT token generation and validation
├── exception       → Custom exceptions and global exception handler
├── validation      → Custom validators (StrongPassword)
├── constant        → Enums (BookingStatus, RoleName, FeedbackType, etc.)
└── util            → ResponseFactory, helper utilities
```

### Frontend Structure
```
src
├── assets          → Static assets (images, icons)
├── components      → Reusable components (ProtectedRoute, StatusChip, PageHeader, LoadingSkeleton, EmptyState)
├── layouts         → MainLayout (sidebar, header, footer)
├── pages
│   ├── auth        → Login, Register, ForgotPassword, ResetPassword
│   ├── equipment   → EquipmentList, EquipmentDetail, EquipmentForm
│   ├── workers     → WorkerList, WorkerDetail, WorkerProfile
│   ├── admin       → AdminDashboard, AdminUsers, AdminEquipment, AdminWorkers, AdminFeedback
│   └── ...          → Dashboard, Profile, Bookings, HiringRequests, Predictions, Feedback, Notifications, NotFound
├── hooks           → Custom React hooks
├── services        → API service layer (axios interceptors, auth, equipment, worker, etc.)
├── routes          → Route definitions (in App.jsx)
├── contexts        → AuthContext, ThemeContext (dark/light mode)
├── constants       → Enums, labels, static data (soil types, regions, categories)
├── styles          → MUI theme configuration
└── utils           → Utility functions
```

---

## 🎯 Features

### Produce Marketplace
- [x] Farmers list fresh produce with name, category, price, unit, quantity, harvest date, images
- [x] Admin approval workflow for produce listings (PENDING → APPROVED/REJECTED)
- [x] Buyers place orders with delivery address, quantity validation, self-purchase prevention
- [x] Order status lifecycle: PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED
- [x] Buyer can cancel from PENDING; Farmer/Admin can reject from PENDING
- [x] Stock quantity auto-decrements on order, auto-restores on cancel/reject
- [x] Order history: My Orders (buyer view), Incoming Orders (farmer/admin view)
- [x] Search by name, category, location; filter by availability, organic
- [x] Multilingual error messages for all product/order operations

### Authentication & Authorization
- [x] Registration with role selection (Farmer, Worker, Equipment Owner)
- [x] JWT-based login with Access + Refresh tokens
- [x] Auto-refresh of expired tokens via Axios interceptor
- [x] Role-based route protection (ProtectedRoute component)
- [x] BCrypt password hashing
- [x] Forgot/Reset password flow
- [x] Profile viewing and password change

### Equipment Module
- [x] CRUD operations for equipment listings
- [x] Multi-image upload support
- [x] Categories: Tractor, Harvester, Tiller, Plough, Seed Drill, Sprayer, etc.
- [x] Admin approval workflow (PENDING → APPROVED/REJECTED)
- [x] Booking system with status management (PENDING → CONFIRMED → COMPLETED)
- [x] Search, filter, pagination
- [x] Equipment reviews and ratings
- [x] My Equipment and My Bookings views

### Worker Module
- [x] Worker profile creation (skills, location, daily rate, availability)
- [x] Admin approval workflow for worker profiles
- [x] Hiring request system (PENDING → ACCEPTED/REJECTED → COMPLETED)
- [x] Worker search with skill/location filtering
- [x] Worker reviews and ratings
- [x] My Hiring Requests (for both farmers and workers)

### Crop Prediction
- [x] Rule-based prediction engine
- [x] Inputs: crop type, area, soil type, water source, region, investment
- [x] Outputs: estimated yield, estimated profit, suitability score
- [x] Risk analysis with recommendations
- [x] Prediction history

### Feedback Module
- [x] Bug reports, suggestions, general feedback
- [x] Admin status management (OPEN → IN_PROGRESS → RESOLVED)
- [x] Admin notes and resolution tracking

### Admin Module
- [x] Dashboard with real-time statistics
- [x] User management (activate/deactivate, filter by role/status)
- [x] Equipment approval (approve/reject pending listings)
- [x] Worker profile approval
- [x] Feedback management with detail view

### Notifications
- [x] Booking, hiring, and approval notifications
- [x] Mark as read / mark all as read
- [x] Notification detail view

### UI/UX
- [x] Dark mode / Light mode toggle
- [x] Responsive design (mobile, tablet, desktop)
- [x] Loading skeletons for all data views
- [x] Animated page transitions (Framer Motion)
- [x] Toast notifications for user actions
- [x] Breadcrumb navigation
- [x] Search, sort, filter, pagination on all list views
- [x] Cartoon-brutalist-inspired modern design with green agriculture theme

---

## 👥 User Roles

| Role | Permissions |
|------|------------|
| **ADMIN** | Full system access, user management, equipment/worker/product approval, feedback resolution, dashboard analytics |
| **FARMER** | List produce, browse equipment, make bookings, hire workers, predict crop profitability, submit feedback |
| **BUYER** | Browse and purchase produce, place orders, track order status, submit feedback |
| **WORKER** | Create professional profile, accept/reject hiring requests, receive ratings and reviews |
| **EQUIPMENT_OWNER** | List equipment for rent, manage booking requests, view booking history |

---

## 🌐 Internationalization

AgriConnect supports three languages out of the box: **English (en)**, **Hindi (hi)**, and **Telugu (te)**. Both frontend and backend are fully internationalized — UI labels, API response messages, validation errors, and notifications are all translated.

### Supported Languages

| Locale | Language | Code |
|--------|----------|------|
| English | अंग्रेज़ी | `en` |
| Hindi | हिन्दी | `hi` |
| Telugu | తెలుగు | `te` |

### How It Works

**Backend (Spring Boot):**
- `LocaleConfig` registers a `LocaleChangeInterceptor` that reads the `Accept-Language` header from every request.
- `MessageSource` loads translated strings from `messages.properties`, `messages_hi.properties`, and `messages_te.properties` under `backend/src/main/resources/messages/`.
- `GlobalExceptionHandler` resolves exception message keys through `MessageSource` with the request's locale, so error responses are always in the user's preferred language.
- `ResponseFactory.success()` resolves controller success message keys the same way.
- All service-layer exceptions (`ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`) carry a `messageKey` and optional `args` array — never hardcoded English strings.

**Frontend (React):**
- `i18next` with `react-i18next` handles UI translations.
- Translation JSON files live under `frontend/src/locales/{en,hi,te}/translation.json`.
- The `LanguageSwitcher` component in the header lets users toggle languages at any time.
- The selected language is persisted to `localStorage` and sent as the `Accept-Language` header on all API requests via an Axios interceptor.

### Adding a New Language

1. **Backend:** Create `messages_<code>.properties` in `backend/src/main/resources/messages/`. Copy all keys from `messages.properties` and translate the values. Register the locale in `LocaleConfig.java`.
2. **Frontend:** Create `frontend/src/locales/<code>/translation.json`. Copy all keys from `en/translation.json` and translate the values. Register the locale in `frontend/src/i18n.js`.
3. **Language Switcher:** Add the new language option to the dropdown in `LanguageSwitcher.jsx`.
4. Rebuild both backend and frontend — no database changes needed.

---

## 🗄 Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (name, email, password, phone, role, active, verified) |
| `roles` | Role definitions (ADMIN, FARMER, BUYER, WORKER, EQUIPMENT_OWNER) |
| `products` | Produce listings (name, category, price, unit, quantity, harvest date, organic) |
| `product_images` | Multiple images per product listing |
| `product_orders` | Order records with quantity, address, status/payment tracking |
| `equipment` | Equipment listings (name, description, category, price, status, location) |
| `equipment_images` | Multiple images per equipment listing |
| `equipment_bookings` | Booking records with status tracking |
| `equipment_reviews` | Reviews and ratings for equipment |
| `worker_profiles` | Worker details (skills, location, daily rate, approval status) |
| `worker_hirings` | Hiring requests with status tracking |
| `worker_reviews` | Reviews and ratings for workers |
| `feedbacks` | Bug reports, suggestions, general feedback |
| `notifications` | System notifications for bookings, hirings, approvals |
| `refresh_tokens` | JWT refresh token storage |
| `crop_prediction_history` | Saved crop predictions |
| `audit_logs` | Activity tracking |

All tables include: `id` (PK, auto-generated), `created_at`, `updated_at` timestamps.

---

## 📡 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password |
| GET | `/api/products` | Auth | List approved products |
| GET | `/api/products/{id}` | Auth | Get product detail |
| GET | `/api/products/my` | FARMER | List my products |
| POST | `/api/products` | FARMER/ADMIN | Create product listing |
| PUT | `/api/products/{id}` | FARMER/ADMIN | Update product listing |
| DELETE | `/api/products/{id}` | FARMER/ADMIN | Delete product |
| POST | `/api/orders` | BUYER/FARMER/ADMIN | Place product order |
| GET | `/api/orders/my` | Auth | List my orders (buyer) |
| GET | `/api/orders/incoming` | FARMER/ADMIN | List incoming orders |
| GET | `/api/orders/{id}` | Auth | Get order detail |
| PATCH | `/api/orders/{id}/status` | Auth | Update order status |
| GET | `/api/admin/products` | ADMIN | List all products |
| PATCH | `/api/admin/products/{id}/status` | ADMIN | Approve/reject product |
| GET | `/api/equipment` | Auth | List approved equipment |
| GET | `/api/equipment/{id}` | Auth | Get equipment detail |
| POST | `/api/equipment` | EQUIPMENT_OWNER/ADMIN | Create equipment |
| PUT | `/api/equipment/{id}` | EQUIPMENT_OWNER/ADMIN | Update equipment |
| DELETE | `/api/equipment/{id}` | EQUIPMENT_OWNER/ADMIN | Delete equipment |
| POST | `/api/equipment/{id}/book` | FARMER | Book equipment |
| POST | `/api/equipment/{id}/reviews` | Auth | Review equipment |
| GET | `/api/equipment/{id}/reviews` | Auth | Get equipment reviews |
| GET | `/api/workers` | Auth | List approved workers |
| GET | `/api/workers/{id}` | Auth | Get worker detail |
| POST | `/api/workers/profile` | WORKER | Create/update profile |
| POST | `/api/workers/{id}/hire` | FARMER | Hire a worker |
| POST | `/api/workers/hiring/{id}/status` | WORKER | Accept/reject hiring |
| POST | `/api/workers/{id}/reviews` | Auth | Review worker |
| POST | `/api/predictions` | FARMER | Run crop prediction |
| GET | `/api/predictions/history` | FARMER | Get prediction history |
| POST | `/api/feedback` | Auth | Submit feedback |
| GET | `/api/feedback/my` | Auth | Get my feedback |
| GET | `/api/notifications` | Auth | Get notifications |
| PATCH | `/api/notifications/{id}/read` | Auth | Mark notification read |
| PATCH | `/api/notifications/read-all` | Auth | Mark all as read |
| GET | `/api/admin/dashboard` | ADMIN | Dashboard statistics |
| GET | `/api/admin/users` | ADMIN | List all users |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | Toggle user active |
| GET | `/api/admin/equipment` | ADMIN | List all equipment |
| PATCH | `/api/admin/equipment/{id}/status` | ADMIN | Approve/reject equipment |
| GET | `/api/admin/workers` | ADMIN | List all worker profiles |
| PATCH | `/api/admin/workers/{id}/approval` | ADMIN | Approve/reject worker |
| GET | `/api/admin/feedbacks` | ADMIN | List all feedbacks |
| PATCH | `/api/admin/feedbacks/{id}` | ADMIN | Update feedback status |

---

## 🚀 Getting Started

### Prerequisites

- **Java 21** (JDK 21 with Eclipse Temurin distribution)
- **Maven 3.9+** (wrapper included — use `./mvnw` or `mvnw.cmd`)
- **Node.js 20+** and npm
- **MySQL 8.0** (or Docker for MySQL)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agriconnect.git
cd agriconnect
```

### 2. Database Setup

Create the MySQL database:

```sql
CREATE DATABASE agriconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or use Docker:

```bash
docker run -d --name mysql-agriconnect \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=agriconnect_db \
  -p 3306:3306 \
  mysql:8.0
```

### 3. Configure Environment

Create a `.env` file or set the following environment variables:

```
DB_URL=jdbc:mysql://localhost:3306/agriconnect_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=your_password
JWT_SECRET=YourStrongSecretKeyWithAtLeast32Characters12345
FRONTEND_URL=http://localhost:5173
```

---

## 🔧 Running Locally

### Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**.

> **Note:** By default, the backend uses an in-memory H2 database (`jdbc:h2:mem:agriconnect_db`) with `ddl-auto=create-drop` — no MySQL installation or Docker is required for local development. All data resets on restart. To use a persistent MySQL database instead, set the `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_DRIVER` environment variables as shown in the [Environment Variables](#3-configure-environment) section above.

Default admin account is created automatically:
- **Email:** `admin@agriconnect.local`
- **Password:** `Admin@12345`

Swagger UI available at: **http://localhost:8080/swagger-ui.html**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173**.

The Vite dev server proxies `/api` requests to the backend automatically.

---

## 🐳 Docker Deployment

### Full Stack with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **MySQL** on port 3306
- **Backend** on port 8080
- **Frontend** on port 5173

### Build Production Image

```bash
docker build -t agriconnect:latest .
docker run -p 8080:8080 \
  -e DB_URL=jdbc:mysql://host.docker.internal:3306/agriconnect_db \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=your_password \
  -e JWT_SECRET=your-secret-key \
  agriconnect:latest
```

---

## 🔄 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci-cd.yml`):

1. **Backend**: Compile, run tests, package JAR
2. **Frontend**: Install, lint, build, upload artifact
3. **Deploy Backend** to Render (on push to main)
4. **Deploy Frontend** to Vercel (on push to main)

Required GitHub Secrets:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_SERVICE_ID` | Render web service ID |
| `RENDER_API_KEY` | Render API key |

---

## ☁️ Production Deployment

### 1. Provision a MySQL Database

Render does not offer managed MySQL — use one of these providers (all have free/cheap tiers):

| Provider | URL |
|----------|-----|
| **Railway** | https://railway.app |
| **Aiven** | https://aiven.io |
| **PlanetScale** | https://planetscale.com |

Create a MySQL 8 database and note the connection host, port, username, password, and database name.

### 2. Deploy Backend to Render

#### Option A — Via `render.yaml` (Infrastructure as Code)

The repo includes a `render.yaml` at the root. On Render, create a **Blueprint** connected to this repo — Render will auto-create the web service from the blueprint.

#### Option B — Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com) → **New Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `agriconnect-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (uses the `Dockerfile` at repo root)
   - **Health Check Path:** `/actuator/health`
4. Add environment variables (set as Render secrets, not plain text):

| Variable | Value |
|----------|-------|
| `DB_URL` | `jdbc:mysql://<host>:<port>/<db>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | Your MySQL username |
| `DB_PASSWORD` | Your MySQL password |
| `DB_DRIVER` | `com.mysql.cj.jdbc.Driver` |
| `JPA_DDL_AUTO` | `update` |
| `JWT_SECRET` | Generate a 32+ character random string |
| `JWT_ACCESS_MINUTES` | `120` |
| `JWT_REFRESH_DAYS` | `14` |
| `FRONTEND_URL` | `https://<your-vercel-project>.vercel.app` |
| `ADMIN_DEFAULT_EMAIL` | Your admin email |
| `ADMIN_DEFAULT_PASSWORD` | A strong password (not the placeholder) |
| `PORT` | `8080` |

5. Deploy. Verify with:
```bash
curl https://<your-render-url>.onrender.com/actuator/health
# → {"status":"UP"}

curl https://<your-render-url>.onrender.com/api-docs
# → OpenAPI JSON
```

### 3. Deploy Frontend to Vercel

The repo already includes `frontend/vercel.json` with the correct Vite + SPA configuration.

1. Go to [Vercel Dashboard](https://vercel.com) → **Add New Project**.
2. Connect your GitHub repository.
3. Configure the project:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables (set for Production, Preview, and Development):

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://<your-render-url>.onrender.com` |

5. Deploy. Verify the live URL loads and browser network calls hit your Render backend (not localhost).

### 4. Wire CI/CD to Auto-Deploy

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) already has `deploy-vercel` and `deploy-render` jobs. Add these secrets to your GitHub repo (Settings → Secrets and variables → Actions):

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel project settings → Tokens |
| `VERCEL_ORG_ID` | Vercel project settings → General |
| `VERCEL_PROJECT_ID` | Vercel project settings → General |
| `RENDER_SERVICE_ID` | Render service dashboard → Settings |
| `RENDER_API_KEY` | Render account settings → API Keys |

After setting secrets, push to `main` — the pipeline will build, test, and deploy both backend and frontend automatically.

### 5. End-to-End Verification

After deployment, run through this flow against the live URLs:
1. Register a new buyer account
2. Login
3. Browse marketplace (`/api/products`)
4. Place an order (`POST /api/orders`)
5. Login as farmer, confirm the order (PENDING → CONFIRMED)
6. Check order status updates from the buyer side
7. All API calls in the browser network tab should hit `*.onrender.com`, not `localhost`

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

Test coverage includes:
- JWT token generation and validation
- Custom user details service
- Response factory utility
- Authentication entry point

### Frontend Tests

```bash
cd frontend
npm test
```

React Testing Library tests for components, hooks, and services.

### Manual API Testing

Import the Postman collection (`docs/Agriconnect.postman_collection.json`) for manual endpoint testing.

---

## 📁 Project Structure

```
agriconnect/
├── backend/
│   ├── pom.xml
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/agriconnect/
│   │   │   │   ├── AgriConnectApplication.java
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   ├── service/impl/
│   │   │   │   ├── mapper/
│   │   │   │   ├── security/
│   │   │   │   ├── jwt/
│   │   │   │   ├── exception/
│   │   │   │   ├── validation/
│   │   │   │   ├── constant/
│   │   │   │   └── util/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── target/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── assets/
│       ├── components/
│       ├── contexts/
│       ├── constants/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       └── utils/
├── docs/
├── .github/workflows/
│   └── ci-cd.yml
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🔒 Security

- **Stateless JWT Authentication** — No server-side sessions
- **BCrypt Password Hashing** — 10+ rounds
- **CORS Configuration** — Only production domain + localhost
- **Spring Security Filter Chain** — Method-level security
- **Role-Based Access Control** — `@PreAuthorize` annotations
- **Input Validation** — Jakarta Bean Validation on all DTOs
- **Global Exception Handler** — Consistent error responses
- **SQL Injection Prevention** — Parameterized JPA queries
- **Password Validation** — Custom `@StrongPassword` validator

---

## 📸 Screenshots

> Screenshots of the running application can be placed in the `docs/screenshots/` directory.

| Page | Description |
|------|-------------|
| Landing Page | Public landing/hero page |
| Login | User authentication |
| Register | New user registration |
| Dashboard | Role-specific dashboard with stats |
| Equipment List | Browse/search equipment |
| Equipment Detail | Equipment details, images, booking |
| Worker List | Browse/search workers |
| Worker Profile | Worker details, skills, reviews |
| Crop Prediction | Input form and results |
| Admin Dashboard | Statistics and approval status |
| Admin Users | User management table |
| Admin Equipment | Equipment approval interface |
| Admin Workers | Worker approval interface |
| Feedback | Submit and view feedback |

---

## 📮 Postman Collection

A complete Postman collection is available at:

```
docs/Agriconnect.postman_collection.json
```

This includes:
- All authentication endpoints
- Equipment CRUD + booking + review endpoints
- Worker profile + hiring + review endpoints
- Crop prediction endpoints
- Feedback endpoints
- Notification endpoints
- Admin endpoints

**Usage:**
1. Open Postman
2. Import → File → Select `Agriconnect.postman_collection.json`
3. Set environment variables: `base_url`, `access_token`
4. Run the Auth → Login request first to get a token

---

## 🎓 Interview & Viva Preparation

### Key Concepts to Understand

- **JWT Authentication Flow** — Access token + Refresh token rotation
- **Spring Security Architecture** — Filter chain, SecurityContext, AuthenticationManager
- **Clean Architecture** — Separation of concerns, dependency inversion
- **DTO Pattern** — Why we use DTOs instead of exposing entities
- **MapStruct** — Compile-time mapping vs runtime reflection
- **Repository Pattern** — Spring Data JPA abstractions
- **REST API Design** — Proper HTTP methods, status codes, resource naming
- **Global Exception Handling** — `@ControllerAdvice` unified error handling
- **Database Normalization** — 3NF schema design decisions
- **CORS** — Cross-Origin Resource Sharing configuration
- **Docker Multi-Stage Builds** — Optimizing image size
- **CI/CD Pipeline** — Automated testing and deployment
- **State Management** — React Context API for auth and theme
- **Axios Interceptors** — Token refresh and error handling
- **Protected Routes** — Role-based routing in React

### Common Viva Questions

1. **Why Spring Boot over plain Spring?** — Auto-configuration, embedded server, starter dependencies
2. **Explain JWT token structure** — Header, payload, signature
3. **How do you prevent SQL injection?** — JPA parameterized queries, input validation
4. **What is lazy vs eager loading in Hibernate?** — Fetch strategies for performance
5. **Why use DTOs?** — Prevent entity exposure, customize API contract, avoid circular JSON
6. **How does refresh token rotation work?** — Issue new access + refresh on each refresh request
7. **Explain the approval workflow** — PENDING → APPROVED/REJECTED with admin review
8. **How did you structure your React components?** — Pages, shared components, layouts, context providers

---

## 📄 License

This project is created for educational purposes as a university final-year project.

---

## 👨‍💻 Author

Built as part of the Software Engineering major project.

---

**⭐ If you found this project useful, please give it a star on GitHub!**
