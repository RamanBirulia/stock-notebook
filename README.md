# Stock Tracker

A comprehensive stock portfolio tracking application built with React and Rust.

## Features

### ✅ Authentication System
- **User Registration & Login**: Secure JWT-based authentication
- **Protected Routes**: All portfolio data is user-specific and protected
- **Landing Page**: Attractive demo for unauthorized users with comics-style layout
- **Session Persistence**: Automatic login on return visits

### 📊 Portfolio Management
- **Real-time Stock Data**: Live market prices and portfolio valuation
- **Purchase Tracking**: Record and manage all stock transactions
- **Profit/Loss Analysis**: Comprehensive performance metrics
- **Interactive Charts**: Visual representation of stock performance

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Internationalization**: Multi-language support (English/Spanish)
- **Modern UI**: Clean, professional interface with smooth animations

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Redux Toolkit** for state management
- **RTK Query** for API calls and caching
- **TailwindCSS** for styling
- **React Router** for navigation
- **Chart.js** for interactive charts
- **i18next** for internationalization

### Backend
- **Rust** with Axum web framework
- **SQLite** database with SQLx
- **JWT** for authentication
- **bcrypt** for password hashing
- **Alpha Vantage API** for stock data

## Quick Start

### Prerequisites
- Node.js 18+
- Rust 1.70+
- Alpha Vantage API key (free)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-notebook
   ```

2. **Backend Setup**
   ```bash
   cd backend

   # Set environment variables
   export DATABASE_URL="sqlite:stocks.db"
   export ALPHA_VANTAGE_API_KEY="your-api-key"
   export JWT_SECRET="your-jwt-secret"

   # Run the backend
   cargo run
   ```

3. **Frontend Setup**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Start development server
   npm start
   ```

4. **Access the Application**
   - Open http://localhost:3000
   - Create an account or login
   - Start tracking your portfolio!

## Authentication System

The application features a complete authentication system:

### For New Users
1. **Landing Page**: See a demo of the dashboard and form components
2. **Registration**: Create an account with username/password
3. **Automatic Login**: Immediately access your personal dashboard

### For Returning Users
- **Automatic Authentication**: Stay logged in across browser sessions
- **Secure Access**: All data is protected and user-specific
- **Easy Logout**: Sign out from the header menu

### Landing Page Features
- **Demo Dashboard**: Real portfolio components with sample data
- **Demo Form**: Stock purchase form showing the input process
- **Comics-Style Layout**: Playful design with hand-drawn elements
- **Feature Showcase**: Interactive cards explaining app capabilities

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and get JWT token

### Protected Endpoints (require JWT token)
- `GET /api/dashboard` - Portfolio overview with profit/loss
- `GET /api/purchases` - List all stock purchases
- `POST /api/purchases` - Add new stock purchase
- `GET /api/stock/:symbol` - Detailed stock information
- `GET /api/stock/:symbol/chart` - Stock price chart data

## Development

### Database Migrations
Migrations run automatically on backend startup. The database includes:
- `users` table for authentication
- `purchases` table for stock transactions

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=sqlite:stocks.db
ALPHA_VANTAGE_API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

# Frontend (handled by proxy)
REACT_APP_API_URL=http://localhost:8080
```

### Security Features
- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: 24-hour expiration
- **Protected Routes**: Middleware validation
- **CORS**: Properly configured for frontend

## Deployment

This application is ready for deployment to Digital Ocean App Platform with comprehensive guides:

### 🚀 Quick Deploy (30 minutes)
See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for a streamlined deployment guide:
- Get API key and setup
- Deploy with 5 simple steps
- Cost: ~$12/month (free with trial credits)

### 📚 Complete Deployment Guide
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation:
- Detailed setup instructions
- Environment configuration
- Monitoring and scaling
- Troubleshooting guide
- Security best practices

### 🛠️ Automated Helper Script
Use the deployment helper script:
```bash
./deploy.sh --help
```

### Manual Deployment

#### Frontend
```bash
cd frontend
npm run build
# Deploy 'build' folder to static hosting
```

#### Backend
```bash
cd backend
cargo build --release
# Deploy binary with environment variables
```

#### Digital Ocean App Platform Features
- ✅ Automatic builds from Git
- ✅ Environment variable configuration  
- ✅ SSL certificate handling
- ✅ PostgreSQL database with backups
- ✅ Auto-scaling and monitoring
- ✅ Custom domains support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the [Authentication Setup Guide](AUTHENTICATION_SETUP.md)
2. Review the [Development Roadmap](DEVELOPMENT_ROADMAP.md)
3. Open an issue on GitHub

---

**Note**: This application is for educational and personal use. Always verify stock data with official sources before making investment decisions.
