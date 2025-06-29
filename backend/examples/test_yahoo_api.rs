#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing for logging
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Create a stock API client
    let stock_client = stock_tracker_backend::stock_api::StockApiClient::new();

    println!("Testing Yahoo Finance API Integration");
    println!("====================================");

    // Test 1: Get current price for Apple
    println!("\n1. Getting current price for AAPL:");
    match stock_client.get_current_price("AAPL").await {
        Ok(price) => println!("  AAPL current price: ${}", price),
        Err(e) => println!("  Error getting AAPL price: {}", e),
    }

    // Test 2: Get current price for Microsoft
    println!("\n2. Getting current price for MSFT:");
    match stock_client.get_current_price("MSFT").await {
        Ok(price) => println!("  MSFT current price: ${}", price),
        Err(e) => println!("  Error getting MSFT price: {}", e),
    }

    // Test 3: Get chart data for Tesla (1 month)
    println!("\n3. Getting 1M chart data for TSLA:");
    match stock_client.get_chart_data("TSLA", "1M").await {
        Ok(chart_data) => {
            println!("  TSLA chart data points: {}", chart_data.len());
            if let (Some(first), Some(last)) = (chart_data.first(), chart_data.last()) {
                println!("  Date range: {} to {}", first.date, last.date);
                println!("  First price: ${}", first.price);
                println!("  Last price: ${}", last.price);
            }
        }
        Err(e) => println!("  Error getting TSLA chart data: {}", e),
    }

    // Test 4: Get chart data for Google (1 year)
    println!("\n4. Getting 1Y chart data for GOOGL:");
    match stock_client.get_chart_data("GOOGL", "1Y").await {
        Ok(chart_data) => {
            println!("  GOOGL chart data points: {}", chart_data.len());
            if let (Some(first), Some(last)) = (chart_data.first(), chart_data.last()) {
                println!("  Date range: {} to {}", first.date, last.date);
                println!("  First price: ${}", first.price);
                println!("  Last price: ${}", last.price);
            }
        }
        Err(e) => println!("  Error getting GOOGL chart data: {}", e),
    }

    // Test 5: Search for symbols using Yahoo Finance
    println!("\n5. Searching for 'Netflix' using Yahoo Finance:");
    match stock_client.search_symbols("Netflix", 5).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error searching for Netflix: {}", e),
    }

    // Test 6: Search for symbols with partial match
    println!("\n6. Searching for 'AMD':");
    match stock_client.search_symbols("AMD", 3).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error searching for AMD: {}", e),
    }

    // Test 7: Test cache functionality
    println!("\n7. Testing cache functionality:");

    // First call should hit the API
    let start = std::time::Instant::now();
    match stock_client.get_current_price("NVDA").await {
        Ok(price1) => {
            let duration1 = start.elapsed();
            println!(
                "  First NVDA price call: ${} (took {:?})",
                price1, duration1
            );

            // Second call should hit the cache
            let start2 = std::time::Instant::now();
            match stock_client.get_current_price("NVDA").await {
                Ok(price2) => {
                    let duration2 = start2.elapsed();
                    println!(
                        "  Second NVDA price call: ${} (took {:?})",
                        price2, duration2
                    );
                    println!("  Cache working: {}", duration2 < duration1);
                }
                Err(e) => println!("  Error on second NVDA call: {}", e),
            }
        }
        Err(e) => println!("  Error on first NVDA call: {}", e),
    }

    // Test 8: Cache statistics
    println!("\n8. Final cache statistics:");
    let (price_count, chart_count, symbol_count) = stock_client.get_cache_stats();
    println!("  Price cache entries: {}", price_count);
    println!("  Chart cache entries: {}", chart_count);
    println!("  Symbol cache entries: {}", symbol_count);

    // Test 9: Error handling with invalid symbol
    println!("\n9. Testing error handling with invalid symbol:");
    match stock_client.get_current_price("INVALID_SYMBOL_12345").await {
        Ok(price) => println!("  Unexpected success: ${}", price),
        Err(e) => println!("  Expected error for invalid symbol: {}", e),
    }

    // Test 10: Different chart periods
    println!("\n10. Testing different chart periods for SPY:");
    let periods = vec!["1M", "1Y", "5Y"];

    for period in periods {
        match stock_client.get_chart_data("SPY", period).await {
            Ok(chart_data) => {
                println!("  SPY {} period: {} data points", period, chart_data.len());
                if let (Some(first), Some(last)) = (chart_data.first(), chart_data.last()) {
                    println!("    Range: {} to {}", first.date, last.date);
                }
            }
            Err(e) => println!("  Error getting SPY {} data: {}", period, e),
        }
    }

    println!("\nYahoo Finance API integration test completed!");
    println!("If you see prices and chart data above, the migration was successful!");

    Ok(())
}
