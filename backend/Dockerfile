# Multi-stage production Dockerfile for Stock Notebook Backend
FROM rust:1.75-slim-bullseye AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy dependency files first for better caching
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this will be cached if Cargo.toml doesn't change)
RUN cargo build --release && rm -rf src

# Copy source code and migrations
COPY src ./src
COPY migrations ./migrations

# Build the application in release mode with SQLx online mode
# Note: This requires a database connection during build in CI/CD
# For offline builds, regenerate .sqlx with: cargo sqlx prepare
RUN cargo build --release

# Production runtime stage
FROM debian:bullseye-slim AS production

# Install runtime dependencies and security updates
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    curl \
    tini \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

# Set working directory
WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/stock-tracker-backend ./stock-tracker-backend

# Copy migrations directory
COPY --from=builder /app/migrations ./migrations

# Set proper ownership and permissions
RUN chown -R app:app /app && \
    chmod +x /app/stock-tracker-backend

# Switch to non-root user
USER app

# Expose the application port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]

# Start the application
CMD ["./stock-tracker-backend"]
