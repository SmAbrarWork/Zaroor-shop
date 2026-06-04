# Zaroor Shop — Architecture & Operations

## Repository layout

```
Zaroor-shop/
├── client/                 # React (Vite) SPA
├── server/                 # Express API + `server/api/` (Vercel serverless entry)
├── scripts/                # e.g. deploy-remote.sh
├── docs/                   # This documentation
├── docker-compose*.yml
└── .env.example            # Optional: Compose project name
```

**Frontend:** SPA (port 3000 in Docker dev).  
**Backend:** REST API (port 5000 in Docker dev).  
**Database:** MongoDB Atlas (or local URI in `.env`).

---

## Authentication

1. **Email/password** — `/login`; JWT in `localStorage`; `Authorization: Bearer` on API calls.
2. **Google OAuth** — `/api/auth/google` → callback → redirect to `CLIENT_URL/login?token=…`.
3. **Admin** — `user.role === 'admin'` unlocks `/admin`.

**Security:** Auth rate limit, Helmet, bcrypt (12 rounds), JWT, CORS from `CLIENT_URL` (comma-separated origins allowed), production error sanitization.

---

## Cart

- Guest: `localStorage` `guest_cart`.
- Logged in: MongoDB via `/api/cart`; merged on login.

---

## API summary

| Area | Examples |
|------|----------|
| Public | `GET /api/health`, `/api/events`, `/api/products` |
| Auth | `POST /api/auth/login`, `register`, `GET /api/auth/me`, Google routes |
| User | `/api/cart`, `/api/orders` |
| Admin | `/api/admin/*` |
| Tracking | `POST /api/tracking` (rate limited) |

---

## Environment variables

**Values** live in `server/.env` and `client/.env` (never commit). Copy from `*.env.example`.

The server loads `.env` from disk via `dotenv` in `server/src/config/environment.js` and exposes typed defaults; Docker / production can also inject the same variable names without a file.

---

## Deployment

See **[deploy-hostinger.md](deploy-hostinger.md)** for the full Hostinger checklist (Nginx, DNS, SSL, env files).

### Docker (Hostinger VPS)

On the VPS:

```bash
cp server/.env.production.example server/.env   # edit with real secrets
# optional: cp .env.production.example .env     # VITE_* for client image build
docker compose -f docker-compose.prod.yml up -d --build
```

Configure **Nginx** on the host (`deploy/nginx/zaroor.shop.conf.example`) so `/` → client:3000 and `/api` → server:5000. Containers bind to `127.0.0.1` only.

### One-command deploy (git push + VPS pull + compose)

From your machine, with `DEPLOY_SSH_KEY`, `DEPLOY_HOST`, and `DEPLOY_REMOTE_DIR` set (see `.env.deploy.example`):

```bash
set -a && source ./.env.deploy && set +a
./scripts/deploy-remote.sh "your message"
```

### Vercel (optional serverless API)

If you host the API on Vercel instead of the VPS, set **Root Directory** to `server`.  
Build uses `server/vercel.json` and the serverless entry `server/api/index.js`.

---

## Local development

```bash
docker compose up --build
# or
(cd server && npm run dev) & (cd client && npm run dev)
cd server && npm run seed   # optional; admin in seed script
```

---

## Database models (short)

- **User** — name, email, password hash, googleId, avatar, role.
- **Product** — name, slug, price, image, tags, stock, description.
- **Event** — name, slug, theme, dates, story.
- **Cart** — user ref, items[].
- **Order** — user ref, items[], total, status, shipping.

---

## Marketing

- **Meta:** client pixel (`VITE_*`); server Conversions API (`META_*` in `server/.env`).
- **GA4:** client gtag (`VITE_*`); server Measurement Protocol (`GA4_*`).
