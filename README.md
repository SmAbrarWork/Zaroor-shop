# Zaroor Shop

E-commerce storefront: **React + Vite** (`client/`) and **Express + MongoDB** (`server/`).

## Quick start (local)

- **Env:** `cp server/.env.example server/.env` and `cp client/.env.example client/.env`, then edit.
- **Run:** `docker compose up --build` or `npm run dev` in `server/` and `client/`.
- **Seed (optional):** `cd server && npm run seed`

## Deploy on Hostinger VPS

**Step-by-step guide with every command:** [docs/deploy-hostinger.md](docs/deploy-hostinger.md)

Summary:

1. **Your PC:** `git push origin main`
2. **VPS:** clone repo → `server/.env` → Nginx → DNS → `docker compose -f docker-compose.prod.yml up --build -d` → Certbot SSL
3. **Updates:** `git pull` + `docker compose -f docker-compose.prod.yml up --build -d`

You need **`server/.env`** and **Nginx** on the VPS. You do **not** need `client/.env` on the VPS for Docker.

### Optional: deploy from your laptop

```bash
cp .env.deploy.example .env.deploy   # edit DEPLOY_* 
set -a && source ./.env.deploy && set +a
./scripts/deploy-remote.sh "your message"
```

## Docs

- [Architecture & API](docs/architecture.md)
- [Hostinger VPS deploy (step-by-step)](docs/deploy-hostinger.md)

## Configuration (server)

Runtime keys live in **`server/.env`**. Loaded by `server/src/config/environment.js` (not committed to git).

## Vercel (optional API hosting)

Create a Vercel project with **Root Directory = `server`** for `server/vercel.json` and `server/api/index.js`.
