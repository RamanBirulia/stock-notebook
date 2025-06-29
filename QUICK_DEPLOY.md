# Quick Deploy Guide - Digital Ocean App Platform

This is a streamlined guide to get your Stock Tracker app deployed on Digital Ocean App Platform in under 30 minutes.

## 🚀 Quick Start (5 steps)

### 1. Get Your API Key
- Go to [alphavantage.co](https://alphavantage.co/support/#api-key)
- Sign up for a free account
- Copy your API key

### 2. Generate JWT Secret
```bash
# Run this command to generate a secure JWT secret
openssl rand -base64 32
```

### 3. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 4. Deploy on Digital Ocean
1. Go to [cloud.digitalocean.com/apps](https://cloud.digitalocean.com/apps)
2. Click **"Create App"**
3. Choose **"GitHub"** and connect your repository
4. Select your repository and `main` branch
5. Click **"Next"** through the detected services
6. In **Environment Variables**, add:
   - `ALPHA_VANTAGE_API_KEY` = (your API key from step 1)
   - `JWT_SECRET` = (your generated secret from step 2)
7. Choose **Basic** plan ($12/month total)
8. Click **"Create Resources"**

### 5. Wait and Test
- Deployment takes 5-10 minutes
- You'll get URLs for both frontend and backend
- Test by creating an account and adding a stock purchase

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] Have Alpha Vantage API key
- [ ] Have generated JWT secret
- [ ] Digital Ocean account created

## 🔧 Configuration Details

Your app will be deployed with:

### Frontend (React)
- **Type**: Static Site
- **Build**: Automatic from `/frontend`
- **URL**: `https://your-app-name.ondigitalocean.app`

### Backend (Rust)
- **Type**: Docker Container
- **Build**: Automatic using Dockerfile
- **URL**: `https://your-app-name-backend.ondigitalocean.app`

### Database
- **Type**: PostgreSQL 14
- **Size**: Development tier (included in plan)
- **Backup**: Automatic daily backups

## 💰 Pricing

### Basic Plan (~$12/month total)
- Frontend: $3/month (static site)
- Backend: $5/month (basic container)
- Database: $4/month (dev database)

### Free Trial
- Digital Ocean offers $200 credit for new accounts
- Try the app for 2+ months free

## 🐛 Common Issues

### Build Failures
```
Error: Failed to build backend
```
**Solution**: Check that your GitHub repository is public or DO has access

### Environment Variables
```
Error: Missing ALPHA_VANTAGE_API_KEY
```
**Solution**: Add the environment variable in app settings

### CORS Errors
```
Error: Blocked by CORS policy
```
**Solution**: Wait for full deployment - CORS is configured automatically

## 🎯 After Deployment

### Test Your App
1. Visit your frontend URL
2. Click "Get Started" 
3. Create an account
4. Add a stock purchase (try "AAPL")
5. Check your dashboard

### Optional: Custom Domain
1. In app settings, go to "Domains"
2. Add your domain name
3. Update DNS records as shown
4. SSL certificate is automatic

## 📊 Monitoring

### View Logs
- App Platform Dashboard → Your App → Runtime Logs
- Separate logs for frontend, backend, and database

### Performance
- CPU and memory usage shown in dashboard
- Set up alerts for high usage

### Scaling
- Increase instance count for more traffic
- Upgrade instance size for better performance

---

## 🆘 Need Help?

### Quick Fixes
1. **App won't start**: Check environment variables are set
2. **Can't add stocks**: Verify Alpha Vantage API key
3. **Login doesn't work**: Check JWT_SECRET is set
4. **Build fails**: Ensure code is pushed to GitHub

### Get Support
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed guide
- Digital Ocean docs: [docs.digitalocean.com](https://docs.digitalocean.com)
- GitHub issues: Open an issue in your repository

---

**Total Time**: 15-30 minutes
**Monthly Cost**: ~$12 (or free with trial credits)
**Maintenance**: Minimal - updates deploy automatically on git push