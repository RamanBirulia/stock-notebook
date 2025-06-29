# Stock Symbol Autocomplete API

This document describes the new stock symbol autocomplete functionality added to the Stock Tracker Backend API.

## Overview

The autocomplete functionality allows the frontend to provide real-time stock symbol suggestions as users type in the "Add Purchase" form. This improves user experience by:

- Providing instant symbol suggestions
- Showing company names alongside symbols
- Filtering by exchange and asset type
- Reducing input errors

## API Integration

The system uses Alpha Vantage's `LISTING_STATUS` function to fetch all available stock symbols and ETFs. This data is cached for 24 hours to minimize API calls and improve performance.

### Alpha Vantage API Details

- **Function**: `LISTING_STATUS`
- **URL**: `https://www.alphavantage.co/query?function=LISTING_STATUS&apikey={API_KEY}`
- **Response Format**: CSV
- **Data Included**: Active stocks and ETFs from major US exchanges

## New API Endpoints

### 1. Search Symbols

**Endpoint**: `GET /api/symbols/search`

**Query Parameters**:
- `q` (required): Search query string
- `limit` (optional): Maximum number of results (default: 10, max: 50)

**Example Request**:
```
GET /api/symbols/search?q=AAPL&limit=5
```

**Example Response**:
```json
[
  {
    "symbol": "AAPL",
    "name": "Apple Inc",
    "exchange": "NASDAQ",
    "asset_type": "Stock"
  },
  {
    "symbol": "AAPLB",
    "name": "Apple Inc - Class B",
    "exchange": "NASDAQ",
    "asset_type": "Stock"
  }
]
```

**Search Logic**:
- Exact symbol matches are prioritized
- Partial symbol matches (prefix matching)
- Company name contains search term
- Results are sorted alphabetically within priority groups

### 2. Cache Management (Admin Endpoints)

These endpoints are available for cache management and monitoring:

#### Get Cache Statistics
**Endpoint**: `GET /api/admin/cache/stats`

**Response**:
```json
{
  "price_cache_entries": 15,
  "chart_cache_entries": 8,
  "symbol_cache_entries": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Clear All Cache
**Endpoint**: `POST /api/admin/cache/clear`

**Response**:
```json
{
  "message": "All cache cleared successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Cleanup Expired Cache
**Endpoint**: `POST /api/admin/cache/cleanup`

**Response**:
```json
{
  "message": "Expired cache entries cleaned up",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Data Models

### StockSymbol
```rust
pub struct StockSymbol {
    pub symbol: String,        // e.g., "AAPL"
    pub name: String,          // e.g., "Apple Inc"
    pub exchange: String,      // e.g., "NASDAQ"
    pub asset_type: String,    // "Stock" or "ETF"
    pub ipo_date: String,      // e.g., "1980-12-12"
    pub status: String,        // "Active"
}
```

### SymbolSuggestion
```rust
pub struct SymbolSuggestion {
    pub symbol: String,        // e.g., "AAPL"
    pub name: String,          // e.g., "Apple Inc"
    pub exchange: String,      // e.g., "NASDAQ"
    pub asset_type: String,    // "Stock" or "ETF"
}
```

## Caching Strategy

### Cache Configuration
- **Cache Duration**: 24 hours for symbol data
- **Cache Key**: `"all_symbols"` for the complete symbol list
- **Thread Safety**: Uses `Arc<Mutex<HashMap>>` for concurrent access

### Cache Behavior
1. **First Request**: Fetches all symbols from Alpha Vantage API (~10,000+ symbols)
2. **Subsequent Requests**: Served from cache until expiration
3. **Cache Miss**: Automatically refetches and updates cache
4. **Search Performance**: In-memory filtering provides sub-millisecond response times

## Frontend Integration

### React/TypeScript Example

```typescript
interface SymbolSuggestion {
  symbol: string;
  name: string;
  exchange: string;
  asset_type: string;
}

const searchSymbols = async (query: string): Promise<SymbolSuggestion[]> => {
  if (query.trim().length < 1) return [];
  
  const response = await fetch(
    `/api/symbols/search?q=${encodeURIComponent(query)}&limit=10`,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    }
  );
  
  if (!response.ok) throw new Error('Failed to search symbols');
  return response.json();
};

