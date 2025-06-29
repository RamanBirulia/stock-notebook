use reqwest::Client;
use rust_decimal::Decimal;

use chrono;
use std::collections::HashMap;

use std::sync::{Arc, Mutex};
use tracing::{debug, error, info, warn};

use crate::models::{
    PricePoint, StockSymbol, SymbolSuggestion, YahooFinanceResponse, YahooV1SearchResponse,
};

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
        let age = now - self.timestamp;
        age.num_hours() >= 24
    }
}

type PriceCache = Arc<Mutex<HashMap<String, CacheItem<Decimal>>>>;
type ChartCache = Arc<Mutex<HashMap<String, CacheItem<Vec<PricePoint>>>>>;
type SymbolCache = Arc<Mutex<HashMap<String, CacheItem<Vec<StockSymbol>>>>>;

pub struct StockApiClient {
    client: Client,
    base_url: String,
    price_cache: PriceCache,
    chart_cache: ChartCache,
    symbol_cache: SymbolCache,
    enable_request_logging: bool,
    enable_response_logging: bool,
}

impl StockApiClient {
    pub fn new() -> Self {
        let enable_request_logging = std::env::var("ENABLE_API_REQUEST_LOGGING")
            .unwrap_or_else(|_| "false".to_string())
            .to_lowercase()
            == "true";
        let enable_response_logging = std::env::var("ENABLE_API_RESPONSE_LOGGING")
            .unwrap_or_else(|_| "false".to_string())
            .to_lowercase()
            == "true";

        if enable_request_logging {
            info!("API request logging enabled");
        }
        if enable_response_logging {
            info!("API response logging enabled");
        }

        Self {
            client: Client::new(),
            base_url: "https://query1.finance.yahoo.com".to_string(),
            price_cache: Arc::new(Mutex::new(HashMap::new())),
            chart_cache: Arc::new(Mutex::new(HashMap::new())),
            symbol_cache: Arc::new(Mutex::new(HashMap::new())),
            enable_request_logging,
            enable_response_logging,
        }
    }

