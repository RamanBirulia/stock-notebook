#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing for logging
    tracing_subscriber::fmt::init();

    // Load environment variables
    dotenvy::dotenv().ok();

    // Create a stock API client
    let stock_client = stock_tracker_backend::stock_api::StockApiClient::new();

    println!("Testing Symbol Search Functionality");
    println!("===================================");

    // Test 1: Search for Apple
    println!("\n1. Searching for 'AAPL':");
    match stock_client.search_symbols("AAPL", 5).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error: {}", e),
    }

    // Test 2: Search for Microsoft
    println!("\n2. Searching for 'MSFT':");
    match stock_client.search_symbols("MSFT", 5).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error: {}", e),
    }

    // Test 3: Search by company name
    println!("\n3. Searching for 'Tesla':");
    match stock_client.search_symbols("Tesla", 5).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error: {}", e),
    }

    // Test 4: Get cache statistics
    println!("\n4. Cache Statistics:");
    let (price_count, chart_count, symbol_count) = stock_client.get_cache_stats();
    println!("  Price cache entries: {}", price_count);
    println!("  Chart cache entries: {}", chart_count);
    println!("  Symbol cache entries: {}", symbol_count);

    // Test 5: Test with partial match
    println!("\n5. Searching for 'Apple' (partial name match):");
    match stock_client.search_symbols("Apple", 3).await {
        Ok(suggestions) => {
            for suggestion in suggestions {
                println!(
                    "  {} - {} ({}, {})",
                    suggestion.symbol, suggestion.name, suggestion.exchange, suggestion.asset_type
                );
            }
        }
        Err(e) => println!("  Error: {}", e),
    }

    println!("\nTest completed!");
    Ok(())
}
