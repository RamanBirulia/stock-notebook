-- PostgreSQL initialization script for stock-notebook database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (handled by POSTGRES_DB env var)
-- Create the user if it doesn't exist (handled by POSTGRES_USER env var)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Set timezone
SET timezone = 'UTC';

-- Create custom types if needed
DO $$
BEGIN
    -- Add any custom types here if needed in the future
    NULL;
END $$;

-- Grant necessary permissions to the stock_user
GRANT ALL PRIVILEGES ON DATABASE stock_notebook TO stock_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO stock_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stock_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stock_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO stock_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO stock_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO stock_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO stock_user;

-- Log initialization completion
DO $$
BEGIN
    RAISE NOTICE 'Stock Notebook PostgreSQL database initialized successfully';
END $$;
