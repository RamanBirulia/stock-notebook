CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_per_share REAL NOT NULL,
    commission REAL NOT NULL DEFAULT 0.0,
    purchase_date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_symbol ON purchases(symbol);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);