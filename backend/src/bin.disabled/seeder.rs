use chrono::{Datelike, Duration, Utc};
use rand::Rng;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use sqlx::postgres::PgPool;
use std::env;
use std::error::Error;
use std::str::FromStr;
use stock_tracker_backend::models::CreateStockDataRequest;
use stock_tracker_backend::stock_data_service::StockDataService;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    println!("🌱 Stock Notebook Database Seeder");
    println!("==================================\n");

    // Parse command line arguments
    let args: Vec<String> = env::args().collect();
    let command = args.get(1).map(|s| s.as_str()).unwrap_or("seed");

    match command {
        "seed" => seed_database().await?,
        "clear" => clear_database().await?,
        "help" | "-h" | "--help" => print_help(),
        _ => {
            println!("❌ Unknown command: {}", command);
            print_help();
            std::process::exit(1);
        }
    }

    Ok(())
}

async fn seed_database() -> Result<(), Box<dyn Error>> {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgresql://stock_user:stock_password@localhost:5432/stock_notebook".to_string()
    });

    println!("🔌 Connecting to database...");
    let pool = PgPool::connect(&database_url).await?;

    println!("🔄 Running migrations...");
    sqlx::migrate!("./migrations").run(&pool).await?;

    let seeder = DatabaseSeeder::new(pool);

    println!("🌱 Starting database seeding...");
    seeder.seed_stock_data().await?;

    Ok(())
}

async fn clear_database() -> Result<(), Box<dyn Error>> {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgresql://stock_user:stock_password@localhost:5432/stock_notebook".to_string()
    });

    println!("🔌 Connecting to database...");
    let pool = PgPool::connect(&database_url).await?;

    let seeder = DatabaseSeeder::new(pool);

    println!("🧹 Clearing fake stock data...");
    seeder.clear_fake_data().await?;

    Ok(())
}

fn print_help() {
    println!("Stock Notebook Database Seeder");
    println!("Usage: cargo run --bin seeder [COMMAND]");
    println!();
    println!("Commands:");
    println!("  seed    Populate database with fake stock data (default)");
    println!("  clear   Clear all fake stock data");
    println!("  help    Show this help message");
    println!();
    println!("Environment Variables:");
    println!("  DATABASE_URL    PostgreSQL connection string");
    println!("                  (default: postgresql://stock_user:stock_password@localhost:5432/stock_notebook)");
    println!();
    println!("Examples:");
    println!("  cargo run --bin seeder");
    println!("  cargo run --bin seeder seed");
    println!("  cargo run --bin seeder clear");
    println!("  DATABASE_URL=postgresql://user:pass@localhost/db cargo run --bin seeder");
}

struct DatabaseSeeder {
    stock_data_service: StockDataService,
}

impl DatabaseSeeder {
    fn new(db: PgPool) -> Self {
        Self {
            stock_data_service: StockDataService::new(db),
        }
    }

    async fn seed_stock_data(&self) -> Result<(), Box<dyn Error>> {
        println!("📊 Generating fake stock data for AAPL, MSFT, and GOOGL...");

        // Define the stocks to seed
        let stocks = vec![
            StockConfig {
                symbol: "AAPL".to_string(),
                name: "Apple Inc.".to_string(),
                base_price: Decimal::from_str("150.00").unwrap(),
                volatility: 0.02, // 2% daily volatility
            },
            StockConfig {
                symbol: "MSFT".to_string(),
                name: "Microsoft Corporation".to_string(),
                base_price: Decimal::from_str("300.00").unwrap(),
                volatility: 0.015, // 1.5% daily volatility
            },
            StockConfig {
                symbol: "GOOGL".to_string(),
                name: "Alphabet Inc.".to_string(),
                base_price: Decimal::from_str("2500.00").unwrap(),
                volatility: 0.025, // 2.5% daily volatility
            },
        ];

        // Generate data for the last 365 days
        let days_to_generate = 365;
        let end_date = Utc::now().date_naive();
        let start_date = end_date - Duration::days(days_to_generate);

        for stock in stocks {
            println!("📈 Generating data for {}...", stock.symbol);

            let stock_data = self.generate_stock_data_for_period(&stock, start_date, end_date);

            println!(
                "💾 Inserting {} records for {}...",
                stock_data.len(),
                stock.symbol
            );

            match self
                .stock_data_service
                .bulk_insert_stock_data(stock_data)
                .await
            {
                Ok(_) => println!("✅ Successfully seeded data for {}", stock.symbol),
                Err(e) => {
                    println!("❌ Failed to seed data for {}: {}", stock.symbol, e);
                    return Err(Box::new(e));
                }
            }
        }

        println!("\n🎉 Database seeding completed successfully!");
        self.print_seeding_summary().await?;

        Ok(())
    }

