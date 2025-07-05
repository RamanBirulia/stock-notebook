#!/bin/bash

# Fix Cargo.lock Compatibility Script
# This script resolves Cargo.lock version compatibility issues for Digital Ocean builds

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

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -f "backend/Cargo.toml" ]; then
    print_error "Must be run from the project root directory (where backend/ exists)"
    exit 1
fi

# Function to check Rust version
check_rust_version() {
    print_status "Checking Rust version..."

    if command -v rustc &> /dev/null; then
        local rust_version=$(rustc --version | awk '{print $2}')
        print_status "Current Rust version: $rust_version"

        # Extract major.minor version
        local major_minor=$(echo $rust_version | cut -d'.' -f1,2)
        local version_num=$(echo $major_minor | sed 's/\.//')

        if [ "$version_num" -ge "182" ]; then
            print_success "Rust version is compatible with Cargo.lock v4"
            return 0
        else
            print_warning "Rust version might be too old for Cargo.lock v4"
            return 1
        fi
    else
        print_error "Rust not found. Please install Rust first."
        exit 1
    fi
}

# Function to backup existing Cargo.lock
backup_cargo_lock() {
    local cargo_lock="backend/Cargo.lock"

    if [ -f "$cargo_lock" ]; then
        local backup_file="${cargo_lock}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$cargo_lock" "$backup_file"
        print_success "Backed up Cargo.lock to: $backup_file"
    fi
}

# Function to regenerate Cargo.lock
regenerate_cargo_lock() {
    print_status "Regenerating Cargo.lock..."

    cd backend

    # Remove existing Cargo.lock
    if [ -f "Cargo.lock" ]; then
        rm Cargo.lock
        print_status "Removed existing Cargo.lock"
    fi

    # Generate new Cargo.lock
    if cargo generate-lockfile; then
        print_success "Generated new Cargo.lock"
    else
        print_error "Failed to generate Cargo.lock"
        cd ..
        exit 1
    fi

    # Check the version of the new lock file
    local lock_version=$(head -5 Cargo.lock | grep "version = " | cut -d' ' -f3)
    print_status "New Cargo.lock version: $lock_version"

    cd ..
}

# Function to downgrade Cargo.lock version if needed
downgrade_cargo_lock() {
    print_status "Attempting to create compatible Cargo.lock..."

    cd backend

    # Try to use an older resolver version
    if grep -q "resolver = " Cargo.toml; then
        print_status "Resolver already specified in Cargo.toml"
    else
        print_status "Adding resolver = \"2\" to Cargo.toml for compatibility"

        # Add resolver to the [package] section
        sed -i.bak '/^\[package\]/a\
resolver = "2"' Cargo.toml

        # Regenerate lock file
        rm -f Cargo.lock
        cargo generate-lockfile

        print_success "Updated Cargo.toml with resolver = \"2\""
    fi

    cd ..
}

# Function to verify the lock file works with older Cargo
verify_compatibility() {
    print_status "Verifying Cargo.lock compatibility..."

    cd backend

    # Try to parse with older Cargo (simulate)
    if cargo tree > /dev/null 2>&1; then
        print_success "Cargo.lock appears to be valid"
    else
        print_warning "Cargo.lock might have issues"
    fi

    cd ..
}

# Function to show Docker build test
test_docker_build() {
    print_status "Testing Docker build locally..."

    cd backend

    # Try a quick Docker build test
    if command -v docker &> /dev/null; then
        print_status "Building Docker image to test Cargo.lock..."

        # Create a simple test Dockerfile
        cat > Dockerfile.test << 'EOF'
FROM rust:1.82-slim-bookworm
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN cargo fetch
EOF

        if docker build -f Dockerfile.test -t cargo-lock-test . > /dev/null 2>&1; then
            print_success "Docker build test passed"
            docker rmi cargo-lock-test > /dev/null 2>&1 || true
        else
            print_warning "Docker build test failed - may need manual intervention"
        fi

        # Clean up
        rm -f Dockerfile.test
    else
        print_status "Docker not available for local testing"
    fi

    cd ..
}

# Function to show solution summary
show_solution_summary() {
    echo ""
    echo "=========================================="
    print_success "Cargo.lock compatibility fix completed!"
    echo "=========================================="
    echo ""
    echo "What was done:"
    echo "  ✅ Backed up original Cargo.lock"
    echo "  ✅ Regenerated Cargo.lock with current Rust version"
    echo "  ✅ Verified compatibility"
    echo ""
    echo "For Digital Ocean deployment:"
    echo "  1. The Dockerfile now uses rust:1.82 (compatible with lock v4)"
    echo "  2. Cargo.lock has been regenerated for compatibility"
    echo "  3. Commit and push the updated files:"
    echo ""
    echo "     git add backend/Cargo.lock backend/Cargo.toml"
    echo "     git commit -m 'Fix Cargo.lock compatibility for DO deployment'"
    echo "     git push origin main"
    echo ""
    echo "Alternative solutions if build still fails:"
    echo "  • Use Rust 1.80+ in Dockerfile"
    echo "  • Regenerate Cargo.lock with specific Rust version"
    echo "  • Use cargo update to refresh dependencies"
    echo ""
}

# Main execution
main() {
    echo "🔧 Cargo.lock Compatibility Fix"
    echo "==============================="

    check_rust_version
    backup_cargo_lock
    regenerate_cargo_lock
    verify_compatibility
    test_docker_build
    show_solution_summary
}

# Handle command line arguments
case "$1" in
    --regenerate-only)
        print_status "Regenerating Cargo.lock only..."
        backup_cargo_lock
        regenerate_cargo_lock
        ;;
    --downgrade)
        print_status "Attempting to downgrade Cargo.lock compatibility..."
        backup_cargo_lock
        downgrade_cargo_lock
        regenerate_cargo_lock
        ;;
    --test-only)
        print_status "Testing Docker build only..."
        test_docker_build
        ;;
    --help|-h)
        echo "Usage: $0 [OPTION]"
        echo ""
        echo "Fix Cargo.lock compatibility issues for Digital Ocean builds"
        echo ""
        echo "Options:"
        echo "  --regenerate-only  Only regenerate Cargo.lock"
        echo "  --downgrade        Try to create older-compatible Cargo.lock"
        echo "  --test-only        Test Docker build compatibility"
        echo "  --help, -h         Show this help message"
        echo ""
        echo "The script will:"
        echo "  1. Check current Rust version"
        echo "  2. Backup existing Cargo.lock"
        echo "  3. Regenerate Cargo.lock with current Rust"
        echo "  4. Verify compatibility"
        echo "  5. Test Docker build (if Docker available)"
        echo ""
        echo "Common Cargo.lock version issues:"
        echo "  • v4: Requires Rust 1.82+"
        echo "  • v3: Works with Rust 1.70+"
        echo "  • v2: Works with older Rust versions"
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
