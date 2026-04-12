# zeroor.shop — Project Documentation

## Architecture

```
zeroor.shop/
├── client/          React 19 + Vite + Redux Toolkit + Tailwind CSS
├── server/          Express 5 + Mongoose + MongoDB
├── docker-compose.yml       Dev environment (hot-reload)
├── docker-compose.prod.yml  Production build
└── .gitignore
```

**Frontend**: SPA served on port 3000
**Backend**: REST API served on port 5000
**Database**: MongoDB (Atlas in production, Docker container in dev)

---

## Authentication Flow

1. **Email/Password**: User signs up or logs in on a single `/login` page (tabbed UI).
   - Server hashes password with bcrypt (12 rounds).
   - Server returns JWT (7-day expiry).
   - Client stores JWT in localStorage, attaches via `Authorization: Bearer <token>` header.

2. **Google OAuth 2.0**: User clicks "Continue with Google".
   - Client redirects to `GET /api/auth/google` → Google consent screen.
   - Google redirects to `GET /api/auth/google/callback` on server.
   - Server creates/links user, generates JWT, redirects to `http://CLIENT_URL/login?token=<jwt>`.
   - Client reads token from URL, stores it, loads user profile.

3. **Admin Detection**: After login, if `user.role === 'admin'`, client redirects to `/admin`.

4. **Security**:
   - Rate limiting: 20 attempts per 15 minutes on auth endpoints.
   - Password minimum: 6 characters (server-enforced).
   - Helmet.js for security headers.
   - CORS restricted to `CLIENT_URL`.
   - Error messages sanitized in production.

---

## Cart System

- **Guest (not logged in)**: Cart stored in `localStorage` under `guest_cart`.
- **Authenticated**: Cart stored in MongoDB, synced via `/api/cart` endpoints.
- **On Login**: Guest cart items are synced to server cart automatically, then localStorage is cleared.
- **Cart API**: Requires JWT. User can only access their own cart (filtered by `req.user._id`).

---

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/events | List all events |
| GET | /api/products | List products (?tag= filter) |
| GET | /api/products/:id | Get single product |

### Auth (rate limited: 20/15min)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Email/password login |
| GET | /api/auth/me | Get current user (JWT) |
| GET | /api/auth/google | Start Google OAuth |
| GET | /api/auth/google/callback | Google OAuth callback |

### Protected (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/cart | Get user cart |
| POST | /api/cart | Add item to cart |
| PUT | /api/cart/:productId | Update item quantity |
| DELETE | /api/cart/:productId | Remove item |
| DELETE | /api/cart | Clear cart |
| POST | /api/orders | Create order from cart |
| GET | /api/orders | List user orders |
| GET | /api/orders/:id | Get order detail |

### Admin (requires JWT + role=admin)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/users | List users (search, pagination) |
| GET | /api/admin/users/:id | User detail + orders + cart |
| PUT | /api/admin/users/:id/role | Change user role |
| DELETE | /api/admin/users/:id | Delete user |
| GET/POST | /api/admin/products | List/create products |
| PUT/DELETE | /api/admin/products/:id | Update/delete product |
| GET/POST | /api/admin/events | List/create events |
| PUT/DELETE | /api/admin/events/:id | Update/delete event |
| GET | /api/admin/orders | List all orders (search, filter, pagination) |
| PUT | /api/admin/orders/:id/status | Update order status |

### Tracking (rate limited: 60/min)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/tracking | Server-side event tracking |

---

## Marketing Integration

### Meta (Facebook) — Two layers:

1. **Browser-side (Meta Pixel)**:
   - Loaded via `fbq()` script in `client/src/utils/tracking.js`.
   - Fires `PageView` on init, then `ViewContent`, `AddToCart`, `Purchase` on user actions.
   - Pixel ID from `VITE_META_PIXEL_ID` in client `.env`.

2. **Server-side (Conversions API)**:
   - Called from `server/src/services/trackingService.js` via `POST /api/tracking`.
   - Hits `https://graph.facebook.com/v19.0/{PIXEL_ID}/events`.
   - Uses `META_PIXEL_ID` + `META_CONVERSIONS_TOKEN` from server `.env`.
   - Sends `event_name`, `event_time`, `action_source`, `user_data`, `custom_data`.

### Google Analytics 4 — Two layers:

1. **Browser-side (gtag.js)**:
   - Script loaded dynamically from `https://www.googletagmanager.com/gtag/js`.
   - Measurement ID from `VITE_GA_MEASUREMENT_ID` in client `.env`.
   - Events fired via `gtag('event', name, params)`.

2. **Server-side (Measurement Protocol)**:
   - Called from tracking service via `POST https://www.google-analytics.com/mp/collect`.
   - Uses `GA4_MEASUREMENT_ID` + `GA4_API_SECRET` from server `.env`.

---

## Environment Variables

### Server (`server/.env`)

