#!/bin/bash

# Stock Notebook Database Seeder Script
# This script provides an easy way to seed the database with fake stock data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DATABASE_URL=${DATABASE_URL:-"postgresql://stock_user:stock_password@localhost:5432/stock_notebook"}
COMMAND=${1:-"seed"}

echo -e "${BLUE}🌱 Stock Notebook Database Seeder${NC}"
echo "=================================="
echo ""

# Function to check if PostgreSQL is running
check_postgres() {
    echo -e "${YELLOW}🔍 Checking PostgreSQL connection...${NC}"
    if ! pg_isready -h localhost -p 5432 -U stock_user > /dev/null 2>&1; then
        echo -e "${RED}❌ PostgreSQL is not running or not accessible${NC}"
        echo -e "${YELLOW}💡 Try starting it with: docker compose -f docker-compose.development.yml up -d postgres${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  seed    Populate database with fake stock data (default)"
    echo "  clear   Clear all fake stock data"
    echo "  help    Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL    PostgreSQL connection string"
    echo "                  (default: postgresql://stock_user:stock_password@localhost:5432/stock_notebook)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 seed"
    echo "  $0 clear"
    echo "  DATABASE_URL=postgresql://user:pass@localhost/db $0 seed"
    echo ""
    echo "Prerequisites:"
    echo "  - PostgreSQL must be running"
    echo "  - Database 'stock_notebook' must exist"
    echo "  - User 'stock_user' must have access"
    echo ""
    echo "Quick Start:"
    echo "  1. Start PostgreSQL: docker compose -f docker-compose.development.yml up -d postgres"
    echo "  2. Run seeder: $0 seed"
    echo "  3. Test with frontend!"
}

# Function to seed database
seed_database() {
    echo -e "${BLUE}🌱 Starting database seeding...${NC}"
    check_postgres

    echo -e "${YELLOW}🔧 Building seeder...${NC}"
    if ! cargo build --bin seeder --quiet; then
        echo -e "${RED}❌ Failed to build seeder${NC}"
        exit 1
    fi

    echo -e "${YELLOW}🚀 Running seeder...${NC}"
    if cargo run --bin seeder --quiet seed; then
        echo -e "${GREEN}🎉 Database seeding completed successfully!${NC}"
        echo -e "${BLUE}💡 Your backend now has fake data for AAPL, MSFT, and GOOGL${NC}"
        echo -e "${BLUE}🔧 You can test the frontend without Yahoo Finance API calls${NC}"
    else
        echo -e "${RED}❌ Seeding failed${NC}"
        exit 1
    fi
}

# Function to clear database
clear_database() {
    echo -e "${BLUE}🧹 Clearing fake stock data...${NC}"
    check_postgres

    echo -e "${YELLOW}🔧 Building seeder...${NC}"
    if ! cargo build --bin seeder --quiet; then
        echo -e "${RED}❌ Failed to build seeder${NC}"
        exit 1
    fi

    echo -e "${YELLOW}🗑️  Running cleanup...${NC}"
    if cargo run --bin seeder --quiet clear; then
        echo -e "${GREEN}✅ Database cleared successfully!${NC}"
    else
        echo -e "${RED}❌ Cleanup failed${NC}"
        exit 1
    fi
}

# Main script logic
case $COMMAND in
    "seed")
        seed_database
        ;;
    "clear")
        clear_database
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
