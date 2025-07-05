# Docker Setup Guide

This guide explains how to use the Docker setup for the Stock Notebook application with both development and production configurations.

## Overview

The project uses two Docker Compose configurations:
- **`docker-compose.development.yml`** - For local development with hot reloading and SQLx online mode
- **`docker-compose.production.yml`** - For production deployment with SQLx offline mode

## Development Setup

### Prerequisites
- Docker and Docker Compose installed
- No database connection required during build (SQLx online mode)

### Quick Start
```bash
# Start development environment
docker compose -f docker-compose.development.yml up --build

# With watch mode for live reloading
docker compose -f docker-compose.development.yml up --build --watch
```

### What's Included
- **PostgreSQL**: Database with exposed port 5432
- **Adminer**: Database administration tool at http://localhost:8081
- **Backend**: Rust API server with hot reloading at http://localhost:8080
- **Frontend**: React development server at http://localhost:3000

### Features
- Live code reloading for both frontend and backend
- SQLx online mode (compile-time query verification with database connection)
- Debug logging enabled
- Development-friendly configuration

## Production Setup

### Prerequisites
- Docker and Docker Compose installed
- SQLx offline data generated (see below)
- Environment variables configured

### Generate SQLx Offline Data
Before building for production, you need to generate SQLx offline data:

```bash
# Generate .sqlx directory
./scripts/generate-sqlx-offline.sh

# Commit the generated files
git add backend/.sqlx
git commit -m "Add SQLx offline data for production builds"
```

### Environment Variables
Create a `.env` file in the project root:

```env
# Database
POSTGRES_DB=stock_notebook
POSTGRES_USER=stock_user
POSTGRES_PASSWORD=your_secure_password

# Backend
JWT_SECRET=your_super_secret_jwt_key_for_production
RUST_LOG=warn
FRONTEND_URL=https://yourdomain.com
FRONTEND_API_URL=https://api.yourdomain.com

# Optional: Database connection pool settings
SQLX_MAX_CONNECTIONS=20
SQLX_MIN_CONNECTIONS=5
SQLX_ACQUIRE_TIMEOUT=30
SQLX_IDLE_TIMEOUT=600
SQLX_MAX_LIFETIME=1800
```

### Deploy to Production
```bash
# Build and start production environment
docker-compose -f docker-compose.production.yml up -d --build

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Stop services
docker-compose -f docker-compose.production.yml down
```

## Key Differences

| Feature | Development | Production |
|---------|-------------|------------|
| SQLx Mode | Online (requires DB during build) | Offline (no DB required during build) |
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Logging | Debug level | Warn level |
| Database Port | Exposed (5432) | Internal only |
| Security | Relaxed | Hardened |
| Resource Limits | None | Memory/CPU limits |
| Health Checks | Basic | Comprehensive |

## Maintenance

### Update SQLx Offline Data
Run this whenever you modify SQL queries or migrations:

```bash
# Regenerate offline data
./scripts/generate-sqlx-offline.sh

# Commit changes
git add backend/.sqlx
git commit -m "Update SQLx offline data"
```

### Cleanup
```bash
# Remove development volumes and containers
docker-compose -f docker-compose.development.yml down -v

# Remove production volumes and containers
docker-compose -f docker-compose.production.yml down -v

# Remove unused Docker resources
docker system prune -a
```

## Troubleshooting

### SQLx Compile Errors
- **Development**: Ensure PostgreSQL is running and accessible
- **Production**: Regenerate `.sqlx` files with `./scripts/generate-sqlx-offline.sh`

### Build Failures
- Check if all required files are copied to Docker context
- Verify `.sqlx` directory exists for production builds
- Ensure environment variables are set correctly

### Database Connection Issues
- Verify database credentials in environment variables
- Check if PostgreSQL container is healthy
- Ensure network connectivity between services

## File Structure

```
stock-notebook/
├── docker-compose.development.yml  # Development configuration
├── docker-compose.production.yml   # Production configuration
├── backend/
│   ├── Dockerfile                  # Multi-stage Dockerfile
│   ├── .sqlx/                      # SQLx offline data (generated)
│   └── migrations/                 # Database migrations
├── frontend/
│   └── Dockerfile                  # Frontend Dockerfile
└── scripts/
    └── generate-sqlx-offline.sh    # Script to generate SQLx offline data
```

## Next Steps

1. **Development**: Use `docker-compose.development.yml` for local development
2. **Production**: Generate SQLx offline data and use `docker-compose.production.yml`
3. **CI/CD**: Set up automated builds using the production configuration
4. **Monitoring**: Add logging and monitoring solutions for production deployment
