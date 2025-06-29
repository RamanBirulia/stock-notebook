# Production Deployment Checklist

This checklist ensures a secure and reliable deployment of Stock Notebook to Digital Ocean.

## Pre-Deployment Checklist

### 🏗️ Infrastructure Setup

- [ ] **Digital Ocean Droplet Created**
  - [ ] Ubuntu 20.04+ or Debian 11+ selected
  - [ ] Minimum 2GB RAM, 1 vCPU (recommended: 4GB RAM, 2 vCPU)
  - [ ] SSH key configured for access
  - [ ] Firewall configured (ports 22, 80, 443 only)

- [ ] **Domain Configuration**
  - [ ] Domain purchased and configured
  - [ ] DNS A record pointing to droplet IP
  - [ ] DNS propagation verified (`dig yourdomain.com`)

- [ ] **Local Environment**
  - [ ] SSH access to droplet verified
  - [ ] Deployment script permissions set (`chmod +x deploy-digital-ocean.sh`)
  - [ ] Production environment file prepared

### 🔐 Security Configuration

- [ ] **Environment Variables**
  - [ ] `POSTGRES_PASSWORD` set to strong password (20+ characters)
  - [ ] `JWT_SECRET` set to cryptographically secure key (32+ characters)
  - [ ] `POSTGRES_USER` changed from default
  - [ ] `POSTGRES_DB` set to production database name

- [ ] **SSL/TLS**
  - [ ] Domain name ready for Let's Encrypt
  - [ ] Email address for certificate notifications
  - [ ] OR custom SSL certificates prepared

- [ ] **Access Control**
  - [ ] SSH key-based authentication configured
  - [ ] Root password disabled (if using keys)
  - [ ] Non-root user created (optional but recommended)

## Deployment Steps

### 📦 Initial Deployment

```bash
# 1. Run initial deployment
./deploy-digital-ocean.sh --initial YOUR_DROPLET_IP

# 2. Configure environment variables
ssh root@YOUR_DROPLET_IP
cd /opt/stock-notebook
cp .env.production .env
nano .env  # Update all variables

# 3. Complete deployment
./deploy-digital-ocean.sh --update YOUR_DROPLET_IP

# 4. Setup SSL (recommended)
./deploy-digital-ocean.sh --ssl YOUR_DROPLET_IP
```

### ✅ Verify Deployment

- [ ] **Services Running**
  ```bash
  ./deploy-digital-ocean.sh --status YOUR_DROPLET_IP
  ```
  - [ ] PostgreSQL: Healthy
  - [ ] Backend API: Healthy
  - [ ] Nginx: Configuration OK

- [ ] **API Endpoints**
  - [ ] Health check: `https://yourdomain.com/health`
  - [ ] Registration: `POST /api/auth/register`
  - [ ] Login: `POST /api/auth/login`

- [ ] **Database**
  - [ ] Connection successful
  - [ ] Migrations applied
  - [ ] Tables created correctly

- [ ] **SSL Certificate**
  - [ ] Certificate installed and valid
  - [ ] HTTPS redirect working
  - [ ] SSL Labs grade A- or better

## Post-Deployment Configuration

### 🔧 Application Setup

- [ ] **Create Admin User**
  ```bash
  # Connect to database and create admin user
  docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
  ```

- [ ] **Test Core Features**
  - [ ] User registration works
  - [ ] User login/logout works
  - [ ] Stock purchase creation
  - [ ] Portfolio dashboard loads
  - [ ] Stock search functionality

- [ ] **Performance Tuning**
  - [ ] Database connection pool configured
  - [ ] Nginx caching enabled
  - [ ] Log rotation configured

### 📊 Monitoring Setup

- [ ] **Log Management**
  - [ ] Application logs accessible
  - [ ] Error logs monitored
  - [ ] Log rotation configured
  - [ ] Disk space monitoring

- [ ] **Health Monitoring**
  - [ ] Health endpoint responding
  - [ ] Database connectivity monitoring
  - [ ] SSL certificate expiration monitoring

- [ ] **Backup Strategy**
  - [ ] Database backup scheduled
  - [ ] Application files backup
  - [ ] Backup restoration tested
  - [ ] Off-site backup storage

### 🔒 Security Hardening

- [ ] **System Security**
  - [ ] System packages updated
  - [ ] Fail2ban configured and running
  - [ ] UFW firewall enabled and configured
  - [ ] Automatic security updates enabled

- [ ] **Application Security**
  - [ ] Environment variables secured
  - [ ] File permissions correct
  - [ ] No sensitive data in logs
  - [ ] Rate limiting configured

- [ ] **SSL/TLS Security**
  - [ ] Strong cipher suites configured
  - [ ] HSTS headers enabled
  - [ ] Certificate auto-renewal working

## Environment Variables Checklist

### Critical Variables (Must Change)

- [ ] `POSTGRES_PASSWORD` - Strong database password
- [ ] `JWT_SECRET` - Cryptographically secure secret
- [ ] `POSTGRES_USER` - Non-default database user
- [ ] `FRONTEND_URL` - Your actual domain

### Application Configuration

- [ ] `POSTGRES_DB` - Production database name
- [ ] `ENVIRONMENT=production`
- [ ] `RUST_LOG=warn` (or `error` for production)
- [ ] `ENABLE_API_REQUEST_LOGGING=false`
- [ ] `ENABLE_API_RESPONSE_LOGGING=false`

