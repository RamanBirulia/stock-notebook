use crate::models::{CreateStockDataRequest, PricePoint, StockSymbol, SymbolSuggestion};
use crate::stock_data_service::StockDataService;
use crate::yahoo_api::YahooFinanceClient;
use chrono::{self, Utc};
use rust_decimal::Decimal;
use sqlx::PgPool;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone, Debug)]
struct CacheItem<T> {
    data: T,
    timestamp: chrono::DateTime<chrono::Utc>,
}

impl<T> CacheItem<T> {
    fn new(data: T) -> Self {
        Self {
            data,
            timestamp: chrono::Utc::now(),
        }
    }

    fn is_expired(&self) -> bool {
        let now = chrono::Utc::now();
        now.signed_duration_since(self.timestamp).num_hours() >= 24
    }
}

type PriceCache = Arc<Mutex<HashMap<String, CacheItem<Decimal>>>>;
type ChartCache = Arc<Mutex<HashMap<String, CacheItem<Vec<PricePoint>>>>>;
type SymbolCache = Arc<Mutex<HashMap<String, CacheItem<Vec<StockSymbol>>>>>;

#[derive(Clone)]
pub struct StockApiClient {
    yahoo_client: YahooFinanceClient,
    stock_data_service: Arc<StockDataService>,
    price_cache: PriceCache,
    chart_cache: ChartCache,
    symbol_cache: SymbolCache,
}

impl StockApiClient {
    pub fn new(db: PgPool) -> Self {
        Self {
            yahoo_client: YahooFinanceClient::new(),
            stock_data_service: Arc::new(StockDataService::new(db)),
            price_cache: Arc::new(Mutex::new(HashMap::new())),
            chart_cache: Arc::new(Mutex::new(HashMap::new())),
            symbol_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_current_price(&self, symbol: &str) -> Result<Decimal, String> {
        let today = Utc::now().date_naive().to_string();
        let symbol_upper = symbol.to_uppercase();

        // Check if we have today's data in database
        match self.stock_data_service.has_today_data(&symbol_upper).await {
            Ok(has_data) => {
                if has_data {
                    // Get today's data from database
                    if let Ok(Some(stock_data)) = self
                        .stock_data_service
                        .get_stock_data_by_date(&symbol_upper, &today)
                        .await
                    {
                        return Ok(stock_data.price);
                    }
                }
            }
            Err(_) => {
                // Continue to fetch from API if database check fails
            }
        }

        // Fetch from Yahoo Finance API
        let price = self.yahoo_client.fetch_current_price(symbol).await?;

        // Store in database
        let stock_data_request = CreateStockDataRequest {
            symbol: symbol_upper.clone(),
            price,
            volume: None,
            data_date: today,
        };

        if let Err(e) = self
            .stock_data_service
            .upsert_stock_data(&stock_data_request)
            .await
        {
            // Log error but don't fail the request
            eprintln!("Failed to store stock data in database: {}", e);
        }

        Ok(price)
    }

    pub async fn get_chart_data(
        &self,
        symbol: &str,
        period: &str,
    ) -> Result<Vec<PricePoint>, String> {
        let symbol_upper = symbol.to_uppercase();
        let (start_date, end_date) = self.get_date_range_for_period(period);

        // Check if we have sufficient data in database
        match self
            .stock_data_service
            .get_stock_data_range(&symbol_upper, &start_date, &end_date)
            .await
        {
            Ok(db_data) => {
                // Check if we have recent enough data
                let today = Utc::now().date_naive().to_string();
                let has_recent_data = db_data.iter().any(|d| d.data_date >= today);

                if !db_data.is_empty() && has_recent_data {
                    // Convert database data to PricePoint format
                    let mut price_points: Vec<PricePoint> = db_data
                        .into_iter()
                        .map(|data| PricePoint {
                            date: data.data_date,
                            price: data.price,
                            volume: data.volume,
                        })
                        .collect();

                    // Apply business logic: filter data by period
                    price_points = self.filter_data_by_period(price_points, period);
                    return Ok(price_points);
                }
            }
            Err(_) => {
                // Continue to fetch from API if database check fails
            }
        }

        // Fetch from Yahoo Finance API
        let mut chart_data = self.yahoo_client.fetch_chart_data(symbol, period).await?;

        // Store fetched data in database
        let stock_data_requests: Vec<CreateStockDataRequest> = chart_data
            .iter()
            .map(|point| CreateStockDataRequest {
                symbol: symbol_upper.clone(),
                price: point.price,
                volume: point.volume,
                data_date: point.date.clone(),
            })
            .collect();

        if let Err(e) = self
            .stock_data_service
            .bulk_insert_stock_data(stock_data_requests)
            .await
        {
            // Log error but don't fail the request
            eprintln!("Failed to store chart data in database: {}", e);
        }

        // Apply business logic: filter data by period
        chart_data = self.filter_data_by_period(chart_data, period);

        Ok(chart_data)
    }

    pub async fn get_all_symbols(&self) -> Result<Vec<StockSymbol>, String> {
        let cache_key = "all_symbols".to_string();

        // Check cache first
        if let Ok(cache) = self.symbol_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    return Ok(cached_item.data.clone());
                }
            }
        }

