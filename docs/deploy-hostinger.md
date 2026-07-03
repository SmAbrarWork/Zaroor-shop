# Zaroor Shop — Hostinger VPS deploy guide (step by step)

Follow the sections in order. Every step includes commands you can copy and run.

Replace placeholders:

| Placeholder | Example |
|-------------|---------|
| `YOUR_VPS_IP` | `203.0.113.10` |
| `YOUR_SSH_USER` | `root` |
| `YOUR_REPO_PATH` | `/var/www/Zaroor-shop` |

---

## Overview

```
Internet → Nginx (80/443) → Docker client :3000 (website)
                          → Docker server :5000 (API /api)
                          → MongoDB Atlas (cloud)
```

---

# Part 1 — On your computer (push code to GitHub)

## Step 1.1 — Go to the project folder

```bash
cd ~/path/to/Zaroor-shop
```

(Use your actual path if different.)

## Step 1.2 — Check what will be committed

```bash
git status
```

Make sure **`server/.env`** is **not** listed (it must stay local only).

## Step 1.3 — Stage and commit

```bash
git add -A
git commit -m "Production deploy setup and latest changes"
```

If Git says “nothing to commit”, skip to Step 1.4.

## Step 1.4 — Push to GitHub

```bash
git push origin main
```

Use your branch name instead of `main` if needed:

```bash
git push origin your-branch-name
```

---

# Part 2 — Connect to the Hostinger VPS

## Step 2.1 — SSH into the server

From your computer:

```bash
ssh -i ~/.ssh/hostinger_vps YOUR_SSH_USER@YOUR_VPS_IP
```

Example:

```bash
ssh -i ~/.ssh/hostinger_vps root@203.0.113.10
```

All commands in **Part 3 onward** are run **on the VPS** (after SSH), unless noted.

---

# Part 3 — Install Docker on the VPS (first time only)

## Step 3.1 — Update packages

```bash
sudo apt update
sudo apt upgrade -y
```

## Step 3.2 — Install Docker

```bash
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Step 3.3 — Allow your user to run Docker (optional but recommended)

```bash
sudo usermod -aG docker $USER
```

Log out and SSH back in so the group applies:

```bash
exit
```

Then SSH again (Step 2.1).

## Step 3.4 — Verify Docker

```bash
docker --version
docker compose version
```

---

# Part 4 — Clone the project on the VPS

## Step 4.1 — Create directory and clone

**Option A — HTTPS (simplest):**

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone https://github.com/zaroorshop/Zaroor-shop.git
cd Zaroor-shop
```

**Option B — SSH (if you added a deploy key on GitHub):**

```bash
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www
git clone git@github.com:zaroorshop/Zaroor-shop.git
cd Zaroor-shop
```

## Step 4.2 — Confirm you are on the latest code

```bash
git branch
git pull origin main
```

---

# Part 5 — Create production environment file

Only **`server/.env`** is required on the VPS for Docker.

You do **not** need `client/.env` on the VPS.

## Step 5.1 — Copy the production template

```bash
cd /var/www/Zaroor-shop
cp server/.env.example server/.env
```

## Step 5.2 — Edit `server/.env`

```bash
nano server/.env
```

Set at least these (replace with your real values):

```env
NODE_ENV=production
PORT=5000

MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/zeroor_shop?retryWrites=true&w=majority

CLIENT_URL=https://zaroor.shop,https://www.zaroor.shop

JWT_SECRET=PASTE_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARACTERS

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://zaroor.shop/api/auth/google/callback
```

Save in nano: `Ctrl+O`, Enter, then `Ctrl+X`.

**Generate a random JWT secret on the VPS:**

```bash
openssl rand -base64 48
```

Paste the output into `JWT_SECRET=` in `server/.env`.

## Step 5.3 — (Optional) Marketing IDs for the frontend build

Only if you use Meta Pixel, GA4, or Google login in the browser:

```bash
cp .env.production.example .env
nano .env
```

Fill `VITE_META_PIXEL_ID`, `VITE_GA_MEASUREMENT_ID`, `VITE_GOOGLE_CLIENT_ID` if needed.

If you skip this step, the shop still works; tracking/OAuth UI keys may be empty until you add them and rebuild. See **[marketing-tracking.md](marketing-tracking.md)** for Meta Pixel / GA4 details.

---

# Part 6 — DNS (Hostinger panel)

Do this in **Hostinger → Domains → DNS**, not on the command line.

| Type | Name | Value |
|------|------|--------|
| A | `@` | `YOUR_VPS_IP` |
| A | `www` | `YOUR_VPS_IP` |

Wait 5–30 minutes for DNS to propagate.

**Check from your computer:**

```bash
dig +short zaroor.shop
dig +short www.zaroor.shop
```

Both should show `YOUR_VPS_IP`.

---

# Part 7 — Install and configure Nginx

## Step 7.1 — Install Nginx and Certbot

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

## Step 7.2 — Copy the site config

```bash
cd /var/www/Zaroor-shop
sudo cp deploy/nginx/zaroor.shop.conf.example /etc/nginx/sites-available/zaroor.shop
```

## Step 7.3 — Enable the site

```bash
sudo ln -sf /etc/nginx/sites-available/zaroor.shop /etc/nginx/sites-enabled/zaroor.shop
sudo rm -f /etc/nginx/sites-enabled/default
```

