#!/bin/sh
set -e

echo "Waiting for DB and applying migrations..."
until npx prisma migrate deploy; do
  echo "DB not ready, retrying in 2s..."
  sleep 2
done

# run optional seed (ignore failures)
if [ -f ./dist/seed.js ]; then
  echo "Running seed script..."
  node dist/seed.js || true
fi

exec node dist/index.js
