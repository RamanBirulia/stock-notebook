package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StockPriceDTO(
    String symbol,
    BigDecimal price,
    LocalDateTime timestamp
) {
    // Compact constructor for validation and normalization
    public StockPriceDTO {
        symbol = symbol != null ? symbol.toUpperCase() : null;
        timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    // Business methods
    public boolean isValid() {
        return symbol != null && !symbol.isEmpty() &&
               price != null && price.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isRecent() {
        return timestamp != null && timestamp.isAfter(LocalDateTime.now().minusMinutes(5));
    }

    public boolean isStale() {
        return timestamp != null && timestamp.isBefore(LocalDateTime.now().minusHours(1));
    }

    @Override
    public String toString() {
        return "StockPriceDTO{" +
                "symbol='" + symbol + '\'' +
                ", price=" + price +
                ", timestamp=" + timestamp +
                '}';
    }
}
