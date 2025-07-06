use crate::models::CreateStockDataRequest;
use crate::stock_data_service::StockDataService;
use chrono::{Datelike, Duration, Utc};
use rand::Rng;
use rust_decimal::prelude::ToPrimitive;
use rust_decimal::Decimal;
use sqlx::PgPool;
use std::str::FromStr;

pub struct DatabaseSeeder {
    stock_data_service: StockDataService,
}

impl DatabaseSeeder {
    pub fn new(db: PgPool) -> Self {
        Self {
            stock_data_service: StockDataService::new(db),
        }
    }

    pub async fn seed_stock_data(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("🌱 Starting database seeding with fake stock data...");

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
            println!("📊 Generating data for {}...", stock.symbol);

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

        println!("🎉 Database seeding completed successfully!");
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

    async fn print_seeding_summary(&self) -> Result<(), Box<dyn std::error::Error>> {
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

        Ok(())
    }

    pub async fn clear_fake_data(&self) -> Result<(), Box<dyn std::error::Error>> {
        println!("🧹 Clearing fake stock data...");

        let symbols = ["AAPL", "MSFT", "GOOGL"];

        for symbol in symbols {
            // Delete all data for this symbol
            let deleted = self.stock_data_service.cleanup_old_data(0).await?;
            println!("🗑️  Deleted {} records for {}", deleted, symbol);
        }

        println!("✅ Fake data cleared successfully!");
        Ok(())
    }
}

struct StockConfig {
    symbol: String,
    name: String,
    base_price: Decimal,
    volatility: f64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::PgPool;

    async fn setup_test_db() -> PgPool {
        let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| {
            "postgresql://stock_user:stock_password@localhost:5432/stock_notebook".to_string()
        });

        let pool = PgPool::connect(&database_url).await.unwrap();
        sqlx::migrate!("./migrations").run(&pool).await.unwrap();
        pool
    }

    #[tokio::test]
    async fn test_seed_stock_data() {
        let pool = setup_test_db().await;
        let seeder = DatabaseSeeder::new(pool);

        // Test seeding
        let result = seeder.seed_stock_data().await;
        assert!(result.is_ok());

        // Verify data was created
        let symbols = seeder
            .stock_data_service
            .get_symbols_with_data()
            .await
            .unwrap();
        assert!(symbols.contains(&"AAPL".to_string()));
        assert!(symbols.contains(&"MSFT".to_string()));
        assert!(symbols.contains(&"GOOGL".to_string()));

        // Verify we have recent data
        let aapl_data = seeder
            .stock_data_service
            .get_latest_stock_data("AAPL")
            .await
            .unwrap();
        assert!(aapl_data.is_some());

        // Clean up
        let _ = seeder.clear_fake_data().await;
    }

    #[tokio::test]
    async fn test_generate_stock_data_for_period() {
        let pool = setup_test_db().await;
        let seeder = DatabaseSeeder::new(pool);

        let stock = StockConfig {
            symbol: "TEST".to_string(),
            name: "Test Stock".to_string(),
            base_price: Decimal::from_str("100.00").unwrap(),
            volatility: 0.02,
        };

        let start_date = Utc::now().date_naive() - Duration::days(30);
        let end_date = Utc::now().date_naive();

        let data = seeder.generate_stock_data_for_period(&stock, start_date, end_date);

        // Should have data for weekdays only (approximately 22 days in a month)
        assert!(data.len() > 15);
        assert!(data.len() < 25);

        // Verify all data is for the TEST symbol
        for record in &data {
            assert_eq!(record.symbol, "TEST");
            assert!(record.price > Decimal::ZERO);
            assert!(record.volume.is_some());
        }
    }
}
