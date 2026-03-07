#!/usr/bin/env bash
set -euo pipefail

echo "Resetting dev database (Postgres)..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required."
  exit 1
fi

if ! command -v docker compose >/dev/null 2>&1; then
  echo "Docker Compose v2 is required."
  exit 1
fi

docker compose --profile dev down
docker volume rm "${PWD##*/}_postgres-data" >/dev/null 2>&1 || true
docker compose --profile dev up -d postgres

echo "Postgres volume reset. Run migrations with:"
echo "  dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj"
