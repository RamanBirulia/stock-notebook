# Project Structure Documentation

## Overview
This is a Spring Boot 3 application following modern Java best practices with a layered architecture pattern.

## Directory Structure

```
backend-java/
├── src/
│   ├── main/
│   │   ├── java/com/stocknotebook/
│   │   │   ├── StockNotebookApplication.java      # Main application class
│   │   │   ├── config/                            # Configuration classes
│   │   │   │   ├── SecurityConfig.java           # Spring Security configuration
│   │   │   │   ├── CacheConfig.java              # Cache configuration
│   │   │   │   ├── WebConfig.java                # Web MVC configuration
│   │   │   │   └── AppConfig.java                # General app configuration
│   │   │   ├── controller/                       # REST controllers
│   │   │   │   ├── AuthController.java           # Authentication endpoints
│   │   │   │   ├── PurchaseController.java       # Purchase management
│   │   │   │   ├── StockController.java          # Stock data endpoints
│   │   │   │   ├── DashboardController.java      # Dashboard data
│   │   │   │   └── AdminController.java          # Admin endpoints
│   │   │   ├── service/                          # Business logic layer
│   │   │   │   ├── AuthService.java              # Authentication service
│   │   │   │   ├── UserService.java              # User management
│   │   │   │   ├── PurchaseService.java          # Purchase operations
│   │   │   │   ├── StockService.java             # Stock data operations
│   │   │   │   ├── DashboardService.java         # Dashboard calculations
│   │   │   │   └── YahooFinanceService.java      # External API integration
│   │   │   ├── repository/                       # Data access layer
│   │   │   │   ├── UserRepository.java           # User data access
│   │   │   │   ├── PurchaseRepository.java       # Purchase data access
│   │   │   │   └── StockDataRepository.java      # Stock data access
│   │   │   ├── entity/                           # JPA entities
│   │   │   │   ├── User.java                     # User entity
│   │   │   │   ├── Purchase.java                 # Purchase entity
│   │   │   │   ├── StockData.java                # Stock data entity
│   │   │   │   └── BaseEntity.java               # Base entity with audit fields
│   │   │   ├── dto/                              # Data Transfer Objects
│   │   │   │   ├── request/                      # Request DTOs
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   └── CreatePurchaseRequest.java
│   │   │   │   ├── response/                     # Response DTOs
│   │   │   │   │   ├── AuthResponse.java
│   │   │   │   │   ├── DashboardResponse.java
│   │   │   │   │   └── StockDetailsResponse.java
│   │   │   │   └── external/                     # External API DTOs
│   │   │   │       └── yahoo/                    # Yahoo Finance DTOs
│   │   │   ├── mapper/                           # Manual object mappers
│   │   │   │   ├── UserMapper.java               # User entity/DTO mapping utility
│   │   │   │   ├── PurchaseMapper.java           # Purchase entity/DTO mapping utility
│   │   │   │   └── StockMapper.java              # Stock entity/DTO mapping utility
│   │   │   ├── exception/                        # Exception handling
│   │   │   │   ├── GlobalExceptionHandler.java   # Global exception handler
│   │   │   │   └── custom/                       # Custom exceptions
│   │   │   │       ├── UserNotFoundException.java
│   │   │   │       ├── StockNotFoundException.java
│   │   │   │       └── YahooFinanceException.java
│   │   │   ├── security/                         # Security components
│   │   │   │   ├── JwtAuthenticationFilter.java  # JWT filter
│   │   │   │   ├── JwtTokenProvider.java         # JWT token handling
│   │   │   │   └── UserDetailsImpl.java          # User details implementation
│   │   │   ├── client/                           # External API clients
│   │   │   │   └── YahooFinanceClient.java       # Yahoo Finance API client
│   │   │   ├── cache/                            # Cache management
│   │   │   │   ├── CacheNames.java               # Cache name constants
│   │   │   │   └── CacheService.java             # Cache operations
│   │   │   ├── scheduler/                        # Scheduled tasks
│   │   │   │   └── StockDataScheduler.java       # Stock data update scheduler
│   │   │   ├── seeder/                           # Database seeding
│   │   │   │   └── DatabaseSeeder.java           # Database seeding utility
│   │   │   └── util/                             # Utility classes
│   │   │       ├── DateUtils.java                # Date utilities
│   │   │       └── ValidationUtils.java          # Validation utilities
│   │   └── resources/
│   │       ├── application.yml                   # Application configuration
│   │       ├── db/migration/                     # Flyway migrations
│   │       │   ├── V1__Initial_schema.sql
│   │       │   └── V2__Add_stock_data_table.sql
│   │       └── static/                           # Static resources
│   └── test/
│       └── java/com/stocknotebook/
│           ├── controller/                       # Controller tests
│           ├── service/                          # Service tests
│           ├── repository/                       # Repository tests
│           └── integration/                      # Integration tests
├── pom.xml                                       # Maven configuration
├── Dockerfile                                    # Docker configuration
├── .dockerignore                                 # Docker ignore file
└── README.md                                     # Project documentation
```

## Architecture Patterns

### Layered Architecture
- **Controller Layer**: REST endpoints, request/response handling
- **Service Layer**: Business logic, transaction management
- **Repository Layer**: Data access, database operations
- **Entity Layer**: JPA entities, database mapping

### Design Patterns Used
- **Repository Pattern**: Data access abstraction
- **DTO Pattern**: Data transfer between layers
- **Factory Pattern**: Object creation
- **Strategy Pattern**: Authentication strategies
- **Observer Pattern**: Event handling
- **Manual Mapping**: Standard Java object mapping without external libraries

## Key Components

### Configuration
- **SecurityConfig**: JWT authentication, CORS, security filters
- **CacheConfig**: Caffeine cache setup, TTL configuration
- **WebConfig**: CORS, interceptors, formatters

### Security
- **JWT Token Provider**: Token generation and validation
- **Authentication Filter**: Request authentication
- **User Details Service**: User authentication details

### External Integration
- **Yahoo Finance Client**: Stock data fetching
- **Cache Service**: Data caching layer
- **Scheduler**: Automated stock data updates

### Database
- **Flyway**: Database migration management
- **JPA Auditing**: Automatic audit fields
- **Connection Pooling**: HikariCP configuration

## Testing Strategy

### Unit Tests
- Service layer business logic
- Repository layer data access
- Utility classes

### Integration Tests
- Controller endpoints
- Database operations
- External API integration

### Test Containers
- PostgreSQL test containers
- Isolated test environments

## Build and Deployment

### Maven Profiles
- **default**: Development profile
- **test**: Test profile with H2 database
- **docker**: Docker deployment profile

### Docker
- Multi-stage build for optimization
- Non-root user for security
- Health checks for monitoring

## Monitoring and Observability

### Spring Boot Actuator
- Health checks
- Metrics collection
- Cache statistics
- Application information

### Logging
- Standard Java logging with SLF4J
- Configurable log levels
- Request/response logging
- No external annotation processors

## Performance Considerations

### Caching Strategy
- Multiple cache levels (price, chart, symbol)
- Configurable TTL values
- Cache eviction policies

### Database Optimization
- Connection pooling
- Query optimization
- Batch processing

### Async Processing
- Scheduled tasks
- Non-blocking operations
- Thread pool configuration