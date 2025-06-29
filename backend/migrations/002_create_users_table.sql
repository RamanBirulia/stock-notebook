-- Create users table for authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    last_login TEXT,
    created_at TEXT NOT NULL
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);