```
# Core
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/zeroor_shop
CLIENT_URL=https://zeroor.shop

# Auth
JWT_SECRET=<random-64-char-string>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
GOOGLE_CALLBACK_URL=https://api.zeroor.shop/api/auth/google/callback

# Meta Marketing
META_PIXEL_ID=<from-facebook-business-manager>
META_CONVERSIONS_TOKEN=<from-events-manager-settings>

# GA4 Marketing
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=<from-ga4-admin-data-streams>

# Payment (future)
STRIPE_SECRET_KEY=<stripe-secret>
JAZZCASH_MERCHANT_ID=<jazzcash-id>
EASYPAISA_STORE_ID=<easypaisa-id>
```

### Client (`client/.env`)

```
VITE_API_BASE_URL=https://api.zeroor.shop/api
VITE_META_PIXEL_ID=<same-pixel-id-as-server>
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_CLIENT_ID=<same-google-client-id-as-server>
```

---

## AWS Deployment

### Option A: EC2 + Docker Compose (Simple, Single Server)

**Best for**: Starting out, low traffic, budget-friendly.

1. **Launch EC2 instance**:
   - AMI: Ubuntu 24.04 LTS
   - Type: t3.small (2 vCPU, 2GB RAM) minimum
   - Storage: 20GB gp3
   - Security Group: Open ports 80, 443, 22

2. **Install Docker**:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   ```

3. **Clone repo and set env**:
   ```bash
   git clone <repo-url> /opt/zeroor
   cd /opt/zeroor
   cp server/.env.example server/.env   # Edit with production values
   cp client/.env.example client/.env   # Edit with production values
   ```

4. **Run production stack**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

5. **Setup Nginx reverse proxy + SSL**:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

   `/etc/nginx/sites-available/zeroor`:
   ```nginx
   server {
       server_name zeroor.shop www.zeroor.shop;
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }

   server {
       server_name api.zeroor.shop;
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/zeroor /etc/nginx/sites-enabled/
   sudo certbot --nginx -d zeroor.shop -d www.zeroor.shop -d api.zeroor.shop
   ```

6. **Auto-restart on reboot**:
   ```bash
   sudo systemctl enable docker
   ```

### Option B: ECS Fargate (Scalable, Managed)

**Best for**: Production scale, auto-scaling, high availability.

1. **Push Docker images to ECR**:
   ```bash
   aws ecr create-repository --repository-name zeroor-client
   aws ecr create-repository --repository-name zeroor-server

   # Build & push
   docker build -t zeroor-client -f client/Dockerfile --target production client/
   docker build -t zeroor-server -f server/Dockerfile --target production server/

   docker tag zeroor-client:latest <account>.dkr.ecr.<region>.amazonaws.com/zeroor-client
   docker tag zeroor-server:latest <account>.dkr.ecr.<region>.amazonaws.com/zeroor-server

   aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com
   docker push <account>.dkr.ecr.<region>.amazonaws.com/zeroor-client
   docker push <account>.dkr.ecr.<region>.amazonaws.com/zeroor-server
   ```

2. **Create ECS resources**:
   - VPC with 2 public subnets
   - ECS Cluster (Fargate)
   - 2 Task Definitions: client (256 CPU, 512 MEM) + server (512 CPU, 1024 MEM)
   - 2 ECS Services with desired count = 1
   - Application Load Balancer with target groups for each service
   - Store env vars in AWS Secrets Manager, reference in task definitions

3. **Database**: Use MongoDB Atlas (already configured) — no need for self-hosted Mongo.

4. **DNS**: Route 53 → ALB for `zeroor.shop` and `api.zeroor.shop`.

5. **SSL**: ACM certificate attached to ALB listener.

6. **Auto-scaling**: ECS service auto-scaling based on CPU/memory.

---

## Database Models

### User
- `name`, `email` (unique), `password` (hashed), `googleId`, `avatar`, `role` (user|admin)

### Product
- `name`, `slug` (unique), `price`, `image`, `description`, `tags[]`, `stock`

### Event
- `name`, `slug` (unique), `theme` {primary, accent, text, surface}, `bannerText`, `countdownDate`, `startDate`, `endDate`, `story`

### Cart
- `user` (ref User, unique), `items[]` {product (ref Product), quantity}

### Order
- `user` (ref User), `items[]` {product, name, price, quantity}, `totalAmount`, `status`, `shippingAddress` {fullName, phone, address, city}

---

## Security Measures

- **Rate Limiting**: Auth (20/15min), Tracking (60/min)
- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT**: Signed with secret, 7-day expiry
- **CORS**: Restricted to CLIENT_URL only
- **Admin Protection**: Double middleware (protect + adminOnly)
- **Self-delete Prevention**: Admin cannot delete their own account
- **Regex Escaping**: Search inputs sanitized before MongoDB regex queries
- **Error Sanitization**: Stack traces hidden in production
- **Input Limits**: JSON body limited to 1MB, field length validation

---

## Local Development

```bash
# Start dev (with hot-reload)
docker compose up --build

# Or without Docker:
cd server && npm install && npm run dev    # Terminal 1
cd client && npm install && npm run dev    # Terminal 2

# Seed database
cd server && npm run seed
```

Admin credentials after seed: `zaroor.shop1@gmail.com` / `admin`
