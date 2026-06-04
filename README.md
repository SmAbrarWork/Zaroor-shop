# Zaroor Shop

Production e-commerce storefront: **React + Vite** (`client/`) and **Express + MongoDB** (`server/`).

This repository is set up for **Hostinger VPS deployment** with Docker. There is no separate dev Docker stack—use production builds everywhere you run Docker.

## Deploy on Hostinger VPS

**Full step-by-step guide:** [docs/deploy-hostinger.md](docs/deploy-hostinger.md)

1. **Your PC:** push `main` to GitHub
2. **VPS:** clone → `cp server/.env.example server/.env` → edit secrets → Nginx → DNS → `docker compose up --build -d` → Certbot SSL
3. **Updates:** `git pull` && `docker compose up --build -d`

You need **`server/.env`** and **Nginx** on the VPS. There is no `client/.env` in the repo—browser tracking IDs (`VITE_*`) go in the repo root **`.env`** when you enable Meta/GA (see [marketing-tracking.md](docs/marketing-tracking.md)).

### Optional: deploy from your laptop

```bash
cp .env.deploy.example .env.deploy   # edit DEPLOY_*
set -a && source ./.env.deploy && set +a
./scripts/deploy-remote.sh "your message"
```

### Optional: Vite build variables (Meta, GA, Google login)

```bash
cp .env.production.example .env   # on VPS, only if you need custom VITE_* at build time
```

## Docs

- [Architecture & API](docs/architecture.md)
- [Hostinger VPS deploy (step-by-step)](docs/deploy-hostinger.md)
- [Meta Pixel & GA4 setup](docs/marketing-tracking.md)

## Configuration

Runtime secrets live in **`server/.env`** (copy from `server/.env.example`). Never commit `.env` files.
