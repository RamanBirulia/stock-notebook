-- Seed data for Stock Notebook application
-- This migration adds an admin user and fake stock data for testing

-- Insert admin user with bcrypt hash for password "admin"
-- Password hash generated with cost factor 10: $2a$10$N.zmdr9k7uOIW25A5oGzh.hOdZnKj0YXNzJKWlYwDHjVwSdcgwsRW
INSERT INTO users (id, username, password_hash, last_login, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin',
    '$2a$10$N.zmdr9k7uOIW25A5oGzh.hOdZnKj0YXNzJKWlYwDHjVwSdcgwsRW',
    NOW(),
    NOW(),
    NOW()
);

-- Generate stock data for GOOGL (2 years)
INSERT INTO stock_data (symbol, price, volume, data_date, created_at, updated_at)
SELECT
    'GOOGL',
    100.00 + (random() * 100 - 50) + (date_part('day', generate_series)::numeric / 10),
    1500000 + (random() * 1000000)::bigint,
    generate_series::date,
    NOW(),
    NOW()
FROM generate_series(
    NOW() - INTERVAL '2 years',
    NOW(),
    INTERVAL '1 day'
) AS generate_series
WHERE EXTRACT(DOW FROM generate_series) BETWEEN 1 AND 5;

-- Generate stock data for AAPL (2 years)
INSERT INTO stock_data (symbol, price, volume, data_date, created_at, updated_at)
SELECT
    'AAPL',
    150.00 + (random() * 80 - 40) + (date_part('day', generate_series)::numeric / 15),
    75000000 + (random() * 50000000)::bigint,
    generate_series::date,
    NOW(),
    NOW()
FROM generate_series(
    NOW() - INTERVAL '2 years',
    NOW(),
    INTERVAL '1 day'
) AS generate_series
WHERE EXTRACT(DOW FROM generate_series) BETWEEN 1 AND 5;

-- Generate stock data for EPAM (2 years)
INSERT INTO stock_data (symbol, price, volume, data_date, created_at, updated_at)
SELECT
    'EPAM',
    200.00 + (random() * 120 - 60) + (date_part('day', generate_series)::numeric / 12),
    800000 + (random() * 600000)::bigint,
    generate_series::date,
    NOW(),
    NOW()
FROM generate_series(
    NOW() - INTERVAL '2 years',
    NOW(),
    INTERVAL '1 day'
) AS generate_series
WHERE EXTRACT(DOW FROM generate_series) BETWEEN 1 AND 5;

-- Create sample purchases for admin user
DO $$
DECLARE
    admin_user_id UUID;
    googl_price DECIMAL(10, 2);
    aapl_price DECIMAL(10, 2);
    epam_price DECIMAL(10, 2);
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin';

    -- Purchase 1: GOOGL 6 months ago
    SELECT price INTO googl_price FROM stock_data
    WHERE symbol = 'GOOGL' AND data_date <= (NOW() - INTERVAL '6 months')::date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'GOOGL', 50, googl_price, 9.99, (NOW() - INTERVAL '6 months')::date, NOW(), NOW());

    -- Purchase 2: AAPL 1 year ago
    SELECT price INTO aapl_price FROM stock_data
    WHERE symbol = 'AAPL' AND data_date <= (NOW() - INTERVAL '1 year')::date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'AAPL', 100, aapl_price, 9.99, (NOW() - INTERVAL '1 year')::date, NOW(), NOW());

    -- Purchase 3: EPAM 3 months ago
    SELECT price INTO epam_price FROM stock_data
    WHERE symbol = 'EPAM' AND data_date <= (NOW() - INTERVAL '3 months')::date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'EPAM', 25, epam_price, 9.99, (NOW() - INTERVAL '3 months')::date, NOW(), NOW());

    -- Purchase 4: Additional GOOGL purchase 2 months ago
    SELECT price INTO googl_price FROM stock_data
    WHERE symbol = 'GOOGL' AND data_date <= (NOW() - INTERVAL '2 months')::date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'GOOGL', 30, googl_price, 9.99, (NOW() - INTERVAL '2 months')::date, NOW(), NOW());

    -- Purchase 5: Additional AAPL purchase 1 month ago
    SELECT price INTO aapl_price FROM stock_data
    WHERE symbol = 'AAPL' AND data_date <= (NOW() - INTERVAL '1 month')::date
    ORDER BY data_date DESC LIMIT 1;

    INSERT INTO purchases (user_id, symbol, quantity, price_per_share, commission, purchase_date, created_at, updated_at)
    VALUES (admin_user_id, 'AAPL', 75, aapl_price, 9.99, (NOW() - INTERVAL '1 month')::date, NOW(), NOW());
END;
$$;

-- Update statistics
ANALYZE users;
ANALYZE purchases;
ANALYZE stock_data;
