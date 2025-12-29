#!/usr/bin/env bash
set -euo pipefail

# Simple, interactive, idempotent deployment helper for PheonixCRM
# IMPORTANT: review the contents before running. Do NOT run as untrusted user.

if [[ "$EUID" -ne 0 ]]; then
  echo "This script must be run as root or via sudo. Re-run with: sudo bash $0"
  exit 1
fi

read -p "Git repo URL (leave empty if repo already on server): " REPO_URL
read -p "Deploy path [/opt/pheonixCRM]: " DEPLOY_DIR
DEPLOY_DIR=${DEPLOY_DIR:-/opt/pheonixCRM}
read -p "Domain (optional; used for FRONTEND_URL / Certbot): " DOMAIN
read -p "Postgres password (will be set in docker compose): " PG_PASS
read -p "JWT secret (will be set in backend .env): " JWT_SECRET

# Basic hardening & user creation (optional)
read -p "Create non-root deploy user? (y/N): " CREATE_USER
if [[ "$CREATE_USER" =~ ^[Yy]$ ]]; then
  read -p "Username for deploy user [deployer]: " DEPLOY_USER
  DEPLOY_USER=${DEPLOY_USER:-deployer}
  if id -u "$DEPLOY_USER" >/dev/null 2>&1; then
    echo "User $DEPLOY_USER already exists"
  else
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
    usermod -aG sudo "$DEPLOY_USER"
    echo "Created user $DEPLOY_USER. Please set its password with: sudo passwd $DEPLOY_USER"
  fi
fi

# Install prerequisites (Debian/Ubuntu)
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg lsb-release apt-transport-https git nginx ufw

# Docker install
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt update
  apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  echo "Installed Docker"
fi

# Ensure deploy directory exists
mkdir -p "$DEPLOY_DIR"
chown $SUDO_USER:$SUDO_USER "$DEPLOY_DIR" || true
cd "$DEPLOY_DIR"

# Clone repo if URL provided
if [[ -n "$REPO_URL" ]]; then
  if [ -d "$DEPLOY_DIR/.git" ]; then
    echo "Repository already present, pulling latest"
    git pull || true
  else
    git clone "$REPO_URL" .
  fi
fi

# Create backend .env (safe defaults). Review before running.
cat > backend/.env <<EOF
DATABASE_URL="postgresql://postgres:${PG_PASS}@db:5432/appdb"
JWT_SECRET="${JWT_SECRET}"
PORT=3000
FRONTEND_URL="${DOMAIN:-http://127.0.0.1}"
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin
EOF
chmod 600 backend/.env

# Start docker compose production file (expects docker-compose.prod.yml in repo root)
docker compose -f docker-compose.prod.yml up -d --build

# Configure nginx: proxy to internal container ports (127.0.0.1:8080 -> frontend, 127.0.0.1:3000 -> backend)
NGINX_CONF="/etc/nginx/sites-available/pheon"
if [[ -n "$DOMAIN" ]]; then
  cat > "$NGINX_CONF" <<NGINX
server {
  listen 80;
  server_name $DOMAIN www.$DOMAIN;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}

server {
  listen 80;
  server_name api.$DOMAIN;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
else
  cat > "$NGINX_CONF" <<NGINX
server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
  }
}
NGINX
fi

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/pheon
nginx -t && systemctl reload nginx

# Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Optional: systemd service to auto-start compose on boot
if [ -f deploy/pheonixcrm.service ]; then
  cp deploy/pheonixcrm.service /etc/systemd/system/pheonixcrm.service
  systemctl daemon-reload
  systemctl enable --now pheonixcrm.service || true
fi

# If a domain was provided, optionally obtain Let's Encrypt certificates
if [[ -n "$DOMAIN" ]]; then
  read -p "Attempt to obtain Let's Encrypt certs for $DOMAIN, www.$DOMAIN and api.$DOMAIN now? (Y/n): " GET_CERT
  GET_CERT=${GET_CERT:-Y}
  if [[ "$GET_CERT" =~ ^[Yy]$ ]]; then
    echo "Checking DNS for $DOMAIN..."
    DOMAIN_IP=$(getent hosts "$DOMAIN" | awk '{print $1}' || true)
    if [[ -z "$DOMAIN_IP" ]]; then
      DOMAIN_IP=$(ping -c 1 "$DOMAIN" 2>/dev/null | sed -n 's/.*(\(.*\)).*/\1/p' || true)
    fi
    PUB_IP="$(curl -s https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
    if [[ -n "$DOMAIN_IP" && "$DOMAIN_IP" != "$PUB_IP" ]]; then
      echo "Warning: DNS for $DOMAIN resolves to $DOMAIN_IP but this server's public IP appears to be $PUB_IP." 
      read -p "Proceed with Certbot anyway? (y/N): " PROCEED_CERT
      if [[ ! "$PROCEED_CERT" =~ ^[Yy]$ ]]; then
        echo "Skipping certificate issuance. You can run certbot later when DNS is configured."
      fi
    fi

    if command -v certbot >/dev/null 2>&1; then
      echo "certbot already installed"
    else
      echo "Installing certbot (snap)..."
      apt install -y snapd
      snap install core && snap refresh core
      snap install --classic certbot
      ln -sf /snap/bin/certbot /usr/bin/certbot
    fi

    read -p "Email for Certbot registration [admin@$DOMAIN]: " CERTBOT_EMAIL
    CERTBOT_EMAIL=${CERTBOT_EMAIL:-admin@$DOMAIN}

    echo "Running certbot for $DOMAIN..."
    if certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect; then
      echo "Certificates obtained successfully. Updating backend FRONTEND_URL to https://$DOMAIN"
      # Update FRONTEND_URL in backend .env to use https
      if grep -q '^FRONTEND_URL=' backend/.env; then
        sed -i "s|^FRONTEND_URL=.*$|FRONTEND_URL=\"https://$DOMAIN\"|" backend/.env || true
      else
        echo "FRONTEND_URL=\"https://$DOMAIN\"" >> backend/.env
      fi
      echo "Reloading nginx to pick up ssl config"
      nginx -t && systemctl reload nginx
    else
      echo "Certbot failed. Check its output above and try again later."
    fi
  else
    echo "Skipping certificate issuance as requested."
  fi
fi

# Health checks
echo "== Health checks =="
if curl -s http://127.0.0.1:3000/health | grep -q 'ok'; then
  echo "Backend healthy"
else
  echo "Check backend logs: docker compose -f docker-compose.prod.yml logs -f backend"
fi

if curl -s http://127.0.0.1:8080 | grep -q '<!DOCTYPE html>'; then
  echo "Frontend is serving"
else
  echo "Frontend may not be built; check container logs: docker compose -f docker-compose.prod.yml logs -f frontend"
fi

echo "Deploy script finished. Review outputs above. If you need help, paste error output here."
