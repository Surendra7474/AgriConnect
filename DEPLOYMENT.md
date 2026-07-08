# 🚀 AgriConnect — Free Deployment Guide

This guide covers deploying AgriConnect to production using **100% free services**.

---

## 📊 Architecture Overview

```
┌─────────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Vercel (Free)  │────▶│ Render (Free)  │────▶│ Supabase (Free)  │
│  React Frontend │     │ Spring Boot     │     │ PostgreSQL 16    │
│  Port 443       │     │ Port 8080       │     │ Port 5432        │
└─────────────────┘     └────────────────┘     └──────────────────┘
```

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| **Vercel** | Frontend hosting | 100 GB bandwidth, 6000 build minutes |
| **Render** | Backend hosting | 750 hours/month, sleeps after 15 min idle |
| **Supabase** | PostgreSQL database | 500 MB database, 2 free projects forever |

---

## ⚡ Option 1: Docker Compose (Local / Self-Hosted)

Run the entire stack locally with Docker. Best for testing before cloud deployment.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed
- [Git](https://git-scm.com/) installed

### Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Surendra7474/AgriConnect.git
cd AgriConnect

# 2. (Optional) Edit .env with your own passwords
#    The defaults work for local testing

# 3. Start everything
docker-compose up -d

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f backend
```

### Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080/api |
| Swagger Docs | http://localhost:8080/swagger-ui.html |
| Actuator Health | http://localhost:8080/actuator/health |

### Default Admin Account

| Email | Password |
|-------|----------|
| admin@agriconnect.local | Admin@12345 |

### Useful Commands

```bash
# Stop everything
docker-compose down

# Stop and delete database volume (fresh start)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f postgres
```

---

## ☁️ Option 2: Free Cloud Deployment

### Step 1 — Create a Free Supabase PostgreSQL Database

Supabase offers a generous free tier with 500 MB of PostgreSQL storage — enough for development and small production apps.

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Click **New project** → Choose your organization
3. Fill in:
   - **Name**: `agriconnect-db`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose the closest to your Render region (e.g., `ap-south-1` for India)
4. Click **Create project** → Wait ~2 minutes for provisioning
5. After creation, go to **Project Settings** → **Database** → **Connection string**
6. Select **JDBC** tab → Copy the connection string (it ends with `?user=...&password=...`)
7. It looks like:
   ```
   jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?user=postgres.xxxxx&password=your_password
   ```

> **Save these values** — you'll need them:
> - `DB_URL`: the full JDBC URL above
> - `DB_USERNAME`: the `user` parameter from the URL (e.g., `postgres.xxxxx`)
> - `DB_PASSWORD`: the password you chose

**Important:** Use the **Pooler (port 5432)** connection string with session mode for Spring Boot. Go to **Project Settings → Database → Connection pooling** and ensure **Pool Mode** is set to **Session**.

---

### Step 2 — Deploy Backend to Render (Free)

1. Push the latest code to your GitHub repo:
   ```bash
   git add .
   git commit -m "Switch to Supabase PostgreSQL"
   git push origin master
   ```

2. Go to [render.com](https://render.com) → Sign up with GitHub

3. Click **New +** → **Web Service** → connect your GitHub repo

   Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `agriconnect-backend` |
   | Environment | `Docker` |
   | Root Directory | (leave blank — uses root Dockerfile) |
   | Health Check Path | `/actuator/health` |
   | Plan | **Free** |

4. OR use **Blueprint**: Render will detect `render.yaml` and auto-configure.

5. Add **Environment Variables** (in Render dashboard → Environment tab):

   | Variable | Value |
   |----------|-------|
   | `PORT` | `8080` |
   | `DB_URL` | `jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres` |
   | `DB_USERNAME` | (from Supabase JDBC string, e.g. `postgres.xxxxx`) |
   | `DB_PASSWORD` | (your Supabase database password) |
   | `DB_DRIVER` | `org.postgresql.Driver` |
   | `JPA_DIALECT` | `org.hibernate.dialect.PostgreSQLDialect` |
   | `JPA_DDL_AUTO` | `update` |
   | `JWT_SECRET` | Generate a random 64-char string (use `openssl rand -base64 48`) |
   | `JWT_ACCESS_MINUTES` | `120` |
   | `JWT_REFRESH_DAYS` | `14` |
   | `FRONTEND_URL` | (set after Step 3 — leave blank for now) |
   | `ADMIN_DEFAULT_EMAIL` | `admin@agriconnect.local` |
   | `ADMIN_DEFAULT_PASSWORD` | (choose a strong password) |

   > **Note on DB_URL**: Supabase's connection pooler uses different syntax. The full JDBC URL should look like:
   > ```
   > jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   > ```
   > If you see connection issues, try port `6543` (transaction mode pooler) or use the direct connection port `5432`.
   > Append `?sslmode=require` if SSL issues arise:
   > ```
   > jdbc:postgresql://HOST:PORT/postgres?sslmode=require
   > ```

6. Click **Create Web Service** — build takes 5-10 minutes

7. Verify:
   ```bash
   curl https://agriconnect-backend.onrender.com/actuator/health
   # Should return: {"status":"UP"}
   ```

8. Note your backend URL: `https://agriconnect-backend.onrender.com`

---

### Step 3 — Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub

2. Click **Add New** → **Project**

3. Import your GitHub repo → Configure:
   | Setting | Value |
   |---------|-------|
   | Framework | `Vite` |
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

4. Add **Environment Variables**:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://agriconnect-backend.onrender.com` |

5. Click **Deploy** — takes ~2 minutes

6. Note your frontend URL: `https://agriconnect.vercel.app`

---

### Step 4 — Wire Them Together

1. Go back to **Render dashboard** → your backend service → **Environment**

2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://agriconnect.vercel.app
   ```

3. Click **Save Changes** → Render will auto-redeploy

4. Open your Vercel URL and verify:
   - Page loads without blank screen
   - Login works (admin@agriconnect.local / your password)
   - API calls in DevTools hit `onrender.com`, not `localhost`

---

### Step 5 — (Optional) CI/CD Auto-Deploy

The repo already contains `.github/workflows/ci-cd.yml`. Add these **GitHub Secrets** (Settings → Secrets and variables → Actions):

| Secret | Where to Get It |
|--------|-----------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens → Create Token |
| `VERCEL_ORG_ID` | Vercel → pick from `.vercel/project.json` after running `npx vercel link` in frontend/ |
| `VERCEL_PROJECT_ID` | Vercel → pick from `.vercel/project.json` |
| `RENDER_SERVICE_ID` | Render → service dashboard → Settings → Service ID |
| `RENDER_API_KEY` | Render → Account Settings → API Keys |

After setting secrets, every push to `master` auto-deploys.

---

## 🛠 Troubleshooting

### "Backend returns 502 Bad Gateway"
- Render free tier sleeps after 15 min of inactivity. First request wakes it up (takes 30-60s). Refresh the page.
- Check Render logs for startup errors — usually a DB connection issue.

### "Supabase connection refused" or "SSL error"
- Ensure the JDBC URL uses the correct port: Supabase Session Pooler = `5432`, Transaction Pooler = `6543`.
- In Supabase dashboard → Project Settings → Database:
  - Copy the **JDBC** connection string
  - Ensure the password is URL-encoded (e.g., `@` → `%40`, `!` → `%21`)
- Add `?sslmode=require` to the end of the JDBC URL if SSL is required.

### "Relation not found" errors on startup
- Supabase PostgreSQL is case-sensitive. Ensure `JPA_DDL_AUTO=update` is set — this auto-creates tables.
- Verify `spring.jpa.properties.hibernate.dialect` is set to `org.hibernate.dialect.PostgreSQLDialect`.
- For production, use `JPA_DDL_AUTO=validate` and run migrations manually.

### "CORS error in browser console"
- Ensure `FRONTEND_URL` on Render matches your Vercel URL exactly (including `https://`).
- After updating, redeploy or wait for Render auto-deploy.

### "Frontend shows blank page"
- Check Vercel build logs — look for Vite build errors.
- Verify `VITE_API_URL` is set correctly in Vercel.
- Open DevTools → Network tab — check if API calls are going to the correct Render URL.

### "Docker build fails"
```bash
# Clear Docker cache and rebuild
docker-compose down
docker system prune -a
docker-compose up -d --build
```

---

## 💰 Cost Summary (Free Tier)

| Service | Monthly Limit | Over-Run Cost |
|---------|--------------|----------------|
| Render (backend) | 750 hours (31 days) | Service sleeps; wakes on request |
| Vercel (frontend) | 100 GB bandwidth | Sufficient for small/medium traffic |
| Supabase (PostgreSQL) | 500 MB, 2 free projects | Upgrade to Pro ($25/month) for more |

**Total cost: $0/month** — all three services have permanent free tiers.

---

## 🔄 Alternative: Single Free VM

If you have an Oracle Cloud Free Tier account (4 ARM cores, 24 GB RAM — permanently free):

1. Launch an Ampere A1 instance with Ubuntu 22.04
2. Install Docker + Docker Compose
3. Clone repo and run `docker-compose up -d`
4. Open firewall ports 80 and 443
5. Set up nginx reverse proxy or Cloudflare Tunnel for HTTPS

This gives you the full stack on one VM with no cold starts and unlimited traffic.

---

## 📁 Files Created/Modified for Deployment

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage backend build (Maven → JRE) |
| `frontend/Dockerfile` | Multi-stage frontend build (Vite → nginx) |
| `docker-compose.yml` | Full-stack local deployment (PostgreSQL) |
| `.env` | Environment variables for Docker Compose |
| `.dockerignore` | Excludes unnecessary files from Docker context |
| `render.yaml` | Render Blueprint for one-click backend deploy |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline with PostgreSQL service |
| `DEPLOYMENT.md` | This guide |
