use crate::models::{CreateStockDataRequest, StockData};
use chrono::{DateTime, NaiveDate, Utc};
use sqlx::PgPool;

pub struct StockDataService {
    db: PgPool,
}

impl StockDataService {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    /// Get the latest stock data for a symbol
    pub async fn get_latest_stock_data(
        &self,
        symbol: &str,
    ) -> Result<Option<StockData>, sqlx::Error> {
        let row = sqlx::query!(
            "SELECT id, symbol, price, volume, data_date, created_at, updated_at
             FROM stock_data
             WHERE symbol = $1
             ORDER BY data_date DESC
             LIMIT 1",
            symbol
        )
        .fetch_optional(&self.db)
        .await?;

        if let Some(row) = row {
            Ok(Some(StockData {
                id: row.id.to_string(),
                symbol: row.symbol,
                price: row.price,
                volume: row.volume,
                data_date: row.data_date.to_string(),
                created_at: row
                    .created_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
                updated_at: row
                    .updated_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
            }))
        } else {
            Ok(None)
        }
    }

    /// Get stock data for a specific date
    pub async fn get_stock_data_by_date(
        &self,
        symbol: &str,
        date: &str,
    ) -> Result<Option<StockData>, sqlx::Error> {
        let date_parsed = NaiveDate::parse_from_str(date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid date format".into()))?;

        let row = sqlx::query!(
            "SELECT id, symbol, price, volume, data_date, created_at, updated_at
             FROM stock_data
             WHERE symbol = $1 AND data_date = $2",
            symbol,
            date_parsed
        )
        .fetch_optional(&self.db)
        .await?;

        if let Some(row) = row {
            Ok(Some(StockData {
                id: row.id.to_string(),
                symbol: row.symbol,
                price: row.price,
                volume: row.volume,
                data_date: row.data_date.to_string(),
                created_at: row
                    .created_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
                updated_at: row
                    .updated_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
            }))
        } else {
            Ok(None)
        }
    }

    /// Get historical stock data for a symbol within a date range
    pub async fn get_stock_data_range(
        &self,
        symbol: &str,
        start_date: &str,
        end_date: &str,
    ) -> Result<Vec<StockData>, sqlx::Error> {
        let start_parsed = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid start date format".into()))?;
        let end_parsed = NaiveDate::parse_from_str(end_date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid end date format".into()))?;

        let rows = sqlx::query!(
            "SELECT id, symbol, price, volume, data_date, created_at, updated_at
             FROM stock_data
             WHERE symbol = $1 AND data_date >= $2 AND data_date <= $3
             ORDER BY data_date ASC",
            symbol,
            start_parsed,
            end_parsed
        )
        .fetch_all(&self.db)
        .await?;

        Ok(rows
            .into_iter()
            .map(|row| StockData {
                id: row.id.to_string(),
                symbol: row.symbol,
                price: row.price,
                volume: row.volume,
                data_date: row.data_date.to_string(),
                created_at: row
                    .created_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
                updated_at: row
                    .updated_at
                    .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                    .to_rfc3339(),
            })
            .collect())
    }

    /// Insert or update stock data for a specific date
    pub async fn upsert_stock_data(
        &self,
        data: &CreateStockDataRequest,
    ) -> Result<StockData, sqlx::Error> {
        let data_date = NaiveDate::parse_from_str(&data.data_date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid date format".into()))?;

        let row = sqlx::query!(
            "INSERT INTO stock_data (symbol, price, volume, data_date)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (symbol, data_date)
             DO UPDATE SET
                price = EXCLUDED.price,
                volume = EXCLUDED.volume,
                updated_at = CURRENT_TIMESTAMP
             RETURNING id, symbol, price, volume, data_date, created_at, updated_at",
            data.symbol,
            data.price,
            data.volume,
            data_date
        )
        .fetch_one(&self.db)
        .await?;

        Ok(StockData {
            id: row.id.to_string(),
            symbol: row.symbol,
            price: row.price,
            volume: row.volume,
            data_date: row.data_date.to_string(),
            created_at: row
                .created_at
                .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                .to_rfc3339(),
            updated_at: row
                .updated_at
                .unwrap_or_else(|| DateTime::from_timestamp(0, 0).unwrap())
                .to_rfc3339(),
        })
    }

    /// Bulk insert stock data (for historical data import)
    pub async fn bulk_insert_stock_data(
        &self,
        data_list: Vec<CreateStockDataRequest>,
    ) -> Result<Vec<StockData>, sqlx::Error> {
        let mut results = Vec::new();

        for data in data_list {
            let result = self.upsert_stock_data(&data).await?;
            results.push(result);
        }

        Ok(results)
    }

    /// Check if we have today's data for a symbol
    pub async fn has_today_data(&self, symbol: &str) -> Result<bool, sqlx::Error> {
        let today = Utc::now().date_naive();

        let count = sqlx::query!(
            "SELECT COUNT(*) as count FROM stock_data WHERE symbol = $1 AND data_date = $2",
            symbol,
            today
        )
        .fetch_one(&self.db)
        .await?;

        Ok(count.count.unwrap_or(0) > 0)
    }

    /// Get all unique symbols that have data
    pub async fn get_symbols_with_data(&self) -> Result<Vec<String>, sqlx::Error> {
        let rows = sqlx::query!("SELECT DISTINCT symbol FROM stock_data ORDER BY symbol")
            .fetch_all(&self.db)
            .await?;

        Ok(rows.into_iter().map(|row| row.symbol).collect())
    }

    /// Get the date of the latest data for a symbol
    pub async fn get_latest_data_date(&self, symbol: &str) -> Result<Option<String>, sqlx::Error> {
        let row = sqlx::query!(
            "SELECT data_date FROM stock_data WHERE symbol = $1 ORDER BY data_date DESC LIMIT 1",
            symbol
        )
        .fetch_optional(&self.db)
        .await?;

        Ok(row.map(|r| r.data_date.to_string()))
    }

    /// Delete old data (older than specified days)
    pub async fn cleanup_old_data(&self, days_to_keep: i64) -> Result<u64, sqlx::Error> {
        let cutoff_date = Utc::now().date_naive() - chrono::Duration::days(days_to_keep);

        let result = sqlx::query!("DELETE FROM stock_data WHERE data_date < $1", cutoff_date)
            .execute(&self.db)
            .await?;

        Ok(result.rows_affected())
    }

    /// Get missing dates for a symbol within a range
    pub async fn get_missing_dates(
        &self,
        symbol: &str,
        start_date: &str,
        end_date: &str,
    ) -> Result<Vec<String>, sqlx::Error> {
        let start_parsed = NaiveDate::parse_from_str(start_date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid start date format".into()))?;
        let end_parsed = NaiveDate::parse_from_str(end_date, "%Y-%m-%d")
            .map_err(|_| sqlx::Error::Decode("Invalid end date format".into()))?;

        // Generate all dates in the range
        let mut all_dates = Vec::new();
        let mut current_date = start_parsed;
        while current_date <= end_parsed {
            all_dates.push(current_date.to_string());
            current_date += chrono::Duration::days(1);
        }

        // Get existing dates from database
        let existing_dates: Vec<String> = sqlx::query!(
            "SELECT data_date FROM stock_data
             WHERE symbol = $1 AND data_date >= $2 AND data_date <= $3",
            symbol,
            start_parsed,
            end_parsed
        )
        .fetch_all(&self.db)
        .await?
        .into_iter()
        .map(|row| row.data_date.to_string())
        .collect();

        // Find missing dates
        let missing_dates: Vec<String> = all_dates
            .into_iter()
            .filter(|date| !existing_dates.contains(date))
            .collect();

        Ok(missing_dates)
    }
}
