# Zaroor Shop

E-commerce storefront: **React + Vite** (`client/`) and **Express + MongoDB** (`server/`).

## Quick start

- **Env:** `cp server/.env.example server/.env` and `cp client/.env.example client/.env`, then edit.
- **Local:** `docker compose up --build` or run `npm run dev` in `server/` and `client/` separately.
- **Seed (optional):** `cd server && npm run seed`

## Docs

- [Architecture, API overview, deploy notes](docs/architecture.md)

## Deploy to EC2

```bash
bash scripts/deploy-remote.sh "describe your change"
```

Commits, pushes `main`, SSHs to the host, `git pull`, and `docker compose -f docker-compose.prod.yml up --build -d`.  
Update **`server/.env` and `client/.env` on the server** for production URLs and secrets (not in git).

## Configuration (server)

Runtime keys belong in **`server/.env`**.  
`server/src/config/environment.js` loads that file (when present), applies defaults, and exports one `env` object—standard practice so app code does not scatter `process.env` reads.

## Vercel

Create a Vercel project with **Root Directory = `server`** so `server/vercel.json` and `server/api/index.js` are used.
