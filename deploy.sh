#!/bin/bash

# Stock Tracker Deployment Helper Script
# This script helps you prepare and deploy your application to Digital Ocean App Platform

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check Git
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi

    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "This is not a Git repository. Please run this script from the root of your Git repository."
        exit 1
    fi

    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    # Check Rust (optional for deployment, but good for local testing)
    if ! command_exists cargo; then
        print_warning "Rust is not installed. You won't be able to test the backend locally."
    fi

    # Check doctl (optional)
    if command_exists doctl; then
        print_success "doctl CLI found - you can deploy via CLI"
    else
        print_warning "doctl CLI not found - you'll need to deploy via web interface"
    fi

    print_success "Prerequisites check completed"
}

# Function to validate environment variables
validate_env_vars() {
    print_status "Validating environment variables..."

    if [ ! -f "backend/.env.production" ]; then
        print_warning "Production environment file not found. Creating template..."
        cp backend/.env.production.template backend/.env.production
        print_error "Please edit backend/.env.production with your actual values before deploying."
        exit 1
    fi

    # Check if required variables are set in the template
    if grep -q "your_.*_here" backend/.env.production; then
        print_error "Please update backend/.env.production with your actual values (remove placeholder text)."
        exit 1
    fi

    print_success "Environment variables validated"
}

# Function to test local build
test_local_build() {
    print_status "Testing local builds..."

    # Test frontend build
    print_status "Testing frontend build..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi

    print_status "Building frontend..."
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Frontend build successful"
    else
        print_error "Frontend build failed"
        exit 1
    fi

    cd ..

    # Test backend build (if Rust is available)
    if command_exists cargo; then
        print_status "Testing backend build..."
        cd backend
        print_status "Building backend..."
        cargo build --release

        if [ $? -eq 0 ]; then
            print_success "Backend build successful"
        else
            print_error "Backend build failed"
            exit 1
        fi
        cd ..
    else
        print_warning "Skipping backend build test (Rust not installed)"
    fi

    print_success "Local build tests completed"
}

# Function to update app.yaml with repository info
update_app_yaml() {
    print_status "Updating app.yaml with repository information..."

    # Get current Git remote URL
    REPO_URL=$(git config --get remote.origin.url)

    if [[ $REPO_URL == *"github.com"* ]]; then
        # Extract username/repo from URL
        if [[ $REPO_URL == *".git" ]]; then
            REPO_PATH=$(echo $REPO_URL | sed 's/.*github.com[\/:]//g' | sed 's/.git$//g')
        else
            REPO_PATH=$(echo $REPO_URL | sed 's/.*github.com[\/:]//g')
        fi

        print_status "Detected GitHub repository: $REPO_PATH"

        # Update app.yaml
        sed -i.bak "s/your-username\/stock-notebook/$REPO_PATH/g" .do/app.yaml
        rm .do/app.yaml.bak 2>/dev/null || true

        print_success "Updated app.yaml with repository: $REPO_PATH"
    else
        print_error "Repository is not hosted on GitHub. Please update .do/app.yaml manually."
        exit 1
    fi
}

# Function to commit and push changes
commit_and_push() {
    print_status "Committing and pushing changes..."

    # Check if there are any changes
    if [ -n "$(git status --porcelain)" ]; then
        print_status "Adding deployment files..."
        git add .do/app.yaml backend/Dockerfile backend/.dockerignore DEPLOYMENT.md backend/.env.production.template deploy.sh

        print_status "Committing changes..."
        git commit -m "Add Digital Ocean App Platform deployment configuration"

        print_status "Pushing to remote repository..."
        git push origin main

        print_success "Changes committed and pushed successfully"
    else
        print_status "No changes to commit"
    fi
}

# Function to provide deployment instructions
show_deployment_instructions() {
    print_success "Deployment preparation completed!"
    echo ""
    print_status "Next steps:"
    echo "1. Go to https://cloud.digitalocean.com/apps"
    echo "2. Click 'Create App'"
    echo "3. Connect your GitHub repository"
    echo "4. Select this repository and the 'main' branch"
    echo "5. Configure environment variables in the app settings:"
    echo "   - ALPHA_VANTAGE_API_KEY (get from https://alphavantage.co)"
    echo "   - JWT_SECRET (generate with: openssl rand -base64 32)"
    echo "   - DATABASE_URL (will be auto-generated if using managed DB)"
    echo "   - FRONTEND_URL (will be auto-generated by DO)"
    echo "   - REACT_APP_API_URL (will be auto-generated by DO)"
    echo "6. Choose your plan and deploy"
    echo ""
    print_status "For detailed instructions, see DEPLOYMENT.md"

    if command_exists doctl; then
        echo ""
        print_status "Alternative: Deploy via CLI with:"
        echo "doctl apps create --spec .do/app.yaml"
    fi
}

# Function to show help
show_help() {
    echo "Stock Tracker Deployment Helper"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --skip-build        Skip local build testing"
    echo "  --skip-env-check    Skip environment variable validation"
    echo "  --dry-run           Prepare for deployment but don't commit/push"
    echo ""
    echo "This script helps you prepare your application for deployment to"
    echo "Digital Ocean App Platform by:"
    echo "  - Checking prerequisites"
    echo "  - Validating environment variables"
    echo "  - Testing local builds"
    echo "  - Updating configuration files"
    echo "  - Committing and pushing changes"
    echo ""
}

# Main execution
main() {
    local skip_build=false
    local skip_env_check=false
    local dry_run=false

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --help|-h)
                show_help
                exit 0
                ;;
            --skip-build)
                skip_build=true
                shift
                ;;
            --skip-env-check)
                skip_env_check=true
                shift
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    echo "🚀 Stock Tracker Deployment Helper"
    echo "=================================="
    echo ""

    # Run checks and preparation
    check_prerequisites

    if [ "$skip_env_check" = false ]; then
        validate_env_vars
    fi

    if [ "$skip_build" = false ]; then
        test_local_build
    fi

    update_app_yaml

    if [ "$dry_run" = false ]; then
        commit_and_push
    else
        print_status "Dry run mode - skipping commit and push"
    fi

    show_deployment_instructions

    print_success "Deployment preparation completed successfully! 🎉"
}

# Run main function
main "$@"
