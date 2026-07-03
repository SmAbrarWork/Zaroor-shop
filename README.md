# Zaroor Shop

Production e-commerce storefront: **React + Vite** (`client/`) and **Express + MongoDB** (`server/`).

This repository is set up for **Hostinger VPS deployment** with Docker.

## Deploy on Hostinger VPS

**First-time setup:** [docs/deploy-hostinger.md](docs/deploy-hostinger.md)

1. **VPS (once):** clone → `server/.env` → Nginx → DNS → `docker compose up --build -d` → Certbot
2. **Your laptop:** push changes to GitHub (`git push origin main`)
3. **VPS (every update):** `./scripts/go-live.sh` — pull, rebuild, live

You need **`server/.env`** and **Nginx** on the VPS. Browser `VITE_*` vars use repo root **`.env`** when needed ([marketing-tracking.md](docs/marketing-tracking.md)).

### Automatic deploy via GitHub Actions (optional)

One-time setup: **[docs/deploy-github-actions.md](docs/deploy-github-actions.md)**  
After setup, pushing to `main` deploys automatically (GitHub Actions SSHs to VPS and runs `scripts/deploy-vps.sh`).

### Update live site manually (on VPS)

After you push to GitHub from your laptop:

```bash
ssh root@187.127.119.183
cd /var/www/Zaroor-shop
./scripts/go-live.sh
```

### Optional: Vite build variables (Meta, GA, Google login)

```bash
cp .env.production.example .env   # on VPS, only if you need custom VITE_* at build time
```

## Docs

- [Architecture & API](docs/architecture.md)
- [Hostinger VPS deploy (step-by-step)](docs/deploy-hostinger.md)
- [Meta Pixel & GA4 setup](docs/marketing-tracking.md)
- [GitHub Actions SSH pipeline](docs/deploy-github-actions.md)

## Configuration

Runtime secrets live in **`server/.env`** (copy from `server/.env.example`). Never commit `.env` files.
