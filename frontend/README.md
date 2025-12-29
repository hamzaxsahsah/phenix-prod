# Frontend (Angular) — Pheonix Admin

Quick start (local dev):

1. cd frontend
2. npm ci
3. npm start

Build for production:

1. npm run build

Docker (production):

1. docker-compose up --build
2. Open http://localhost:8080 — the Angular app will talk to backend at http://backend:3000 inside Docker compose.

Default admin login: admin / admin

Notes:
- The frontend sends requests to `/auth`, `/deliverymen`, `/deliveries`. Ensure backend is reachable at the configured `apiUrl` in `src/environments/environment*.ts`.
- UI uses Angular Material. Use `npm install` to ensure Material dependencies are installed if building locally.
- To improve UI further I can add dialogs, confirmation dialogs, and data tables with pagination and filtering.