## Step 7.4 — Test and reload Nginx

```bash
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl reload nginx
```

---

# Part 8 — Build and start Docker containers

## Step 8.1 — Build and run in the background

```bash
cd /var/www/Zaroor-shop
docker compose up --build -d
```

First build may take several minutes.

## Step 8.2 — Check container status

```bash
docker compose ps
```

Both `server` and `client` should show **healthy** (may take ~1 minute).

## Step 8.3 — View logs if something fails

```bash
docker compose logs -f server
```

Press `Ctrl+C` to stop following logs.

```bash
docker compose logs -f client
```

## Step 8.4 — Test API on the VPS (before SSL)

```bash
curl -s http://127.0.0.1:5000/api/health
```

Expected:

```json
{"success":true,"message":"Server is healthy"}
```

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/
```

Expected: `200`

---

# Part 9 — HTTPS (SSL certificate)

## Step 9.1 — Get certificate with Certbot

```bash
sudo certbot --nginx -d zaroor.shop -d www.zaroor.shop
```

Follow the prompts (email, agree to terms). Choose redirect HTTP → HTTPS when asked.

## Step 9.2 — Test HTTPS

```bash
curl -s https://zaroor.shop/api/health
```

Open in a browser:

- https://zaroor.shop  
- https://www.zaroor.shop  

---

# Part 10 — (Optional) Seed the database

Creates sample products/admin if your seed script is configured:

```bash
cd /var/www/Zaroor-shop
docker compose exec server npm run seed
```

---

# Part 11 — Firewall (recommended)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

Do **not** open ports 3000 or 5000 to the public.

---

# Part 12 — Google OAuth (if you use Google login)

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth client:

**Authorized JavaScript origins:**

```
https://zaroor.shop
https://www.zaroor.shop
```

**Authorized redirect URIs:**

```
https://zaroor.shop/api/auth/google/callback
```

Must match `GOOGLE_CALLBACK_URL` in `server/.env`.

---

# Part 13 — Deploy updates later (every new release)

## On your laptop

Push your changes to GitHub:

```bash
git add -A
git commit -m "Describe your change"
git push origin main
```

## On the VPS (pull + rebuild + live)

```bash
ssh root@YOUR_VPS_IP
cd /var/www/Zaroor-shop
./scripts/go-live.sh
```

This script: stops Docker → `git pull origin main` → `docker compose up --build -d` → health check.

First time on VPS, make it executable:

```bash
chmod +x /var/www/Zaroor-shop/scripts/go-live.sh
```

Verify in browser: **https://zaroor.shop**

If you changed `VITE_*` in root `.env`, the `up --build` step rebuilds the client image automatically.

If you only changed `server/.env` (no code change):

```bash
docker compose up -d --force-recreate server
```

---

# Part 14 — Automatic deploy on every `git push` (optional)

Use **GitHub Actions** so you only push to `main` and the VPS updates itself (no manual `go-live.sh`).

**Full setup (SSH keys + GitHub secrets):** [deploy-github-actions.md](deploy-github-actions.md)

After setup, your daily workflow is:

```bash
git push origin main
```

Check runs under GitHub → **Actions** → **Deploy to VPS**.

---

# Quick reference — commands only

**VPS first deploy:**

```bash
sudo apt update && sudo apt upgrade -y
# install Docker (Part 3)
cd /var/www && git clone https://github.com/zaroorshop/Zaroor-shop.git && cd Zaroor-shop
cp server/.env.example server/.env && nano server/.env
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/zaroor.shop.conf.example /etc/nginx/sites-available/zaroor.shop
sudo ln -sf /etc/nginx/sites-available/zaroor.shop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
docker compose up --build -d
sudo certbot --nginx -d zaroor.shop -d www.zaroor.shop
curl -s https://zaroor.shop/api/health
```

**VPS update (after git push):**

```bash
cd /var/www/Zaroor-shop && ./scripts/go-live.sh
```

---

# Troubleshooting

| Problem | Command / fix |
|---------|----------------|
| Container not healthy | `docker compose logs server` |
| CORS errors in browser | Fix `CLIENT_URL` in `server/.env`, then `docker compose up -d --force-recreate server` |
| Site loads, API 404 | Nginx not proxying `/api` — redo Part 7 |
| `git pull` auth failed | Use HTTPS clone or add SSH deploy key on GitHub |
| Certbot fails | DNS must point to VPS first (Part 6) |
| Restart everything | `cd /var/www/Zaroor-shop && ./scripts/go-live.sh` |

---

# Checklist before going live

- [ ] Code pushed to GitHub
- [ ] `server/.env` on VPS with `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (32+ chars)
- [ ] Valid `MONGO_URI` (Atlas IP allowlist includes `0.0.0.0/0` or VPS IP)
- [ ] `CLIENT_URL` has `https://zaroor.shop` and `https://www.zaroor.shop`
- [ ] DNS A records → VPS IP
- [ ] Nginx enabled and tested (`sudo nginx -t`)
- [ ] `docker compose ps` → healthy
- [ ] `curl https://zaroor.shop/api/health` → success
- [ ] HTTPS works in browser
- [ ] Google OAuth URLs updated (if used)
