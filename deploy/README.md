# Deployment (KVM VPS on Hostinger)

This document contains example steps and templates to deploy the Angular frontend and Node backend using Docker Compose, Nginx and Certbot on a Hostinger KVM VPS.

Replace `yourdomain.com` and `api.yourdomain.com` with your actual domain names (Hostinger domain if you're using their DNS).

## Quick steps

1. SSH into your VPS and install Docker & Docker Compose plugin (Ubuntu/Debian):

```bash
sudo apt update && sudo apt upgrade -y
# install Docker
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
```

2. Clone repo and create .env (example):
```bash
sudo mkdir -p /opt/pheonixCRM && sudo chown $USER /opt/pheonixCRM
cd /opt/pheonixCRM
git clone <your-repo-url> .
cd backend
cat > .env <<EOF
DATABASE_URL="postgresql://postgres:StrongPassHere@db:5432/appdb"
JWT_SECRET="very-strong-jwt-secret"
PORT=3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-admin-password
FRONTEND_URL=https://yourdomain.com
EOF
```

3. Start production stack:
```bash
cd /opt/pheonixCRM
docker compose -f docker-compose.prod.yml up -d --build
```

4. Configure Nginx on host
- Copy `deploy/nginx.conf` to `/etc/nginx/sites-available/pheonix` and replace `example.com` with your domain(s). Then `sudo ln -s /etc/nginx/sites-available/pheonix /etc/nginx/sites-enabled/` and `sudo nginx -t && sudo systemctl reload nginx`.

5. Obtain TLS certs (Certbot):
```bash
sudo apt install snapd
sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com
```

6. Optional: enable systemd service
```bash
# place deploy/pheonixcrm.service into /etc/systemd/system/pheonixcrm.service
sudo systemctl daemon-reload
sudo systemctl enable --now pheonixcrm.service
```

## Notes & tips
- The backend `index.ts` reads `FRONTEND_URL` environment variable and uses it for CORS origin.
- For production, use strong secrets and back up the Postgres volume.
- If you prefer a managed Postgres, update `DATABASE_URL` accordingly.
