package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record DashboardResponseDTO(
    BigDecimal totalSpent,
    BigDecimal currentValue,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage,
    List<StockHoldingDTO> stocks,
    Integer totalPositions,
    Integer totalPurchases,
    LocalDateTime lastUpdated
) {
    // Compact constructor for validation and calculated fields
    public DashboardResponseDTO {
        // Ensure non-null values
        totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        currentValue = currentValue != null ? currentValue : BigDecimal.ZERO;
        profitLoss = profitLoss != null ? profitLoss : BigDecimal.ZERO;
        profitLossPercentage = profitLossPercentage != null ? profitLossPercentage : BigDecimal.ZERO;
        totalPositions = totalPositions != null ? totalPositions : (stocks != null ? stocks.size() : 0);
        totalPurchases = totalPurchases != null ? totalPurchases : 0;
        lastUpdated = lastUpdated != null ? lastUpdated : LocalDateTime.now();
    }

    // Simplified constructor
    public DashboardResponseDTO(BigDecimal totalSpent, BigDecimal currentValue,
                               BigDecimal profitLoss, BigDecimal profitLossPercentage,
                               List<StockHoldingDTO> stocks) {
        this(totalSpent, currentValue, profitLoss, profitLossPercentage, stocks, null, null, null);
    }

    // Business methods
    public boolean isProfit() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLoss() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean hasPositions() {
        return stocks != null && !stocks.isEmpty();
    }

    public boolean isEmpty() {
        return stocks == null || stocks.isEmpty();
    }

    public StockHoldingDTO getBestPerformer() {
        if (stocks == null || stocks.isEmpty()) {
            return null;
        }

        return stocks.stream()
            .filter(stock -> stock.profitLossPercentage() != null)
            .max((a, b) -> a.profitLossPercentage().compareTo(b.profitLossPercentage()))
            .orElse(null);
    }

    public StockHoldingDTO getWorstPerformer() {
        if (stocks == null || stocks.isEmpty()) {
            return null;
        }

        return stocks.stream()
            .filter(stock -> stock.profitLossPercentage() != null)
            .min((a, b) -> a.profitLossPercentage().compareTo(b.profitLossPercentage()))
            .orElse(null);
    }

    public BigDecimal getTotalCommissionPaid() {
        if (stocks == null || stocks.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return stocks.stream()
            .filter(stock -> stock.totalCommission() != null)
            .map(StockHoldingDTO::totalCommission)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getDiversificationScore() {
        if (stocks == null || stocks.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Simple diversification score based on position count
        return BigDecimal.valueOf(Math.min(stocks.size() * 10, 100));
    }

    @Override
    public String toString() {
        return "DashboardResponseDTO{" +
                "totalSpent=" + totalSpent +
                ", currentValue=" + currentValue +
                ", profitLoss=" + profitLoss +
                ", profitLossPercentage=" + profitLossPercentage +
                ", totalPositions=" + totalPositions +
                ", totalPurchases=" + totalPurchases +
                ", stocksCount=" + (stocks != null ? stocks.size() : 0) +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}
