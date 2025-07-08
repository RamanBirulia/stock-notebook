package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PortfolioSummaryDTO(
    List<PortfolioPositionDTO> positions,
    BigDecimal totalValue,
    BigDecimal totalSpent,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage,
    Integer totalPositions,
    Integer totalPurchases,
    LocalDateTime lastUpdated
) {
    // Compact constructor for validation and calculated fields
    public PortfolioSummaryDTO {
        // Ensure non-null values
        totalValue = totalValue != null ? totalValue : BigDecimal.ZERO;
        totalSpent = totalSpent != null ? totalSpent : BigDecimal.ZERO;
        profitLoss = profitLoss != null ? profitLoss : BigDecimal.ZERO;
        profitLossPercentage = profitLossPercentage != null ? profitLossPercentage : BigDecimal.ZERO;
        totalPositions = totalPositions != null ? totalPositions : (positions != null ? positions.size() : 0);
        totalPurchases = totalPurchases != null ? totalPurchases : 0;
        lastUpdated = lastUpdated != null ? lastUpdated : LocalDateTime.now();
    }

    // Simplified constructor
    public PortfolioSummaryDTO(List<PortfolioPositionDTO> positions, BigDecimal totalValue) {
        this(positions, totalValue, null, null, null, null, null, null);
    }

    // Business methods
    public boolean isProfit() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLoss() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean hasPositions() {
        return positions != null && !positions.isEmpty();
    }

    public boolean isEmpty() {
        return positions == null || positions.isEmpty();
    }

    public PortfolioPositionDTO getBestPerformer() {
        if (positions == null || positions.isEmpty()) {
            return null;
        }

        return positions.stream()
            .filter(pos -> pos.profitLossPercentage() != null)
            .max((a, b) -> a.profitLossPercentage().compareTo(b.profitLossPercentage()))
            .orElse(null);
    }

    public PortfolioPositionDTO getWorstPerformer() {
        if (positions == null || positions.isEmpty()) {
            return null;
        }

        return positions.stream()
            .filter(pos -> pos.profitLossPercentage() != null)
            .min((a, b) -> a.profitLossPercentage().compareTo(b.profitLossPercentage()))
            .orElse(null);
    }

    public BigDecimal getTotalCommissionPaid() {
        if (positions == null || positions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return positions.stream()
            .filter(pos -> pos.totalCommission() != null)
            .map(PortfolioPositionDTO::totalCommission)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getDiversificationScore() {
        if (positions == null || positions.isEmpty()) {
            return BigDecimal.ZERO;
        }

        // Simple diversification score based on position count
        // More sophisticated calculation could consider sector, market cap, etc.
        return BigDecimal.valueOf(Math.min(positions.size() * 10, 100));
    }

    @Override
    public String toString() {
        return "PortfolioSummaryDTO{" +
                "totalValue=" + totalValue +
                ", totalSpent=" + totalSpent +
                ", profitLoss=" + profitLoss +
                ", profitLossPercentage=" + profitLossPercentage +
                ", totalPositions=" + totalPositions +
                ", totalPurchases=" + totalPurchases +
                ", positionsCount=" + (positions != null ? positions.size() : 0) +
                ", lastUpdated=" + lastUpdated +
                '}';
    }
}
