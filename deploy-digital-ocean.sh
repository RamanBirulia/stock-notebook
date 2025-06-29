#!/bin/bash

# Digital Ocean Deployment Script for Stock Notebook
# This script automates deployment to Digital Ocean Droplet

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DROPLET_IP=""
DROPLET_USER="root"
APP_NAME="stock-notebook"
DEPLOY_DIR="/opt/stock-notebook"
BACKUP_DIR="/opt/backups/stock-notebook"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

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

# Help function
show_help() {
    echo "Digital Ocean Deployment Script for Stock Notebook"
    echo ""
    echo "Usage: $0 [OPTION] DROPLET_IP"
    echo ""
    echo "Options:"
    echo "  --initial      Initial deployment (installs Docker, sets up environment)"
    echo "  --update       Update existing deployment"
    echo "  --backup       Create backup before deployment"
    echo "  --rollback     Rollback to previous version"
    echo "  --logs         Show application logs"
    echo "  --status       Show deployment status"
    echo "  --ssl          Setup SSL certificates (Let's Encrypt)"
    echo "  --help, -h     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --initial 138.197.123.456    # Initial deployment"
    echo "  $0 --update 138.197.123.456     # Update deployment"
    echo "  $0 --backup 138.197.123.456     # Create backup"
    echo ""
    echo "Prerequisites:"
    echo "  • Digital Ocean Droplet with Ubuntu 20.04+ or Debian 11+"
    echo "  • SSH key access to the droplet"
    echo "  • Domain name pointing to the droplet IP (for SSL)"
    echo ""
}

