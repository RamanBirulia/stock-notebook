use crate::models::{
    PricePoint, StockSymbol, SymbolSuggestion, YahooFinanceResponse, YahooV1SearchResponse,
};
use reqwest::Client;
use rust_decimal::Decimal;

#[derive(Clone)]
pub struct YahooFinanceClient {
    client: Client,
    base_url: String,
}

impl YahooFinanceClient {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://query1.finance.yahoo.com".to_string(),
        }
    }

    pub async fn fetch_current_price(&self, symbol: &str) -> Result<Decimal, String> {
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

    pub async fn fetch_chart_data(
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

            Ok(price_points)
        } else {
            Err(format!(
                "No chart data found for symbol {} with period {}",
                symbol, period
            ))
        }
    }

    pub async fn fetch_symbols(&self) -> Result<Vec<StockSymbol>, String> {
        // For now, return a hardcoded list of popular symbols
        // In a real implementation, this could fetch from Yahoo Finance screener API
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

impl Default for YahooFinanceClient {
    fn default() -> Self {
        Self::new()
    }
}