// Usage in autocomplete component
const [suggestions, setSuggestions] = useState<SymbolSuggestion[]>([]);
const [query, setQuery] = useState('');

const handleInputChange = async (value: string) => {
  setQuery(value);
  try {
    const results = await searchSymbols(value);
    setSuggestions(results);
  } catch (error) {
    console.error('Symbol search failed:', error);
    setSuggestions([]);
  }
};
```

### Autocomplete Component Example

```jsx
<input
  type="text"
  value={query}
  onChange={(e) => handleInputChange(e.target.value)}
  placeholder="Enter stock symbol (e.g., AAPL)"
/>

{suggestions.length > 0 && (
  <div className="suggestions-dropdown">
    {suggestions.map((suggestion) => (
      <div
        key={suggestion.symbol}
        className="suggestion-item"
        onClick={() => selectSymbol(suggestion.symbol)}
      >
        <strong>{suggestion.symbol}</strong> - {suggestion.name}
        <small>({suggestion.exchange})</small>
      </div>
    ))}
  </div>
)}
```

## Performance Considerations

### API Rate Limits
- Alpha Vantage free tier: 25 requests/day
- Symbol data fetch counts as 1 request per day
- 24-hour caching minimizes API usage

### Memory Usage
- Complete symbol dataset: ~2-3 MB in memory
- Acceptable for typical server configurations
- Consider implementing LRU cache for very memory-constrained environments

### Response Times
- **Cache Hit**: <1ms (in-memory search)
- **Cache Miss**: 2-5 seconds (initial API fetch)
- **Search Operation**: <10ms (string matching and sorting)

## Error Handling

### Common Error Scenarios

1. **API Rate Limit Exceeded**
   ```json
   {
     "error": "API rate limit reached for symbols"
   }
   ```

2. **Demo API Key Limitation**
   ```json
   {
     "error": "Demo API key limitation for symbols"
   }
   ```

3. **Network Failure**
   ```json
   {
     "error": "Request failed: connection timeout"
   }
   ```

4. **Empty Query**
   - Returns empty array `[]`
   - No error thrown for better UX

## Security Considerations

### Authentication
- All symbol search requests require valid JWT token
- Admin endpoints skip authentication in development
- **Production Note**: Implement proper admin authentication for cache management endpoints

### Input Validation
- Query parameter sanitization
- Limit parameter bounds checking (max 50 results)
- No SQL injection risk (in-memory search only)

## Monitoring and Debugging

### Logging
The system logs important events:
- Cache hits/misses
- API fetch operations
- Cache update operations
- Error conditions

### Debug Information
- Use `/api/admin/cache/stats` to monitor cache status
- Check logs for API rate limit issues
- Monitor response times for performance degradation

## Environment Variables

Required environment variables:
```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

Optional (will use defaults):
```bash
DATABASE_URL=sqlite:stocks.db
JWT_SECRET=your_jwt_secret
```

## Testing

### Manual Testing
Run the example test:
```bash
cargo run --example test_symbols
```

### Integration Testing
```bash
# Start the server
cargo run

# Test the endpoint
curl "http://localhost:8080/api/symbols/search?q=AAPL&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Future Enhancements

1. **International Markets**: Support for non-US exchanges
2. **Real-time Updates**: WebSocket-based symbol updates
3. **Personalization**: User-specific symbol suggestions based on portfolio
4. **Advanced Filtering**: Filter by market cap, sector, or other criteria
5. **Fuzzy Search**: Handle typos and approximate matches
6. **Search Analytics**: Track popular searches for optimization

## Troubleshooting

### Common Issues

1. **No Results Returned**
   - Check if cache is populated: `GET /api/admin/cache/stats`
   - Verify API key is valid
   - Check network connectivity

2. **Slow Initial Response**
   - First request after server start fetches all symbols
   - Consider pre-warming cache on server startup

3. **Outdated Symbol Data**
   - Clear cache: `POST /api/admin/cache/clear`
   - Cache automatically expires after 24 hours

4. **Memory Issues**
   - Monitor server memory usage
   - Consider implementing cache size limits

For additional support, check the application logs and ensure your Alpha Vantage API key has sufficient quota remaining.