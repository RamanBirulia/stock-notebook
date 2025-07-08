-- Seed data for Stock Notebook application
-- This migration adds an admin user and fake stock data for testing

-- Insert admin user with bcrypt hash for password "admin"
-- Password hash generated with cost factor 10: $2a$10$N.zmdr9k7uOIW25A5oGzh.hOdZnKj0YXNzJKWlYwDHjVwSdcgwsRW
INSERT INTO users (id, username, password_hash, last_login, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin',
    '$2a$10$N.zmdr9k7uOIW25A5oGzh.hOdZnKj0YXNzJKWlYwDHjVwSdcgwsRW',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Function to generate fake stock data
CREATE OR REPLACE FUNCTION generate_stock_data(
    p_symbol VARCHAR(10),
    p_start_price DECIMAL(10, 2),
    p_start_date DATE,
    p_end_date DATE
) RETURNS VOID AS $$
DECLARE
    current_date DATE;
    current_price DECIMAL(10, 2);
    price_change DECIMAL(10, 2);
    volume_base BIGINT;
    current_volume BIGINT;
    day_of_week INTEGER;
BEGIN
    current_date := p_start_date;
    current_price := p_start_price;

    -- Set base volume based on stock
    volume_base := CASE
        WHEN p_symbol = 'GOOGL' THEN 1500000
        WHEN p_symbol = 'AAPL' THEN 75000000
        WHEN p_symbol = 'EPAM' THEN 800000
        ELSE 1000000
    END;

    WHILE current_date <= p_end_date LOOP
        -- Get day of week (1=Monday, 7=Sunday)
        day_of_week := EXTRACT(DOW FROM current_date);

        -- Only generate data for weekdays (Monday=1 to Friday=5)
        IF day_of_week BETWEEN 1 AND 5 THEN
            -- Generate price change (-5% to +5%)
            price_change := current_price * (random() * 0.1 - 0.05);
            current_price := current_price + price_change;

            -- Ensure price doesn't go below $1
            IF current_price < 1.00 THEN
                current_price := 1.00;
            END IF;

            -- Generate volume (base ± 50%)
            current_volume := volume_base + (random() * volume_base - volume_base/2)::BIGINT;

            -- Insert stock data
            INSERT INTO stock_data (symbol, price, volume, data_date, created_at, updated_at)
            VALUES (
                p_symbol,
                ROUND(current_price, 2),
                current_volume,
                current_date,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
        END IF;

        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate 2 years of stock data
DO $$
DECLARE
    start_date DATE;
    end_date DATE;
BEGIN
    start_date := CURRENT_DATE - INTERVAL '2 years';
    end_date := CURRENT_DATE;

    -- Generate data for GOOGL (starting at $100)
    PERFORM generate_stock_data('GOOGL', 100.00, start_date, end_date);

    -- Generate data for AAPL (starting at $150)
    PERFORM generate_stock_data('AAPL', 150.00, start_date, end_date);

    -- Generate data for EPAM (starting at $200)
    PERFORM generate_stock_data('EPAM', 200.00, start_date, end_date);
END;
$$;

-- Create sample purchases for admin user
DO $$
DECLARE
    admin_user_id UUID;
    purchase_date DATE;
    googl_price DECIMAL(10, 2);
    aapl_price DECIMAL(10, 2);
    epam_price DECIMAL(10, 2);
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';

    -- Purchase 1: GOOGL 6 months ago
    purchase_date := CURRENT_DATE - INTERVAL '6 months';
    SELECT price INTO googl_price FROM stock_data
    WHERE symbol = 'GOOGL' AND data_date <= purchase_date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'GOOGL', 50, googl_price, 9.99, purchase_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Purchase 2: AAPL 1 year ago
    purchase_date := CURRENT_DATE - INTERVAL '1 year';
    SELECT price INTO aapl_price FROM stock_data
    WHERE symbol = 'AAPL' AND data_date <= purchase_date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'AAPL', 100, aapl_price, 9.99, purchase_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Purchase 3: EPAM 3 months ago
    purchase_date := CURRENT_DATE - INTERVAL '3 months';
    SELECT price INTO epam_price FROM stock_data
    WHERE symbol = 'EPAM' AND data_date <= purchase_date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'EPAM', 25, epam_price, 9.99, purchase_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Purchase 4: Additional GOOGL purchase 2 months ago
    purchase_date := CURRENT_DATE - INTERVAL '2 months';
    SELECT price INTO googl_price FROM stock_data
    WHERE symbol = 'GOOGL' AND data_date <= purchase_date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'GOOGL', 30, googl_price, 9.99, purchase_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

    -- Purchase 5: Additional AAPL purchase 1 month ago
    purchase_date := CURRENT_DATE - INTERVAL '1 month';
    SELECT price INTO aapl_price FROM stock_data
    WHERE symbol = 'AAPL' AND data_date <= purchase_date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'AAPL', 75, aapl_price, 9.99, purchase_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
END;
$$;

-- Clean up the temporary function
DROP FUNCTION generate_stock_data(VARCHAR(10), DECIMAL(10, 2), DATE, DATE);

-- Update statistics
ANALYZE users;
ANALYZE purchases;
ANALYZE stock_data;