    pub async fn get_current_price(&self, symbol: &str) -> Result<Decimal, String> {
        // Check cache first
        let cache_key = format!("price_{}", symbol.to_uppercase());

        if let Ok(cache) = self.price_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    info!("Returning cached price for {}", symbol);
                    return Ok(cached_item.data);
                }
            }
        }

        // Cache miss or expired, fetch from API
        let price = self.fetch_current_price_from_api(symbol).await?;

        // Store in cache
        if let Ok(mut cache) = self.price_cache.lock() {
            cache.insert(cache_key, CacheItem::new(price));
            info!("Cached price for {}", symbol);
        }

        Ok(price)
    }

    async fn fetch_current_price_from_api(&self, symbol: &str) -> Result<Decimal, String> {
        let url = format!("{}/v8/finance/chart/{}", self.base_url, symbol);

        info!("Fetching current price for {}", symbol);

        if self.enable_request_logging {
            info!("=== API REQUEST ===");
            info!("URL: {}", url);
            info!("Method: GET");
            info!("API: Yahoo Finance Chart (for current price)");
            info!("Symbol: {}", symbol);
            info!("==================");
        }

        let response = self.client
            .get(&url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            .header("Accept", "application/json")
            .header("Accept-Language", "en-US,en;q=0.9")
            .send()
            .await
            .map_err(|e| {
                error!("Request failed for symbol {}: {}", symbol, e);
                format!("Request failed: {}", e)
            })?;

        let response_status = response.status();
        let response_headers = response.headers().clone();

        if self.enable_request_logging {
            debug!("Response status: {}", response_status);
            debug!("Response headers: {:?}", response_headers);
        }

        let response_text = response.text().await.map_err(|e| {
            error!("Failed to read response text for symbol {}: {}", symbol, e);
            format!("Failed to read response text: {}", e)
        })?;

        if self.enable_response_logging {
            info!("=== API RESPONSE ===");
            info!("Symbol: {}", symbol);
            info!("Status: {}", response_status);
            info!(
                "Response body (first 500 chars): {}",
                if response_text.len() > 500 {
                    &response_text[..500]
                } else {
                    &response_text
                }
            );
            info!("===================");
        }

        // Check if response is HTML (indicates blocking or wrong endpoint)
        if response_text.trim_start().starts_with("<!DOCTYPE")
            || response_text.trim_start().starts_with("<html")
        {
            error!(
                "Received HTML response instead of JSON for symbol {}",
                symbol
            );
            return Err(
                "API returned HTML instead of JSON - possible rate limiting or blocking"
                    .to_string(),
            );
        }

        let data: YahooFinanceResponse = serde_json::from_str(&response_text).map_err(|e| {
            error!("Failed to parse JSON for symbol {}: {}", symbol, e);
            warn!("Raw response that failed to parse: {}", response_text);
            format!("Failed to parse JSON: {}", e)
        })?;

        if let Some(error) = &data.chart.error {
            error!(
                "Yahoo Finance API error for symbol {}: {}",
                symbol, error.description
            );
            return Err(format!("API Error: {}", error.description));
        }

        if let Some(results) = &data.chart.result {
            if let Some(result) = results.first() {
                let price = result.meta.regular_market_price;
                Decimal::try_from(price).map_err(|e| format!("Failed to parse price: {}", e))
            } else {
                Err(format!("No chart data available for symbol: {}", symbol))
            }
        } else {
            Err(format!("No chart data available for symbol: {}", symbol))
        }
    }

    pub async fn get_chart_data(
        &self,
        symbol: &str,
        period: &str,
    ) -> Result<Vec<PricePoint>, String> {
        // Check cache first
        let cache_key = format!("chart_{}_{}", symbol.to_uppercase(), period);

        if let Ok(cache) = self.chart_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    info!("Returning cached chart data for {} ({})", symbol, period);
                    return Ok(cached_item.data.clone());
                }
            }
        }

        // Cache miss or expired, fetch from API
        let chart_data = self.fetch_chart_data_from_api(symbol, period).await?;

        // Store in cache
        if let Ok(mut cache) = self.chart_cache.lock() {
            cache.insert(cache_key, CacheItem::new(chart_data.clone()));
            info!("Cached chart data for {} ({})", symbol, period);
        }

        Ok(chart_data)
    }

    async fn fetch_chart_data_from_api(
        &self,
        symbol: &str,
        period: &str,
    ) -> Result<Vec<PricePoint>, String> {
        // Map period to Yahoo Finance range and interval
        let (range, interval) = match period {
            "1M" => ("1mo", "1d"),
            "1Y" => ("1y", "1d"),
            "5Y" => ("5y", "1wk"),
            _ => ("1mo", "1d"),
        };

        let url = format!(
            "{}/v8/finance/chart/{}?range={}&interval={}",
            self.base_url, symbol, range, interval
        );

        info!(
            "Fetching chart data for {} ({}) using range={}, interval={}",
            symbol, period, range, interval
        );

        if self.enable_request_logging {
            info!("=== API REQUEST ===");
            info!("URL: {}", url);
            info!("Method: GET");
            info!("API: Yahoo Finance Chart");
            info!("Symbol: {}", symbol);
            info!("Period: {}", period);
            info!("Range: {}", range);
            info!("Interval: {}", interval);
            info!("==================");
        }

        let response = self.client
            .get(&url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            .header("Accept", "application/json")
            .header("Accept-Language", "en-US,en;q=0.9")
            .send()
            .await
            .map_err(|e| {
                error!(
                    "Chart data request failed for {} ({}): {}",
                    symbol, period, e
                );
                format!("Request failed: {}", e)
            })?;

        let response_status = response.status();
        let response_headers = response.headers().clone();

        if self.enable_request_logging {
            debug!("Response status: {}", response_status);
            debug!("Response headers: {:?}", response_headers);
        }

        let response_text = response.text().await.map_err(|e| {
            error!(
                "Failed to read response text for {} ({}): {}",
                symbol, period, e
            );
            format!("Failed to read response text: {}", e)
        })?;

        if self.enable_response_logging {
            info!("=== API RESPONSE ===");
            info!("Symbol: {}", symbol);
            info!("Period: {}", period);
            info!("Status: {}", response_status);
            info!(
                "Response body (first 1000 chars): {}",
                if response_text.len() > 1000 {
                    &response_text[..1000]
                } else {
                    &response_text
                }
            );
            if response_text.len() > 1000 {
                info!(
                    "Response body (last 500 chars): {}",
                    &response_text[response_text.len() - 500..]
                );
            }
            info!("===================");
        }

        // Check if response is HTML (indicates blocking or wrong endpoint)
        if response_text.trim_start().starts_with("<!DOCTYPE")
            || response_text.trim_start().starts_with("<html")
        {
            error!(
                "Received HTML response instead of JSON for chart data {} ({})",
                symbol, period
            );
            return Err(
                "API returned HTML instead of JSON - possible rate limiting or blocking"
                    .to_string(),
            );
        }

        let data: YahooFinanceResponse = serde_json::from_str(&response_text).map_err(|e| {
            error!(
                "Failed to parse Yahoo Finance response for {} ({}): {}",
                symbol, period, e
            );
            warn!(
                "Raw response that failed to parse (first 500 chars): {}",
                if response_text.len() > 500 {
                    &response_text[..500]
                } else {
                    &response_text
                }
            );
            format!(
                "Failed to parse Yahoo Finance response for {} ({}): {}",
                symbol, period, e
            )
        })?;

        if let Some(error) = &data.chart.error {
            error!(
                "Yahoo Finance API error for {} ({}): {}",
                symbol, period, error.description
            );
            return Err(format!(
                "Yahoo Finance API error for {} ({}): {}",
                symbol, period, error.description
            ));
        }

        if let Some(results) = &data.chart.result {
            if let Some(result) = results.first() {
                info!(
                    "Found {} data points for {} ({})",
                    result.timestamp.len(),
                    symbol,
                    period
                );

                let mut price_points: Vec<PricePoint> = Vec::new();

                if let Some(quote) = result.indicators.quote.first() {
                    for (i, &timestamp) in result.timestamp.iter().enumerate() {
                        if let (Some(close), volume) = (
                            quote.close.get(i).and_then(|&c| c),
                            quote.volume.get(i).and_then(|&v| v),
                        ) {
                            // Convert timestamp to date string
                            let date = chrono::DateTime::from_timestamp(timestamp, 0)
                                .map(|dt| dt.format("%Y-%m-%d").to_string())
                                .unwrap_or_else(|| format!("{}", timestamp));

                            if let Ok(price) = Decimal::try_from(close) {
                                price_points.push(PricePoint {
                                    date,
                                    price,
                                    volume,
                                });
                            }
                        }
                    }
                }

                // Sort by date (oldest first for processing)
                price_points.sort_by(|a, b| a.date.cmp(&b.date));

                // Filter data based on period requirements
                let filtered_points = self.filter_data_by_period(&price_points, period);

                if filtered_points.is_empty() {
                    return Err(format!(
                        "No valid data points after filtering for {} ({})",
                        symbol, period
                    ));
                }

                info!(
                    "Returning {} filtered price points for {} ({})",
                    filtered_points.len(),
                    symbol,
                    period
                );

                if !filtered_points.is_empty() {
                    info!(
                        "Date range: {} to {}",
                        filtered_points.first().unwrap().date,
                        filtered_points.last().unwrap().date
                    );
                } else {
                    warn!(
                        "No data points remaining after filtering for {} ({})",
                        symbol, period
                    );
                }

                Ok(filtered_points)
            } else {
                Err(format!(
                    "No chart data available for {} ({})",
                    symbol, period
                ))
            }
        } else {
            Err(format!(
                "No chart data available for {} ({})",
                symbol, period
            ))
        }
    }

    fn filter_data_by_period(&self, price_points: &[PricePoint], period: &str) -> Vec<PricePoint> {
        let now = chrono::Utc::now();
        let cutoff_date = match period {
            "1M" => now - chrono::Duration::days(30),
            "1Y" => now - chrono::Duration::days(365),
            "5Y" => now - chrono::Duration::days(365 * 5),
            _ => now - chrono::Duration::days(30),
        };

        let cutoff_str = cutoff_date.format("%Y-%m-%d").to_string();

        price_points
            .iter()
            .filter(|point| point.date >= cutoff_str)
            .cloned()
            .collect()
    }
}

