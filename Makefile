.PHONY: dev prod reset-db seed migrate

dev:
	docker compose --profile dev up --build

prod:
	docker compose --profile prod up --build

reset-db:
	./scripts/reset-dev-db.sh

seed:
	./scripts/seed-dev-data.sh

migrate:
	dotnet ef database update --project backend/Loyalty.Api/Loyalty.Api.csproj
