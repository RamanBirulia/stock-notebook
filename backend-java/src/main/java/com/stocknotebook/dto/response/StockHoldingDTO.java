package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for stock holding information
 */
public record StockHoldingDTO(
    String symbol,
    Integer totalQuantity,
    BigDecimal averagePrice,
    BigDecimal currentPrice,
    BigDecimal totalValue,
    BigDecimal totalSpent,
    BigDecimal totalCommission,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage,
    Integer purchaseCount,
    LocalDateTime firstPurchaseDate,
    LocalDateTime lastPurchaseDate
) {
    /**
     * Constructor with calculated profit/loss fields
     */
    public StockHoldingDTO(
        String symbol,
        Integer totalQuantity,
        BigDecimal averagePrice,
        BigDecimal currentPrice,
        BigDecimal totalValue,
        BigDecimal totalSpent,
        BigDecimal totalCommission,
        Integer purchaseCount,
        LocalDateTime firstPurchaseDate,
        LocalDateTime lastPurchaseDate
    ) {
        this(
            symbol,
            totalQuantity,
            averagePrice,
            currentPrice,
            totalValue,
            totalSpent,
            totalCommission != null ? totalCommission : BigDecimal.ZERO,
            totalValue.subtract(totalSpent),
            totalSpent.compareTo(BigDecimal.ZERO) > 0
                ? totalValue
                    .subtract(totalSpent)
                    .divide(totalSpent, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO,
            purchaseCount,
            firstPurchaseDate,
            lastPurchaseDate
        );
    }

    /**
     * Business methods
     */
    public boolean isProfit() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLoss() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) < 0;
    }

    public BigDecimal getAllocationPercentage(BigDecimal totalPortfolioValue) {
        if (totalPortfolioValue == null || totalPortfolioValue.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        return totalValue
            .divide(totalPortfolioValue, 4, BigDecimal.ROUND_HALF_UP)
            .multiply(BigDecimal.valueOf(100));
    }

    public boolean hasMultiplePurchases() {
        return purchaseCount != null && purchaseCount > 1;
    }

    public BigDecimal getUnrealizedGainLoss() {
        return profitLoss;
    }

    public boolean isSignificantPosition(BigDecimal threshold) {
        return totalValue.compareTo(threshold) >= 0;
    }

    public String getPositionSummary() {
        return String.format(
            "%s: %d shares @ $%.2f avg (Current: $%.2f, P/L: $%.2f)",
            symbol,
            totalQuantity,
            averagePrice,
            currentPrice,
            profitLoss
        );
    }
}
