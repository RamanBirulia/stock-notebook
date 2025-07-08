package com.stocknotebook.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stocknotebook.dto.response.SymbolSuggestionDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class YahooFinanceClient {

    private static final Logger log = LoggerFactory.getLogger(
        YahooFinanceClient.class
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String baseUrl;
    private final int timeout;
    private final int retryAttempts;
    private final long retryDelay;

    public YahooFinanceClient(
        RestTemplate restTemplate,
        ObjectMapper objectMapper,
        @Value(
            "${app.yahoo-finance.base-url:https://query1.finance.yahoo.com}"
        ) String baseUrl,
        @Value("${app.yahoo-finance.timeout:30000}") int timeout,
        @Value("${app.yahoo-finance.retry-attempts:3}") int retryAttempts,
        @Value("${app.yahoo-finance.retry-delay:1000}") long retryDelay
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.baseUrl = baseUrl;
        this.timeout = timeout;
        this.retryAttempts = retryAttempts;
        this.retryDelay = retryDelay;
    }

    /**
     * Fetch current price for a stock symbol
     *
     * @param symbol the stock symbol
     * @return the current price
     * @throws RuntimeException if unable to fetch price
     */
    public BigDecimal fetchCurrentPrice(String symbol) {
        log.info("Fetching current price for symbol: {}", symbol);

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/v8/finance/chart/{symbol}")
            .queryParam("interval", "1m")
            .queryParam("range", "1d")
            .buildAndExpand(symbol.toUpperCase())
            .toUriString();

        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    url,
                    String.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException(
                        "Yahoo Finance API returned error: " +
                        response.getStatusCode()
                    );
                }

                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode chartNode = rootNode.path("chart");
                JsonNode resultNode = chartNode.path("result");

                if (resultNode.isArray() && resultNode.size() > 0) {
                    JsonNode firstResult = resultNode.get(0);
                    JsonNode metaNode = firstResult.path("meta");
                    JsonNode priceNode = metaNode.path("regularMarketPrice");

                    if (priceNode.isNumber()) {
                        BigDecimal price = BigDecimal.valueOf(
                            priceNode.asDouble()
                        );
                        log.info(
                            "Successfully fetched price for {}: {}",
                            symbol,
                            price
                        );
                        return price;
                    }
                }

                throw new RuntimeException(
                    "No price data found for symbol: " + symbol
                );
            } catch (Exception e) {
                log.warn(
                    "Attempt {} failed to fetch price for {}: {}",
                    attempt,
                    symbol,
                    e.getMessage()
                );

                if (attempt == retryAttempts) {
                    throw new RuntimeException(
                        "Failed to fetch current price for " +
                        symbol +
                        " after " +
                        retryAttempts +
                        " attempts",
                        e
                    );
                }

                try {
                    Thread.sleep(retryDelay * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(
                        "Interrupted while retrying",
                        ie
                    );
                }
            }
        }

        throw new RuntimeException(
            "Failed to fetch current price for " + symbol
        );
    }

    /**
     * Fetch chart data for a stock symbol
     *
     * @param symbol the stock symbol
     * @param period the time period (1D, 1W, 1M, 3M, 6M, 1Y, 2Y, 5Y, 10Y, MAX)
     * @return list of price points
     * @throws RuntimeException if unable to fetch chart data
     */
    public List<PricePoint> fetchChartData(String symbol, String period) {
        log.info(
            "Fetching chart data for symbol: {} with period: {}",
            symbol,
            period
        );

        String[] rangeAndInterval = mapPeriodToRangeAndInterval(period);
        String range = rangeAndInterval[0];
        String interval = rangeAndInterval[1];

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/v8/finance/chart/{symbol}")
            .queryParam("interval", interval)
            .queryParam("range", range)
            .buildAndExpand(symbol.toUpperCase())
            .toUriString();

        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    url,
                    String.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException(
                        "Yahoo Finance API returned error: " +
                        response.getStatusCode()
                    );
                }

                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode chartNode = rootNode.path("chart");
                JsonNode resultNode = chartNode.path("result");

                if (resultNode.isArray() && resultNode.size() > 0) {
                    JsonNode firstResult = resultNode.get(0);
                    JsonNode timestampNode = firstResult.path("timestamp");
                    JsonNode indicatorsNode = firstResult.path("indicators");
                    JsonNode quoteNode = indicatorsNode.path("quote");

                    if (quoteNode.isArray() && quoteNode.size() > 0) {
                        JsonNode firstQuote = quoteNode.get(0);
                        JsonNode closeNode = firstQuote.path("close");
                        JsonNode volumeNode = firstQuote.path("volume");

                        List<PricePoint> pricePoints = new ArrayList<>();

                        for (int i = 0; i < timestampNode.size(); i++) {
                            long timestamp = timestampNode.get(i).asLong();
                            JsonNode closePrice = closeNode.get(i);
                            JsonNode volumeData = volumeNode.get(i);

                            if (!closePrice.isNull()) {
                                LocalDate date = Instant.ofEpochSecond(
                                    timestamp
                                )
                                    .atZone(ZoneId.systemDefault())
                                    .toLocalDate();

                                BigDecimal price = BigDecimal.valueOf(
                                    closePrice.asDouble()
                                );
                                Long volume = volumeData.isNull()
                                    ? null
                                    : volumeData.asLong();

                                pricePoints.add(
                                    new PricePoint(date, price, volume)
                                );
                            }
                        }

                        log.info(
                            "Successfully fetched {} price points for {}",
                            pricePoints.size(),
                            symbol
                        );
                        return pricePoints;
                    }
                }

                throw new RuntimeException(
                    "No chart data found for symbol: " + symbol
                );
            } catch (Exception e) {
                log.warn(
                    "Attempt {} failed to fetch chart data for {}: {}",
                    attempt,
                    symbol,
                    e.getMessage()
                );

                if (attempt == retryAttempts) {
                    throw new RuntimeException(
                        "Failed to fetch chart data for " +
                        symbol +
                        " after " +
                        retryAttempts +
                        " attempts",
                        e
                    );
                }

                try {
                    Thread.sleep(retryDelay * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(
                        "Interrupted while retrying",
                        ie
                    );
                }
            }
        }

        throw new RuntimeException("Failed to fetch chart data for " + symbol);
    }

    /**
     * Search for stock symbols
     *
     * @param query the search query
     * @param limit the maximum number of results
     * @return list of symbol suggestions
     * @throws RuntimeException if unable to search symbols
     */
    public List<SymbolSuggestionDTO> searchSymbols(String query, int limit) {
        log.info(
            "Searching symbols for query: {} with limit: {}",
            query,
            limit
        );

        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
            .path("/v1/finance/search")
            .queryParam("q", query)
            .queryParam("quotesCount", limit)
            .queryParam("newsCount", 0)
            .build()
            .toUriString();

        for (int attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(
                    url,
                    String.class
                );

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException(
                        "Yahoo Finance API returned error: " +
                        response.getStatusCode()
                    );
                }

                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode quotesNode = rootNode.path("quotes");

                List<SymbolSuggestionDTO> suggestions = new ArrayList<>();

                if (quotesNode.isArray()) {
                    for (JsonNode quoteNode : quotesNode) {
                        String quoteType = quoteNode.path("quoteType").asText();

                        if ("EQUITY".equals(quoteType)) {
                            String symbol = quoteNode.path("symbol").asText();
                            String shortName = quoteNode
                                .path("shortname")
                                .asText();
                            String longName = quoteNode
                                .path("longname")
                                .asText();
                            String exchange = quoteNode
                                .path("exchDisp")
                                .asText();
                            String typeDisplay = quoteNode
                                .path("typeDisp")
                                .asText();

                            String name = longName != null &&
                                !longName.isEmpty()
                                ? longName
                                : shortName;

                            suggestions.add(
                                new SymbolSuggestionDTO(
                                    symbol,
                                    name,
                                    exchange,
                                    typeDisplay
                                )
                            );
                        }
                    }
                }

                log.info(
                    "Successfully found {} symbol suggestions for query: {}",
                    suggestions.size(),
                    query
                );
                return suggestions;
            } catch (Exception e) {
                log.warn(
                    "Attempt {} failed to search symbols for {}: {}",
                    attempt,
                    query,
                    e.getMessage()
                );

                if (attempt == retryAttempts) {
                    throw new RuntimeException(
                        "Failed to search symbols for " +
                        query +
                        " after " +
                        retryAttempts +
                        " attempts",
                        e
                    );
                }

                try {
                    Thread.sleep(retryDelay * attempt);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException(
                        "Interrupted while retrying",
                        ie
                    );
                }
            }
        }

        throw new RuntimeException("Failed to search symbols for " + query);
    }

    /**
     * Map period to Yahoo Finance range and interval parameters
     *
     * @param period the period string
     * @return array with [range, interval]
     */
    private String[] mapPeriodToRangeAndInterval(String period) {
        return switch (period.toUpperCase()) {
            case "1D" -> new String[] { "1d", "5m" };
            case "1W" -> new String[] { "5d", "15m" };
            case "1M" -> new String[] { "1mo", "1d" };
            case "3M" -> new String[] { "3mo", "1d" };
            case "6M" -> new String[] { "6mo", "1d" };
            case "1Y" -> new String[] { "1y", "1d" };
            case "2Y" -> new String[] { "2y", "1wk" };
            case "5Y" -> new String[] { "5y", "1wk" };
            case "10Y" -> new String[] { "10y", "1mo" };
            case "MAX" -> new String[] { "max", "1mo" };
            default -> new String[] { "1mo", "1d" };
        };
    }

    /**
     * Data class for price points
     */
    public static class PricePoint {

        private final LocalDate date;
        private final BigDecimal price;
        private final Long volume;

        public PricePoint(LocalDate date, BigDecimal price, Long volume) {
            this.date = date;
            this.price = price;
            this.volume = volume;
        }

        public LocalDate getDate() {
            return date;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public Long getVolume() {
            return volume;
        }

        @Override
        public String toString() {
            return (
                "PricePoint{" +
                "date=" +
                date +
                ", price=" +
                price +
                ", volume=" +
                volume +
                '}'
            );
        }
    }
}
