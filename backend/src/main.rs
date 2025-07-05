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
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPool;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use uuid;

pub mod models;
pub mod stock_api;

use models::*;
use stock_api::StockApiClient;

#[derive(Clone)]
struct AppState {
    db: PgPool,
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
    dotenvy::dotenv().ok();

    let database_user = std::env::var("DATABASE_USER").unwrap_or_else(|_| "stock_user".to_string());
    let database_password =
        std::env::var("DATABASE_PASSWORD").unwrap_or_else(|_| "stock_password".to_string());
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
        format!(
            "postgresql://{}:{}@localhost:5432/stock_notebook",
            database_user, database_password
        )
    });

    let jwt_secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());

    let frontend_url =
        std::env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:3000".to_string());

    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    let pool = PgPool::connect(&database_url).await?;

    sqlx::query("SELECT 1").execute(&pool).await?;

    sqlx::migrate!("./migrations").run(&pool).await?;

    let stock_client = Arc::new(StockApiClient::new());

    let app_state = AppState {
        db: pool,
        stock_client,
        jwt_secret,
    };

    let cors = CorsLayer::new()
        .allow_origin(frontend_url.parse::<HeaderValue>()?)
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers([
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
            axum::http::header::ACCEPT,
        ])
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

    let bind_address = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&bind_address).await?;

    let shutdown_signal = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install CTRL+C signal handler");
    };

    tokio::select! {
        result = axum::serve(listener, app) => {
            result?;
        }
        _ = shutdown_signal => {
        }
    }

    Ok(())
}

async fn auth_middleware(
    State(app_state): State<AppState>,
    req: Request,
    next: Next,
) -> Result<axum::response::Response, StatusCode> {
    let path = req.uri().path();

    if path.starts_with("/api/auth/") || path == "/health" || path.starts_with("/api/admin/") {
        return Ok(next.run(req).await);
    }

    let auth_header = req
        .headers()
        .get(AUTHORIZATION)
        .and_then(|header| header.to_str().ok());

    let token = if let Some(auth_header) = auth_header {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            token
        } else {
            return Err(StatusCode::UNAUTHORIZED);
        }
    } else {
        return Err(StatusCode::UNAUTHORIZED);
    };

    let claims = match decode::<Claims>(
        token,
        &DecodingKey::from_secret(app_state.jwt_secret.as_ref()),
        &Validation::default(),
    ) {
        Ok(data) => data.claims,
        Err(_) => return Err(StatusCode::UNAUTHORIZED),
    };

    let mut req = req;
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
    State(app_state): State<AppState>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let user = sqlx::query_as!(
        User,
        "SELECT id, username, password_hash, last_login, created_at FROM users WHERE username = $1",
        payload.username
    )
    .fetch_optional(&app_state.db)
    .await?;

    if let Some(user) = user {
        if verify(&payload.password, &user.password_hash).unwrap_or(false) {
            let exp = chrono::Utc::now()
                .checked_add_signed(chrono::Duration::hours(24))
                .unwrap()
                .timestamp() as usize;

            let claims = Claims {
                user_id: user.id.to_string(),
                username: user.username.clone(),
                exp,
            };

            let token = encode(
                &Header::default(),
                &claims,
                &EncodingKey::from_secret(app_state.jwt_secret.as_ref()),
            )
            .map_err(|_| AppError::Internal("Failed to create token".to_string()))?;

            return Ok(Json(AuthResponse {
                token,
                user: UserInfo {
                    id: user.id.to_string(),
                    username: user.username,
                    last_login: user.last_login.map(|dt| dt.to_rfc3339()),
                },
            }));
        }
    }

    Err(AppError::Unauthorized("Invalid credentials".to_string()))
}

