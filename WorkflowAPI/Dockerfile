# Base runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WorkflowAPI/WorkflowAPI.csproj", "WorkflowAPI/"]
RUN dotnet restore "WorkflowAPI/WorkflowAPI.csproj"
COPY . .
WORKDIR "/src/WorkflowAPI"
RUN dotnet build "WorkflowAPI.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "WorkflowAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Mude a linha abaixo para configurar a porta
ENTRYPOINT ["dotnet", "WorkflowAPI.dll", "--urls", "http://0.0.0.0:5000"]