### Performance Tuning

- [ ] `SQLX_MAX_CONNECTIONS` - Appropriate for your load
- [ ] `SQLX_MIN_CONNECTIONS` - Minimum connection pool
- [ ] `SQLX_ACQUIRE_TIMEOUT` - Database timeout settings
- [ ] `CACHE_TTL_HOURS` - API cache duration

## Testing Checklist

### 🧪 Functional Testing

- [ ] **Authentication Flow**
  ```bash
  # Test registration
  curl -X POST https://yourdomain.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"testpass123"}'

  # Test login
  curl -X POST https://yourdomain.com/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"testpass123"}'
  ```

- [ ] **API Endpoints**
  - [ ] All endpoints return expected status codes
  - [ ] Error handling works correctly
  - [ ] Rate limiting active
  - [ ] CORS configured properly

- [ ] **Database Operations**
  - [ ] User creation/authentication
  - [ ] Purchase CRUD operations
  - [ ] Data persistence across restarts

### 🚀 Performance Testing

- [ ] **Load Testing**
  - [ ] API can handle expected concurrent users
  - [ ] Database performance acceptable
  - [ ] Memory usage within limits

- [ ] **Security Testing**
  - [ ] SQL injection protection
  - [ ] XSS protection headers
  - [ ] Authentication bypass attempts fail

## Maintenance Setup

### 📅 Scheduled Tasks

- [ ] **Daily Tasks**
  - [ ] Health check monitoring
  - [ ] Log file rotation
  - [ ] Disk space monitoring

- [ ] **Weekly Tasks**  
  - [ ] Database backup creation
  - [ ] System security updates
  - [ ] SSL certificate status check

- [ ] **Monthly Tasks**
  - [ ] Performance review
  - [ ] Security audit
  - [ ] Backup restoration test

### 🚨 Alerting

- [ ] **Critical Alerts**
  - [ ] Service downtime
  - [ ] Database connection failures  
  - [ ] SSL certificate expiration (30 days)
  - [ ] Disk space critical (90%+)

- [ ] **Warning Alerts**
  - [ ] High error rate
  - [ ] Slow response times
  - [ ] High resource usage

## Documentation

- [ ] **Deployment Documentation**
  - [ ] Environment configuration documented
  - [ ] Deployment process documented
  - [ ] Rollback procedure documented

- [ ] **Operational Documentation**
  - [ ] Monitoring procedures
  - [ ] Backup/restore procedures
  - [ ] Troubleshooting guide

- [ ] **Contact Information**
  - [ ] On-call contacts defined
  - [ ] Escalation procedures
  - [ ] Vendor contacts (Digital Ocean, domain registrar)

## Go-Live Checklist

### Final Verification

- [ ] **Pre-Launch**
  - [ ] All tests passing
  - [ ] Performance acceptable
  - [ ] Security scan completed
  - [ ] Backup/restore tested

- [ ] **Launch**
  - [ ] DNS TTL reduced (for quick rollback if needed)
  - [ ] Monitoring alerts active
  - [ ] Team notified of launch
  - [ ] Rollback plan ready

- [ ] **Post-Launch**
  - [ ] Monitor for 24 hours
  - [ ] User feedback collection
  - [ ] Performance metrics review
  - [ ] DNS TTL restored

## Emergency Procedures

### 🚨 Rollback Plan

```bash
# Quick rollback to previous version
./deploy-digital-ocean.sh --rollback YOUR_DROPLET_IP

# Manual rollback
ssh root@YOUR_DROPLET_IP
cd /opt/stock-notebook
docker compose -f docker-compose.prod.yml down
# Restore from backup
docker compose -f docker-compose.prod.yml up -d
```

### 📞 Emergency Contacts

- [ ] **Technical Contacts**
  - [ ] Primary developer: [Contact Info]
  - [ ] System administrator: [Contact Info]
  - [ ] Database administrator: [Contact Info]

- [ ] **Service Providers**
  - [ ] Digital Ocean support
  - [ ] Domain registrar support
  - [ ] SSL certificate provider

## Success Criteria

✅ **Deployment Successful When:**

- [ ] Application accessible via HTTPS
- [ ] All core features working
- [ ] SSL certificate valid and secure
- [ ] Performance meets requirements
- [ ] Monitoring and alerting active
- [ ] Backup strategy implemented
- [ ] Security measures in place

---

## Common Issues and Solutions

### Database Connection Issues

```bash
# Check PostgreSQL status
docker compose exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB

# Reset database connection
docker compose restart postgres
```

### SSL Certificate Issues

```bash
# Manually renew Let's Encrypt certificate
certbot renew --force-renewal

# Check certificate status
openssl x509 -in /opt/stock-notebook/ssl/cert.pem -text -noout
```

### Application Not Starting

```bash
# Check logs
docker compose logs backend

# Verify environment variables
docker compose exec backend env | grep -E "(DATABASE_URL|JWT_SECRET)"
```

---

**✅ Production deployment complete!**

**Next Steps:**
1. Monitor application for 24-48 hours
2. Set up regular maintenance schedule
3. Plan for scaling as user base grows
4. Document any custom configurations