async fn register(
    State(app_state): State<AppState>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, AppError> {
    let existing_user = sqlx::query!("SELECT id FROM users WHERE username = $1", payload.username)
        .fetch_optional(&app_state.db)
        .await?;

    if existing_user.is_some() {
        return Err(AppError::Conflict("Username already exists".to_string()));
    }

    let password_hash = hash(&payload.password, DEFAULT_COST)
        .map_err(|_| AppError::Internal("Failed to hash password".to_string()))?;

    let user_id = uuid::Uuid::new_v4();
    let created_at = chrono::Utc::now();

    sqlx::query!(
        "INSERT INTO users (id, username, password_hash, created_at) VALUES ($1, $2, $3, $4)",
        user_id,
        payload.username,
        password_hash,
        created_at
    )
    .execute(&app_state.db)
    .await?;

    let exp = chrono::Utc::now()
        .checked_add_signed(chrono::Duration::hours(24))
        .unwrap()
        .timestamp() as usize;

    let claims = Claims {
        user_id: user_id.to_string(),
        username: payload.username.clone(),
        exp,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(app_state.jwt_secret.as_ref()),
    )
    .map_err(|_| AppError::Internal("Failed to create token".to_string()))?;

    Ok(Json(AuthResponse {
        token,
        user: UserInfo {
            id: user_id.to_string(),
            username: payload.username,
            last_login: None,
        },
    }))
}

async fn create_purchase(
    State(app_state): State<AppState>,
    Json(payload): Json<CreatePurchaseRequest>,
) -> Result<Json<Purchase>, AppError> {
    let purchase_id = uuid::Uuid::new_v4();
    let purchase_date = chrono::NaiveDate::parse_from_str(&payload.purchase_date, "%Y-%m-%d")
        .map_err(|_| AppError::Internal("Invalid date format".to_string()))?;

    let row = sqlx::query!(
        "INSERT INTO purchases (id, symbol, quantity, price_per_share, commission, purchase_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, symbol, quantity, price_per_share, commission, purchase_date",
        purchase_id,
        payload.symbol,
        payload.quantity as i32,
        payload.price_per_share,
        payload.commission,
        purchase_date
    )
    .fetch_one(&app_state.db)
    .await?;

    Ok(Json(Purchase {
        id: row.id.to_string(),
        symbol: row.symbol,
        quantity: row.quantity as i64,
        price_per_share: row.price_per_share,
        commission: row.commission,
        purchase_date: row.purchase_date.to_string(),
    }))
}

async fn get_purchases(State(app_state): State<AppState>) -> Result<Json<Vec<Purchase>>, AppError> {
    let rows = sqlx::query!(
        "SELECT id, symbol, quantity, price_per_share, commission, purchase_date FROM purchases ORDER BY purchase_date DESC"
    )
    .fetch_all(&app_state.db)
    .await?;

    let purchases: Vec<Purchase> = rows
        .into_iter()
        .map(|row| Purchase {
            id: row.id.to_string(),
            symbol: row.symbol,
            quantity: row.quantity as i64,
            price_per_share: row.price_per_share,
            commission: row.commission,
            purchase_date: row.purchase_date.to_string(),
        })
        .collect();

    Ok(Json(purchases))
}

async fn get_dashboard(State(app_state): State<AppState>) -> Result<Json<DashboardData>, AppError> {
    let purchases = sqlx::query!(
        "SELECT symbol, SUM(quantity) as total_quantity, AVG(price_per_share) as avg_price, SUM(quantity * price_per_share + commission) as total_spent FROM purchases GROUP BY symbol"
    )
    .fetch_all(&app_state.db)
    .await?;

    let mut total_spent = rust_decimal::Decimal::ZERO;
    let mut current_value = rust_decimal::Decimal::ZERO;
    let mut stocks = Vec::new();

    for row in purchases {
        let symbol = row.symbol.clone();
        let quantity = rust_decimal::Decimal::new(row.total_quantity.unwrap_or(0), 0);
        let spent = row.total_spent.unwrap_or(Decimal::ZERO);

        total_spent += spent;

        let current_price = app_state
            .stock_client
            .get_current_price(&symbol)
            .await
            .unwrap_or(rust_decimal::Decimal::ZERO);

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
    State(app_state): State<AppState>,
    Path(symbol): Path<String>,
) -> Result<Json<StockDetails>, AppError> {
    let rows = sqlx::query!(
        "SELECT id, symbol, quantity, price_per_share, commission, purchase_date FROM purchases WHERE symbol = $1 ORDER BY purchase_date DESC",
        symbol
    )
    .fetch_all(&app_state.db)
    .await?;

    let purchases: Vec<Purchase> = rows
        .into_iter()
        .map(|row| Purchase {
            id: row.id.to_string(),
            symbol: row.symbol,
            quantity: row.quantity as i64,
            price_per_share: row.price_per_share,
            commission: row.commission,
            purchase_date: row.purchase_date.to_string(),
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

    let current_price = app_state.stock_client.get_current_price(&symbol).await?;
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
    State(app_state): State<AppState>,
    Path(symbol): Path<String>,
    Query(query): Query<ChartQuery>,
) -> Result<Json<ChartData>, AppError> {
    let period = query.period.unwrap_or_else(|| "1M".to_string());

    let price_data = app_state
        .stock_client
        .get_chart_data(&symbol, &period)
        .await
        .map_err(|e| {
            AppError::StockApi(format!("Failed to get chart data for {}: {}", symbol, e))
        })?;

    let purchase_dates = sqlx::query!(
        "SELECT purchase_date, price_per_share FROM purchases WHERE symbol = $1",
        symbol
    )
    .fetch_all(&app_state.db)
    .await?;

    let purchase_points: Vec<PurchasePoint> = purchase_dates
        .into_iter()
        .map(|row| PurchasePoint {
            date: row.purchase_date.to_string(),
            price: row.price_per_share,
        })
        .collect();

    Ok(Json(ChartData {
        symbol: symbol.clone(),
        period,
        price_data,
        purchase_points,
    }))
}

#[derive(Deserialize)]
struct SymbolSearchQuery {
    q: String,
    limit: Option<usize>,
}

async fn search_symbols(
    State(app_state): State<AppState>,
    Query(query): Query<SymbolSearchQuery>,
) -> Result<Json<Vec<SymbolSuggestion>>, AppError> {
    let limit = query.limit.unwrap_or(10);
    let results = app_state
        .stock_client
        .search_symbols(&query.q, limit)
        .await
        .map_err(|e| AppError::StockApi(format!("Failed to search symbols: {}", e)))?;

    Ok(Json(results))
}

async fn get_cache_stats(
    State(app_state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    let (price_count, chart_count, symbol_count) = app_state.stock_client.get_cache_stats();

    Ok(Json(serde_json::json!({
        "price_cache_entries": price_count,
        "chart_cache_entries": chart_count,
        "symbol_cache_entries": symbol_count,
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

async fn clear_cache(
    State(app_state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    app_state.stock_client.clear_cache();

    Ok(Json(serde_json::json!({
        "message": "All cache cleared successfully",
        "timestamp": chrono::Utc::now().to_rfc3339()

    })))
}

async fn cleanup_cache(
    State(app_state): State<AppState>,
) -> Result<Json<serde_json::Value>, AppError> {
    app_state.stock_client.cleanup_expired_cache();

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
        AppError::Internal(err)
    }
}

impl axum::response::IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, error_message) = match self {
            AppError::Database(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Database error".to_string(),
            ),
            AppError::StockApi(_) => (
                axum::http::StatusCode::BAD_GATEWAY,
                "Stock API error".to_string(),
            ),
            AppError::NotFound(e) => (axum::http::StatusCode::NOT_FOUND, e),
            AppError::Unauthorized(e) => (axum::http::StatusCode::UNAUTHORIZED, e),
            AppError::Conflict(e) => (axum::http::StatusCode::CONFLICT, e),
            AppError::Internal(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Internal server error".to_string(),
            ),
        };

        let body = Json(serde_json::json!({
            "error": error_message
        }));

        (status, body).into_response()
    }
}
