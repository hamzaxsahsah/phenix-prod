# How to run the deploy script on your VPS

1. SSH to the VPS (do this from your local machine):
   ssh root@72.62.31.157

2. (Optional but recommended) change root password immediately and create a non-root user:
   passwd
   adduser deployer
   usermod -aG sudo deployer

3. Review the script content before running. (Important for security.)
   cat /opt/pheonixCRM/deploy/setup-deploy.sh

4. Run the script as root (it will prompt for values):
   sudo bash /opt/pheonixCRM/deploy/setup-deploy.sh

5. After the script finishes:
   - Visit http://72.62.31.157 to check the frontend.
   - Check backend health locally on the VPS:
     curl http://127.0.0.1:3000/health

6. If you provided a domain when running the `setup-deploy.sh` script, the script can automatically obtain Let's Encrypt certificates for `yourdomain.com`, `www.yourdomain.com`, and `api.yourdomain.com`.
   - Make sure DNS A records for those names point to this VPS IP.
   - The script will prompt whether you want to run Certbot and ask for a contact email.
   - If you prefer to run Certbot manually later, use:
     sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

7. If anything fails, copy and paste exact error output or container logs here and I will help fix it:
   docker compose -f docker-compose.prod.yml logs -f backend
   docker compose -f docker-compose.prod.yml logs -f frontend

---
Security notes:
- DO NOT share passwords publicly. Rotate credentials if you already shared them.
- Consider disabling root SSH access and only allow login with a deploy user + keypair.
