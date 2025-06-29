#!/bin/bash

# Development Setup Script for Stock Notebook with PostgreSQL
# This script helps set up the development environment

set -e

echo "🚀 Setting up Stock Notebook development environment..."

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

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi

    print_success "Docker is installed and running"
}

# Check if Docker Compose is available
check_docker_compose() {
    print_status "Checking Docker Compose..."

    if docker compose version &> /dev/null; then
        print_success "Docker Compose is available"
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        print_success "Docker Compose (standalone) is available"
        COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
}

# Create environment file if it doesn't exist
setup_env_file() {
    print_status "Setting up environment file..."

    ENV_FILE="./backend/.env"
    ENV_EXAMPLE="./backend/.env.postgres.example"

    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_EXAMPLE" ]; then
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_success "Created .env file from .env.postgres.example"
        else
            print_warning ".env.postgres.example not found, creating basic .env file"
            cat > "$ENV_FILE" << 'EOF'
DATABASE_URL=postgresql://stock_user:stock_password@localhost:5432/stock_notebook
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=8080
FRONTEND_URL=http://localhost:3000
RUST_LOG=info
ENABLE_API_REQUEST_LOGGING=false
ENABLE_API_RESPONSE_LOGGING=false
EOF
        fi
    else
        print_success ".env file already exists"
    fi
}

# Start PostgreSQL using Docker Compose
start_postgres() {
    print_status "Starting PostgreSQL database..."

    $COMPOSE_CMD up -d postgres

    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    timeout=30
    counter=0

    while [ $counter -lt $timeout ]; do
        if $COMPOSE_CMD exec postgres pg_isready -U stock_user -d stock_notebook &> /dev/null; then
            print_success "PostgreSQL is ready!"
            break
        fi

        counter=$((counter + 1))
        sleep 1
        echo -n "."
    done

    if [ $counter -eq $timeout ]; then
        print_error "PostgreSQL failed to start within $timeout seconds"
        exit 1
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."

    cd backend

    # Check if sqlx-cli is installed
    if ! command -v sqlx &> /dev/null; then
        print_status "Installing sqlx-cli..."
        cargo install sqlx-cli --no-default-features --features postgres
    fi

    # Run migrations
    if sqlx migrate run --database-url "postgresql://stock_user:stock_password@localhost:5432/stock_notebook" --source migrations; then
        print_success "Database migrations completed successfully"
    else
        print_error "Failed to run database migrations"
        exit 1
    fi

    cd ..
}

# Build the backend
build_backend() {
    print_status "Building Rust backend..."

    cd backend
    if cargo build; then
        print_success "Backend built successfully"
    else
        print_error "Failed to build backend"
        exit 1
    fi
    cd ..
}

# Start Adminer for database management
start_adminer() {
    print_status "Starting Adminer (database management UI)..."
    $COMPOSE_CMD up -d adminer
    print_success "Adminer is available at http://localhost:8081"
    echo "  Server: postgres"
    echo "  Username: stock_user"
    echo "  Password: stock_password"
    echo "  Database: stock_notebook"
}

# Show status and next steps
show_status() {
    echo ""
    echo "=========================================="
    print_success "Development environment setup complete!"
    echo "=========================================="
    echo ""
    echo "Services running:"
    echo "  📊 PostgreSQL: localhost:5432"
    echo "  🔍 Adminer:    http://localhost:8081"
    echo ""
    echo "To start the backend server:"
    echo "  cd backend && cargo run"
    echo ""
    echo "To start all services with Docker Compose:"
    echo "  $COMPOSE_CMD up -d"
    echo ""
    echo "To view logs:"
    echo "  $COMPOSE_CMD logs -f"
    echo ""
    echo "To stop services:"
    echo "  $COMPOSE_CMD down"
    echo ""
    echo "Database connection details:"
    echo "  Host: localhost"
    echo "  Port: 5432"
    echo "  Database: stock_notebook"
    echo "  Username: stock_user"
    echo "  Password: stock_password"
    echo ""
}

# Main execution
main() {
    echo "🏗️  Stock Notebook Development Setup"
    echo "======================================"

    check_docker
    check_docker_compose
    setup_env_file
    start_postgres
    run_migrations
    build_backend
    start_adminer
    show_status
}

# Handle script arguments
case "$1" in
    --postgres-only)
        print_status "Starting PostgreSQL only..."
        check_docker
        check_docker_compose
        start_postgres
        ;;
    --migrations-only)
        print_status "Running migrations only..."
        run_migrations
        ;;
    --build-only)
        print_status "Building backend only..."
        build_backend
        ;;
    --status)
        print_status "Checking service status..."
        $COMPOSE_CMD ps
        ;;
    --clean)
        print_status "Cleaning up development environment..."
        $COMPOSE_CMD down -v
        print_success "Environment cleaned up"
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Options:"
        echo "  --postgres-only    Start PostgreSQL only"
        echo "  --migrations-only  Run database migrations only"
        echo "  --build-only       Build backend only"
        echo "  --status           Show service status"
        echo "  --clean            Clean up environment (removes containers and volumes)"
        echo "  --help, -h         Show this help message"
        echo ""
        echo "Run without arguments to perform full setup"
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
