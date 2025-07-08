# Stock Notebook Backend (Java)

Spring Boot 3 backend service for stock portfolio tracking with real-time data from Yahoo Finance API.

## Features

- **Authentication**: JWT-based user registration and login
- **Portfolio Management**: Track stock purchases and calculate portfolio performance
- **Real-time Data**: Fetch current stock prices and historical charts from Yahoo Finance
- **Caching**: Multi-level caching for optimal performance
- **Admin Dashboard**: Cache management and database statistics
- **Automated Updates**: Scheduled stock data updates
- **Database Seeding**: Generate fake data for testing

## Tech Stack

- **Java 17** with Spring Boot 3.2
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **Flyway** for database migrations
- **Caffeine** for caching
- **Maven** for build management
- **Docker** for containerization

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- PostgreSQL 15+
- Docker (optional)

### Local Development

1. **Clone and navigate to backend**
   ```bash
   cd stock-notebook/backend-java
   ```

2. **Set up PostgreSQL database**
   ```bash
   createdb stock_notebook
   createuser stock_user
   ```

3. **Configure environment variables**
   ```bash
   export DATABASE_URL=jdbc:postgresql://localhost:5432/stock_notebook
   export DATABASE_USER=stock_user
   export DATABASE_PASSWORD=stock_password
   export JWT_SECRET=your-secret-key
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Access the API**
   - Health check: http://localhost:8080/actuator/health
   - API base: http://localhost:8080/api/

### Docker Deployment

1. **Build and run with Docker**
   ```bash
   docker build -t stock-notebook-backend .
   docker run -p 8080:8080 stock-notebook-backend
   ```

2. **Using Docker Compose** (from project root)
   ```bash
   docker-compose up backend-java
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Portfolio
- `GET /api/purchases` - Get user purchases
- `POST /api/purchases` - Add new purchase
- `GET /api/dashboard` - Portfolio dashboard data

### Stock Data
- `GET /api/stock/{symbol}` - Stock details
- `GET /api/stock/{symbol}/chart` - Historical chart data
- `GET /api/symbols/search` - Search stock symbols

### Admin
- `GET /api/admin/cache/stats` - Cache statistics
- `POST /api/admin/cache/clear` - Clear all cache
- `POST /api/admin/stock-data/update` - Update stock data

## Testing

### Run Tests
```bash
mvn test
```

### Run Integration Tests
```bash
mvn verify -P integration-test
```

### Database Seeding
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--seed-database=true"
```

## Configuration

Key configuration options in `application.yml`:

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:mySecretKey}
    expiration: 86400000 # 24 hours
  
  yahoo-finance:
    base-url: https://query1.finance.yahoo.com
    timeout: 30000
  
  cache:
    price-cache-ttl: 300 # 5 minutes
    chart-cache-ttl: 1800 # 30 minutes
```

## Development

### Project Structure
See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed architecture documentation.

### Contributing
See [HOW_TO_CONTRIBUTE.md](HOW_TO_CONTRIBUTE.md) for development guidelines.

### Database Migrations
```bash
mvn flyway:migrate
```

### Generate Test Data
```bash
curl -X POST http://localhost:8080/api/admin/seed-database
```

## Production

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `YAHOO_FINANCE_API_KEY` - Yahoo Finance API key (optional)
- `LOG_LEVEL` - Logging level (INFO, DEBUG, WARN)

### Health Checks
- `/actuator/health` - Application health status
- `/actuator/metrics` - Application metrics

### Monitoring
- Spring Boot Actuator endpoints enabled
- Structured logging with JSON format
- Database connection pool monitoring

## License

MIT License - see LICENSE file for details