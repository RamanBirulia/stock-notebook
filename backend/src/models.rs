use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub password_hash: String,
    pub last_login: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct RegisterRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: UserInfo,
    pub token: String,
}

#[derive(Debug, Serialize)]
pub struct UserInfo {
    pub id: String,
    pub username: String,
    pub last_login: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Purchase {
    pub id: String,
    pub symbol: String,
    pub quantity: i64,
    pub price_per_share: Decimal,
    pub commission: Decimal,
    pub purchase_date: String,
}

#[derive(Debug, Deserialize)]
pub struct CreatePurchaseRequest {
    pub symbol: String,
    pub quantity: i64,
    pub price_per_share: Decimal,
    pub commission: Decimal,
    pub purchase_date: String,
}

#[derive(Debug, Serialize)]
pub struct DashboardData {
    pub total_spent: Decimal,
    pub current_value: Decimal,
    pub profit_loss: Decimal,
    pub profit_loss_percentage: Decimal,
    pub stocks: Vec<StockHolding>,
}

#[derive(Debug, Serialize)]
pub struct StockHolding {
    pub symbol: String,
    pub quantity: Decimal,
    pub current_price: Decimal,
    pub total_value: Decimal,
    pub total_spent: Decimal,
}

#[derive(Debug, Serialize)]
pub struct StockDetails {
    pub symbol: String,
    pub purchases: Vec<Purchase>,
    pub total_quantity: Decimal,
    pub total_spent: Decimal,
    pub current_price: Decimal,
    pub current_value: Decimal,
    pub profit_loss: Decimal,
}

#[derive(Debug, Serialize)]
pub struct ChartData {
    pub symbol: String,
    pub period: String,
    pub price_data: Vec<PricePoint>,
    pub purchase_points: Vec<PurchasePoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricePoint {
    pub date: String,
    pub price: Decimal,
    pub volume: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct PurchasePoint {
    pub date: String,
    pub price: Decimal,
}

// Yahoo Finance API structures
#[derive(Debug, Deserialize)]
pub struct YahooFinanceResponse {
    pub chart: YahooChart,
}

#[derive(Debug, Deserialize)]
pub struct YahooChart {
    pub result: Option<Vec<YahooResult>>,
    pub error: Option<YahooError>,
}

#[derive(Debug, Deserialize)]
pub struct YahooResult {
    pub meta: YahooMeta,
    pub timestamp: Vec<i64>,
    pub indicators: YahooIndicators,
}

#[derive(Debug, Deserialize)]
pub struct YahooMeta {
    pub currency: String,
    pub symbol: String,
    #[serde(rename = "exchangeName")]
    pub exchange_name: String,
    #[serde(rename = "instrumentType")]
    pub instrument_type: String,
    #[serde(rename = "firstTradeDate")]
    pub first_trade_date: i64,
    #[serde(rename = "regularMarketTime")]
    pub regular_market_time: i64,
    pub gmtoffset: i32,
    pub timezone: String,
    #[serde(rename = "exchangeTimezoneName")]
    pub exchange_timezone_name: String,
    #[serde(rename = "regularMarketPrice")]
    pub regular_market_price: f64,
    #[serde(rename = "chartPreviousClose")]
    pub chart_previous_close: f64,
    #[serde(rename = "currentTradingPeriod")]
    pub current_trading_period: YahooTradingPeriod,
    #[serde(rename = "dataGranularity")]
    pub data_granularity: String,
    pub range: String,
    #[serde(rename = "validRanges")]
    pub valid_ranges: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct YahooTradingPeriod {
    pub pre: YahooPeriod,
    pub regular: YahooPeriod,
    pub post: YahooPeriod,
}

#[derive(Debug, Deserialize)]
pub struct YahooPeriod {
    pub timezone: String,
    pub start: i64,
    pub end: i64,
    pub gmtoffset: i32,
}

#[derive(Debug, Deserialize)]
pub struct YahooIndicators {
    pub quote: Vec<YahooQuote>,
}

#[derive(Debug, Deserialize)]
pub struct YahooQuote {
    pub open: Vec<Option<f64>>,
    pub high: Vec<Option<f64>>,
    pub low: Vec<Option<f64>>,
    pub close: Vec<Option<f64>>,
    pub volume: Vec<Option<i64>>,
}

#[derive(Debug, Deserialize)]
pub struct YahooError {
    pub code: String,
    pub description: String,
}

// Yahoo Finance Quote API structures
#[derive(Debug, Deserialize)]
pub struct YahooQuoteResponse {
    #[serde(rename = "quoteResponse")]
    pub quote_response: YahooQuoteResult,
}

#[derive(Debug, Deserialize)]
pub struct YahooQuoteResult {
    pub result: Vec<YahooQuoteData>,
    pub error: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct YahooQuoteData {
    pub symbol: String,
    #[serde(rename = "regularMarketPrice")]
    pub regular_market_price: Option<f64>,
    #[serde(rename = "regularMarketTime")]
    pub regular_market_time: Option<i64>,
    #[serde(rename = "regularMarketChange")]
    pub regular_market_change: Option<f64>,
    #[serde(rename = "regularMarketChangePercent")]
    pub regular_market_change_percent: Option<f64>,
    #[serde(rename = "regularMarketVolume")]
    pub regular_market_volume: Option<i64>,
    #[serde(rename = "regularMarketPreviousClose")]
    pub regular_market_previous_close: Option<f64>,
    #[serde(rename = "regularMarketOpen")]
    pub regular_market_open: Option<f64>,
    #[serde(rename = "regularMarketDayHigh")]
    pub regular_market_day_high: Option<f64>,
    #[serde(rename = "regularMarketDayLow")]
    pub regular_market_day_low: Option<f64>,
}

// Yahoo Finance Search API structures
#[derive(Debug, Deserialize)]
pub struct YahooSearchResponse {
    #[serde(rename = "ResultSet")]
    pub result_set: YahooSearchResultSet,
}

#[derive(Debug, Deserialize)]
pub struct YahooSearchResultSet {
    #[serde(rename = "Query")]
    pub query: String,
    #[serde(rename = "Result")]
    pub result: Vec<YahooSearchResult>,
}

#[derive(Debug, Deserialize)]
pub struct YahooSearchResult {
    pub symbol: String,
    pub name: String,
    pub exch: String,
    #[serde(rename = "type")]
    pub result_type: String,
    #[serde(rename = "exchDisp")]
    pub exch_disp: String,
    #[serde(rename = "typeDisp")]
    pub type_disp: String,
}

// Yahoo Finance v1 Search API structures (alternative format)
#[derive(Debug, Deserialize)]
pub struct YahooV1SearchResponse {
    pub quotes: Vec<YahooV1SearchQuote>,
    pub count: i32,
}

#[derive(Debug, Deserialize)]
pub struct YahooV1SearchQuote {
    pub symbol: String,
    pub shortname: Option<String>,
    pub longname: Option<String>,
    #[serde(rename = "exchDisp")]
    pub exch_disp: String,
    #[serde(rename = "typeDisp")]
    pub type_disp: String,
    #[serde(rename = "quoteType")]
    pub quote_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StockSymbol {
    pub symbol: String,
    pub name: String,
    pub exchange: String,
    pub asset_type: String,
    pub ipo_date: String,
    pub status: String,
}

#[derive(Debug, Serialize)]
pub struct SymbolSuggestion {
    pub symbol: String,
    pub name: String,
    pub exchange: String,
    pub asset_type: String,
}
