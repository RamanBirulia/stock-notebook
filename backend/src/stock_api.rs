use reqwest::Client;
use rust_decimal::Decimal;

use chrono;
use std::collections::HashMap;

use std::sync::{Arc, Mutex};

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
        now.signed_duration_since(self.timestamp).num_hours() >= 24
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
}

impl StockApiClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://query1.finance.yahoo.com".to_string(),
            price_cache: Arc::new(Mutex::new(HashMap::new())),
            chart_cache: Arc::new(Mutex::new(HashMap::new())),
            symbol_cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn get_current_price(&self, symbol: &str) -> Result<Decimal, String> {
        let cache_key = format!("price_{}", symbol.to_uppercase());

        if let Ok(cache) = self.price_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    return Ok(cached_item.data);
                }
            }
        }

        let price = self.fetch_current_price_from_api(symbol).await?;

        if let Ok(mut cache) = self.price_cache.lock() {
            cache.insert(cache_key, CacheItem::new(price));
        }

        Ok(price)
    }

    async fn fetch_current_price_from_api(&self, symbol: &str) -> Result<Decimal, String> {
        let url = format!(
            "{}/v8/finance/chart/{}?interval=1m&range=1d",
            self.base_url,
            symbol.to_uppercase()
        );

        let response = match self.client.get(&url).send().await {
            Ok(response) => response,
            Err(e) => {
                return Err(format!("Request failed for symbol {}: {}", symbol, e));
            }
        };

        let response_status = response.status();

        let response_text = match response.text().await {
            Ok(text) => text,
            Err(e) => {
                return Err(format!(
                    "Failed to read response text for symbol {}: {}",
                    symbol, e
                ));
            }
        };

        if !response_status.is_success() {
            return Err(format!(
                "Yahoo Finance API returned error for symbol {}: HTTP {} - {}",
                symbol, response_status, response_text
            ));
        }

        let yahoo_response: YahooFinanceResponse = match serde_json::from_str(&response_text) {
            Ok(response) => response,
            Err(e) => {
                return Err(format!("Failed to parse JSON for symbol {}: {}", symbol, e));
            }
        };

        if let Some(result) = yahoo_response.chart.result.and_then(|mut r| r.pop()) {
            let price = result.meta.regular_market_price;
            Ok(Decimal::from_f64_retain(price).unwrap_or(Decimal::ZERO))
        } else {
            Err(format!("No current price data found for symbol {}", symbol))
        }
    }

    pub async fn get_chart_data(
        &self,
        symbol: &str,
        period: &str,
    ) -> Result<Vec<PricePoint>, String> {
        let cache_key = format!("chart_{}_{}", symbol.to_uppercase(), period);

        if let Ok(cache) = self.chart_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    return Ok(cached_item.data.clone());
                }
            }
        }

        let chart_data = self.fetch_chart_data_from_api(symbol, period).await?;

        if let Ok(mut cache) = self.chart_cache.lock() {
            cache.insert(cache_key, CacheItem::new(chart_data.clone()));
        }

        Ok(chart_data)
    }

    async fn fetch_chart_data_from_api(
        &self,
        symbol: &str,
        period: &str,
    ) -> Result<Vec<PricePoint>, String> {
        let (range, interval) = match period {
            "1D" => ("1d", "5m"),
            "1W" => ("5d", "15m"),
            "1M" => ("1mo", "1d"),
            "3M" => ("3mo", "1d"),
            "6M" => ("6mo", "1d"),
            "1Y" => ("1y", "1d"),
            "2Y" => ("2y", "1wk"),
            "5Y" => ("5y", "1wk"),
            "10Y" => ("10y", "1mo"),
            "MAX" => ("max", "1mo"),
            _ => ("1mo", "1d"),
        };

        let url = format!(
            "{}/v8/finance/chart/{}?interval={}&range={}",
            self.base_url,
            symbol.to_uppercase(),
            interval,
            range
        );

        let response = match self.client.get(&url).send().await {
            Ok(response) => response,
            Err(e) => {
                return Err(format!(
                    "Request failed for symbol {} with period {}: {}",
                    symbol, period, e
                ));
            }
        };

        let response_status = response.status();

        let response_text = match response.text().await {
            Ok(text) => text,
            Err(e) => {
                return Err(format!(
                    "Failed to read response text for symbol {} with period {}: {}",
                    symbol, period, e
                ));
            }
        };

        if !response_status.is_success() {
            return Err(format!(
                "Yahoo Finance API returned error for symbol {} with period {}: HTTP {} - {}",
                symbol, period, response_status, response_text
            ));
        }

        let yahoo_response: YahooFinanceResponse = match serde_json::from_str(&response_text) {
            Ok(response) => response,
            Err(e) => {
                return Err(format!(
                    "Failed to parse JSON for symbol {} with period {}: {}",
                    symbol, period, e
                ));
            }
        };

        if let Some(result) = yahoo_response.chart.result.and_then(|mut r| r.pop()) {
            let timestamps = result.timestamp;
            let quote_data = result.indicators.quote.into_iter().next().unwrap();
            let closes = quote_data.close;
            let volumes = quote_data.volume;

            let mut price_points = Vec::new();

            for (i, &timestamp) in timestamps.iter().enumerate() {
                if let Some(close_price) = closes.get(i).and_then(|&p| p) {
                    let date = chrono::DateTime::from_timestamp(timestamp, 0)
                        .unwrap_or_else(chrono::Utc::now)
                        .format("%Y-%m-%d")
                        .to_string();

                    let volume = volumes.get(i).and_then(|&v| v);

                    price_points.push(PricePoint {
                        date,
                        price: Decimal::from_f64_retain(close_price).unwrap_or(Decimal::ZERO),
                        volume,
                    });
                }
            }

            let filtered_data = self.filter_data_by_period(price_points, period);
            Ok(filtered_data)
        } else {
            Err(format!(
                "No chart data found for symbol {} with period {}",
                symbol, period
            ))
        }
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
}

