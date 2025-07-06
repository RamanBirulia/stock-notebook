# Stock Notebook API - Postman Collection Documentation

This documentation provides a comprehensive guide for testing the Stock Notebook API using Postman, including authentication, all available endpoints, expected responses, and curl examples.

## Base URL
```
http://localhost:8080
```

## 1. Authentication

### Overview
The API uses JWT (JSON Web Token) authentication. Most endpoints require a valid JWT token in the Authorization header, except for:
- `/health` - Health check endpoint
- `/api/auth/login` - Login endpoint  
- `/api/auth/register` - Registration endpoint
- `/api/admin/*` - Admin endpoints (currently bypassed in middleware)

### Authentication Flow
1. Register a new user or login with existing credentials
2. Receive a JWT token in the response
3. Include the token in the `Authorization` header for protected endpoints: `Bearer <token>`

## 2. API Endpoints

### 2.1 Health Check

**GET /health**
- **Description**: Check if the API is running
- **Authentication**: None required
- **Response**: Status message

```bash
curl -X GET http://localhost:8080/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 2.2 Authentication Endpoints

#### 2.2.1 Register User

**POST /api/auth/register**
- **Description**: Register a new user account
- **Authentication**: None required
- **Request Body**: JSON with username and password

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "last_login": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2.2.2 Login User

**POST /api/auth/login**
- **Description**: Authenticate user and receive JWT token
- **Authentication**: None required
- **Request Body**: JSON with username and password

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "last_login": "2024-01-01T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.3 Purchase Management

#### 2.3.1 Create Purchase

**POST /api/purchases**
- **Description**: Record a new stock purchase
- **Authentication**: Bearer token required
- **Request Body**: JSON with purchase details

```bash
curl -X POST http://localhost:8080/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "symbol": "AAPL",
    "quantity": 10,
    "price_per_share": "150.50",
    "commission": "9.99",
    "purchase_date": "2024-01-01"
  }'
```

**Expected Response:**
```json
{
  "id": "purchase-uuid",
  "symbol": "AAPL",
  "quantity": 10,
  "price_per_share": "150.50",
  "commission": "9.99",
  "purchase_date": "2024-01-01"
}
```

#### 2.3.2 Get All Purchases

**GET /api/purchases**
- **Description**: Retrieve all purchases for the authenticated user
- **Authentication**: Bearer token required

```bash
curl -X GET http://localhost:8080/api/purchases \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
[
  {
    "id": "purchase-uuid-1",
    "symbol": "AAPL",
    "quantity": 10,
    "price_per_share": "150.50",
    "commission": "9.99",
    "purchase_date": "2024-01-01"
  },
  {
    "id": "purchase-uuid-2",
    "symbol": "GOOGL",
    "quantity": 5,
    "price_per_share": "2800.00",
    "commission": "9.99",
    "purchase_date": "2024-01-02"
  }
]
```

### 2.4 Dashboard

#### 2.4.1 Get Dashboard Data

**GET /api/dashboard**
- **Description**: Get portfolio overview with current values and profit/loss
- **Authentication**: Bearer token required

```bash
curl -X GET http://localhost:8080/api/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "total_spent": "15519.98",
  "current_value": "16500.00",
  "profit_loss": "980.02",
  "profit_loss_percentage": "6.31",
  "stocks": [
    {
      "symbol": "AAPL",
      "quantity": "10",
      "current_price": "155.00",
      "total_value": "1550.00",
      "total_spent": "1509.99"
    },
    {
      "symbol": "GOOGL",
      "quantity": "5",
      "current_price": "2990.00",
      "total_value": "14950.00",
      "total_spent": "14009.99"
    }
  ]
}
```

### 2.5 Stock Information

#### 2.5.1 Get Stock Details

**GET /api/stock/{symbol}**
- **Description**: Get detailed information about a specific stock including purchases
- **Authentication**: Bearer token required
- **Path Parameter**: symbol (stock symbol, e.g., AAPL)

```bash
curl -X GET http://localhost:8080/api/stock/AAPL \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "symbol": "AAPL",
  "purchases": [
    {
      "id": "purchase-uuid",
      "symbol": "AAPL",
      "quantity": 10,
      "price_per_share": "150.50",
      "commission": "9.99",
      "purchase_date": "2024-01-01"
    }
  ],
  "total_quantity": "10",
  "total_spent": "1509.99",
  "current_price": "155.00",
  "current_value": "1550.00",
  "profit_loss": "40.01"
}
```

#### 2.5.2 Get Stock Chart Data

**GET /api/stock/{symbol}/chart**
- **Description**: Get historical price data and purchase points for charting
- **Authentication**: Bearer token required
- **Path Parameter**: symbol (stock symbol, e.g., AAPL)
- **Query Parameter**: period (optional, default: 1M)

**Available periods**: 1D, 1W, 1M, 3M, 6M, 1Y, 2Y, 5Y, 10Y, MAX

```bash
curl -X GET "http://localhost:8080/api/stock/AAPL/chart?period=1M" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "symbol": "AAPL",
  "period": "1M",
  "price_data": [
    {
      "date": "2024-01-01",
      "price": "150.50",
      "volume": 1000000
    },
    {
      "date": "2024-01-02",
      "price": "151.25",
      "volume": 1200000
    }
  ],
  "purchase_points": [
    {
      "date": "2024-01-01",
      "price": "150.50"
    }
  ]
}
```

### 2.6 Symbol Search

#### 2.6.1 Search Stock Symbols

**GET /api/symbols/search**
- **Description**: Search for stock symbols by name or symbol
- **Authentication**: Bearer token required
- **Query Parameters**: 
  - q (required): Search query
  - limit (optional): Number of results (default: 10)

```bash
curl -X GET "http://localhost:8080/api/symbols/search?q=Apple&limit=5" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "exchange": "NASDAQ",
    "asset_type": "Stock"
  },
  {
    "symbol": "APLE",
    "name": "Apple Hospitality REIT Inc.",
    "exchange": "NYSE",
    "asset_type": "REIT"
  }
]
```

### 2.7 Admin Endpoints

#### 2.7.1 Get Cache Statistics

**GET /api/admin/cache/stats**
- **Description**: Get cache statistics (price, chart, symbol cache counts)
- **Authentication**: None required (bypassed in middleware)

```bash
curl -X GET http://localhost:8080/api/admin/cache/stats
```

**Expected Response:**
```json
{
  "price_cache_count": 25,
  "chart_cache_count": 10,
  "symbol_cache_count": 1
}
```

#### 2.7.2 Clear Cache

**POST /api/admin/cache/clear**
- **Description**: Clear all cached data
- **Authentication**: None required (bypassed in middleware)

```bash
curl -X POST http://localhost:8080/api/admin/cache/clear
```

**Expected Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

#### 2.7.3 Cleanup Expired Cache

**POST /api/admin/cache/cleanup**
- **Description**: Remove expired cache entries
- **Authentication**: None required (bypassed in middleware)

```bash
curl -X POST http://localhost:8080/api/admin/cache/cleanup
```

**Expected Response:**
```json
{
  "message": "Expired cache entries cleaned up"
}
```

#### 2.7.4 Update Stock Data

**POST /api/admin/stock-data/update**
- **Description**: Bulk update stock data for multiple symbols
- **Authentication**: None required (bypassed in middleware)
- **Request Body**: JSON array of stock symbols

```bash
curl -X POST http://localhost:8080/api/admin/stock-data/update \
  -H "Content-Type: application/json" \
  -d '{
    "symbols": ["AAPL", "GOOGL", "MSFT", "TSLA"]
  }'
