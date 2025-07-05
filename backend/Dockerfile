FROM rust:1.88-slim-bookworm AS base

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

ENV CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse
ENV CARGO_PROFILE_RELEASE_LTO=true
ENV CARGO_PROFILE_RELEASE_CODEGEN_UNITS=1

WORKDIR /app

# Pre-build dependencies for better caching
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && echo "" > src/lib.rs
RUN cargo build --release && rm -rf src

# Development builder stage
FROM base AS development

ENV SQLX_OFFLINE=true

COPY src ./src
COPY migrations ./migrations
COPY .sqlx* ./.sqlx/

RUN cargo build --release

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Make binary executable
RUN chmod +x ./target/release/stock-tracker-backend

EXPOSE 8080
CMD ["./target/release/stock-tracker-backend"]

# Production builder stage
FROM base AS production-builder

ENV SQLX_OFFLINE=true

COPY src ./src
COPY migrations ./migrations
COPY .sqlx* ./.sqlx/

RUN cargo build --release

# Production runtime stage
FROM debian:bookworm-slim AS production

# Install runtime dependencies and security updates
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    curl \
    tini \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for security
RUN groupadd -r app && useradd -r -g app -d /app -s /sbin/nologin app

WORKDIR /app

# Copy the binary from production-builder stage
COPY --from=production-builder /app/target/release/stock-tracker-backend ./stock-tracker-backend
COPY --from=production-builder /app/migrations ./migrations

# Set proper ownership and permissions
RUN chown -R app:app /app && \
    chmod +x /app/stock-tracker-backend

# Switch to non-root user
USER app

EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["./stock-tracker-backend"]
