package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PortfolioPositionDTO(
    String symbol,
    Integer quantity,
    BigDecimal averagePrice,
    BigDecimal currentPrice,
    BigDecimal currentValue,
    BigDecimal totalSpent,
    BigDecimal totalCommission,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage,
    Integer purchaseCount,
    LocalDate firstPurchaseDate,
    LocalDate lastPurchaseDate
) {
    // Compact constructor for validation and calculated fields
    public PortfolioPositionDTO {
        // Ensure non-null values
        symbol = symbol != null ? symbol.toUpperCase() : null;
        quantity = quantity != null ? quantity : 0;
        averagePrice = averagePrice != null ? averagePrice : BigDecimal.ZERO;
        currentPrice = currentPrice != null ? currentPrice : BigDecimal.ZERO;
        totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        totalCommission = totalCommission != null ? totalCommission : BigDecimal.ZERO;
        purchaseCount = purchaseCount != null ? purchaseCount : 0;

        // Calculate derived fields if not provided
        if (currentValue == null && currentPrice != null && quantity != null) {
            currentValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
        }
        currentValue = currentValue != null ? currentValue : BigDecimal.ZERO;

        if (profitLoss == null && currentValue != null && totalSpent != null) {
            profitLoss = currentValue.subtract(totalSpent);
        }
        profitLoss = profitLoss != null ? profitLoss : BigDecimal.ZERO;

        if (profitLossPercentage == null && totalSpent != null && totalSpent.compareTo(BigDecimal.ZERO) > 0) {
            profitLossPercentage = profitLoss.divide(totalSpent, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
        }
        profitLossPercentage = profitLossPercentage != null ? profitLossPercentage : BigDecimal.ZERO;
    }

    // Simplified constructor
    public PortfolioPositionDTO(String symbol, Integer quantity, BigDecimal averagePrice,
                               BigDecimal currentPrice, BigDecimal currentValue, BigDecimal totalSpent) {
        this(symbol, quantity, averagePrice, currentPrice, currentValue, totalSpent,
             null, null, null, null, null, null);
    }

    // Business methods
    public boolean isProfit() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLoss() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean hasCurrentPrice() {
        return currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isValid() {
        return symbol != null && !symbol.isEmpty() &&
               quantity != null && quantity > 0 &&
               averagePrice != null && averagePrice.compareTo(BigDecimal.ZERO) > 0;
    }

    public BigDecimal getAllocationPercentage(BigDecimal totalPortfolioValue) {
        if (totalPortfolioValue == null || totalPortfolioValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return currentValue.divide(totalPortfolioValue, 4, BigDecimal.ROUND_HALF_UP)
                         .multiply(BigDecimal.valueOf(100));
    }

    public BigDecimal getGainLossPerShare() {
        if (currentPrice == null || averagePrice == null) {
            return BigDecimal.ZERO;
        }
        return currentPrice.subtract(averagePrice);
    }

    public boolean isLongTerm() {
        return firstPurchaseDate != null &&
               firstPurchaseDate.isBefore(LocalDate.now().minusYears(1));
    }

    @Override
    public String toString() {
        return "PortfolioPositionDTO{" +
                "symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", averagePrice=" + averagePrice +
                ", currentPrice=" + currentPrice +
                ", currentValue=" + currentValue +
                ", totalSpent=" + totalSpent +
                ", profitLoss=" + profitLoss +
                ", profitLossPercentage=" + profitLossPercentage +
                ", purchaseCount=" + purchaseCount +
                '}';
    }
}
