# Marketing tracking (Meta Pixel & GA4)

The shop does **not** use `client/.env` in production. Browser IDs are set at **Docker build time** via the repo root `.env` (from `.env.production.example`). Server secrets live in **`server/.env`**.

---

## Meta Pixel — how it works in this project

### 1. Browser (Meta Pixel script)

**Code:** `client/src/utils/tracking.js` → `initMetaPixel()`  
**Started from:** `client/src/main.jsx` on every page load  

When `VITE_META_PIXEL_ID` is set at build time, the app loads Facebook’s `fbevents.js`, runs `PageView`, and exposes `trackEvent()` for:

| App event | Meta standard event |
|-----------|---------------------|
| `view_content` | ViewContent |
| `add_to_cart` | AddToCart |
| `purchase` | Purchase |
| `campaign_view` | ViewContent |

**Used today in:** `Home.jsx`, `ProductDetails.jsx` (view, add to cart, campaign).

### 2. Server (Meta Conversions API — optional, more reliable)

**Code:** `server/src/services/trackingService.js`  
**Route:** `POST /api/tracking` (rate limited)  

Sends events to Facebook when both are set in **`server/.env`**:

- `META_PIXEL_ID` — same numeric ID as the pixel  
- `META_CONVERSIONS_TOKEN` — from Meta Events Manager → Settings → Conversions API  

The React app can call this endpoint for server-side events (not all pages do yet; browser `trackEvent` is the main path).

---

## Enable Meta Pixel on Hostinger (later)

### Step 1 — Get IDs from Meta

1. [Meta Events Manager](https://business.facebook.com/events_manager) → your Pixel  
2. Copy **Pixel ID**  
3. (Optional) Generate **Conversions API** access token  

### Step 2 — VPS: root `.env` (browser build)

```bash
cd /var/www/Zaroor-shop
cp .env.production.example .env
nano .env
```

Set:

```env
VITE_META_PIXEL_ID=YOUR_PIXEL_ID
```

Keep `VITE_API_BASE_URL=/api` for Nginx.

### Step 3 — VPS: `server/.env` (server-side, optional)

```env
META_PIXEL_ID=YOUR_PIXEL_ID
META_CONVERSIONS_TOKEN=YOUR_CAPI_TOKEN
```

### Step 4 — Rebuild client container

```bash
docker compose up --build -d
```

Vite bakes `VITE_*` into the static JS; a rebuild is required after any change.

### Step 5 — Verify

- Install [Meta Pixel Helper](https://chrome.google.com/webstore/detail/meta-pixel-helper) Chrome extension  
- Visit `https://zaroor.shop` → should see PageView  
- Open a product → ViewContent; add to cart → AddToCart  

---

## GA4 (same pattern)

| Layer | Variables |
|-------|-----------|
| Browser | `VITE_GA_MEASUREMENT_ID` in root `.env` → `initAnalytics()` in `tracking.js` |
| Server | `GA4_MEASUREMENT_ID`, `GA4_API_SECRET` in `server/.env` |

Rebuild after changing `VITE_GA_MEASUREMENT_ID`.

---

## Local development (optional)

If you run `npm run dev` inside `client/` on your laptop, you may create **`client/.env`** locally (gitignored) with `VITE_*` vars. That file is **not** used on the VPS or in Docker.

For Docker locally, use the repo root `.env` like production.
