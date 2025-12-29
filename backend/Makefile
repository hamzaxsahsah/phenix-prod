# Simple Makefile for common tasks
.PHONY: dev build start docker-build docker-run prisma-generate prisma-migrate

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

prisma-generate:
	npm run prisma:generate

prisma-migrate:
	npm run prisma:migrate

docker-build:
	docker build -t pheonix-backend:latest .

docker-run:
	docker run --rm -e DATABASE_URL="postgresql://postgres:example@host.docker.internal:5432/appdb" -p 3000:3000 pheonix-backend:latest

docker-up:
	docker-compose up --build

docker-down:
	docker-compose down -v
