package com.stocknotebook.repository;

import com.stocknotebook.entity.Symbol;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SymbolRepository extends JpaRepository<Symbol, UUID> {

    /**
     * Find symbol by symbol code
     */
    Optional<Symbol> findBySymbol(String symbol);

    /**
     * Find symbol by symbol code (case insensitive)
     */
    Optional<Symbol> findBySymbolIgnoreCase(String symbol);

    /**
     * Check if symbol exists
     */
    boolean existsBySymbol(String symbol);

    /**
     * Find all active symbols
     */
    List<Symbol> findByIsActiveTrue();

    /**
     * Search symbols by company name (case insensitive, contains)
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
           "s.isActive = true " +
           "ORDER BY s.companyName")
    List<Symbol> findByCompanyNameContainingIgnoreCase(@Param("query") String query);

    /**
     * Search symbols by company name with pagination
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
           "s.isActive = true " +
           "ORDER BY s.companyName")
    Page<Symbol> findByCompanyNameContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    /**
     * Search symbols by symbol code (case insensitive, contains)
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) AND " +
           "s.isActive = true " +
           "ORDER BY s.symbol")
    List<Symbol> findBySymbolContainingIgnoreCase(@Param("query") String query);

    /**
     * Search symbols by symbol code or company name (case insensitive)
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "(LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "s.isActive = true " +
           "ORDER BY " +
           "CASE WHEN LOWER(s.symbol) LIKE LOWER(CONCAT(:query, '%')) THEN 1 " +
           "     WHEN LOWER(s.companyName) LIKE LOWER(CONCAT(:query, '%')) THEN 2 " +
           "     WHEN LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3 " +
           "     ELSE 4 END, " +
           "s.symbol")
    List<Symbol> searchBySymbolOrCompanyName(@Param("query") String query);

    /**
     * Search symbols by symbol code or company name with pagination
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "(LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "s.isActive = true " +
           "ORDER BY " +
           "CASE WHEN LOWER(s.symbol) LIKE LOWER(CONCAT(:query, '%')) THEN 1 " +
           "     WHEN LOWER(s.companyName) LIKE LOWER(CONCAT(:query, '%')) THEN 2 " +
           "     WHEN LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) THEN 3 " +
           "     ELSE 4 END, " +
           "s.symbol")
    Page<Symbol> searchBySymbolOrCompanyName(@Param("query") String query, Pageable pageable);

    /**
     * Full-text search using PostgreSQL's full-text search capabilities
     */
    @Query(value = "SELECT * FROM symbols s WHERE " +
                   "to_tsvector('english', s.company_name || ' ' || COALESCE(s.description, '')) @@ to_tsquery('english', :query) " +
                   "AND s.is_active = true " +
                   "ORDER BY ts_rank(to_tsvector('english', s.company_name || ' ' || COALESCE(s.description, '')), to_tsquery('english', :query)) DESC",
           nativeQuery = true)
    List<Symbol> fullTextSearch(@Param("query") String query);

    /**
     * Find symbols by sector
     */
    List<Symbol> findBySectorIgnoreCaseAndIsActiveTrue(String sector);

    /**
     * Find symbols by industry
     */
    List<Symbol> findByIndustryIgnoreCaseAndIsActiveTrue(String industry);

    /**
     * Find symbols by exchange
     */
    List<Symbol> findByExchangeIgnoreCaseAndIsActiveTrue(String exchange);

    /**
     * Find symbols by market cap category
     */
    List<Symbol> findByMarketCapCategoryAndIsActiveTrue(Symbol.MarketCapCategory marketCapCategory);

    /**
     * Get all unique sectors
     */
    @Query("SELECT DISTINCT s.sector FROM Symbol s WHERE s.sector IS NOT NULL AND s.isActive = true ORDER BY s.sector")
    List<String> findAllUniqueSectors();

    /**
     * Get all unique industries
     */
    @Query("SELECT DISTINCT s.industry FROM Symbol s WHERE s.industry IS NOT NULL AND s.isActive = true ORDER BY s.industry")
    List<String> findAllUniqueIndustries();

    /**
     * Get all unique exchanges
     */
    @Query("SELECT DISTINCT s.exchange FROM Symbol s WHERE s.exchange IS NOT NULL AND s.isActive = true ORDER BY s.exchange")
    List<String> findAllUniqueExchanges();

    /**
     * Get symbol statistics
     */
    @Query("SELECT COUNT(s), " +
           "COUNT(DISTINCT s.sector), " +
           "COUNT(DISTINCT s.industry), " +
           "COUNT(DISTINCT s.exchange) " +
           "FROM Symbol s WHERE s.isActive = true")
    Object[] getSymbolStatistics();

    /**
     * Find symbols by multiple criteria
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "(:sector IS NULL OR LOWER(s.sector) = LOWER(:sector)) AND " +
           "(:industry IS NULL OR LOWER(s.industry) = LOWER(:industry)) AND " +
           "(:exchange IS NULL OR LOWER(s.exchange) = LOWER(:exchange)) AND " +
           "(:marketCapCategory IS NULL OR s.marketCapCategory = :marketCapCategory) AND " +
           "s.isActive = true " +
           "ORDER BY s.symbol")
    List<Symbol> findByMultipleCriteria(
            @Param("sector") String sector,
            @Param("industry") String industry,
            @Param("exchange") String exchange,
            @Param("marketCapCategory") Symbol.MarketCapCategory marketCapCategory);

    /**
     * Find popular symbols (this could be extended with actual popularity metrics)
     */
    @Query("SELECT s FROM Symbol s WHERE " +
           "s.marketCapCategory IN ('LARGE', 'MID') AND " +
           "s.isActive = true " +
           "ORDER BY s.marketCapCategory, s.symbol")
    List<Symbol> findPopularSymbols(Pageable pageable);
}
