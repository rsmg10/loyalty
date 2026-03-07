#!/usr/bin/env bash
set -euo pipefail

echo "Seeding dev data..."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required."
  exit 1
fi

if ! command -v docker compose >/dev/null 2>&1; then
  echo "Docker Compose v2 is required."
  exit 1
fi

docker compose --profile dev up -d postgres

export Seed__Enabled=true
dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
dotnet run --project backend/Loyalty.Api/Loyalty.Api.csproj
