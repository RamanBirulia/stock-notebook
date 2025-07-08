package com.stocknotebook.repository;

import com.stocknotebook.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {

    /**
     * Find all purchases for a specific user
     *
     * @param userId the user ID
     * @return list of purchases ordered by purchase date descending
     */
    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId ORDER BY p.purchaseDate DESC")
    List<Purchase> findByUserId(@Param("userId") UUID userId);

    /**
     * Find purchases by user ID and symbol
     *
     * @param userId the user ID
     * @param symbol the stock symbol
     * @return list of purchases for the specific symbol
     */
    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.symbol = :symbol ORDER BY p.purchaseDate DESC")
    List<Purchase> findByUserIdAndSymbol(@Param("userId") UUID userId, @Param("symbol") String symbol);

    /**
     * Find all unique symbols for a user
     *
     * @param userId the user ID
     * @return list of unique stock symbols
     */
    @Query("SELECT DISTINCT p.symbol FROM Purchase p WHERE p.user.id = :userId ORDER BY p.symbol")
    List<String> findDistinctSymbolsByUserId(@Param("userId") UUID userId);

    /**
     * Get aggregated purchase data by symbol for a user
     *
     * @param userId the user ID
     * @return list of objects containing symbol, total quantity, average price, and total spent
     */
    @Query(value = """
        SELECT
            p.symbol,
            SUM(p.quantity) as total_quantity,
            AVG(p.price_per_share) as avg_price,
            SUM(p.quantity * p.price_per_share + p.commission) as total_spent
        FROM purchases p
        WHERE p.user_id = :userId
        GROUP BY p.symbol
        ORDER BY p.symbol
        """, nativeQuery = true)
    List<Object[]> findAggregatedPurchasesByUserId(@Param("userId") UUID userId);

    /**
     * Find purchases within a date range
     *
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return list of purchases within the date range
     */
    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.purchaseDate BETWEEN :startDate AND :endDate ORDER BY p.purchaseDate DESC")
    List<Purchase> findByUserIdAndDateRange(@Param("userId") UUID userId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    /**
     * Get total amount spent by a user
     *
     * @param userId the user ID
     * @return total amount spent including commissions
     */
    @Query("SELECT COALESCE(SUM(p.quantity * p.pricePerShare + p.commission), 0) FROM Purchase p WHERE p.user.id = :userId")
    BigDecimal getTotalSpentByUserId(@Param("userId") UUID userId);

    /**
     * Get total quantity of shares for a specific symbol owned by a user
     *
     * @param userId the user ID
     * @param symbol the stock symbol
     * @return total quantity of shares
     */
    @Query("SELECT COALESCE(SUM(p.quantity), 0) FROM Purchase p WHERE p.user.id = :userId AND p.symbol = :symbol")
    Integer getTotalQuantityByUserIdAndSymbol(@Param("userId") UUID userId, @Param("symbol") String symbol);

    /**
     * Get average purchase price for a specific symbol owned by a user
     *
     * @param userId the user ID
     * @param symbol the stock symbol
     * @return average purchase price
     */
    @Query("SELECT AVG(p.pricePerShare) FROM Purchase p WHERE p.user.id = :userId AND p.symbol = :symbol")
    BigDecimal getAveragePriceByUserIdAndSymbol(@Param("userId") UUID userId, @Param("symbol") String symbol);

    /**
     * Find recent purchases for a user
     *
     * @param userId the user ID
     * @param limit the number of recent purchases to return
     * @return list of recent purchases
     */
    @Query(value = "SELECT * FROM purchases WHERE user_id = :userId ORDER BY purchase_date DESC LIMIT :limit", nativeQuery = true)
    List<Purchase> findRecentPurchasesByUserId(@Param("userId") UUID userId, @Param("limit") int limit);

    /**
     * Count total number of purchases for a user
     *
     * @param userId the user ID
     * @return total number of purchases
     */
    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.user.id = :userId")
    long countByUserId(@Param("userId") UUID userId);

    /**
     * Find purchases by symbol across all users (for admin purposes)
     *
     * @param symbol the stock symbol
     * @return list of all purchases for the symbol
     */
    @Query("SELECT p FROM Purchase p WHERE p.symbol = :symbol ORDER BY p.purchaseDate DESC")
    List<Purchase> findBySymbol(@Param("symbol") String symbol);

    /**
     * Get all unique symbols across all users
     *
     * @return list of unique stock symbols
     */
    @Query("SELECT DISTINCT p.symbol FROM Purchase p ORDER BY p.symbol")
    List<String> findAllUniqueSymbols();

    /**
     * Get purchase statistics for a user
     *
     * @param userId the user ID
     * @return array containing [total_purchases, total_spent, unique_symbols, avg_commission]
     */
    @Query(value = """
        SELECT
            COUNT(p.id) as total_purchases,
            COALESCE(SUM(p.quantity * p.price_per_share + p.commission), 0) as total_spent,
            COUNT(DISTINCT p.symbol) as unique_symbols,
            AVG(p.commission) as avg_commission
        FROM purchases p
        WHERE p.user_id = :userId
        """, nativeQuery = true)
    Object[] getPurchaseStatistics(@Param("userId") UUID userId);

    /**
     * Find purchases that need current price updates (for portfolio valuation)
     *
     * @param userId the user ID
     * @return list of distinct symbols that need price updates
     */
    @Query("SELECT DISTINCT p.symbol FROM Purchase p WHERE p.user.id = :userId")
    List<String> findSymbolsNeedingPriceUpdate(@Param("userId") UUID userId);
}
