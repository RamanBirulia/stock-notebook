# Stock Notebook Database Seeder

A comprehensive database seeding tool for populating the Stock Notebook backend with realistic fake stock data for testing and development.

## 🎯 Purpose

This seeder allows you to test your frontend application without making actual API calls to Yahoo Finance. It generates realistic stock price data with proper volatility patterns and trading volumes for popular stocks.

## 🚀 Quick Start

### Prerequisites
- PostgreSQL running (via Docker or locally)
- Rust environment set up
- Database migrations applied

### Easy Method (Shell Script)
```bash
# Start PostgreSQL
docker compose -f docker-compose.development.yml up -d postgres

# Run seeder
cd backend
./seed.sh seed

# Clear data when done
./seed.sh clear
```

### Manual Method (Cargo)
```bash
cd backend

# Seed database
cargo run --bin seeder seed

# Clear database
cargo run --bin seeder clear

# Show help
cargo run --bin seeder help
```

## 📊 Generated Data

The seeder generates realistic stock data for three major companies:

### AAPL (Apple Inc.)
- **Base Price**: ~$150.00
- **Volatility**: 2% daily
- **Volume**: 25M - 75M shares
- **Pattern**: Realistic price movements with mean reversion

### MSFT (Microsoft Corporation)
- **Base Price**: ~$300.00
- **Volatility**: 1.5% daily
- **Volume**: 15M - 45M shares
- **Pattern**: Slightly more stable than AAPL

### GOOGL (Alphabet Inc.)
- **Base Price**: ~$2500.00
- **Volatility**: 2.5% daily
- **Volume**: 12.5M - 37.5M shares
- **Pattern**: Higher volatility, typical of growth stocks

## 📈 Data Characteristics

### Time Period
- **Duration**: Last 365 days from current date
- **Frequency**: Daily (weekdays only)
- **Records**: ~261 trading days per stock

### Price Generation
- **Algorithm**: Random walk with mean reversion
- **Volatility**: Configurable per stock
- **Bounds**: Minimum price of $1.00
- **Realism**: Prices tend to revert to base price over time

### Volume Generation
- **Range**: 50% to 200% of base volume
- **Randomization**: Realistic daily variation
- **Correlation**: Higher volumes on days with larger price movements

## 🔧 Usage Examples

### Basic Seeding
```bash
# Using shell script
./seed.sh seed

# Using cargo directly
cargo run --bin seeder seed
```

### Custom Database URL
```bash
DATABASE_URL=postgresql://myuser:mypass@localhost/mydb ./seed.sh seed
```

### Clear All Data
```bash
./seed.sh clear
```

### Help Information
```bash
./seed.sh help
cargo run --bin seeder help
```

## 🏗️ Technical Implementation

### Database Schema
The seeder populates the `stock_data` table:
```sql
CREATE TABLE stock_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    volume BIGINT,
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### Data Generation Process
1. **Configuration**: Define stock parameters (symbol, base price, volatility)
2. **Date Range**: Generate dates for last 365 days (weekdays only)
3. **Price Calculation**: Use random walk with mean reversion
4. **Volume Generation**: Random volume based on stock-specific ranges
5. **Database Insert**: Bulk insert with upsert logic

### Price Movement Algorithm
```rust
// Random daily change
let random_change = rng.gen_range(-1.0..1.0);
let price_change_percent = random_change * stock.volatility;

// Mean reversion component
let distance_from_base = (current_price - base_price) / base_price;
let mean_reversion = -distance_from_base * 0.1;

// Total change
let total_change = price_change_percent + mean_reversion;
```

## 🧪 Testing Your Frontend

After seeding, you can test these scenarios:

### Portfolio Dashboard
1. Create purchases for AAPL, MSFT, GOOGL
2. View portfolio dashboard
3. See realistic current prices and profit/loss calculations

### Stock Details
1. View individual stock details
2. See purchase history with current valuations
3. All data comes from your local database

### Chart Data
1. Request chart data for different periods (1D, 1W, 1M, etc.)
2. See historical price movements
3. Verify data is served from database, not Yahoo Finance

## 🔍 Verification

### Check Generated Data
```bash
# Connect to database
psql -U stock_user -d stock_notebook -h localhost

# Check data
SELECT symbol, COUNT(*) as records, MIN(data_date) as first_date, MAX(data_date) as last_date
FROM stock_data 
GROUP BY symbol 
ORDER BY symbol;

# Sample prices
SELECT symbol, data_date, price, volume 
FROM stock_data 
WHERE data_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY symbol, data_date;
```

### Test API Endpoints
```bash
# Get current price (should use database)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/stock/AAPL

# Get chart data (should use database)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/stock/AAPL/chart?period=1M
```

## 📝 Configuration

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- Default: `postgresql://stock_user:stock_password@localhost:5432/stock_notebook`

### Stock Configuration
Modify `StockConfig` in the seeder code to:
- Add new stocks
- Adjust base prices
- Change volatility levels
- Modify volume ranges

### Time Range
Adjust `days_to_generate` variable to change the historical period:
```rust
let days_to_generate = 365; // Change this value
```

## 🚨 Important Notes

### Data Isolation
- Only populates `stock_data` table
- Does not create users or purchases
- Safe to run multiple times (upsert logic)

### Performance
- Uses bulk insert operations
- Optimized for speed
- Progress indicators for long operations

### Data Quality
- Realistic price movements
- Proper weekend exclusions
- Volume correlation with price changes
- Mean reversion prevents unrealistic prices

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
docker ps | grep postgres

# Check connection
pg_isready -h localhost -p 5432 -U stock_user

# Start PostgreSQL
docker compose -f docker-compose.development.yml up -d postgres
```

### Build Issues
```bash
# Clean build
cargo clean
cargo build --bin seeder

# Check dependencies
cargo check
```

### Data Issues
```bash
# Clear and reseed
./seed.sh clear
./seed.sh seed

# Check data integrity
psql -U stock_user -d stock_notebook -h localhost -c "SELECT COUNT(*) FROM stock_data;"
```

## 🔄 Maintenance

### Regular Tasks
1. **Update base prices**: Adjust to current market levels
2. **Add new stocks**: Include additional popular stocks
3. **Refresh data**: Clear and reseed periodically
4. **Monitor performance**: Check seeding speed and database size

### Data Cleanup
```bash
# Remove old data (keeps last 90 days)
cargo run --bin seeder clear

# Full database cleanup
./seed.sh clear
```

## 📚 Related Documentation

- [README_REFACTORING.md](README_REFACTORING.md) - Architecture details
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation overview
- [Database Migrations](migrations/) - Schema definitions

## 🤝 Contributing

To extend the seeder:
1. Add new stocks to `StockConfig` array
2. Adjust volatility and volume parameters
3. Test with different time periods
4. Update documentation

## 📄 License

Same license as the main Stock Notebook project.

---

**Happy testing! 🚀**

The seeder provides a realistic testing environment for your Stock Notebook frontend without external API dependencies.