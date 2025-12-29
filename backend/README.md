# Backend (TypeScript + Prisma)

Quick start:

- copy `.env.example` to `.env` and set values
- run local development: `npm ci && npm run dev`
- build: `npm run build` then `npm start`
- docker: `docker-compose up --build`

Endpoints:
- POST /auth/register { email, password } (registers a user with role USER)
- POST /auth/login { email, password }
- GET /health

Delivery & deliveryman endpoints:
- POST /deliverymen { email, password } -> create a delivery man (role DELIVERY_MAN)
- GET /deliverymen -> list delivery men
- POST /deliveries { clientName, address, phoneNumber, product (required), serialNumber?, price?, state?, assignedToId?, createdById? }

Example:
```
POST /deliveries
{
  "clientName": "Client A",
  "product": "Widget",
  "address": "123 Main St",
  "phoneNumber": "0600000000",
  "price": 12.5
}
```
- GET /deliveries -> list deliveries (optional query param `assignedToId`)
- GET /deliveries/:id -> get a delivery
- PATCH /deliveries/:id -> update fields like `state` or `assignedToId`

Delivery states (enum names):
- AJOUTE, ANNULE, ANNULE_PAS_INTERESSE, ANNULE_SUIVI, CHANGE, CHANGEMENT_CLIENT, CHANGEMENT_NUMERO, DEMANDE_DE_RETOUR,
  EXPEDIE, HORS_ZONE, INJOIGNABLE, INJOIGNABLE_SUIVI, INTERESSE, LIVRE, MANQUE_DE_STOCK, MISE_EN_DISTRIBUTION,
  NUMERO_ERRONE, NUMERO_INCORRECT, PAS_DE_REPONSE, PAS_DE_REPONSE_SUIVI, PAS_DE_REPONSE_2, PAS_DE_REPONSE_3,
  PAS_DE_REPONSE_4, PAS_DE_REPONSE_5, PAS_DE_REPONSE_LV, PRET_POUR_EXPEDITION, PROGRAMME, RAMASSE, RECU_PAR_LIVREUR,
  REFUSE, REPORTE, REPORTE_SUIVI, RETOUR_CLIENT_RECU, RETOUR_RECU_AGENCE_CASA, RETOURNE, RETOURNE_VERS_AGENCE

Notes:
- Migrations require a reachable Postgres database. Run `docker-compose up -d db` or start your Postgres server, then run:
  `npx prisma migrate dev --name add_deliveries` to create + apply migrations and `npx prisma generate` to regenerate the client.
- For simple testing without Postgres, I can change the datasource to SQLite temporarily and run migrations locally — tell me if you prefer that.

Postman collection (quick test)
- I added `postman_collection.json` and `postman_environment.json` in the `backend/` folder.
- Import both in Postman: File -> Import -> select collection and environment.
- Select the environment `Pheonix Backend Local` and run the collection with the Collection Runner. Ensure your backend is running at `http://localhost:3000`.
- The collection will:
  1. Check `/health`
  2. Register a user (unique email generated automatically)
  3. Login and capture JWT
  4. Create a deliveryman
  5. Create a delivery (uses `product` field)
  6. List, get, and update the delivery
