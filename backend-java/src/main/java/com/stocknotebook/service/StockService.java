package com.stocknotebook.service;

import com.stocknotebook.client.YahooFinanceClient;
import com.stocknotebook.dto.response.StockPriceDTO;
import com.stocknotebook.dto.response.SymbolSuggestionDTO;
import com.stocknotebook.entity.StockData;
import com.stocknotebook.repository.StockDataRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StockService {

    private static final Logger log = LoggerFactory.getLogger(
        StockService.class
    );

    private final StockDataRepository stockDataRepository;
    private final YahooFinanceClient yahooFinanceClient;

    public StockService(
        StockDataRepository stockDataRepository,
        YahooFinanceClient yahooFinanceClient
    ) {
        this.stockDataRepository = stockDataRepository;
        this.yahooFinanceClient = yahooFinanceClient;
    }

    /**
     * Get current price for a stock symbol with caching
     */
    @Cacheable(value = "stockPrices", key = "#symbol")
    public StockPriceDTO getCurrentPrice(String symbol) {
        log.info("Getting current price for symbol: {}", symbol);

        String upperSymbol = symbol.toUpperCase();
        LocalDate today = LocalDate.now();

        // Check if we have today's data in database
        Optional<StockData> todayData =
            stockDataRepository.findBySymbolAndDataDate(upperSymbol, today);
        if (todayData.isPresent()) {
            log.info("Found today's data in database for symbol: {}", symbol);
            return mapToStockPriceDTO(todayData.get());
        }

        // Fetch from Yahoo Finance API
        try {
            BigDecimal price = yahooFinanceClient.fetchCurrentPrice(symbol);

            // Store in database
            StockData stockData = new StockData(
                upperSymbol,
                price,
                null,
                today
            );
            stockDataRepository.save(stockData);

            log.info(
                "Successfully fetched and stored current price for {}: {}",
                symbol,
                price
            );
            return new StockPriceDTO(upperSymbol, price, LocalDateTime.now());
        } catch (Exception e) {
            log.error(
                "Failed to fetch current price for symbol: {}",
                symbol,
                e
            );

            // Fallback to latest available data
            Optional<StockData> latestData =
                stockDataRepository.findLatestBySymbol(upperSymbol);
            if (latestData.isPresent()) {
                log.warn("Using latest available data for symbol: {}", symbol);
                return mapToStockPriceDTO(latestData.get());
            }

            throw new RuntimeException(
                "Unable to get current price for " + symbol,
                e
            );
        }
    }

    /**
     * Get current prices for multiple symbols
     */
    @Transactional(readOnly = true)
    public List<StockPriceDTO> getMultiplePrices(List<String> symbols) {
        log.info("Getting current prices for {} symbols", symbols.size());

        return symbols
            .stream()
            .map(this::getCurrentPrice)
            .collect(Collectors.toList());
    }

    /**
     * Get portfolio values for multiple symbols
     */
    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getPortfolioValues(List<String> symbols) {
        log.info("Getting portfolio values for {} symbols", symbols.size());

        return symbols
            .stream()
            .collect(
                Collectors.toMap(
                    symbol -> symbol,
                    symbol -> getCurrentPrice(symbol).price()
                )
            );
    }

    /**
     * Get chart data for a stock symbol with caching
     */
    @Cacheable(value = "stockCharts", key = "#symbol + '_' + #period")
    public List<YahooFinanceClient.PricePoint> getChartData(
        String symbol,
        String period
    ) {
        log.info(
            "Getting chart data for symbol: {} with period: {}",
            symbol,
            period
        );

        String upperSymbol = symbol.toUpperCase();

        // Determine date range for the period
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = calculateStartDate(period, endDate);

        // Check if we have sufficient data in database
        List<StockData> dbData = stockDataRepository.findBySymbolAndDateRange(
            upperSymbol,
            startDate,
            endDate
        );

        // If we have recent data and sufficient coverage, use database data
        if (
            hasRecentData(dbData, endDate) &&
            hasSufficientCoverage(dbData, startDate, endDate, period)
        ) {
            log.info("Using database data for chart: {}", symbol);
            return convertToYahooFinanceFormat(dbData);
        }

        // Fetch from Yahoo Finance API
        try {
            List<YahooFinanceClient.PricePoint> chartData =
                yahooFinanceClient.fetchChartData(symbol, period);

            // Store fetched data in database
            storeChartDataInDatabase(upperSymbol, chartData);

            log.info(
                "Successfully fetched and stored chart data for {}: {} points",
                symbol,
                chartData.size()
            );
            return chartData;
        } catch (Exception e) {
            log.error("Failed to fetch chart data for symbol: {}", symbol, e);

            // Fallback to available database data
            if (!dbData.isEmpty()) {
                log.warn("Using available database data for chart: {}", symbol);
                return convertToYahooFinanceFormat(dbData);
            }

            throw new RuntimeException(
                "Unable to get chart data for " + symbol,
                e
            );
        }
    }

    /**
     * Search for stock symbols
     */
    @Cacheable(value = "symbolSearch", key = "#query + '_' + #limit")
    public List<SymbolSuggestionDTO> searchSymbols(String query, int limit) {
        log.info(
            "Searching symbols for query: {} with limit: {}",
            query,
            limit
        );

        try {
            return yahooFinanceClient.searchSymbols(query, limit);
        } catch (Exception e) {
            log.error("Failed to search symbols for query: {}", query, e);
            throw new RuntimeException(
                "Unable to search symbols for " + query,
                e
            );
        }
    }

    /**
     * Get historical stock data from database
     */
    @Transactional(readOnly = true)
    public List<StockPriceDTO> getHistoricalData(
        String symbol,
        LocalDate startDate,
        LocalDate endDate
    ) {
        log.info(
            "Getting historical data for symbol: {} from {} to {}",
            symbol,
            startDate,
            endDate
        );

        return stockDataRepository
            .findBySymbolAndDateRange(symbol.toUpperCase(), startDate, endDate)
            .stream()
            .map(this::mapToStockPriceDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get latest stock data for a symbol
     */
    @Transactional(readOnly = true)
    public Optional<StockPriceDTO> getLatestData(String symbol) {
        log.info("Getting latest data for symbol: {}", symbol);

        return stockDataRepository
            .findLatestBySymbol(symbol.toUpperCase())
            .map(this::mapToStockPriceDTO);
    }

    /**
     * Check if stock data exists for a symbol on a specific date
     */
    @Transactional(readOnly = true)
    public boolean hasDataForDate(String symbol, LocalDate date) {
        return stockDataRepository.existsBySymbolAndDataDate(
            symbol.toUpperCase(),
            date
        );
    }

    /**
     * Get all unique symbols that have stock data
     */
    @Transactional(readOnly = true)
    public List<String> getAllSymbols() {
        log.info("Getting all unique symbols");
        return stockDataRepository.findAllUniqueSymbols();
    }

    /**
     * Update stock data for multiple symbols
     */
    public int updateStockDataBulk(List<String> symbols) {
        log.info("Updating stock data for {} symbols", symbols.size());

        LocalDate today = LocalDate.now();

        List<String> symbolsToUpdate = symbols
            .stream()
            .filter(symbol ->
                !stockDataRepository.existsBySymbolAndDataDate(
                    symbol.toUpperCase(),
                    today
                )
            )
            .collect(Collectors.toList());

        log.info("Found {} symbols that need updates", symbolsToUpdate.size());

        return (int) symbolsToUpdate
            .stream()
            .mapToLong(this::updateSingleSymbol)
            .sum();
    }

    /**
     * Clean up old stock data
     */
    public int cleanupOldData(int daysToKeep) {
        log.info("Cleaning up stock data older than {} days", daysToKeep);

        LocalDate cutoffDate = LocalDate.now().minusDays(daysToKeep);
        int deletedCount = stockDataRepository.deleteByDataDateBefore(
            cutoffDate
        );

        log.info("Cleaned up {} old stock data records", deletedCount);
        return deletedCount;
    }

    /**
     * Get stock data statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStockDataStatistics() {
        log.info("Getting stock data statistics");

        Object[] stats = stockDataRepository.getStockDataStatistics();

        return Map.of(
            "totalRecords",
            stats[0],
            "uniqueSymbols",
            stats[1],
            "dateRangeStart",
            stats[2],
            "dateRangeEnd",
            stats[3]
        );
    }

    /**
     * Evict price cache for a specific symbol
     */
    @CacheEvict(value = "stockPrices", key = "#symbol")
    public void evictPriceCache(String symbol) {
        log.info("Evicted price cache for symbol: {}", symbol);
    }

    /**
     * Evict chart cache for a specific symbol and period
     */
    @CacheEvict(value = "stockCharts", key = "#symbol + '_' + #period")
    public void evictChartCache(String symbol, String period) {
        log.info(
            "Evicted chart cache for symbol: {} and period: {}",
            symbol,
            period
        );
    }

    /**
     * Evict all caches
     */
    @CacheEvict(
        value = { "stockPrices", "stockCharts", "symbolSearch" },
        allEntries = true
    )
    public void evictAllCaches() {
        log.info("Evicted all stock caches");
    }

    // Private helper methods

    private long updateSingleSymbol(String symbol) {
        String upperSymbol = symbol.toUpperCase();
        try {
            BigDecimal price = yahooFinanceClient.fetchCurrentPrice(symbol);
            StockData stockData = new StockData(
                upperSymbol,
                price,
                null,
                LocalDate.now()
            );
            stockDataRepository.save(stockData);
            log.info("Updated stock data for {}: {}", symbol, price);
            return 1;
        } catch (Exception e) {
            log.warn("Failed to update stock data for symbol: {}", symbol, e);
            return 0;
        }
    }

    private StockPriceDTO mapToStockPriceDTO(StockData stockData) {
        return new StockPriceDTO(
            stockData.getSymbol(),
            stockData.getPrice(),
            stockData.getCreatedAt()
        );
    }

    private LocalDate calculateStartDate(String period, LocalDate endDate) {
        return switch (period.toUpperCase()) {
            case "1D" -> endDate.minusDays(1);
            case "1W" -> endDate.minusWeeks(1);
            case "1M" -> endDate.minusMonths(1);
            case "3M" -> endDate.minusMonths(3);
            case "6M" -> endDate.minusMonths(6);
            case "1Y" -> endDate.minusYears(1);
            case "2Y" -> endDate.minusYears(2);
            case "5Y" -> endDate.minusYears(5);
            case "10Y" -> endDate.minusYears(10);
            case "MAX" -> endDate.minusYears(20);
            default -> endDate.minusMonths(1);
        };
    }

    private boolean hasRecentData(List<StockData> data, LocalDate endDate) {
        if (data.isEmpty()) {
            return false;
        }

        LocalDate twoDaysAgo = endDate.minusDays(2);
        return data.stream().anyMatch(d -> d.getDataDate().isAfter(twoDaysAgo));
    }

    private boolean hasSufficientCoverage(
        List<StockData> data,
        LocalDate startDate,
        LocalDate endDate,
        String period
    ) {
        if (data.isEmpty()) {
            return false;
        }

        long totalDays = startDate.until(endDate).getDays();
        long actualDays = data.size();

        double expectedCoverage = switch (period.toUpperCase()) {
            case "1D" -> 0.9;
            case "1W" -> 0.8;
            case "1M" -> 0.7;
            default -> 0.6;
        };

        return (double) actualDays / totalDays >= expectedCoverage;
    }

    private List<YahooFinanceClient.PricePoint> convertToYahooFinanceFormat(
        List<StockData> stockDataList
    ) {
        return stockDataList
            .stream()
            .map(data ->
                new YahooFinanceClient.PricePoint(
                    data.getDataDate(),
                    data.getPrice(),
                    data.getVolume()
                )
            )
            .collect(Collectors.toList());
    }

    private void storeChartDataInDatabase(
        String symbol,
        List<YahooFinanceClient.PricePoint> chartData
    ) {
        List<StockData> stockDataList = chartData
            .stream()
            .filter(point ->
                !stockDataRepository.existsBySymbolAndDataDate(
                    symbol,
                    point.getDate()
                )
            )
            .map(point ->
                new StockData(
                    symbol,
                    point.getPrice(),
                    point.getVolume(),
                    point.getDate()
                )
            )
            .collect(Collectors.toList());

        stockDataRepository.saveAll(stockDataList);
        log.info(
            "Stored {} new stock data records for symbol: {}",
            stockDataList.size(),
            symbol
        );
    }
}
