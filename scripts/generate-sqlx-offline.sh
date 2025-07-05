#!/bin/bash

# Simple script to generate SQLx offline data for production builds
# This script sets up a temporary database and generates .sqlx files

set -e

echo "🔧 Generating SQLx offline data for production builds..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
POSTGRES_VERSION="15"
POSTGRES_USER="stock_user"
POSTGRES_PASSWORD="temp_password"
POSTGRES_DB="stock_notebook"
POSTGRES_PORT="5433"
CONTAINER_NAME="sqlx-temp-postgres"

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed.${NC}" >&2; exit 1; }
command -v cargo >/dev/null 2>&1 || { echo -e "${RED}❌ Cargo is required but not installed.${NC}" >&2; exit 1; }

# Function to cleanup
cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up temporary database...${NC}"
    docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
    docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Change to backend directory
cd "$(dirname "$0")/../backend"

# Start temporary PostgreSQL database
echo -e "${YELLOW}🚀 Starting temporary PostgreSQL database...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $POSTGRES_PORT:5432 \
    -e POSTGRES_USER=$POSTGRES_USER \
    -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    -e POSTGRES_DB=$POSTGRES_DB \
    postgres:$POSTGRES_VERSION-alpine

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Test database connection
DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec $CONTAINER_NAME pg_isready -U $POSTGRES_USER >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}⏳ Waiting for database... (attempt $attempt/$max_attempts)${NC}"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ Database failed to start after $max_attempts attempts${NC}"
    exit 1
fi

# Set environment variable for SQLx
export DATABASE_URL=$DATABASE_URL

# Install sqlx-cli if not present
if ! command -v sqlx >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Installing sqlx-cli...${NC}"
    cargo install sqlx-cli --no-default-features --features postgres
fi

# Run migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
sqlx migrate run --source migrations

# Generate .sqlx files
echo -e "${YELLOW}📝 Generating SQLx offline data...${NC}"
if cargo sqlx prepare --check >/dev/null 2>&1; then
    echo -e "${GREEN}✅ SQLx offline data is already up to date!${NC}"
else
    cargo sqlx prepare
    echo -e "${GREEN}✅ SQLx offline data generated successfully!${NC}"
fi

# Verify .sqlx directory was created
if [ -d ".sqlx" ]; then
    echo -e "${GREEN}✅ .sqlx directory created with $(find .sqlx -name "*.json" | wc -l) query files${NC}"
else
    echo -e "${RED}❌ .sqlx directory was not created${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 SQLx offline data generation complete!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "  1. Commit the .sqlx directory to your repository"
echo -e "  2. Use docker-compose.production.yml for production builds"
echo -e "  3. Production builds will now work without database connection!"
