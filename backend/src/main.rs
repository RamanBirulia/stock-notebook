use axum::extract::Request;
use axum::http::header::AUTHORIZATION;
use axum::{
    extract::{Path, Query, State},
    http::{HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::Json,
    routing::{get, post},
    Router,
};
use bcrypt::{hash, verify, DEFAULT_COST};
use chrono::Utc;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqlitePool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing::{info, warn};
use uuid;

use std::str::FromStr;

pub mod models;
pub mod stock_api;

use models::*;
use stock_api::StockApiClient;

#[derive(Clone)]
struct AppState {
    db: SqlitePool,
    stock_client: Arc<StockApiClient>,
    jwt_secret: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Claims {
    user_id: String,
    username: String,
    exp: usize,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing with environment variable support
    let log_level = std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string());
    std::env::set_var("RUST_LOG", log_level);

    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    dotenvy::dotenv().ok();

    let database_url =
        std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite:stocks.db".to_string());

    let pool = SqlitePool::connect(&database_url).await?;

    // Run migrations
    sqlx::migrate!("./migrations").run(&pool).await?;

    let stock_client = Arc::new(StockApiClient::new());
    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let app_state = AppState {
        db: pool,
        stock_client,
        jwt_secret,
    };

    // Configure CORS for both development and production
    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

    let cors = CorsLayer::new()
        .allow_origin(frontend_url.parse::<HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(Any)
        .allow_credentials(true);

    let app = Router::new()
        .route("/health", get(health_check))
        .route("/api/auth/login", post(login))
        .route("/api/auth/register", post(register))
        .route("/api/purchases", post(create_purchase))
        .route("/api/purchases", get(get_purchases))
        .route("/api/dashboard", get(get_dashboard))
        .route("/api/stock/:symbol", get(get_stock_details))
        .route("/api/stock/:symbol/chart", get(get_stock_chart))
        .route("/api/symbols/search", get(search_symbols))
        .route("/api/admin/cache/stats", get(get_cache_stats))
        .route("/api/admin/cache/clear", post(clear_cache))
        .route("/api/admin/cache/cleanup", post(cleanup_cache))
        .layer(middleware::from_fn_with_state(
            app_state.clone(),
            auth_middleware,
        ))
        .layer(cors)
        .with_state(app_state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&bind_address).await?;
    info!("Server running on http://{}", bind_address);

    axum::serve(listener, app).await?;

    Ok(())
}

async fn auth_middleware(
    State(state): State<AppState>,
    mut req: Request,
    next: Next,
) -> Result<axum::response::Response, StatusCode> {
    // Skip auth for login, register, health, and admin endpoints
    let path = req.uri().path();
    if path.starts_with("/api/auth/") || path == "/health" || path.starts_with("/api/admin/") {
        return Ok(next.run(req).await);
    }

    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = if let Some(auth_header) = auth_header {
        if auth_header.starts_with("Bearer ") {
            auth_header.trim_start_matches("Bearer ")
        } else {
            return Err(StatusCode::UNAUTHORIZED);
        }
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    let claims = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.jwt_secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(data) => data.claims,
        Err(_) => return Err(StatusCode::UNAUTHORIZED),
    };

    // Add user info to request extensions
    req.extensions_mut().insert(claims);
    Ok(next.run(req).await)
}

async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "message": "Stock tracker backend is running",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(login_req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let user_row = sqlx::query!(
        "SELECT id, username, password_hash FROM users WHERE username = ?",
        login_req.username
    )
    .fetch_optional(&state.db)
    .await?;

    let user = match user_row {
        Some(row) => row,
        None => return Err(AppError::Unauthorized("Invalid credentials".to_string())),
    };

    let is_valid = verify(&login_req.password, &user.password_hash)
        .map_err(|_| AppError::Internal("Password verification failed".to_string()))?;

    if !is_valid {
        return Err(AppError::Unauthorized("Invalid credentials".to_string()));
    }

    // Update last login
    let now = Utc::now().to_rfc3339();
    sqlx::query!("UPDATE users SET last_login = ? WHERE id = ?", now, user.id)
        .execute(&state.db)
        .await?;

    // Generate JWT token
    let claims = Claims {
        user_id: user.id.clone().unwrap_or_default(),
        username: user.username.clone(),
        exp: (Utc::now().timestamp() + 24 * 60 * 60) as usize, // 24 hours
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::Internal("Token generation failed".to_string()))?;

    Ok(Json(AuthResponse {
        user: UserInfo {
            id: user.id.unwrap_or_default(),
            username: user.username,
            last_login: Some(now),
        },
        token,
    }))
}

async fn register(
    State(state): State<AppState>,
    Json(register_req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    // Check if user already exists
    let existing_user = sqlx::query!(
        "SELECT id FROM users WHERE username = ?",
        register_req.username
    )
    .fetch_optional(&state.db)
    .await?;

    if existing_user.is_some() {
        return Err(AppError::Conflict("Username already exists".to_string()));
    }

    // Hash password
    let password_hash = hash(register_req.password, DEFAULT_COST)
        .map_err(|_| AppError::Internal("Password hashing failed".to_string()))?;

    let user_id = uuid::Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // Create user
    sqlx::query!(
        "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
        user_id,
        register_req.username,
        password_hash,
        now
    )
    .execute(&state.db)
    .await?;

    // Generate JWT token
    let claims = Claims {
        user_id: user_id.clone(),
        username: register_req.username.clone(),
        exp: (Utc::now().timestamp() + 24 * 60 * 60) as usize, // 24 hours
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(state.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::Internal("Token generation failed".to_string()))?;

    Ok(Json(AuthResponse {
        user: UserInfo {
            id: user_id,
            username: register_req.username,
            last_login: None,
        },
        token,
    }))
}

async fn create_purchase(
    State(state): State<AppState>,
    Json(purchase): Json<CreatePurchaseRequest>,
) -> Result<Json<Purchase>, AppError> {
    let purchase_id = uuid::Uuid::new_v4().to_string();

    let price_str = purchase.price_per_share.to_string();
    let commission_str = purchase.commission.to_string();

    let row = sqlx::query!(
        r#"
        INSERT INTO purchases (id, symbol, quantity, price_per_share, commission, purchase_date)
        VALUES (?, ?, ?, ?, ?, ?)
        RETURNING id, symbol, quantity, price_per_share, commission, purchase_date
        "#,
        purchase_id,
        purchase.symbol,
        purchase.quantity,
        price_str,
        commission_str,
        purchase.purchase_date
    )
    .fetch_one(&state.db)
    .await?;

    let purchase = Purchase {
        id: row.id.unwrap_or_default(),
        symbol: row.symbol,
        quantity: row.quantity,
        price_per_share: rust_decimal::Decimal::from_str(&row.price_per_share.to_string()).unwrap(),
        commission: rust_decimal::Decimal::from_str(&row.commission.to_string()).unwrap(),
        purchase_date: row.purchase_date,
    };

    Ok(Json(purchase))
}

async fn get_purchases(State(state): State<AppState>) -> Result<Json<Vec<Purchase>>, AppError> {
    let rows = sqlx::query!(
        "SELECT id, symbol, quantity, price_per_share, commission, purchase_date FROM purchases ORDER BY purchase_date DESC"
    )
    .fetch_all(&state.db)
    .await?;

    let purchases: Vec<Purchase> = rows
        .into_iter()
        .map(|row| Purchase {
            id: row.id.unwrap_or_default(),
            symbol: row.symbol,
            quantity: row.quantity,
            price_per_share: rust_decimal::Decimal::from_str(&row.price_per_share.to_string())
                .unwrap(),
            commission: rust_decimal::Decimal::from_str(&row.commission.to_string()).unwrap(),
            purchase_date: row.purchase_date,
        })
        .collect();

    Ok(Json(purchases))
}

async fn get_dashboard(State(state): State<AppState>) -> Result<Json<DashboardData>, AppError> {
    let purchases = sqlx::query!(
        "SELECT symbol, SUM(quantity) as total_quantity, AVG(price_per_share) as avg_price, SUM(quantity * price_per_share + commission) as total_spent FROM purchases GROUP BY symbol"
    )
    .fetch_all(&state.db)
    .await?;

    let mut total_spent = rust_decimal::Decimal::ZERO;
    let mut current_value = rust_decimal::Decimal::ZERO;
    let mut stocks = Vec::new();

    for row in purchases {
        let symbol = row.symbol;
        let quantity = rust_decimal::Decimal::new(row.total_quantity.into(), 0);
        let spent = rust_decimal::Decimal::from_str(&row.total_spent.to_string()).unwrap();

        total_spent += spent;

        // Get current stock price from Alpha Vantage
        let current_price = match state.stock_client.get_current_price(&symbol).await {
            Ok(price) => {
                info!(
                    "Got current price from Alpha Vantage for {}: ${}",
                    symbol, price
                );
                price
            }
            Err(e) => {
                warn!(
                    "Alpha Vantage failed for current price of {}: {}",
                    symbol, e
                );
                rust_decimal::Decimal::ZERO
            }
        };

        let stock_value = quantity * current_price;
        current_value += stock_value;

        stocks.push(StockHolding {
            symbol: symbol.clone(),
            quantity,
            current_price,
            total_value: stock_value,
            total_spent: spent,
        });
    }

    let profit_loss = current_value - total_spent;
    let profit_loss_percentage = if total_spent > rust_decimal::Decimal::ZERO {
        (profit_loss / total_spent) * rust_decimal::Decimal::new(100, 0)
    } else {
        rust_decimal::Decimal::ZERO
    };

    Ok(Json(DashboardData {
        total_spent,
        current_value,
        profit_loss,
        profit_loss_percentage,
        stocks,
    }))
}

async fn get_stock_details(
    Path(symbol): Path<String>,
    State(state): State<AppState>,
) -> Result<Json<StockDetails>, AppError> {
    let purchases = sqlx::query!(
        "SELECT id, symbol, quantity, price_per_share, commission, purchase_date FROM purchases WHERE symbol = ? ORDER BY purchase_date DESC",
        symbol
    )
    .fetch_all(&state.db)
    .await?;

    let purchases: Vec<Purchase> = purchases
        .into_iter()
        .map(|row| Purchase {
            id: row.id.unwrap_or_default(),
            symbol: row.symbol,
            quantity: row.quantity,
            price_per_share: rust_decimal::Decimal::from_str(&row.price_per_share.to_string())
                .unwrap(),
            commission: rust_decimal::Decimal::from_str(&row.commission.to_string()).unwrap(),
            purchase_date: row.purchase_date,
        })
        .collect();

    if purchases.is_empty() {
        return Err(AppError::NotFound(
            "Stock not found in portfolio".to_string(),
        ));
    }

    let total_quantity: rust_decimal::Decimal = purchases
        .iter()
        .map(|p| rust_decimal::Decimal::new(p.quantity, 0))
        .sum();
    let total_spent: rust_decimal::Decimal = purchases
        .iter()
        .map(|p| rust_decimal::Decimal::new(p.quantity, 0) * p.price_per_share + p.commission)
        .sum();

    // Get current price from Alpha Vantage
    let current_price = state.stock_client.get_current_price(&symbol).await?;
    let current_value = total_quantity * current_price;
    let profit_loss = current_value - total_spent;

    Ok(Json(StockDetails {
        symbol: symbol.clone(),
        purchases,
        total_quantity,
        total_spent,
        current_price,
        current_value,
        profit_loss,
    }))
}

#[derive(Deserialize)]
struct ChartQuery {
    period: Option<String>,
}

async fn get_stock_chart(
    Path(symbol): Path<String>,
    Query(query): Query<ChartQuery>,
    State(state): State<AppState>,
) -> Result<Json<ChartData>, AppError> {
    let period = query.period.unwrap_or_else(|| "1M".to_string());

    // Get chart data from Alpha Vantage
    let chart_data = state.stock_client.get_chart_data(&symbol, &period).await?;

    // Get purchase dates for this symbol
    let purchase_dates = sqlx::query!(
        "SELECT purchase_date, price_per_share FROM purchases WHERE symbol = ?",
        symbol
    )
    .fetch_all(&state.db)
    .await?;

    let purchase_points: Vec<PurchasePoint> = purchase_dates
        .into_iter()
        .map(|row| PurchasePoint {
            date: row.purchase_date,
            price: rust_decimal::Decimal::from_str(&row.price_per_share.to_string()).unwrap(),
        })
        .collect();

    Ok(Json(ChartData {
        symbol: symbol.clone(),
        period,
        price_data: chart_data,
        purchase_points,
    }))
}

#[derive(Deserialize)]
struct SymbolSearchQuery {
    q: String,
    limit: Option<usize>,
}

async fn search_symbols(
    Query(query): Query<SymbolSearchQuery>,
    State(state): State<AppState>,
) -> Result<Json<Vec<models::SymbolSuggestion>>, AppError> {
    let limit = query.limit.unwrap_or(10).min(50); // Max 50 results

    if query.q.trim().is_empty() {
        return Ok(Json(vec![]));
    }

    let suggestions = state.stock_client.search_symbols(&query.q, limit).await?;

    Ok(Json(suggestions))
}

async fn get_cache_stats(
    State(state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let (price_count, chart_count, symbol_count) = state.stock_client.get_cache_stats();

    Ok(Json(serde_json::json!({
        "price_cache_entries": price_count,
        "chart_cache_entries": chart_count,
        "symbol_cache_entries": symbol_count,
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

async fn clear_cache(State(state): State<AppState>) -> Result<Json<serde_json::Value>, AppError> {
    state.stock_client.clear_cache();

    Ok(Json(serde_json::json!({
        "message": "All cache cleared successfully",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

async fn cleanup_cache(State(state): State<AppState>) -> Result<Json<serde_json::Value>, AppError> {
    state.stock_client.cleanup_expired_cache();

    Ok(Json(serde_json::json!({
        "message": "Expired cache entries cleaned up",
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

#[derive(Debug)]
enum AppError {
    Database(sqlx::Error),
    StockApi(String),
    NotFound(String),
    Unauthorized(String),
    Conflict(String),
    Internal(String),
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        AppError::Database(err)
    }
}

impl From<String> for AppError {
    fn from(err: String) -> Self {
        AppError::StockApi(err)
    }
}

impl axum::response::IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match &self {
            AppError::Database(e) => {
                tracing::error!("Database error: {}", e);
                (
                    axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                    "Database error".to_string(),
                )
            }
            AppError::StockApi(e) => {
                tracing::error!("Stock API error: {}", e);
                (
                    axum::http::StatusCode::BAD_GATEWAY,
                    "Stock API error".to_string(),
                )
            }
            AppError::NotFound(e) => (axum::http::StatusCode::NOT_FOUND, e.clone()),
            AppError::Unauthorized(e) => (axum::http::StatusCode::UNAUTHORIZED, e.clone()),
            AppError::Conflict(e) => (axum::http::StatusCode::CONFLICT, e.clone()),
            AppError::Internal(e) => {
                tracing::error!("Internal error: {}", e);
                (axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.clone())
            }
        };

        let body = Json(serde_json::json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}