impl Default for StockApiClient {
    fn default() -> Self {
        Self::new()
    }
}

impl StockApiClient {
    /// Clears all cached data
    pub fn clear_cache(&self) {
        if let Ok(mut price_cache) = self.price_cache.lock() {
            price_cache.clear();
        }
        if let Ok(mut chart_cache) = self.chart_cache.lock() {
            chart_cache.clear();
        }
        if let Ok(mut symbol_cache) = self.symbol_cache.lock() {
            symbol_cache.clear();
        }
        info!("Cache cleared");
    }

    /// Removes expired entries from cache
    pub fn cleanup_expired_cache(&self) {
        if let Ok(mut price_cache) = self.price_cache.lock() {
            price_cache.retain(|_, item| !item.is_expired());
        }
        if let Ok(mut chart_cache) = self.chart_cache.lock() {
            chart_cache.retain(|_, item| !item.is_expired());
        }
        if let Ok(mut symbol_cache) = self.symbol_cache.lock() {
            symbol_cache.retain(|_, item| !item.is_expired());
        }
        info!("Expired cache entries cleaned up");
    }

    /// Gets cache statistics
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

    /// Gets all available stock symbols with caching
    pub async fn get_all_symbols(&self) -> Result<Vec<StockSymbol>, String> {
        let cache_key = "all_symbols".to_string();

        // Check cache first
        if let Ok(cache) = self.symbol_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    info!("Returning cached symbols list");
                    return Ok(cached_item.data.clone());
                }
            }
        }

        // Cache miss or expired, fetch from API
        let symbols = self.fetch_symbols_from_api().await?;

        // Store in cache
        if let Ok(mut cache) = self.symbol_cache.lock() {
            cache.insert(cache_key, CacheItem::new(symbols.clone()));
            info!("Cached symbols list with {} entries", symbols.len());
        }

        Ok(symbols)
    }

    /// Fetches popular stock symbols using Yahoo Finance search
    /// Since Yahoo Finance doesn't provide a direct listing API, we'll use a predefined list of popular symbols
    async fn fetch_symbols_from_api(&self) -> Result<Vec<StockSymbol>, String> {
        info!("Using predefined popular symbols list (Yahoo Finance doesn't provide direct listing API)");

        // Return a curated list of popular symbols
        let symbols = vec![
            StockSymbol {
                symbol: "AAPL".to_string(),
                name: "Apple Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "1980-12-12".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "MSFT".to_string(),
                name: "Microsoft Corporation".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "1986-03-13".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "GOOGL".to_string(),
                name: "Alphabet Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "2004-08-19".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "AMZN".to_string(),
                name: "Amazon.com Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "1997-05-15".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "TSLA".to_string(),
                name: "Tesla Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "2010-06-29".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "META".to_string(),
                name: "Meta Platforms Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "2012-05-18".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "NVDA".to_string(),
                name: "NVIDIA Corporation".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "1999-01-22".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "NFLX".to_string(),
                name: "Netflix Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Stock".to_string(),
                ipo_date: "2002-05-23".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "SPY".to_string(),
                name: "SPDR S&P 500 ETF Trust".to_string(),
                exchange: "NYSE".to_string(),
                asset_type: "ETF".to_string(),
                ipo_date: "1993-01-22".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "QQQ".to_string(),
                name: "Invesco QQQ Trust".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "ETF".to_string(),
                ipo_date: "1999-03-10".to_string(),
                status: "Active".to_string(),
            },
        ];

        info!("Returning {} predefined symbols", symbols.len());
        Ok(symbols)
    }

    /// Searches for symbols using Yahoo Finance search API
    pub async fn search_symbols(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<SymbolSuggestion>, String> {
        // First check our predefined symbols
        let all_symbols = self.get_all_symbols().await?;
        let query_lower = query.to_lowercase();

        let mut matches: Vec<SymbolSuggestion> = all_symbols
            .iter()
            .filter(|symbol| {
                let symbol_lower = symbol.symbol.to_lowercase();
                let name_lower = symbol.name.to_lowercase();

                // Match if query is a prefix of symbol or contained in name
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

        // If we don't have enough matches, try Yahoo Finance search API
        if matches.len() < limit {
            match self
                .search_yahoo_symbols(query, limit - matches.len())
                .await
            {
                Ok(mut yahoo_matches) => {
                    // Filter out duplicates
                    yahoo_matches.retain(|yahoo_match| {
                        !matches
                            .iter()
                            .any(|existing| existing.symbol == yahoo_match.symbol)
                    });
                    matches.extend(yahoo_matches);
                }
                Err(e) => {
                    warn!("Yahoo Finance search failed: {}", e);
                    // Continue with predefined matches only
                }
            }
        }

        // Sort by relevance: exact symbol matches first, then alphabetical
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

    /// Search symbols using Yahoo Finance search API
    async fn search_yahoo_symbols(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<SymbolSuggestion>, String> {
        let url = format!(
            "{}/v1/finance/search?q={}&quotesCount={}&newsCount=0",
            self.base_url,
            urlencoding::encode(query),
            limit
        );

        info!("Searching Yahoo Finance for: {}", query);

        if self.enable_request_logging {
            info!("=== API REQUEST ===");
            info!("URL: {}", url);
            info!("Method: GET");
            info!("API: Yahoo Finance Search");
            info!("Query: {}", query);
            info!("==================");
        }

        let response = self.client
            .get(&url)
            .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
            .header("Accept", "application/json")
            .header("Accept-Language", "en-US,en;q=0.9")
            .send()
            .await
            .map_err(|e| {
                error!("Yahoo Finance search request failed: {}", e);
                format!("Request failed: {}", e)
            })?;

        let response_status = response.status();
        let response_text = response.text().await.map_err(|e| {
            error!("Failed to read Yahoo Finance search response: {}", e);
            format!("Failed to read response text: {}", e)
        })?;

        if self.enable_response_logging {
            info!("=== API RESPONSE ===");
            info!("Query: {}", query);
            info!("Status: {}", response_status);
            info!("Response body: {}", response_text);
            info!("===================");
        }

        // Check if response is HTML (indicates blocking or wrong endpoint)
        if response_text.trim_start().starts_with("<!DOCTYPE")
            || response_text.trim_start().starts_with("<html")
        {
            error!(
                "Received HTML response instead of JSON for search query: {}",
                query
            );
            return Err(
                "API returned HTML instead of JSON - possible rate limiting or blocking"
                    .to_string(),
            );
        }

        let data: YahooV1SearchResponse = serde_json::from_str(&response_text).map_err(|e| {
            error!("Failed to parse Yahoo Finance search response: {}", e);
            warn!("Raw response that failed to parse: {}", response_text);
            format!("Failed to parse JSON: {}", e)
        })?;

        let suggestions: Vec<SymbolSuggestion> = data
            .quotes
            .into_iter()
            .filter(|quote| quote.quote_type == "EQUITY" || quote.quote_type == "ETF") // Only stocks and ETFs
            .map(|quote| SymbolSuggestion {
                symbol: quote.symbol,
                name: quote
                    .longname
                    .or(quote.shortname)
                    .unwrap_or_else(|| "Unknown".to_string()),
                exchange: quote.exch_disp,
                asset_type: quote.type_disp,
            })
            .collect();

        info!("Found {} suggestions from Yahoo Finance", suggestions.len());
        Ok(suggestions)
    }
}
