# Stock Notebook - Portfolio Tracking Application

A modern web application for tracking stock portfolios built with Rust (Axum) backend and PostgreSQL database.

## Features

- 🔐 **User Authentication** - Secure JWT-based authentication
- 📊 **Portfolio Dashboard** - Real-time portfolio value and performance tracking
- 📈 **Stock Price Integration** - Live stock prices via Yahoo Finance API
- 💰 **Purchase Tracking** - Record and manage stock purchases
- 📉 **Chart Visualization** - Interactive price charts with purchase markers
- 🔍 **Symbol Search** - Smart stock symbol search and suggestions
- 🏦 **Commission Tracking** - Include trading fees in calculations
- 💹 **Profit/Loss Analysis** - Detailed performance metrics

## Technology Stack

- **Backend**: Rust with Axum framework
- **Database**: PostgreSQL with SQLx
- **Authentication**: JWT tokens with bcrypt password hashing
- **Stock Data**: Yahoo Finance API
- **Deployment**: Docker with Docker Compose
- **Web Server**: Nginx (production)

## Quick Start (Development)

### Prerequisites

- Docker and Docker Compose
- Rust 1.75+ (for local development)

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd stock-notebook

# Quick setup with Docker
docker compose -f docker-compose.development.yml up -d

# Or use the automated setup script
./scripts/dev-setup.sh

# Add sample data
./scripts/seed-db.sh
```

### Access the Application

- **API**: http://localhost:8080
- **Database Admin**: http://localhost:8081 (Adminer)
- **Health Check**: http://localhost:8080/health

### Demo Credentials

- **Username**: `demo_user`
- **Password**: `password123`

## Production Deployment

### Digital Ocean Deployment

#### Prerequisites

- Digital Ocean Droplet (Ubuntu 20.04+ or Debian 11+)
- Domain name pointing to your droplet IP
- SSH key access to the droplet

#### Quick Deploy

```bash
# Initial deployment (installs Docker, sets up environment)
./deploy-digital-ocean.sh --initial YOUR_DROPLET_IP

# Update your environment variables
ssh root@YOUR_DROPLET_IP
cd /opt/stock-notebook
nano .env  # Update with your production values

# Complete the deployment
./deploy-digital-ocean.sh --update YOUR_DROPLET_IP

# Setup SSL certificates (optional but recommended)
./deploy-digital-ocean.sh --ssl YOUR_DROPLET_IP
```

#### Manual Deployment Steps

1. **Prepare the Droplet**
   ```bash
   # Connect to your droplet
   ssh root@YOUR_DROPLET_IP

   # Update system
   apt update && apt upgrade -y

   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Deploy the Application**
   ```bash
   # Create deployment directory
   mkdir -p /opt/stock-notebook
   cd /opt/stock-notebook

   # Copy your application files
   # (Use scp, git clone, or the deployment script)

   # Create production environment file
   cp .env.production .env
   nano .env  # Update with your values
   ```

3. **Start Services**
   ```bash
   # Start with production configuration
   docker compose -f docker-compose.prod.yml up -d

   # Check status
   docker compose -f docker-compose.prod.yml ps
   ```

### Environment Configuration

#### Required Environment Variables

```env
# Database
POSTGRES_DB=stock_notebook_prod
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_strong_password
DATABASE_URL=postgresql://user:password@postgres:5432/database

# Security
JWT_SECRET=your-very-strong-jwt-secret-key-here

# Application
FRONTEND_URL=https://yourdomain.com
ENVIRONMENT=production
RUST_LOG=warn
```

#### Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Configure firewall (ports 80, 443, 22 only)
- [ ] Enable fail2ban for SSH protection
- [ ] Setup SSL certificates
- [ ] Configure regular backups
- [ ] Enable log rotation

### SSL/HTTPS Setup

#### Using Let's Encrypt (Recommended)

```bash
# Automated SSL setup
./deploy-digital-ocean.sh --ssl YOUR_DROPLET_IP

# Manual setup
ssh root@YOUR_DROPLET_IP
apt install certbot python3-certbot-nginx
certbot certonly --standalone -d yourdomain.com
```

#### Using Custom Certificates

```bash
# Copy your certificates to the droplet
scp your-cert.pem root@YOUR_DROPLET_IP:/opt/stock-notebook/ssl/cert.pem
scp your-key.pem root@YOUR_DROPLET_IP:/opt/stock-notebook/ssl/key.pem
```

## API Documentation

### Authentication Endpoints

```
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
```

### Portfolio Endpoints

