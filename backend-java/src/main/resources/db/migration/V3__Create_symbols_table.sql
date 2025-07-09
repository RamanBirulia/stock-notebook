-- Create symbols table for stock metadata and search functionality
-- This table stores static information about stocks that doesn't change frequently

CREATE TABLE symbols (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(500) NOT NULL,
    description TEXT,
    sector VARCHAR(100),
    industry VARCHAR(100),
    exchange VARCHAR(50),
    market_cap_category VARCHAR(20), -- LARGE, MID, SMALL
    country VARCHAR(50) DEFAULT 'US',
    currency VARCHAR(10) DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient searching
CREATE INDEX idx_symbols_symbol ON symbols(symbol);
CREATE INDEX idx_symbols_company_name ON symbols(company_name);
CREATE INDEX idx_symbols_company_name_lower ON symbols(LOWER(company_name));
CREATE INDEX idx_symbols_sector ON symbols(sector);
CREATE INDEX idx_symbols_industry ON symbols(industry);
CREATE INDEX idx_symbols_market_cap ON symbols(market_cap_category);
CREATE INDEX idx_symbols_is_active ON symbols(is_active);

-- Full-text search index for company name and description
CREATE INDEX idx_symbols_search ON symbols USING gin(to_tsvector('english', company_name || ' ' || COALESCE(description, '')));

-- Trigger for updating updated_at timestamp
CREATE TRIGGER update_symbols_updated_at
    BEFORE UPDATE ON symbols
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some constraints
ALTER TABLE symbols ADD CONSTRAINT chk_market_cap_category
    CHECK (market_cap_category IN ('LARGE', 'MID', 'SMALL', 'MICRO', 'NANO'));

ALTER TABLE symbols ADD CONSTRAINT chk_symbol_format
    CHECK (symbol ~ '^[A-Z0-9.-]+$');
