# Database-Based Symbol Search Implementation

This document describes the implementation of a database-based symbol search feature for the Stock Notebook application, replacing the previous Yahoo Finance API dependency for symbol search functionality.

## Overview

The new implementation uses a local database table to store stock symbol metadata, providing faster search capabilities and reducing dependency on external APIs. The system includes over 100 popular stocks across various sectors and supports advanced search features.

## Database Schema

### Symbols Table

The `symbols` table stores comprehensive metadata for each stock symbol:

```sql
CREATE TABLE symbols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(500) NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    industry VARCHAR(100),
    exchange VARCHAR(50),
    market_cap_category VARCHAR(20), -- LARGE, MID, SMALL, MICRO, NANO
    country VARCHAR(50) DEFAULT 'US',
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

Optimized indexes for efficient searching:

- `idx_symbols_symbol` - Primary symbol lookups
- `idx_symbols_company_name` - Company name searches
- `idx_symbols_company_name_lower` - Case-insensitive company name searches
- `idx_symbols_search` - Full-text search using PostgreSQL's GIN index
- `idx_symbols_sector` - Sector-based filtering
- `idx_symbols_industry` - Industry-based filtering
- `idx_symbols_market_cap` - Market cap category filtering

## Key Features

### 1. Multi-Modal Search

The system supports various search modes:

- **Symbol-based search**: Direct symbol matching (e.g., "AAPL")
- **Company name search**: Partial company name matching (e.g., "Apple")
- **Full-text search**: Advanced search using PostgreSQL's full-text capabilities
- **Sector/Industry filtering**: Browse stocks by business category

### 2. Smart Search Ranking

Search results are ranked by relevance:

1. Exact symbol matches (highest priority)
2. Company names starting with the query
3. Symbols containing the query
4. Company names containing the query (lowest priority)

### 3. Fallback Mechanisms

- Primary search using `searchBySymbolOrCompanyName`
- Fallback to full-text search for complex queries
- Popular symbols returned for empty queries

### 4. Performance Optimizations

- Multiple specialized indexes
- Paginated results
- Caching layer using Spring Cache
- Efficient database queries

## API Endpoints

### Search Endpoints

```http
GET /api/stocks/search?query={query}&limit={limit}
```
Search for symbols by query string.

```http
GET /api/stocks/popular?limit={limit}
```
Get popular symbols (large and mid-cap stocks).

```http
GET /api/stocks/sector/{sector}?limit={limit}
```
Get symbols by sector.

### Metadata Endpoints

```http
GET /api/stocks/{symbol}/metadata
```
Get detailed metadata for a specific symbol.

```http
GET /api/stocks/sectors
```
Get all unique sectors.

```http
GET /api/stocks/industries
```
Get all unique industries.

```http
GET /api/stocks/symbols/statistics
```
Get symbol database statistics (admin only).

## Implementation Details

### Entity Model

The `Symbol` entity includes:

```java
@Entity
@Table(name = "symbols")
public class Symbol extends BaseEntity {
    private String symbol;
    private String companyName;
    private String description;
    private String sector;
    private String industry;
    private String exchange;
    private MarketCapCategory marketCapCategory;
    private String country;
    private String currency;
    private Boolean isActive;
    
    public enum MarketCapCategory {
        LARGE, MID, SMALL, MICRO, NANO
    }
}
```

### Repository Methods

Key repository methods for searching:

```java
@Repository
public interface SymbolRepository extends JpaRepository<Symbol, UUID> {
    // Basic lookups
    Optional<Symbol> findBySymbolIgnoreCase(String symbol);
    
    // Search methods
    Page<Symbol> searchBySymbolOrCompanyName(String query, Pageable pageable);
    List<Symbol> fullTextSearch(String query);
    
    // Filtering methods
    List<Symbol> findBySectorIgnoreCaseAndIsActiveTrue(String sector);
    List<Symbol> findByIndustryIgnoreCaseAndIsActiveTrue(String industry);
    List<Symbol> findPopularSymbols(Pageable pageable);
    
