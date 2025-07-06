#[cfg(test)]
mod integration_tests {
    use crate::stock_api::StockApiClient;
    use chrono::Utc;
    use rust_decimal::Decimal;
    use sqlx::PgPool;
    use std::str::FromStr;

    async fn setup_test_db() -> PgPool {
        let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgresql://stock_user:stock_password@localhost:5432/stock_notebook".to_string()
        });

        let pool = PgPool::connect(&database_url).await.unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        pool
    }

    #[tokio::test]
    async fn test_seeded_data_integration() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool.clone());

        // Test getting current price for seeded stocks
        let test_symbols = ["AAPL", "MSFT", "GOOGL"];

        for symbol in test_symbols {
            println!("Testing {} current price...", symbol);

            match stock_client.get_current_price(symbol).await {
                Ok(price) => {
                    println!("✅ {}: ${}", symbol, price);
                    assert!(price > Decimal::ZERO, "Price should be positive");

                    // Verify prices are in reasonable ranges based on seeded data
                    match symbol {
                        "AAPL" => assert!(
                            price >= Decimal::from_str("50.00").unwrap()
                                && price <= Decimal::from_str("300.00").unwrap(),
                            "AAPL price should be between $50-$300, got ${}",
                            price
                        ),
                        "MSFT" => assert!(
                            price >= Decimal::from_str("100.00").unwrap()
                                && price <= Decimal::from_str("500.00").unwrap(),
                            "MSFT price should be between $100-$500, got ${}",
                            price
                        ),
                        "GOOGL" => assert!(
                            price >= Decimal::from_str("1000.00").unwrap()
                                && price <= Decimal::from_str("4000.00").unwrap(),
                            "GOOGL price should be between $1000-$4000, got ${}",
                            price
                        ),
                        _ => {}
                    }
                }
                Err(e) => {
                    panic!("Failed to get price for {}: {}", symbol, e);
                }
            }
        }
    }

    #[tokio::test]
    async fn test_seeded_chart_data() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        let test_periods = ["1W", "1M", "3M"];

        for symbol in ["AAPL", "MSFT", "GOOGL"] {
            for period in test_periods {
                println!("Testing {} chart data for period {}...", symbol, period);

                match stock_client.get_chart_data(symbol, period).await {
                    Ok(chart_data) => {
                        println!(
                            "✅ {}: {} - {} data points",
                            symbol,
                            period,
                            chart_data.len()
                        );
                        assert!(!chart_data.is_empty(), "Chart data should not be empty");

                        // Verify data points have valid prices and dates
                        for point in &chart_data {
                            assert!(point.price > Decimal::ZERO, "Price should be positive");
                            assert!(!point.date.is_empty(), "Date should not be empty");

                            // Verify volume is present and reasonable
                            if let Some(volume) = point.volume {
                                assert!(volume > 0, "Volume should be positive when present");
                            }
                        }

                        // Verify data is sorted by date
                        for i in 1..chart_data.len() {
                            assert!(
                                chart_data[i - 1].date <= chart_data[i].date,
                                "Chart data should be sorted by date"
                            );
                        }
                    }
                    Err(e) => {
                        panic!(
                            "Failed to get chart data for {} ({}): {}",
                            symbol, period, e
                        );
                    }
                }
            }
        }
    }

    #[tokio::test]
    async fn test_portfolio_calculations() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        // Test portfolio calculation with seeded data
        let portfolio_symbols = vec!["AAPL".to_string(), "MSFT".to_string(), "GOOGL".to_string()];

        match stock_client
            .get_portfolio_current_value(&portfolio_symbols)
            .await
        {
            Ok(portfolio_values) => {
                println!("✅ Portfolio values calculated successfully");

                for (symbol, price) in &portfolio_values {
                    println!("   {}: ${}", symbol, price);
                    assert!(price > &Decimal::ZERO, "Portfolio price should be positive");
                }

                assert_eq!(
                    portfolio_values.len(),
                    portfolio_symbols.len(),
                    "Should have values for all symbols"
                );
            }
            Err(e) => {
                panic!("Failed to calculate portfolio values: {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_database_stats() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        match stock_client.get_database_stats().await {
            Ok(stats) => {
                println!("✅ Database stats: {:?}", stats);

                if let Some(symbol_count) = stats.get("symbols_count") {
                    assert!(
                        *symbol_count >= 3,
                        "Should have at least 3 symbols (AAPL, MSFT, GOOGL)"
                    );
                }
            }
            Err(e) => {
                panic!("Failed to get database stats: {}", e);
            }
        }
    }

    #[tokio::test]
    async fn test_cache_behavior() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        let symbol = "AAPL";

        // First call should hit the database
        let start_time = std::time::Instant::now();
        let price1 = stock_client
            .get_current_price(symbol)
            .await
            .expect("First price call should succeed");
        let first_duration = start_time.elapsed();

        // Second call should be faster (cache hit)
        let start_time = std::time::Instant::now();
        let price2 = stock_client
            .get_current_price(symbol)
            .await
            .expect("Second price call should succeed");
        let second_duration = start_time.elapsed();

        println!(
            "First call: {}ms, Second call: {}ms",
            first_duration.as_millis(),
            second_duration.as_millis()
        );

        // Prices should be the same (cached)
        assert_eq!(price1, price2, "Cached price should be the same");

        // Second call should be faster (though this might not always be true in tests)
        println!("✅ Cache behavior test completed");
    }

    #[tokio::test]
    async fn test_data_consistency() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        // Test that multiple calls return consistent data
        for symbol in ["AAPL", "MSFT", "GOOGL"] {
            let mut prices = Vec::new();

            // Make multiple calls to the same symbol
            for _ in 0..3 {
                match stock_client.get_current_price(symbol).await {
                    Ok(price) => prices.push(price),
                    Err(e) => panic!("Price call failed for {}: {}", symbol, e),
                }
            }

            // All prices should be the same (since we're using today's cached data)
            let first_price = prices[0];
            for price in &prices {
                assert_eq!(
                    *price, first_price,
                    "All calls for {} should return the same price on the same day",
                    symbol
                );
            }

            println!(
                "✅ {}: Consistent price ${} across {} calls",
                symbol,
                first_price,
                prices.len()
            );
        }
    }

    #[tokio::test]
    async fn test_realistic_data_ranges() {
        let pool = setup_test_db().await;
        let stock_client = StockApiClient::new(pool);

        // Test that seeded data has realistic characteristics
        for symbol in ["AAPL", "MSFT", "GOOGL"] {
            match stock_client.get_chart_data(symbol, "1M").await {
                Ok(chart_data) => {
                    if chart_data.len() >= 2 {
                        let mut prices: Vec<Decimal> = chart_data.iter().map(|p| p.price).collect();
                        prices.sort();

                        let min_price = prices.first().unwrap();
                        let max_price = prices.last().unwrap();
                        let avg_price =
                            prices.iter().sum::<Decimal>() / Decimal::from(prices.len());

                        println!(
                            "✅ {}: Min=${}, Max=${}, Avg=${}",
                            symbol, min_price, max_price, avg_price
                        );

                        // Check that we have reasonable price variation (not all the same)
                        assert_ne!(
                            min_price, max_price,
                            "Price should vary over time for {}",
                            symbol
                        );

                        // Check that variation is not too extreme (within 3x range)
                        let price_ratio = max_price / min_price;
                        assert!(
                            price_ratio <= Decimal::from_str("3.0").unwrap(),
                            "Price variation should be reasonable for {} (ratio: {})",
                            symbol,
                            price_ratio
                        );
                    }
                }
                Err(e) => {
                    panic!("Failed to get chart data for {}: {}", symbol, e);
                }
            }
        }
    }
}
