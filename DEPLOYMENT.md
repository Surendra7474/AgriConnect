# 🚀 AgriConnect — Free Deployment Guide

This guide covers deploying AgriConnect to production using **100% free services**.

---

## 📊 Architecture Overview

```
┌─────────────────┐     ┌────────────────┐     ┌────────────────┐
│  Vercel (Free)  │────▶│ Render (Free)  │────▶│ Railway (Free) │
│  React Frontend │     │ Spring Boot     │     │ MySQL 8        │
│  Port 443       │     │ Port 8080       │     │ Port 3306      │
└─────────────────┘     └────────────────┘     └────────────────┘
```

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| **Vercel** | Frontend hosting | 100 GB bandwidth, 6000 build minutes |
| **Render** | Backend hosting | 750 hours/month, sleeps after 15 min idle |
| **Railway** | MySQL database | $5 credit (lasts ~1 month), then need new account |

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
docker-compose logs -f mysql
```

---

## ☁️ Option 2: Free Cloud Deployment

### Step 1 — Create a Free MySQL Database (Railway)

Railway offers $5 free credit which covers ~1 month of MySQL. For truly unlimited free, use **Aiven** instead — both steps are covered below.

#### Option A: Railway (simpler, $5 credit)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **New Project** → **Deploy MySQL**
3. Wait for deployment → Click the MySQL service → **Connect** tab
4. Copy the **MySQL Connection URL** — it looks like:
   ```
   mysql://root:password@host.railway.internal:3306/railway
   ```
5. Convert it to JDBC format:
   ```
   jdbc:mysql://HOST:PORT/railway?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
   ```
   Replace `HOST`, `PORT`, and note the `password` separately.

#### Option B: Aiven (free forever, more steps)

1. Go to [aiven.io](https://aiven.io) → Sign up → **Create Service**
2. Select **MySQL** → Free plan → Choose cloud region near you
3. After creation, go to **Overview** → Copy:
   - **Host** (e.g., `mysql-xxx.aivencloud.com`)
   - **Port** (e.g., `27771`)
   - **User** (e.g., `avnadmin`)
   - **Password**
4. JDBC URL format:
   ```
   jdbc:mysql://HOST:PORT/defaultdb?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC
   ```

> **Save these values** — you'll need them for the backend:
> - `DB_URL`
> - `DB_USERNAME`
> - `DB_PASSWORD`

---

### Step 2 — Deploy Backend to Render (Free)

1. Push the latest code to your GitHub repo:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. Go to [render.com](https://render.com) → Sign up with GitHub

3. Click **New +** → **Blueprint**

4. Connect your GitHub repo — Render will detect `render.yaml` and auto-configure

5. OR manual setup: **New +** → **Web Service** → connect repo

   Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `agriconnect-backend` |
   | Environment | `Docker` |
   | Root Directory | (leave blank — uses root Dockerfile) |
   | Health Check Path | `/actuator/health` |
   | Plan | **Free** |

6. Add **Environment Variables** (in Render dashboard → Environment tab):

   | Variable | Value |
   |----------|-------|
   | `PORT` | `8080` |
   | `DB_URL` | `jdbc:mysql://<HOST>:<PORT>/<DB_NAME>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
   | `DB_USERNAME` | (from Railway/Aiven) |
   | `DB_PASSWORD` | (from Railway/Aiven) |
   | `DB_DRIVER` | `com.mysql.cj.jdbc.Driver` |
   | `JPA_DIALECT` | `org.hibernate.dialect.MySQLDialect` |
   | `JPA_DDL_AUTO` | `update` |
   | `JWT_SECRET` | Generate a random 64-char string (use `openssl rand -base64 48`) |
   | `JWT_ACCESS_MINUTES` | `120` |
   | `JWT_REFRESH_DAYS` | `14` |
   | `FRONTEND_URL` | (set after Step 3 — leave blank for now) |
   | `ADMIN_DEFAULT_EMAIL` | `admin@agriconnect.local` |
   | `ADMIN_DEFAULT_PASSWORD` | (choose a strong password) |

7. Click **Create Web Service** — build takes 5-10 minutes

8. Verify:
   ```bash
   curl https://agriconnect-backend.onrender.com/actuator/health
   # Should return: {"status":"UP"}
   ```

9. Note your backend URL: `https://agriconnect-backend.onrender.com`

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

After setting secrets, every push to `main` auto-deploys.

---

## 🛠 Troubleshooting

### "Backend returns 502 Bad Gateway"
- Render free tier sleeps after 15 min of inactivity. First request wakes it up (takes 30-60s). Refresh the page.
- Check Render logs for startup errors — usually a DB connection issue.

### "CORS error in browser console"
- Ensure `FRONTEND_URL` on Render matches your Vercel URL exactly (including `https://`).
- After updating, redeploy or wait for Render auto-deploy.

### "Frontend shows blank page"
- Check Vercel build logs — look for Vite build errors.
- Verify `VITE_API_URL` is set correctly in Vercel.
- Open DevTools → Network tab — check if API calls are going to the correct Render URL.

### "MySQL connection refused"
- Railway/Aiven: ensure the database is running and not paused.
- Check firewall: Aiven may need your Render IP allowlisted (Aiven → Overview → copy public IP, add to allowed).
- Render's IP changes, so use `useSSL=true` in the JDBC URL.

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
| Railway (MySQL) | $5 credit (~1 month) | Migrate to Aiven for permanent free |
| Aiven (MySQL) | Free forever | 1 GB storage, 1 shared vCPU — good enough |

**Total cost: $0/month** if using Aiven for MySQL.

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
| `docker-compose.yml` | Full-stack local deployment |
| `.env` | Environment variables for Docker Compose |
| `.dockerignore` | Excludes unnecessary files from Docker context |
| `render.yaml` | Render Blueprint for one-click backend deploy |
| `DEPLOYMENT.md` | This guide |
