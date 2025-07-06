-- Add stock_data table for caching historical stock prices
CREATE TABLE IF NOT EXISTS stock_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL,
    price DECIMAL(12,4) NOT NULL,
    volume BIGINT,
    data_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index to prevent duplicate entries for same symbol and date
CREATE UNIQUE INDEX IF NOT EXISTS idx_stock_data_symbol_date ON stock_data(symbol, data_date);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_data_symbol ON stock_data(symbol);
CREATE INDEX IF NOT EXISTS idx_stock_data_date ON stock_data(data_date);
CREATE INDEX IF NOT EXISTS idx_stock_data_created_at ON stock_data(created_at);

-- Create trigger for stock_data table to update updated_at timestamp
CREATE TRIGGER update_stock_data_updated_at
    BEFORE UPDATE ON stock_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