```
GET  /api/dashboard      - Get portfolio summary
GET  /api/purchases      - Get all purchases
POST /api/purchases      - Add new purchase
```

### Stock Data Endpoints

```
GET  /api/stock/:symbol        - Get stock details
GET  /api/stock/:symbol/chart  - Get price chart data
GET  /api/symbols/search       - Search stock symbols
```

### Admin Endpoints

```
GET  /api/admin/cache/stats   - Cache statistics
POST /api/admin/cache/clear   - Clear all cache
POST /api/admin/cache/cleanup - Cleanup expired cache
```

## Development

### Development Commands

```bash
# Using Makefile
make setup     # Complete development setup
make up        # Start all services
make down      # Stop services
make logs      # View logs
make test      # Run tests
make migrate   # Run database migrations
make seed      # Add sample data

# Manual commands
cd backend
cargo run      # Start backend server
cargo test     # Run tests
```

### Database Management

```bash
# Connect to database
make db-connect

# Create migration
cd backend
sqlx migrate add migration_name

# Run migrations
sqlx migrate run
```

### Adding New Features

1. **Backend Changes**
   - Add routes in `src/main.rs`
   - Add models in `src/models.rs`
   - Add business logic in appropriate modules

2. **Database Changes**
   - Create migration: `sqlx migrate add feature_name`
   - Update models if needed
   - Test with development database

3. **Testing**
   ```bash
   cargo test
   cargo clippy
   cargo fmt
   ```

## Monitoring and Maintenance

### Health Monitoring

```bash
# Check service status
./deploy-digital-ocean.sh --status YOUR_DROPLET_IP

# View logs
./deploy-digital-ocean.sh --logs YOUR_DROPLET_IP

# Check health endpoint
curl https://yourdomain.com/health
```

### Backup and Recovery

```bash
# Create backup
./deploy-digital-ocean.sh --backup YOUR_DROPLET_IP

# Manual database backup
docker compose exec postgres pg_dump -U user database > backup.sql

# Restore from backup
docker compose exec -T postgres psql -U user database < backup.sql
```

### Updates and Rollbacks

```bash
# Update to latest version
./deploy-digital-ocean.sh --update YOUR_DROPLET_IP

# Rollback if needed
./deploy-digital-ocean.sh --rollback YOUR_DROPLET_IP
```

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready -U user -d database

# Check logs
docker compose logs postgres
```

#### API Not Responding
```bash
# Check backend logs
docker compose logs backend

# Check if port is accessible
curl http://localhost:8080/health
```

#### SSL Certificate Issues
```bash
# Renew Let's Encrypt certificates
certbot renew

# Check certificate expiry
openssl x509 -in /path/to/cert.pem -text -noout
```

### Performance Tuning

#### Database Optimization
```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyze table statistics
ANALYZE purchases;
ANALYZE users;
```

#### Application Optimization
- Monitor memory usage with `docker stats`
- Adjust connection pool settings in `.env`
- Enable query caching for frequently accessed data
- Use CDN for static assets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Setup

```bash
git clone <your-fork>
cd stock-notebook
./scripts/dev-setup.sh
make test
```

## License

[Your License Here]

## Support

- **Issues**: GitHub Issues
- **Documentation**: See `/docs` directory
- **Health Check**: `https://yourdomain.com/health`

---

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   Rust Backend  │    │   PostgreSQL    │
│   (Reverse      │────│   (Axum API)    │────│   (Database)    │
│    Proxy)       │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌─────────┐            ┌─────────┐            ┌─────────┐
    │   SSL   │            │   JWT   │            │ Migrations│
    │ Termination│          │  Auth   │            │ & Backups │
    └─────────┘            └─────────┘            └─────────┘
```

## Project Structure

```
stock-notebook/
├── backend/                 # Rust backend application
│   ├── src/
│   │   ├── main.rs         # Main application entry point
│   │   ├── models.rs       # Data models
│   │   └── stock_api.rs    # Stock API integration
│   ├── migrations/         # Database migrations
│   └── Dockerfile          # Backend container image
├── nginx/                  # Nginx configuration
│   ├── nginx.conf          # Main nginx config
│   └── conf.d/             # Server configurations
├── scripts/                # Deployment and utility scripts
│   ├── dev-setup.sh        # Development environment setup
│   └── seed-db.sh          # Database seeding
├── docker-compose.yml      # Development services
├── docker-compose.prod.yml # Production services
└── deploy-digital-ocean.sh # Digital Ocean deployment
```

Built with ❤️ using Rust and PostgreSQL