        // Fetch from Yahoo Finance API
        let symbols = self.yahoo_client.fetch_symbols().await?;

        // Cache the result
        if let Ok(mut cache) = self.symbol_cache.lock() {
            cache.insert(cache_key, CacheItem::new(symbols.clone()));
        }

        Ok(symbols)
    }

    pub async fn search_symbols(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<SymbolSuggestion>, String> {
        // First, search in our predefined symbols
        let all_symbols = self.get_all_symbols().await?;
        let query_lower = query.to_lowercase();

        let mut matches: Vec<SymbolSuggestion> = all_symbols
            .iter()
            .filter(|symbol| {
                let symbol_lower = symbol.symbol.to_lowercase();
                let name_lower = symbol.name.to_lowercase();

                symbol_lower.starts_with(&query_lower) || name_lower.contains(&query_lower)
            })
            .take(limit)
            .map(|symbol| SymbolSuggestion {
                symbol: symbol.symbol.clone(),
                name: symbol.name.clone(),
                exchange: symbol.exchange.clone(),
                asset_type: symbol.asset_type.clone(),
            })
            .collect();

        // If we don't have enough matches, search Yahoo Finance API
        if matches.len() < limit {
            match self
                .yahoo_client
                .search_symbols(query, limit - matches.len())
                .await
            {
                Ok(mut yahoo_matches) => {
                    // Remove duplicates
                    yahoo_matches.retain(|yahoo_match| {
                        !matches
                            .iter()
                            .any(|existing| existing.symbol == yahoo_match.symbol)
                    });
                    matches.extend(yahoo_matches);
                }
                Err(_) => {
                    // Continue with predefined matches only if Yahoo search fails
                }
            }
        }

        // Sort results with exact matches first
        matches.sort_by(|a, b| {
            let a_exact = a.symbol.to_lowercase() == query_lower;
            let b_exact = b.symbol.to_lowercase() == query_lower;

            match (a_exact, b_exact) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.symbol.cmp(&b.symbol),
            }
        });

        Ok(matches)
    }

    pub fn clear_cache(&self) {
        if let Ok(mut cache) = self.price_cache.lock() {
            cache.clear();
        }
        if let Ok(mut cache) = self.chart_cache.lock() {
            cache.clear();
        }
        if let Ok(mut cache) = self.symbol_cache.lock() {
            cache.clear();
        }
    }

    pub fn cleanup_expired_cache(&self) {
        if let Ok(mut cache) = self.price_cache.lock() {
            cache.retain(|_, item| !item.is_expired());
        }
        if let Ok(mut cache) = self.chart_cache.lock() {
            cache.retain(|_, item| !item.is_expired());
        }
        if let Ok(mut cache) = self.symbol_cache.lock() {
            cache.retain(|_, item| !item.is_expired());
        }
    }

    pub fn get_cache_stats(&self) -> (usize, usize, usize) {
        let price_count = self
            .price_cache
            .lock()
            .map(|cache| cache.len())
            .unwrap_or(0);
        let chart_count = self
            .chart_cache
            .lock()
            .map(|cache| cache.len())
            .unwrap_or(0);
        let symbol_count = self
            .symbol_cache
            .lock()
            .map(|cache| cache.len())
            .unwrap_or(0);
        (price_count, chart_count, symbol_count)
    }

    fn filter_data_by_period(&self, mut data: Vec<PricePoint>, period: &str) -> Vec<PricePoint> {
        let max_points = match period {
            "1D" => 1,
            "1W" => 7,
            "1M" => 30,
            "3M" => 30 * 3,
            "6M" => 30 * 6,
            "1Y" => 365,
            "2Y" => 365 * 2,
            "5Y" => 365 * 5,
            "10Y" => 365 * 10,
            "MAX" => 365 * 10,
            _ => 100,
        };

        if data.len() > max_points {
            let step = data.len() / max_points;
            data = data.into_iter().step_by(step.max(1)).collect();
        }

        data
    }
    /// Get date range for a given period
    fn get_date_range_for_period(&self, period: &str) -> (String, String) {
        let end_date = Utc::now().date_naive();
        let start_date = match period {
            "1D" => end_date - chrono::Duration::days(1),
            "1W" => end_date - chrono::Duration::weeks(1),
            "1M" => end_date - chrono::Duration::days(30),
            "3M" => end_date - chrono::Duration::days(90),
            "6M" => end_date - chrono::Duration::days(180),
            "1Y" => end_date - chrono::Duration::days(365),
            "2Y" => end_date - chrono::Duration::days(730),
            "5Y" => end_date - chrono::Duration::days(1825),
            "10Y" => end_date - chrono::Duration::days(3650),
            "MAX" => end_date - chrono::Duration::days(7300), // ~20 years
            _ => end_date - chrono::Duration::days(30),
        };

        (start_date.to_string(), end_date.to_string())
    }

    /// Get portfolio value using database data
    pub async fn get_portfolio_current_value(
        &self,
        symbols: &[String],
    ) -> Result<HashMap<String, Decimal>, String> {
        let mut portfolio_values = HashMap::new();

        for symbol in symbols {
            let price = self.get_current_price(symbol).await?;
            portfolio_values.insert(symbol.clone(), price);
        }

        Ok(portfolio_values)
    }

    /// Update stock data for multiple symbols
    pub async fn update_stock_data_bulk(&self, symbols: &[String]) -> Result<(), String> {
        let today = Utc::now().date_naive().to_string();

        for symbol in symbols {
            let symbol_upper = symbol.to_uppercase();

            // Check if we already have today's data
            match self.stock_data_service.has_today_data(&symbol_upper).await {
                Ok(has_data) => {
                    if has_data {
                        continue; // Skip if we already have today's data
                    }
                }
                Err(_) => {
                    // Continue to fetch if check fails
                }
            }

            // Fetch current price from Yahoo Finance
            match self.yahoo_client.fetch_current_price(symbol).await {
                Ok(price) => {
                    let stock_data_request = CreateStockDataRequest {
                        symbol: symbol_upper.clone(),
                        price,
                        volume: None,
                        data_date: today.clone(),
                    };

                    if let Err(e) = self
                        .stock_data_service
                        .upsert_stock_data(&stock_data_request)
                        .await
                    {
                        eprintln!("Failed to update stock data for {}: {}", symbol, e);
                    }
                }
                Err(e) => {
                    eprintln!("Failed to fetch current price for {}: {}", symbol, e);
                }
            }
        }

        Ok(())
    }

    /// Get database statistics
    pub async fn get_database_stats(&self) -> Result<HashMap<String, i64>, String> {
        let mut stats = HashMap::new();

        match self.stock_data_service.get_symbols_with_data().await {
            Ok(symbols) => {
                stats.insert("symbols_count".to_string(), symbols.len() as i64);
            }
            Err(_) => {
                stats.insert("symbols_count".to_string(), 0);
            }
        }

        Ok(stats)
    }

    /// Clean up old stock data
    pub async fn cleanup_old_stock_data(&self, days_to_keep: i64) -> Result<u64, String> {
        self.stock_data_service
            .cleanup_old_data(days_to_keep)
            .await
            .map_err(|e| format!("Failed to cleanup old data: {}", e))
    }
}

impl Default for StockApiClient {
    fn default() -> Self {
        // This will panic if called without a database connection
        // Consider removing this implementation or requiring explicit initialization
        panic!(
            "StockApiClient requires a database connection. Use StockApiClient::new(db) instead."
        )
    }
}
