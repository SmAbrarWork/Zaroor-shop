# Zaroor Shop

Production e-commerce storefront: **React + Vite** (`client/`) and **Express + MongoDB** (`server/`).

This repository is set up for **Hostinger VPS deployment** with Docker. There is no separate dev Docker stack—use production builds everywhere you run Docker.

## Deploy on Hostinger VPS

**First-time setup:** [docs/deploy-hostinger.md](docs/deploy-hostinger.md)  
**Auto-deploy on push to `main`:** [docs/deploy-automation.md](docs/deploy-automation.md)

1. **VPS (once):** clone → `server/.env` → Nginx → DNS → `docker compose up --build -d` → Certbot
2. **GitHub (once):** add Actions secrets → every **`git push origin main`** deploys automatically
3. **Or laptop:** `./scripts/deploy-push.sh "your message"`

You need **`server/.env`** and **Nginx** on the VPS. Browser `VITE_*` vars use repo root **`.env`** when needed ([marketing-tracking.md](docs/marketing-tracking.md)).

### Deploy from your laptop (one command)

```bash
cp .env.deploy.example .env.deploy   # edit once
nano .env.deploy
./scripts/deploy.sh "your commit message"
```

Pushes to GitHub over SSH, then VPS pulls, rebuilds Docker, and goes live.

### Auto-deploy (GitHub Actions)

Push to **`main`** runs `.github/workflows/deploy-hostinger.yml` → VPS runs `scripts/deploy-vps.sh` (pull, rebuild, health check).

### Optional: Vite build variables (Meta, GA, Google login)

```bash
cp .env.production.example .env   # on VPS, only if you need custom VITE_* at build time
```

## Docs

- [Architecture & API](docs/architecture.md)
- [Hostinger VPS deploy (step-by-step)](docs/deploy-hostinger.md)
- [Auto-deploy GitHub → Hostinger](docs/deploy-automation.md)
- [Meta Pixel & GA4 setup](docs/marketing-tracking.md)

## Configuration

Runtime secrets live in **`server/.env`** (copy from `server/.env.example`). Never commit `.env` files.