    fn generate_stock_data_for_period(
        &self,
        stock: &StockConfig,
        start_date: chrono::NaiveDate,
        end_date: chrono::NaiveDate,
    ) -> Vec<CreateStockDataRequest> {
        let mut stock_data = Vec::new();
        let mut rng = rand::thread_rng();
        let mut current_price = stock.base_price;
        let mut current_date = start_date;

        while current_date <= end_date {
            // Skip weekends (Saturday = 6, Sunday = 0)
            let weekday = current_date.weekday().num_days_from_monday();
            if weekday < 5 {
                // Generate price movement using random walk with mean reversion
                let random_change = rng.gen_range(-1.0..1.0);
                let price_change_percent = random_change * stock.volatility;

                // Add some mean reversion tendency
                let distance_from_base = (current_price - stock.base_price) / stock.base_price;
                let mean_reversion = -distance_from_base.to_f64().unwrap_or(0.0) * 0.1;

                let total_change = price_change_percent + mean_reversion;
                let price_change =
                    current_price * Decimal::from_f64_retain(total_change).unwrap_or(Decimal::ZERO);

                current_price += price_change;

                // Ensure price doesn't go below $1
                if current_price < Decimal::from_str("1.00").unwrap() {
                    current_price = Decimal::from_str("1.00").unwrap();
                }

                // Generate realistic volume (between 10M and 100M for these major stocks)
                let base_volume = match stock.symbol.as_str() {
                    "AAPL" => 50_000_000,
                    "MSFT" => 30_000_000,
                    "GOOGL" => 25_000_000,
                    _ => 20_000_000,
                };

                let volume_multiplier = rng.gen_range(0.5..2.0);
                let volume = (base_volume as f64 * volume_multiplier) as i64;

                stock_data.push(CreateStockDataRequest {
                    symbol: stock.symbol.clone(),
                    price: current_price,
                    volume: Some(volume),
                    data_date: current_date.to_string(),
                });
            }

            current_date += Duration::days(1);
        }

        stock_data
    }

    async fn print_seeding_summary(&self) -> Result<(), Box<dyn Error>> {
        println!("\n📈 Seeding Summary:");
        println!("==================");

        let symbols = self.stock_data_service.get_symbols_with_data().await?;

        for symbol in symbols {
            if ["AAPL", "MSFT", "GOOGL"].contains(&symbol.as_str()) {
                let latest_data = self
                    .stock_data_service
                    .get_latest_stock_data(&symbol)
                    .await?;

                if let Some(data) = latest_data {
                    println!(
                        "📊 {}: Latest Price = ${}, Date = {}",
                        symbol, data.price, data.data_date
                    );

                    // Get data range
                    let latest_date = self
                        .stock_data_service
                        .get_latest_data_date(&symbol)
                        .await?;
                    if let Some(date) = latest_date {
                        let start_date =
                            (Utc::now().date_naive() - Duration::days(365)).to_string();
                        let data_range = self
                            .stock_data_service
                            .get_stock_data_range(&symbol, &start_date, &date)
                            .await?;

                        println!(
                            "   📅 Records: {} (from {} to {})",
                            data_range.len(),
                            start_date,
                            date
                        );
                    }
                }
            }
        }

        println!("\n✨ Fake data generation complete!");
        println!("💡 You can now test the frontend without making Yahoo Finance API calls.");
        println!("🔧 The data includes realistic price movements and volumes for:");
        println!("   • AAPL: ~$150 base price with 2% volatility");
        println!("   • MSFT: ~$300 base price with 1.5% volatility");
        println!("   • GOOGL: ~$2500 base price with 2.5% volatility");
        println!("📊 Data covers the last 365 days (weekdays only)");
        println!("\n🚀 Ready to test your frontend!");

        Ok(())
    }

    async fn clear_fake_data(&self) -> Result<(), Box<dyn Error>> {
        println!("🧹 Clearing all stock data...");

        let deleted = self.stock_data_service.cleanup_old_data(0).await?;
        println!("🗑️  Deleted {} records", deleted);

        println!("✅ All fake data cleared successfully!");
        Ok(())
    }
}

struct StockConfig {
    symbol: String,
    name: String,
    base_price: Decimal,
    volatility: f64,
}