    // Metadata methods
    List<String> findAllUniqueSectors();
    List<String> findAllUniqueIndustries();
}
```

### Service Layer

The `StockService` provides:

```java
@Service
public class StockService {
    // Main search method
    @Cacheable(value = "symbolSearch", key = "#query + '_' + #limit")
    public List<SymbolSuggestionDTO> searchSymbols(String query, int limit);
    
    // Helper methods
    public List<SymbolSuggestionDTO> getPopularSymbols(int limit);
    public List<SymbolSuggestionDTO> getSymbolsBySector(String sector, int limit);
    public Optional<Symbol> getSymbolMetadata(String symbol);
    
    // Metadata methods
    public List<String> getAllSectors();
    public List<String> getAllIndustries();
    public Map<String, Object> getSymbolStatistics();
}
```

## Data Population

The system includes 100+ popular stocks across major sectors:

### Technology Sector
- Large cap: AAPL, MSFT, GOOGL, AMZN, META, TSLA, NVDA, etc.
- Mid cap: EPAM, SNOW, PLTR, UBER, etc.

### Financial Services
- JPM, BAC, WFC, GS, MS, V, MA, AXP, BRK.B

### Healthcare
- JNJ, PFE, UNH, ABBV, TMO, ABT, MRNA, GILD

### Consumer Discretionary
- HD, MCD, NKE, SBUX

### Consumer Staples
- PG, KO, PEP, WMT, COST

### Energy
- XOM, CVX, COP

### Industrials
- BA, CAT, GE, UPS, FDX

### And more across all major sectors...

## Migration Scripts

### V3__Create_symbols_table.sql
Creates the symbols table with appropriate indexes and constraints.

### V4__Seed_symbols_data.sql
Populates the table with 100+ popular stocks with comprehensive metadata.

## Usage Examples

### Search for Apple stock
```http
GET /api/stocks/search?query=Apple&limit=10
```

Response:
```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "description": "Designs, manufactures, and markets smartphones...",
    "sector": "Technology",
    "industry": "Consumer Electronics",
    "exchange": "NASDAQ",
    "marketCapCategory": "LARGE",
    "country": "US",
    "currency": "USD"
  }
]
```

### Get technology stocks
```http
GET /api/stocks/sector/Technology?limit=20
```

### Get popular symbols
```http
GET /api/stocks/popular?limit=10
```

## Benefits

1. **Performance**: Faster search response times compared to external API calls
2. **Reliability**: No dependency on external service availability
3. **Customization**: Can add/modify stock metadata as needed
4. **Cost**: No API usage costs
5. **Offline capability**: Works without internet connection
6. **Advanced features**: Full-text search, sector filtering, etc.

## Future Enhancements

1. **Real-time updates**: Scheduled jobs to update symbol metadata
2. **Popularity metrics**: Track search frequency for better ranking
3. **Additional metadata**: Market cap values, IPO dates, etc.
4. **Fuzzy search**: Handle typos and similar names
5. **Internationalization**: Support for international markets
6. **Symbol validation**: Ensure symbols exist before allowing trades

## Testing

Comprehensive unit tests cover:
- Symbol search functionality
- Fallback mechanisms
- Popular symbol retrieval
- Sector-based filtering
- Metadata retrieval
- Error handling

Run tests with:
```bash
mvn test -Dtest=StockServiceSymbolSearchTest
```

## Caching Strategy

The system uses Spring Cache with the following cache regions:

- `symbolSearch`: Symbol search results (key: query + limit)
- `stockPrices`: Stock price data (existing)
- `stockCharts`: Chart data (existing)

Cache eviction is handled automatically and can be manually triggered via admin endpoints.

## Security Considerations

- All endpoints require authentication
- Admin-only endpoints for statistics and cache management
- Input validation on all search parameters
- SQL injection prevention through parameterized queries
- Rate limiting can be applied at the API gateway level

## Monitoring and Logging

The system includes comprehensive logging:
- Search query tracking
- Performance metrics
- Error logging
- Cache hit/miss rates
- Database query performance

## Conclusion

This implementation provides a robust, efficient, and scalable symbol search system that enhances the user experience while reducing external dependencies. The comprehensive metadata model supports advanced search features and provides a solid foundation for future enhancements.