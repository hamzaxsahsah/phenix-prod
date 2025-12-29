# Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
# use npm install to avoid requiring package-lock; allow legacy peer deps for angular packages
RUN npm install --silent --legacy-peer-deps
COPY . .
RUN npm run build --silent

# Serve with nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
