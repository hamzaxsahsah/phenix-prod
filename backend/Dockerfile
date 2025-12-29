# ---- builder ----
FROM node:18-alpine AS builder
WORKDIR /app

# install deps
COPY package*.json tsconfig.json ./
COPY prisma ./prisma/
RUN npm ci

# copy sources and build
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# ---- runtime ----
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# install runtime dependencies required by Prisma (OpenSSL) and bash
RUN apk add --no-cache bash openssl ca-certificates && update-ca-certificates || true

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY package*.json ./

RUN chmod +x ./entrypoint.sh || true

EXPOSE 3000
ENTRYPOINT ["/bin/sh", "-c", "./entrypoint.sh"]
