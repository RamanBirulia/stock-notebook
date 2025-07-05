#!/bin/bash

# Fix Cargo.lock using Docker (no local Rust required)
# This script uses Docker to regenerate Cargo.lock with a compatible Rust version

set -e

echo "🔧 Fixing Cargo.lock compatibility using Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not found. Please install Docker first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -f "backend/Cargo.toml" ]; then
    echo "❌ Must be run from the project root directory (where backend/ exists)"
    exit 1
fi

echo "📁 Working directory: $(pwd)"
echo "📦 Backend directory found"

# Backup existing Cargo.lock if it exists
if [ -f "backend/Cargo.lock" ]; then
    backup_file="backend/Cargo.lock.backup.$(date +%Y%m%d_%H%M%S)"
    cp "backend/Cargo.lock" "$backup_file"
    echo "💾 Backed up Cargo.lock to: $backup_file"
    rm "backend/Cargo.lock"
    echo "🗑️  Removed old Cargo.lock"
fi

echo "🐳 Using Docker to regenerate Cargo.lock..."

# Use Docker to regenerate Cargo.lock with Rust 1.83
docker run --rm \
    -v "$(pwd)/backend:/workspace" \
    -w /workspace \
    rust:1.83-slim-bookworm \
    sh -c "
        echo '🦀 Rust version:' && rustc --version && echo
        echo '📋 Cargo version:' && cargo --version && echo
        echo '🔧 Generating new Cargo.lock...'
        cargo generate-lockfile
        echo '✅ New Cargo.lock generated'
        echo '📄 Lock file version:'
        head -5 Cargo.lock | grep 'version = ' || echo 'Version not found in header'
    "

# Verify the new Cargo.lock was created
if [ -f "backend/Cargo.lock" ]; then
    echo "✅ New Cargo.lock created successfully"

    # Show lock file version
    lock_version=$(head -5 backend/Cargo.lock | grep "version = " | cut -d' ' -f3 | tr -d '"' || echo "unknown")
    echo "📊 Cargo.lock version: $lock_version"

    # Count dependencies
    dep_count=$(grep -c "^name = " backend/Cargo.lock || echo "0")
    echo "📦 Dependencies: $dep_count packages"

else
    echo "❌ Failed to create Cargo.lock"
    exit 1
fi

echo ""
echo "🎉 Cargo.lock fix completed!"
echo ""
echo "Next steps:"
echo "1. Commit the new Cargo.lock:"
echo "   git add backend/Cargo.lock"
echo "   git commit -m 'Fix Cargo.lock compatibility for Digital Ocean'"
echo ""
echo "2. Push to trigger Digital Ocean rebuild:"
echo "   git push origin main"
echo ""
echo "The new Cargo.lock should be compatible with Digital Ocean's build environment."