# Validate inputs
validate_inputs() {
    if [ -z "$DROPLET_IP" ]; then
        print_error "Droplet IP address is required"
        show_help
        exit 1
    fi

    # Validate IP format
    if ! [[ $DROPLET_IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        print_error "Invalid IP address format: $DROPLET_IP"
        exit 1
    fi

    # Check if we can SSH to the droplet
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$DROPLET_USER@$DROPLET_IP" exit 2>/dev/null; then
        print_error "Cannot connect to droplet via SSH. Please check:"
        echo "  • SSH key is added to your SSH agent"
        echo "  • SSH key is authorized on the droplet"
        echo "  • Droplet IP is correct and accessible"
        exit 1
    fi

    print_success "SSH connection to droplet verified"
}

# Install Docker and Docker Compose on the droplet
install_docker() {
    print_status "Installing Docker and Docker Compose on droplet..."

    ssh "$DROPLET_USER@$DROPLET_IP" << 'EOF'
        # Update system
        apt-get update && apt-get upgrade -y

        # Install dependencies
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release ufw fail2ban

        # Add Docker GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

        # Add Docker repository
        echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

        # Start and enable Docker
        systemctl start docker
        systemctl enable docker

        # Add user to docker group (if not root)
        if [ "$USER" != "root" ]; then
            usermod -aG docker $USER
        fi

        # Install Docker Compose standalone (fallback)
        curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose

        # Configure firewall
        ufw default deny incoming
        ufw default allow outgoing
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable

        # Configure fail2ban
        systemctl start fail2ban
        systemctl enable fail2ban

        echo "Docker and security setup completed"
EOF

    print_success "Docker and security tools installed successfully"
}

# Setup application directory and environment
setup_environment() {
    print_status "Setting up application environment..."

    # Create directories on droplet
    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        # Create application directories
        mkdir -p $DEPLOY_DIR
        mkdir -p $BACKUP_DIR
        mkdir -p $DEPLOY_DIR/ssl
        mkdir -p $DEPLOY_DIR/nginx/conf.d
        mkdir -p /var/log/stock-notebook

        # Set permissions
        chown -R $DROPLET_USER:$DROPLET_USER $DEPLOY_DIR
        chown -R $DROPLET_USER:$DROPLET_USER $BACKUP_DIR
EOF

    print_success "Application directories created"
}

# Copy application files to droplet
deploy_files() {
    print_status "Copying application files to droplet..."

    # Create temporary tarball
    tar -czf /tmp/stock-notebook-deploy.tar.gz \
        --exclude='target' \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='.env' \
        .

    # Copy tarball to droplet
    scp /tmp/stock-notebook-deploy.tar.gz "$DROPLET_USER@$DROPLET_IP:/tmp/"

    # Extract on droplet
    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR
        tar -xzf /tmp/stock-notebook-deploy.tar.gz
        rm /tmp/stock-notebook-deploy.tar.gz

        # Set proper permissions
        chown -R $DROPLET_USER:$DROPLET_USER $DEPLOY_DIR

        # Create .env file if it doesn't exist
        if [ ! -f .env ]; then
            cp .env.production .env
            echo "Created .env file from template. Please update with your values!"
        fi
EOF

    # Clean up local tarball
    rm /tmp/stock-notebook-deploy.tar.gz

    print_success "Application files deployed"
}

# Setup SSL certificates with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificates..."

    read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
    read -p "Enter your email for Let's Encrypt: " EMAIL

    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        print_error "Domain and email are required for SSL setup"
        exit 1
    fi

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        # Install Certbot
        apt-get update
        apt-get install -y certbot python3-certbot-nginx

        # Stop nginx if running
        docker compose -f $DEPLOY_DIR/$DOCKER_COMPOSE_FILE down nginx 2>/dev/null || true

        # Get certificate
        certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --email $EMAIL \
            -d $DOMAIN

        # Copy certificates to nginx directory
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $DEPLOY_DIR/ssl/cert.pem
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $DEPLOY_DIR/ssl/key.pem

        # Set up auto-renewal
        echo "0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f $DEPLOY_DIR/$DOCKER_COMPOSE_FILE restart nginx" | crontab -

        # Update .env with domain
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=https://$DOMAIN|g" $DEPLOY_DIR/.env
EOF

    print_success "SSL certificates configured for $DOMAIN"
}

# Create database backup
create_backup() {
    print_status "Creating database backup..."

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR

        # Create backup directory with timestamp
        BACKUP_TIMESTAMP=\$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/backup_\$BACKUP_TIMESTAMP"
        mkdir -p "\$BACKUP_PATH"

        # Backup database
        docker compose -f $DOCKER_COMPOSE_FILE exec -T postgres pg_dump -U \$POSTGRES_USER \$POSTGRES_DB > "\$BACKUP_PATH/database.sql" 2>/dev/null || echo "Database backup failed (container might not be running)"

        # Backup application files
        tar -czf "\$BACKUP_PATH/app_files.tar.gz" -C $DEPLOY_DIR --exclude='target' --exclude='*.log' .

        # Keep only last 5 backups
        ls -t $BACKUP_DIR | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}"

        echo "Backup created at: \$BACKUP_PATH"
EOF

    print_success "Backup created successfully"
}

# Start services
start_services() {
    print_status "Starting services..."

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR

        # Build and start services
        docker compose -f $DOCKER_COMPOSE_FILE up -d --build

        # Wait for services to be healthy
        echo "Waiting for services to start..."
        sleep 30

        # Check service status
        docker compose -f $DOCKER_COMPOSE_FILE ps
EOF

    print_success "Services started successfully"
}

