#!/bin/bash

# Database Seeding Script for Stock Notebook
# This script seeds the PostgreSQL database with sample data for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Database connection details
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="stock_notebook"
DB_USER="stock_user"
DB_PASSWORD="stock_password"
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL connection..."

    if ! docker compose exec postgres pg_isready -U $DB_USER -d $DB_NAME &> /dev/null; then
        print_error "PostgreSQL is not running or not ready"
        print_status "Please start PostgreSQL first:"
        print_status "  docker compose up -d postgres"
        exit 1
    fi

    print_success "PostgreSQL is running and ready"
}

# Clear existing data
clear_data() {
    print_status "Clearing existing data..."

    docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME << 'EOF'
-- Clear data from tables (respecting foreign key constraints)
DELETE FROM purchases;
DELETE FROM users;

-- Reset sequences if any
-- PostgreSQL automatically handles UUID generation, so no sequences to reset
EOF

    print_success "Existing data cleared"
}

# Seed users
seed_users() {
    print_status "Seeding users..."

    # Password is "password123" hashed with bcrypt
    local password_hash='$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewqxfxIXnkQkrHuO'

    docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME << EOF
-- Insert sample users
INSERT INTO users (id, username, password_hash, created_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'demo_user', '$password_hash', NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'investor_joe', '$password_hash', NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'stock_trader', '$password_hash', NOW());
EOF

    print_success "Users seeded successfully"
    print_status "Demo users created with password: password123"
}

# Seed purchases
seed_purchases() {
    print_status "Seeding purchase data..."

    docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME << 'EOF'
-- Insert sample purchases
INSERT INTO purchases (id, symbol, quantity, price_per_share, commission, purchase_date, created_at) VALUES
    -- Apple purchases
    ('650e8400-e29b-41d4-a716-446655440001', 'AAPL', 100, 150.50, 9.99, '2024-01-15', '2024-01-15 10:30:00+00'),
    ('650e8400-e29b-41d4-a716-446655440002', 'AAPL', 50, 145.75, 9.99, '2024-02-20', '2024-02-20 14:15:00+00'),
    ('650e8400-e29b-41d4-a716-446655440003', 'AAPL', 25, 160.25, 9.99, '2024-03-10', '2024-03-10 09:45:00+00'),

    -- Microsoft purchases
    ('650e8400-e29b-41d4-a716-446655440004', 'MSFT', 75, 380.00, 9.99, '2024-01-20', '2024-01-20 11:00:00+00'),
    ('650e8400-e29b-41d4-a716-446655440005', 'MSFT', 25, 375.50, 9.99, '2024-02-25', '2024-02-25 15:30:00+00'),

    -- Google/Alphabet purchases
    ('650e8400-e29b-41d4-a716-446655440006', 'GOOGL', 20, 2750.00, 9.99, '2024-01-25', '2024-01-25 10:15:00+00'),
    ('650e8400-e29b-41d4-a716-446655440007', 'GOOGL', 10, 2800.25, 9.99, '2024-03-05', '2024-03-05 13:20:00+00'),

    -- Amazon purchases
    ('650e8400-e29b-41d4-a716-446655440008', 'AMZN', 30, 3200.00, 9.99, '2024-02-01', '2024-02-01 09:30:00+00'),
    ('650e8400-e29b-41d4-a716-446655440009', 'AMZN', 15, 3150.75, 9.99, '2024-03-15', '2024-03-15 16:45:00+00'),

    -- Tesla purchases
    ('650e8400-e29b-41d4-a716-44665544000a', 'TSLA', 40, 250.00, 9.99, '2024-01-30', '2024-01-30 12:00:00+00'),
    ('650e8400-e29b-41d4-a716-44665544000b', 'TSLA', 20, 245.50, 9.99, '2024-02-28', '2024-02-28 14:30:00+00'),

    -- Meta purchases
    ('650e8400-e29b-41d4-a716-44665544000c', 'META', 35, 320.00, 9.99, '2024-02-10', '2024-02-10 11:30:00+00'),
    ('650e8400-e29b-41d4-a716-44665544000d', 'META', 15, 315.75, 9.99, '2024-03-20', '2024-03-20 10:00:00+00'),

    -- NVIDIA purchases
    ('650e8400-e29b-41d4-a716-44665544000e', 'NVDA', 25, 800.00, 9.99, '2024-01-10', '2024-01-10 15:00:00+00'),
    ('650e8400-e29b-41d4-a716-44665544000f', 'NVDA', 15, 850.25, 9.99, '2024-03-01', '2024-03-01 13:45:00+00'),

    -- Netflix purchases
    ('650e8400-e29b-41d4-a716-446655440010', 'NFLX', 20, 450.00, 9.99, '2024-02-15', '2024-02-15 12:30:00+00'),

    -- ETF purchases
    ('650e8400-e29b-41d4-a716-446655440011', 'SPY', 100, 420.00, 9.99, '2024-01-05', '2024-01-05 09:30:00+00'),
    ('650e8400-e29b-41d4-a716-446655440012', 'SPY', 50, 425.50, 9.99, '2024-02-05', '2024-02-05 10:15:00+00'),
    ('650e8400-e29b-41d4-a716-446655440013', 'QQQ', 75, 380.00, 9.99, '2024-01-12', '2024-01-12 14:00:00+00');
EOF

    print_success "Purchase data seeded successfully"
}

# Display summary
show_summary() {
    print_status "Database seeding completed! Summary:"

    docker compose exec -T postgres psql -U $DB_USER -d $DB_NAME << 'EOF'
-- Show summary of seeded data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Purchases' as table_name, COUNT(*) as count FROM purchases;

-- Show purchase summary by symbol
SELECT
    symbol,
    COUNT(*) as purchase_count,
    SUM(quantity) as total_quantity,
    ROUND(AVG(price_per_share), 2) as avg_price,
    ROUND(SUM(quantity * price_per_share + commission), 2) as total_spent
FROM purchases
GROUP BY symbol
ORDER BY total_spent DESC;
EOF

    echo ""
    print_success "Sample data loaded successfully!"
    echo ""
    print_status "Demo credentials:"
    echo "  Username: demo_user"
    echo "  Password: password123"
    echo ""
    print_status "Database contains:"
    echo "  • 3 sample users"
    echo "  • 19 stock purchases across 9 different symbols"
    echo "  • Mix of individual stocks and ETFs"
    echo "  • Purchase dates spanning several months"
    echo ""
    print_status "You can now:"
    echo "  • Test the login functionality"
    echo "  • View the dashboard with portfolio data"
    echo "  • Test stock detail views"
    echo "  • Explore the purchase history"
}

# Main execution
main() {
    echo "🌱 Stock Notebook Database Seeding"
    echo "==================================="

    check_postgres

    if [ "$1" = "--clear-only" ]; then
        clear_data
        print_success "Data cleared successfully"
        exit 0
    fi

    if [ "$1" != "--append" ]; then
        clear_data
    fi

    seed_users
    seed_purchases
    show_summary
}

# Handle script arguments
case "$1" in
    --clear-only)
        print_status "Clearing data only..."
        main --clear-only
        ;;
    --append)
        print_status "Appending data (not clearing existing)..."
        main --append
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --clear-only   Clear existing data without seeding new data"
        echo "  --append       Add seed data without clearing existing data"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "Run without arguments to clear and seed with fresh data"
        echo ""
        echo "Prerequisites:"
        echo "  • PostgreSQL container must be running"
        echo "  • Database migrations must be applied"
        echo ""
        echo "Demo credentials after seeding:"
        echo "  Username: demo_user"
        echo "  Password: password123"
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