```

**Expected Response:**
```json
{
  "message": "Stock data updated successfully for 4 symbols"
}
```

#### 2.7.5 Get Database Statistics

**GET /api/admin/stock-data/stats**
- **Description**: Get database statistics (symbols count, etc.)
- **Authentication**: None required (bypassed in middleware)

```bash
curl -X GET http://localhost:8080/api/admin/stock-data/stats
```

**Expected Response:**
```json
{
  "symbols_count": 150,
  "total_records": 50000,
  "last_updated": "2024-01-01T12:00:00Z"
}
```

#### 2.7.6 Cleanup Old Stock Data

**POST /api/admin/stock-data/cleanup**
- **Description**: Delete old stock data older than specified days
- **Authentication**: None required (bypassed in middleware)
- **Request Body**: JSON with days to keep

```bash
curl -X POST http://localhost:8080/api/admin/stock-data/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "days_to_keep": 365
  }'
```

**Expected Response:**
```json
{
  "message": "Deleted 1500 old records",
  "records_deleted": 1500
}
```

## 3. Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data",
  "details": "Missing required field: symbol"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "details": "Stock symbol not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "details": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

## 4. Postman Collection Setup

### 4.1 Environment Variables

Set up the following environment variables in Postman:

- `baseUrl`: `http://localhost:8080`
- `authToken`: (will be set automatically after login)

### 4.2 Authentication Setup

1. Create a login request and use the "Tests" tab to automatically set the token:

```javascript
if (pm.response.code === 200) {
    const responseJson = pm.response.json();
    pm.environment.set("authToken", responseJson.token);
}
```

2. For protected endpoints, set the Authorization header:
   - Type: Bearer Token
   - Token: `{{authToken}}`

### 4.3 Request Collection Order

Recommended order for testing:

1. **Health Check** - Verify API is running
2. **Register User** - Create a test account
3. **Login User** - Get authentication token
4. **Create Purchase** - Add some test data
5. **Get Dashboard** - View portfolio overview
6. **Get Stock Details** - View specific stock information
7. **Get Stock Chart** - View historical data
8. **Search Symbols** - Test symbol search
9. **Admin endpoints** - Test administrative functions

### 4.4 Sample Test Data

Use the following test data for consistent testing:

```json
{
  "username": "testuser",
  "password": "testpass123",
  "purchases": [
    {
      "symbol": "AAPL",
      "quantity": 10,
      "price_per_share": "150.00",
      "commission": "9.99",
      "purchase_date": "2024-01-01"
    },
    {
      "symbol": "GOOGL",
      "quantity": 5,
      "price_per_share": "2800.00",
      "commission": "9.99",
      "purchase_date": "2024-01-02"
    }
  ]
}
```

## 5. Common Issues and Troubleshooting

### 5.1 Authentication Issues
- Ensure the JWT token is properly formatted in the Authorization header
- Check that the token hasn't expired (24-hour expiry)
- Verify the JWT_SECRET environment variable is set correctly

### 5.2 Database Connection Issues
- Verify PostgreSQL is running on the expected port
- Check DATABASE_URL environment variable
- Ensure database migrations have been run

### 5.3 Stock Data Issues
- External API calls may fail due to rate limiting
- Some symbols may not be available in the Yahoo Finance API
- Check network connectivity for external API calls

### 5.4 CORS Issues
- Ensure the FRONTEND_URL environment variable is set correctly
- Check that the request origin matches the allowed CORS origins

This documentation provides a comprehensive guide for testing all API endpoints using Postman. Each endpoint includes detailed curl examples that can be imported directly into Postman for easy testing.