impl Default for StockApiClient {
    fn default() -> Self {
        Self::new()
    }
}

impl StockApiClient {
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

    pub async fn get_all_symbols(&self) -> Result<Vec<StockSymbol>, String> {
        let cache_key = "all_symbols".to_string();

        if let Ok(cache) = self.symbol_cache.lock() {
            if let Some(cached_item) = cache.get(&cache_key) {
                if !cached_item.is_expired() {
                    return Ok(cached_item.data.clone());
                }
            }
        }

        let symbols = self.fetch_symbols_from_api().await?;

        if let Ok(mut cache) = self.symbol_cache.lock() {
            cache.insert(cache_key, CacheItem::new(symbols.clone()));
        }

        Ok(symbols)
    }

    async fn fetch_symbols_from_api(&self) -> Result<Vec<StockSymbol>, String> {
        let symbols = vec![
            StockSymbol {
                symbol: "AAPL".to_string(),
                name: "Apple Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1980-12-12".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "GOOGL".to_string(),
                name: "Alphabet Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "2004-08-19".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "MSFT".to_string(),
                name: "Microsoft Corporation".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1986-03-13".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "AMZN".to_string(),
                name: "Amazon.com Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1997-05-15".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "TSLA".to_string(),
                name: "Tesla Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "2010-06-29".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "META".to_string(),
                name: "Meta Platforms Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "2012-05-18".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "NFLX".to_string(),
                name: "Netflix Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "2002-05-23".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "NVDA".to_string(),
                name: "NVIDIA Corporation".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1999-01-22".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "AMD".to_string(),
                name: "Advanced Micro Devices Inc.".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1972-09-27".to_string(),
                status: "Active".to_string(),
            },
            StockSymbol {
                symbol: "INTC".to_string(),
                name: "Intel Corporation".to_string(),
                exchange: "NASDAQ".to_string(),
                asset_type: "Equity".to_string(),
                ipo_date: "1971-10-13".to_string(),
                status: "Active".to_string(),
            },
        ];

        Ok(symbols)
    }

    pub async fn search_symbols(
        &self,
        query: &str,
        limit: usize,
    ) -> Result<Vec<SymbolSuggestion>, String> {
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

        if matches.len() < limit {
            match self
                .search_yahoo_symbols(query, limit - matches.len())
                .await
            {
                Ok(mut yahoo_matches) => {
                    yahoo_matches.retain(|yahoo_match| {
                        !matches
                            .iter()
                            .any(|existing| existing.symbol == yahoo_match.symbol)
                    });
                    matches.extend(yahoo_matches);
                }
                Err(_) => {
                    // Continue with predefined matches only
                }
            }
        }

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

        let response = match self.client.get(&url).send().await {
            Ok(response) => response,
            Err(e) => {
                return Err(format!("Yahoo Finance search request failed: {}", e));
            }
        };

        let response_status = response.status();

        let response_text = match response.text().await {
            Ok(text) => text,
            Err(e) => {
                return Err(format!(
                    "Failed to read Yahoo Finance search response: {}",
                    e
                ));
            }
        };

        if !response_status.is_success() {
            return Err(format!(
                "Yahoo Finance search API returned error: HTTP {} - {}",
                response_status, response_text
            ));
        }

        let yahoo_response: YahooV1SearchResponse = match serde_json::from_str(&response_text) {
            Ok(response) => response,
            Err(e) => {
                return Err(format!(
                    "Failed to parse Yahoo Finance search response: {}",
                    e
                ));
            }
        };

        let suggestions: Vec<SymbolSuggestion> = yahoo_response
            .quotes
            .into_iter()
            .filter_map(|quote| {
                if quote.quote_type == "EQUITY" {
                    Some(SymbolSuggestion {
                        symbol: quote.symbol,
                        name: quote.longname.or(quote.shortname).unwrap_or_default(),
                        exchange: quote.exch_disp,
                        asset_type: quote.type_disp,
                    })
                } else {
                    None
                }
            })
            .collect();

        Ok(suggestions)
    }
}
