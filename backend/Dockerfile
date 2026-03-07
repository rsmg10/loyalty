FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/Loyalty.Api/Loyalty.Api.csproj backend/Loyalty.Api/
RUN dotnet restore backend/Loyalty.Api/Loyalty.Api.csproj
COPY backend/Loyalty.Api/ backend/Loyalty.Api/
WORKDIR /src/backend/Loyalty.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "Loyalty.Api.dll"]