# Check deployment status
check_status() {
    print_status "Checking deployment status..."

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR

        echo "=== Docker Compose Status ==="
        docker compose -f $DOCKER_COMPOSE_FILE ps

        echo ""
        echo "=== Service Health ==="

        # Check PostgreSQL
        if docker compose -f $DOCKER_COMPOSE_FILE exec postgres pg_isready -U \$POSTGRES_USER -d \$POSTGRES_DB >/dev/null 2>&1; then
            echo "✅ PostgreSQL: Healthy"
        else
            echo "❌ PostgreSQL: Unhealthy"
        fi

        # Check Backend API
        if curl -f http://localhost:8080/health >/dev/null 2>&1; then
            echo "✅ Backend API: Healthy"
        else
            echo "❌ Backend API: Unhealthy"
        fi

        # Check Nginx
        if docker compose -f $DOCKER_COMPOSE_FILE exec nginx nginx -t >/dev/null 2>&1; then
            echo "✅ Nginx: Configuration OK"
        else
            echo "❌ Nginx: Configuration Error"
        fi

        echo ""
        echo "=== Resource Usage ==="
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

        echo ""
        echo "=== Disk Usage ==="
        df -h $DEPLOY_DIR
EOF
}

# Show application logs
show_logs() {
    print_status "Showing application logs..."

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR
        docker compose -f $DOCKER_COMPOSE_FILE logs --tail=100 -f
EOF
}

# Rollback to previous version
rollback() {
    print_status "Rolling back to previous backup..."

    ssh "$DROPLET_USER@$DROPLET_IP" << EOF
        cd $DEPLOY_DIR

        # Find latest backup
        LATEST_BACKUP=\$(ls -t $BACKUP_DIR | head -n 1)

        if [ -z "\$LATEST_BACKUP" ]; then
            echo "No backups found for rollback"
            exit 1
        fi

        echo "Rolling back to: \$LATEST_BACKUP"

        # Stop current services
        docker compose -f $DOCKER_COMPOSE_FILE down

        # Restore application files
        tar -xzf "$BACKUP_DIR/\$LATEST_BACKUP/app_files.tar.gz" -C $DEPLOY_DIR

        # Restore database
        docker compose -f $DOCKER_COMPOSE_FILE up -d postgres
        sleep 10
        docker compose -f $DOCKER_COMPOSE_FILE exec -T postgres psql -U \$POSTGRES_USER -d \$POSTGRES_DB < "$BACKUP_DIR/\$LATEST_BACKUP/database.sql"

        # Start all services
        docker compose -f $DOCKER_COMPOSE_FILE up -d

        echo "Rollback completed"
EOF

    print_success "Rollback completed successfully"
}

# Initial deployment
initial_deployment() {
    print_status "Starting initial deployment to Digital Ocean..."

    validate_inputs
    install_docker
    setup_environment
    deploy_files

    print_warning "Please update the .env file on the droplet with your production values:"
    print_warning "  ssh $DROPLET_USER@$DROPLET_IP"
    print_warning "  cd $DEPLOY_DIR"
    print_warning "  nano .env"
    print_warning ""
    print_warning "Then run: $0 --update $DROPLET_IP"
}

# Update deployment
update_deployment() {
    print_status "Updating deployment..."

    validate_inputs
    create_backup
    deploy_files
    start_services
    check_status

    print_success "Deployment updated successfully!"
    echo ""
    echo "Your Stock Notebook application is now running at:"
    echo "  HTTP:  http://$DROPLET_IP"
    echo "  HTTPS: https://$DROPLET_IP (if SSL is configured)"
    echo ""
    echo "To check logs: $0 --logs $DROPLET_IP"
    echo "To check status: $0 --status $DROPLET_IP"
}

# Main execution
case "$1" in
    --initial)
        DROPLET_IP="$2"
        initial_deployment
        ;;
    --update)
        DROPLET_IP="$2"
        update_deployment
        ;;
    --backup)
        DROPLET_IP="$2"
        validate_inputs
        create_backup
        ;;
    --rollback)
        DROPLET_IP="$2"
        validate_inputs
        rollback
        ;;
    --logs)
        DROPLET_IP="$2"
        validate_inputs
        show_logs
        ;;
    --status)
        DROPLET_IP="$2"
        validate_inputs
        check_status
        ;;
    --ssl)
        DROPLET_IP="$2"
        validate_inputs
        setup_ssl
        ;;
    --help|-h)
        show_help
        ;;
    "")
        print_error "No option specified"
        show_help
        exit 1
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
