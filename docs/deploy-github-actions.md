# GitHub Actions → Hostinger VPS deploy pipeline

When you **push to `main`**, GitHub automatically SSHs into your VPS, pulls the latest code, and rebuilds Docker.

```
Your PC  →  git push origin main  →  GitHub
                                      │
                                      ▼
                              GitHub Actions (deploy.yml)
                                      │
                                      ▼ SSH
                              Hostinger VPS
                              git pull + docker compose up --build -d
```

You need **two SSH keys** (do not mix them up):

| Key | Private key lives in | Public key goes to |
|-----|----------------------|-------------------|
| **A — VPS login** | GitHub Secret `DEPLOY_SSH_PRIVATE_KEY` | VPS `~/.ssh/authorized_keys` |
| **B — Git read** | VPS `~/.ssh/github_deploy` | GitHub repo → Settings → Deploy keys |

---

## Part 1 — Key A: GitHub Actions can SSH into the VPS

Run on **your laptop** (not on the VPS):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_actions_deploy -N "" -C "github-actions-zaroor-deploy"
```

Show the **public** key (you will paste it on the VPS):

```bash
cat ~/.ssh/github_actions_deploy.pub
```

On the **VPS** (you are already `root@187.127.119.183`):

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
```

Paste the **one line** from `github_actions_deploy.pub`, save, then:

```bash
chmod 600 ~/.ssh/authorized_keys
```

Test from **your laptop**:

```bash
ssh -i ~/.ssh/github_actions_deploy root@187.127.119.183 "echo SSH OK"
```

---

## Part 2 — Key B: VPS can `git pull` from GitHub (no password)

On the **VPS**:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N "" -C "vps-zaroor-git-read"
cat ~/.ssh/github_deploy.pub
```

Copy the output. On **GitHub**:

1. Open https://github.com/zaroorshop/Zaroor-shop  
2. **Settings** → **Deploy keys** → **Add deploy key**  
3. Title: `Hostinger VPS`  
4. Key: paste `github_deploy.pub`  
5. Leave **Allow write access** unchecked → **Add key**

On the **VPS**, configure SSH for GitHub:

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Test:

```bash
ssh -T git@github.com
```

You should see: `Hi zaroorshop/Zaroor-shop! You've successfully authenticated...`

---

## Part 3 — Clone repo on VPS with SSH (one time)

```bash
mkdir -p /var/www
cd /var/www
git clone git@github.com:zaroorshop/Zaroor-shop.git
cd Zaroor-shop
```

Create production env (if not done yet):

```bash
cp server/.env.production.example server/.env
nano server/.env
```

Install Nginx and start Docker once manually (see [deploy-hostinger.md](deploy-hostinger.md) Parts 7–9).  
After that, **GitHub Actions only updates code + containers**.

---

## Part 4 — GitHub repository secrets

On GitHub: **zaroorshop/Zaroor-shop** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add each secret:

| Secret name | Value |
|-------------|--------|
| `DEPLOY_HOST` | `187.127.119.183` |
| `DEPLOY_USER` | `root` |
| `DEPLOY_REMOTE_DIR` | `/var/www/Zaroor-shop` |
| `DEPLOY_SSH_PRIVATE_KEY` | **Entire** contents of `~/.ssh/github_actions_deploy` (private key, including `BEGIN`/`END` lines) |

Optional:

| Secret name | Value |
|-------------|--------|
| `DEPLOY_SSH_PORT` | `22` (default) |

To copy the private key on your laptop:

```bash
cat ~/.ssh/github_actions_deploy
```

Paste everything into the secret field.

---

## Part 5 — Push the workflow to GitHub

On **your laptop**, in the project folder:

```bash
cd /path/to/Zaroor-shop
git add .github/workflows/deploy.yml scripts/deploy-vps.sh docs/deploy-github-actions.md
git commit -m "Add GitHub Actions deploy pipeline to Hostinger VPS"
git push origin main
```

The first push triggers a deploy. Check progress:

**GitHub** → **Actions** tab → **Deploy to VPS**

---

## Part 6 — Daily workflow (after setup)

```bash
# On your laptop — normal development
git add -A
git commit -m "Your change"
git push origin main
```

GitHub Actions deploys automatically. No manual SSH needed.

Manual deploy from VPS (optional):

```bash
cd /var/www/Zaroor-shop
./scripts/deploy-vps.sh
```

Manual deploy from laptop (old script, still works):

```bash
set -a && source ./.env.deploy && set +a
./scripts/deploy-remote.sh "message"   # commits + pushes + SSH deploy
```

Prefer **push to main only** once Actions is set up; avoid `deploy-remote.sh` unless you want it to commit for you.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Actions: `Permission denied (publickey)` | Key A public key not in VPS `authorized_keys`, or wrong `DEPLOY_SSH_PRIVATE_KEY` secret |
| Actions: `git pull` / `fetch` fails | Key B not added as Deploy key, or VPS clone used HTTPS without token |
| Actions: `couldn't find remote ref main` | Branch is not `main`; rename branch or edit `deploy.yml` |
| Actions: Docker build fails | SSH to VPS, run `docker compose -f docker-compose.prod.yml logs` |
| Deploy runs but site old | Check Actions log; confirm `DEPLOY_REMOTE_DIR` matches clone path |
| `server/.env` missing on VPS | Create once on VPS; **never** commit it — Actions does not overwrite `.env` |

---

## Security notes

- Never commit private keys or `server/.env`.
- Deploy key is **read-only** (no write to GitHub).
- GitHub Actions key only needs VPS shell access — use `root` or a dedicated `deploy` user.
- Consider protecting `main` with branch protection + required status checks later.
