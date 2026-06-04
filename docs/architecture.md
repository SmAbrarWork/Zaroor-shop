# Zaroor Shop — Architecture & Operations

## Repository layout

```
Zaroor-shop/
├── client/                 # React (Vite) SPA — built into static files for production
├── server/                 # Express API
├── scripts/                # go-live.sh (VPS update script)
├── docs/
├── deploy/nginx/           # Nginx site config example
└── docker-compose.yml      # Production stack only
```

**Frontend:** static SPA served on port 3000 (inside Docker).  
**Backend:** REST API on port 5000 (inside Docker).  
**Database:** MongoDB Atlas (`MONGO_URI` in `server/.env`).

---

## Authentication

1. **Email/password** — `/login`; JWT in `localStorage`; `Authorization: Bearer` on API calls.
2. **Google OAuth** — `/api/auth/google` → callback → redirect to `CLIENT_URL/login?token=…`.
3. **Admin** — `user.role === 'admin'` unlocks `/admin`.

**Security:** Auth rate limit, Helmet, bcrypt (12 rounds), JWT, CORS from `CLIENT_URL` (comma-separated origins), production error sanitization (no stack traces to clients).

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

Copy **`server/.env.example`** → **`server/.env`** on the VPS and fill in real values. Never commit `.env`.

Optional root **`.env.production.example`** → **`.env`** only if you need custom `VITE_*` values when Docker builds the client image.

The server loads `server/.env` via `dotenv` in `server/src/config/environment.js`.

---

## Deployment (Hostinger VPS)

See **[deploy-hostinger.md](deploy-hostinger.md)** for Nginx, DNS, SSL, and troubleshooting.

```bash
cp server/.env.example server/.env   # edit with real secrets
# optional: cp .env.production.example .env
docker compose up -d --build
```

Nginx on the host proxies `/` → client:3000 and `/api` → server:5000. Containers bind to `127.0.0.1` only.

### Go live after a GitHub push

On the VPS:

```bash
cd /var/www/Zaroor-shop
./scripts/go-live.sh
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

See **[marketing-tracking.md](marketing-tracking.md)** for enabling Meta Pixel and GA4 on the VPS.

- **Meta (browser):** `VITE_META_PIXEL_ID` in root `.env` → `client/src/utils/tracking.js`
- **Meta (server):** `META_PIXEL_ID`, `META_CONVERSIONS_TOKEN` in `server/.env` → Conversions API
- **GA4:** `VITE_GA_MEASUREMENT_ID` (build) + `GA4_*` in `server/.env` (optional server events)
