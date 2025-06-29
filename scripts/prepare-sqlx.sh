#!/bin/bash

# SQLx Offline Preparation Script for PostgreSQL
# This script prepares SQLx query data for offline compilation

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

# Configuration
DATABASE_URL="postgresql://stock_user:stock_password@localhost:5432/stock_notebook"
BACKEND_DIR="backend"

# Check if we're in the right directory
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Must be run from the project root directory (where backend/ exists)"
    exit 1
fi

# Check if sqlx-cli is installed
check_sqlx_cli() {
    print_status "Checking SQLx CLI installation..."

    if ! command -v sqlx &> /dev/null; then
        print_warning "SQLx CLI not found. Installing..."
        cargo install sqlx-cli --no-default-features --features postgres
    fi

    print_success "SQLx CLI is available"
}

# Check if PostgreSQL is running
check_postgres() {
    print_status "Checking PostgreSQL connection..."

    if ! docker compose exec postgres pg_isready -U stock_user -d stock_notebook &> /dev/null; then
        print_error "PostgreSQL is not running or not ready"
        print_status "Please start PostgreSQL first:"
        print_status "  docker compose up -d postgres"
        exit 1
    fi

    print_success "PostgreSQL is running and ready"
}

# Run database migrations if needed
run_migrations() {
    print_status "Ensuring database migrations are up to date..."

    cd "$BACKEND_DIR"

    # Check migration status
    if sqlx migrate info --database-url "$DATABASE_URL" --source migrations | grep -q "pending"; then
        print_status "Running pending migrations..."
        sqlx migrate run --database-url "$DATABASE_URL" --source migrations
        print_success "Migrations completed"
    else
        print_success "All migrations are up to date"
    fi

    cd ..
}

# Clean existing SQLx data
clean_sqlx_data() {
    print_status "Cleaning existing SQLx data..."

    if [ -d "$BACKEND_DIR/.sqlx" ]; then
        rm -rf "$BACKEND_DIR/.sqlx"
        print_success "Removed old SQLx data"
    else
        print_status "No existing SQLx data to clean"
    fi
}

# Prepare SQLx queries
prepare_queries() {
    print_status "Preparing SQLx queries for offline compilation..."

    cd "$BACKEND_DIR"

    # Set database URL for sqlx prepare
    export DATABASE_URL="$DATABASE_URL"

    # Prepare queries
    if sqlx prepare --database-url "$DATABASE_URL"; then
        print_success "SQLx queries prepared successfully"
    else
        print_error "Failed to prepare SQLx queries"
        cd ..
        exit 1
    fi

    cd ..
}

# Verify prepared data
verify_prepared_data() {
    print_status "Verifying prepared SQLx data..."

    if [ -d "$BACKEND_DIR/.sqlx" ]; then
        local query_count=$(find "$BACKEND_DIR/.sqlx" -name "*.json" | wc -l)
        print_success "Found $query_count prepared queries"

        # Show first query file for verification
        local first_query=$(find "$BACKEND_DIR/.sqlx" -name "*.json" | head -1)
        if [ -n "$first_query" ]; then
            print_status "Sample query metadata:"
            echo "----------------------------------------"
            head -20 "$first_query" | sed 's/^/  /'
            echo "----------------------------------------"
        fi
    else
        print_error "No .sqlx directory found after preparation"
        exit 1
    fi
}

# Test offline compilation
test_offline_build() {
    print_status "Testing offline compilation..."

    cd "$BACKEND_DIR"

    # Test with offline mode
    export SQLX_OFFLINE=true

    if cargo check; then
        print_success "Offline compilation test passed"
    else
        print_error "Offline compilation test failed"
        print_warning "You may need to fix any query mismatches"
        cd ..
        exit 1
    fi

    # Clean up environment
    unset SQLX_OFFLINE
    cd ..
}

# Update Dockerfile for offline mode
update_dockerfile() {
    print_status "Updating Dockerfile for offline compilation..."

    local dockerfile="$BACKEND_DIR/Dockerfile"

    if [ -f "$dockerfile" ]; then
        # Check if already configured for offline mode
        if grep -q "SQLX_OFFLINE=true" "$dockerfile"; then
            print_success "Dockerfile already configured for offline mode"
        else
            print_warning "Consider updating Dockerfile to use SQLX_OFFLINE=true"
            print_status "Add this line before 'RUN cargo build --release':"
            print_status "  ENV SQLX_OFFLINE=true"
        fi
    fi
}

# Show usage instructions
show_instructions() {
    echo ""
    echo "=========================================="
    print_success "SQLx offline preparation completed!"
    echo "=========================================="
    echo ""
    echo "What was done:"
    echo "  ✅ SQLx CLI verified/installed"
    echo "  ✅ Database migrations checked"
    echo "  ✅ Query metadata prepared for PostgreSQL"
    echo "  ✅ Offline compilation tested"
    echo ""
    echo "Next steps:"
    echo "  1. Commit the .sqlx directory to version control:"
    echo "     git add backend/.sqlx"
    echo "     git commit -m 'Add SQLx prepared queries for PostgreSQL'"
    echo ""
    echo "  2. Update your Dockerfile to use offline mode:"
    echo "     ENV SQLX_OFFLINE=true"
    echo ""
    echo "  3. Your Docker builds will now work without database connection"
    echo ""
    echo "Maintenance:"
    echo "  • Re-run this script after changing SQL queries"
    echo "  • Re-run after database schema changes"
    echo "  • Keep .sqlx in sync with your codebase"
    echo ""
}

# Handle command line arguments
case "$1" in
    --clean-only)
        print_status "Cleaning SQLx data only..."
        clean_sqlx_data
        print_success "SQLx data cleaned"
        ;;
    --verify-only)
        print_status "Verifying existing SQLx data..."
        verify_prepared_data
        test_offline_build
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Prepare SQLx queries for offline compilation with PostgreSQL"
        echo ""
        echo "Options:"
        echo "  --clean-only   Remove existing .sqlx data without preparing new"
        echo "  --verify-only  Verify existing .sqlx data and test compilation"
        echo "  --help, -h     Show this help message"
        echo ""
        echo "Prerequisites:"
        echo "  • PostgreSQL must be running (docker compose up -d postgres)"
        echo "  • Database migrations must be applied"
        echo "  • Rust and Cargo must be available"
        echo ""
        echo "This script will:"
        echo "  1. Install sqlx-cli if needed"
        echo "  2. Verify PostgreSQL connection"
        echo "  3. Run any pending migrations"
        echo "  4. Clean old SQLx data"
        echo "  5. Prepare new query metadata for PostgreSQL"
        echo "  6. Test offline compilation"
        ;;
    "")
        # Full preparation
        print_status "Starting SQLx offline preparation..."
        check_sqlx_cli
        check_postgres
        run_migrations
        clean_sqlx_data
        prepare_queries
        verify_prepared_data
        test_offline_build
        update_dockerfile
        show_instructions
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac
