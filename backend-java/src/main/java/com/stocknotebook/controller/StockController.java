package com.stocknotebook.controller;

import com.stocknotebook.dto.response.StockPriceDTO;
import com.stocknotebook.dto.response.SymbolSuggestionDTO;
import com.stocknotebook.service.StockService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private static final Logger log = LoggerFactory.getLogger(
        StockController.class
    );

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    /**
     * Get current price for a stock symbol
     */
    @GetMapping("/{symbol}/price")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<StockPriceDTO> getCurrentPrice(
        @PathVariable String symbol
    ) {
        log.info("Get current price request received for symbol: {}", symbol);

        try {
            StockPriceDTO price = stockService.getCurrentPrice(symbol);
            return ResponseEntity.ok(price);
        } catch (RuntimeException e) {
            log.warn("Failed to get current price for symbol: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error getting current price for symbol: {}", symbol, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get current prices for multiple symbols
     */
    @PostMapping("/prices")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StockPriceDTO>> getMultiplePrices(
        @RequestBody List<String> symbols
    ) {
        log.info(
            "Get multiple prices request received for {} symbols",
            symbols.size()
        );

        try {
            List<StockPriceDTO> prices = stockService.getMultiplePrices(
                symbols
            );
            return ResponseEntity.ok(prices);
        } catch (Exception e) {
            log.error("Error getting multiple prices", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get chart data for a stock symbol
     */
    @GetMapping("/{symbol}/chart")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<
        List<com.stocknotebook.client.YahooFinanceClient.PricePoint>
    > getChartData(
        @PathVariable String symbol,
        @RequestParam(defaultValue = "1M") String period
    ) {
        log.info(
            "Get chart data request received for symbol: {} with period: {}",
            symbol,
            period
        );

        try {
            List<
                com.stocknotebook.client.YahooFinanceClient.PricePoint
            > chartData = stockService.getChartData(symbol, period);
            return ResponseEntity.ok(chartData);
        } catch (RuntimeException e) {
            log.warn("Failed to get chart data for symbol: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error getting chart data for symbol: {}", symbol, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Search for stock symbols
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SymbolSuggestionDTO>> searchSymbols(
        @RequestParam String query,
        @RequestParam(defaultValue = "10") int limit
    ) {
        log.info(
            "Search symbols request received for query: {} with limit: {}",
            query,
            limit
        );

        try {
            List<SymbolSuggestionDTO> suggestions = stockService.searchSymbols(
                query,
                limit
            );
            return ResponseEntity.ok(suggestions);
        } catch (RuntimeException e) {
            log.warn("Failed to search symbols for query: {}", query);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error searching symbols for query: {}", query, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get historical stock data
     */
    @GetMapping("/{symbol}/history")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StockPriceDTO>> getHistoricalData(
        @PathVariable String symbol,
        @RequestParam LocalDate startDate,
        @RequestParam LocalDate endDate
    ) {
        log.info(
            "Get historical data request received for symbol: {} from {} to {}",
            symbol,
            startDate,
            endDate
        );

        try {
            List<StockPriceDTO> historicalData = stockService.getHistoricalData(
                symbol,
                startDate,
                endDate
            );
            return ResponseEntity.ok(historicalData);
        } catch (Exception e) {
            log.error(
                "Error getting historical data for symbol: {}",
                symbol,
                e
            );
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get latest stock data for a symbol
     */
    @GetMapping("/{symbol}/latest")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<StockPriceDTO> getLatestData(
        @PathVariable String symbol
    ) {
        log.info("Get latest data request received for symbol: {}", symbol);

        try {
            Optional<StockPriceDTO> latestData = stockService.getLatestData(
                symbol
            );
            return latestData
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting latest data for symbol: {}", symbol, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Check if stock data exists for a symbol on a specific date
     */
    @GetMapping("/{symbol}/exists")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Boolean> hasDataForDate(
        @PathVariable String symbol,
        @RequestParam LocalDate date
    ) {
        log.info(
            "Check data existence request received for symbol: {} on date: {}",
            symbol,
            date
        );

        try {
            boolean exists = stockService.hasDataForDate(symbol, date);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            log.error(
                "Error checking data existence for symbol: {}",
                symbol,
                e
            );
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get all unique symbols
     */
    @GetMapping("/symbols")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<String>> getAllSymbols() {
        log.info("Get all symbols request received");

        try {
            List<String> symbols = stockService.getAllSymbols();
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            log.error("Error getting all symbols", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get stock data statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStockDataStatistics() {
        log.info("Get stock data statistics request received");

        try {
            Map<String, Object> statistics =
                stockService.getStockDataStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting stock data statistics", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Update stock data for multiple symbols (admin only)
     */
    @PostMapping("/update")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStockDataBulk(
        @RequestBody List<String> symbols
    ) {
        log.info("Bulk update request received for {} symbols", symbols.size());

        try {
            int updatedCount = stockService.updateStockDataBulk(symbols);
            Map<String, Object> response = Map.of(
                "totalSymbols",
                symbols.size(),
                "updatedCount",
                updatedCount,
                "message",
                "Stock data update completed"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating stock data bulk", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Clean up old stock data (admin only)
     */
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> cleanupOldData(
        @RequestParam(defaultValue = "365") int daysToKeep
    ) {
        log.info(
            "Cleanup old data request received with daysToKeep: {}",
            daysToKeep
        );

        try {
            int deletedCount = stockService.cleanupOldData(daysToKeep);
            Map<String, Object> response = Map.of(
                "deletedCount",
                deletedCount,
                "daysToKeep",
                daysToKeep,
                "message",
                "Old stock data cleanup completed"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error cleaning up old data", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Evict price cache for a specific symbol
     */
    @DeleteMapping("/{symbol}/cache/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> evictPriceCache(@PathVariable String symbol) {
        log.info("Evict price cache request received for symbol: {}", symbol);

        try {
            stockService.evictPriceCache(symbol);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error evicting price cache for symbol: {}", symbol, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Evict chart cache for a specific symbol and period
     */
    @DeleteMapping("/{symbol}/cache/chart")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> evictChartCache(
        @PathVariable String symbol,
        @RequestParam String period
    ) {
        log.info(
            "Evict chart cache request received for symbol: {} and period: {}",
            symbol,
            period
        );

        try {
            stockService.evictChartCache(symbol, period);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error evicting chart cache for symbol: {}", symbol, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Evict all caches
     */
    @DeleteMapping("/cache/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> evictAllCaches() {
        log.info("Evict all caches request received");

        try {
            stockService.evictAllCaches();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error evicting all caches", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get popular symbols
     */
    @GetMapping("/popular")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SymbolSuggestionDTO>> getPopularSymbols(
        @RequestParam(defaultValue = "20") int limit
    ) {
        log.info("Get popular symbols request received with limit: {}", limit);

        try {
            List<SymbolSuggestionDTO> popularSymbols =
                stockService.getPopularSymbols(limit);
            return ResponseEntity.ok(popularSymbols);
        } catch (Exception e) {
            log.error("Error getting popular symbols", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get symbols by sector
     */
    @GetMapping("/sector/{sector}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<SymbolSuggestionDTO>> getSymbolsBySector(
        @PathVariable String sector,
        @RequestParam(defaultValue = "50") int limit
    ) {
        log.info(
            "Get symbols by sector request received for sector: {} with limit: {}",
            sector,
            limit
        );

        try {
            List<SymbolSuggestionDTO> symbols = stockService.getSymbolsBySector(
                sector,
                limit
            );
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            log.error("Error getting symbols by sector: {}", sector, e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get all unique sectors
     */
    @GetMapping("/sectors")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<String>> getAllSectors() {
        log.info("Get all sectors request received");

        try {
            List<String> sectors = stockService.getAllSectors();
            return ResponseEntity.ok(sectors);
        } catch (Exception e) {
            log.error("Error getting all sectors", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get all unique industries
     */
    @GetMapping("/industries")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<String>> getAllIndustries() {
        log.info("Get all industries request received");

        try {
            List<String> industries = stockService.getAllIndustries();
            return ResponseEntity.ok(industries);
        } catch (Exception e) {
            log.error("Error getting all industries", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get symbol metadata
     */
    @GetMapping("/{symbol}/metadata")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<com.stocknotebook.entity.Symbol> getSymbolMetadata(
        @PathVariable String symbol
    ) {
        log.info("Get symbol metadata request received for symbol: {}", symbol);

        try {
            Optional<com.stocknotebook.entity.Symbol> metadata =
                stockService.getSymbolMetadata(symbol);
            return metadata
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error(
                "Error getting symbol metadata for symbol: {}",
                symbol,
                e
            );
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get symbol statistics
     */
    @GetMapping("/symbols/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSymbolStatistics() {
        log.info("Get symbol statistics request received");

        try {
            Map<String, Object> statistics = stockService.getSymbolStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting symbol statistics", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }
}
