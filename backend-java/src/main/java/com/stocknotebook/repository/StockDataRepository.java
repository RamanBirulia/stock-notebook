package com.stocknotebook.repository;

import com.stocknotebook.entity.StockData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockDataRepository extends JpaRepository<StockData, UUID> {

    /**
     * Find the latest stock data for a symbol
     *
     * @param symbol the stock symbol
     * @return Optional containing the latest stock data if found
     */
    @Query("SELECT s FROM StockData s WHERE s.symbol = :symbol ORDER BY s.dataDate DESC LIMIT 1")
    Optional<StockData> findLatestBySymbol(@Param("symbol") String symbol);

    /**
     * Find stock data by symbol and date
     *
     * @param symbol the stock symbol
     * @param date the data date
     * @return Optional containing the stock data if found
     */
    Optional<StockData> findBySymbolAndDataDate(String symbol, LocalDate date);

    /**
     * Find stock data for a symbol within a date range
     *
     * @param symbol the stock symbol
     * @param startDate the start date
     * @param endDate the end date
     * @return list of stock data ordered by date ascending
     */
    @Query("SELECT s FROM StockData s WHERE s.symbol = :symbol AND s.dataDate BETWEEN :startDate AND :endDate ORDER BY s.dataDate ASC")
    List<StockData> findBySymbolAndDateRange(@Param("symbol") String symbol,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    /**
     * Check if stock data exists for a symbol on a specific date
     *
     * @param symbol the stock symbol
     * @param date the data date
     * @return true if data exists, false otherwise
     */
    boolean existsBySymbolAndDataDate(String symbol, LocalDate date);

    /**
     * Get all unique symbols that have stock data
     *
     * @return list of unique stock symbols
     */
    @Query("SELECT DISTINCT s.symbol FROM StockData s ORDER BY s.symbol")
    List<String> findAllUniqueSymbols();

    /**
     * Find stock data for multiple symbols on a specific date
     *
     * @param symbols list of stock symbols
     * @param date the data date
     * @return list of stock data for the symbols on the specified date
     */
    @Query("SELECT s FROM StockData s WHERE s.symbol IN :symbols AND s.dataDate = :date")
    List<StockData> findBySymbolsAndDate(@Param("symbols") List<String> symbols, @Param("date") LocalDate date);

    /**
     * Get the latest data date for a symbol
     *
     * @param symbol the stock symbol
     * @return the latest data date if found
     */
    @Query("SELECT MAX(s.dataDate) FROM StockData s WHERE s.symbol = :symbol")
    Optional<LocalDate> findLatestDateBySymbol(@Param("symbol") String symbol);

    /**
     * Delete old stock data older than specified date
     *
     * @param cutoffDate the date before which data should be deleted
     * @return number of records deleted
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM StockData s WHERE s.dataDate < :cutoffDate")
    int deleteByDataDateBefore(@Param("cutoffDate") LocalDate cutoffDate);

    /**
     * Delete all stock data for a specific symbol
     *
     * @param symbol the stock symbol
     * @return number of records deleted
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM StockData s WHERE s.symbol = :symbol")
    int deleteBySymbol(@Param("symbol") String symbol);

    /**
     * Count total number of stock data records
     *
     * @return total number of records
     */
    @Query("SELECT COUNT(s) FROM StockData s")
    long countAllRecords();

    /**
     * Count stock data records for a specific symbol
     *
     * @param symbol the stock symbol
     * @return number of records for the symbol
     */
    @Query("SELECT COUNT(s) FROM StockData s WHERE s.symbol = :symbol")
    long countBySymbol(@Param("symbol") String symbol);

    /**
     * Find stock data records that need updating (older than specified date)
     *
     * @param cutoffDate the date to compare against
     * @return list of symbols that need updating
     */
    @Query("SELECT DISTINCT s.symbol FROM StockData s WHERE s.symbol NOT IN (SELECT DISTINCT s2.symbol FROM StockData s2 WHERE s2.dataDate >= :cutoffDate)")
    List<String> findSymbolsNeedingUpdate(@Param("cutoffDate") LocalDate cutoffDate);

    /**
     * Get stock data statistics
     *
     * @return array containing [total_records, unique_symbols, date_range_start, date_range_end]
     */
    @Query(value = """
        SELECT
            COUNT(*) as total_records,
            COUNT(DISTINCT symbol) as unique_symbols,
            MIN(data_date) as date_range_start,
            MAX(data_date) as date_range_end
        FROM stock_data
        """, nativeQuery = true)
    Object[] getStockDataStatistics();

    /**
     * Find missing dates for a symbol within a date range
     *
     * @param symbol the stock symbol
     * @param startDate the start date
     * @param endDate the end date
     * @return list of existing dates for the symbol in the range
     */
    @Query("SELECT s.dataDate FROM StockData s WHERE s.symbol = :symbol AND s.dataDate BETWEEN :startDate AND :endDate ORDER BY s.dataDate")
    List<LocalDate> findExistingDatesBySymbolAndRange(@Param("symbol") String symbol,
                                                     @Param("startDate") LocalDate startDate,
                                                     @Param("endDate") LocalDate endDate);

    /**
     * Find recent stock data across all symbols
     *
     * @param limit the number of recent records to return
     * @return list of recent stock data records
     */
    @Query(value = "SELECT * FROM stock_data ORDER BY data_date DESC, created_at DESC LIMIT :limit", nativeQuery = true)
    List<StockData> findRecentStockData(@Param("limit") int limit);

    /**
     * Find stock data by volume range
     *
     * @param symbol the stock symbol
     * @param minVolume minimum volume
     * @param maxVolume maximum volume
     * @return list of stock data within the volume range
     */
    @Query("SELECT s FROM StockData s WHERE s.symbol = :symbol AND s.volume BETWEEN :minVolume AND :maxVolume ORDER BY s.dataDate DESC")
    List<StockData> findBySymbolAndVolumeRange(@Param("symbol") String symbol,
                                             @Param("minVolume") Long minVolume,
                                             @Param("maxVolume") Long maxVolume);

    /**
     * Find stock data for symbols with data updated today
     *
     * @param today today's date
     * @return list of symbols with today's data
     */
    @Query("SELECT DISTINCT s.symbol FROM StockData s WHERE s.dataDate = :today")
    List<String> findSymbolsWithTodayData(@Param("today") LocalDate today);

    /**
     * Get average price for a symbol over a date range
     *
     * @param symbol the stock symbol
     * @param startDate the start date
     * @param endDate the end date
     * @return average price over the date range
     */
    @Query("SELECT AVG(s.price) FROM StockData s WHERE s.symbol = :symbol AND s.dataDate BETWEEN :startDate AND :endDate")
    Optional<java.math.BigDecimal> getAveragePriceBySymbolAndDateRange(@Param("symbol") String symbol,
                                                                       @Param("startDate") LocalDate startDate,
                                                                       @Param("endDate") LocalDate endDate);

    /**
     * Find stock data with highest volume for a symbol
     *
     * @param symbol the stock symbol
     * @return stock data with highest volume
     */
    @Query("SELECT s FROM StockData s WHERE s.symbol = :symbol ORDER BY s.volume DESC LIMIT 1")
    Optional<StockData> findHighestVolumeBySymbol(@Param("symbol") String symbol);
}
