package com.stocknotebook.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record PurchaseResponseDTO(
    String id,
    String symbol,
    Integer quantity,
    BigDecimal pricePerShare,
    BigDecimal commission,
    LocalDate purchaseDate,
    BigDecimal totalCost,
    BigDecimal currentPrice,
    BigDecimal totalValue,
    BigDecimal profitLoss,
    BigDecimal profitLossPercentage
) {
    // Compact constructor for validation and calculated fields
    public PurchaseResponseDTO {
        // Ensure commission is not null
        commission = commission != null ? commission : BigDecimal.ZERO;

        // Calculate total cost if not provided
        if (totalCost == null && pricePerShare != null && quantity != null) {
            totalCost = pricePerShare.multiply(BigDecimal.valueOf(quantity)).add(commission);
        }

        // Calculate derived fields if current price is available
        if (currentPrice != null && quantity != null) {
            if (totalValue == null) {
                totalValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
            }

            if (profitLoss == null && totalCost != null) {
                profitLoss = totalValue.subtract(totalCost);
            }

            if (profitLossPercentage == null && totalCost != null && totalCost.compareTo(BigDecimal.ZERO) > 0) {
                profitLossPercentage = profitLoss.divide(totalCost, 4, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            }
        }
    }

    // Constructor from UUID
    public PurchaseResponseDTO(UUID id, String symbol, Integer quantity, BigDecimal pricePerShare,
                              BigDecimal commission, LocalDate purchaseDate, BigDecimal totalCost,
                              BigDecimal currentPrice, BigDecimal totalValue, BigDecimal profitLoss,
                              BigDecimal profitLossPercentage) {
        this(id != null ? id.toString() : null, symbol, quantity, pricePerShare, commission,
             purchaseDate, totalCost, currentPrice, totalValue, profitLoss, profitLossPercentage);
    }

    // Simplified constructor without calculated fields
    public PurchaseResponseDTO(String id, String symbol, Integer quantity, BigDecimal pricePerShare,
                              BigDecimal commission, LocalDate purchaseDate) {
        this(id, symbol, quantity, pricePerShare, commission, purchaseDate, null, null, null, null, null);
    }

    // Business methods
    public boolean isProfit() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isLoss() {
        return profitLoss != null && profitLoss.compareTo(BigDecimal.ZERO) < 0;
    }

    public boolean hasCurrentPrice() {
        return currentPrice != null;
    }

    public boolean isValid() {
        return id != null && !id.isEmpty() &&
               symbol != null && !symbol.isEmpty() &&
               quantity != null && quantity > 0 &&
               pricePerShare != null && pricePerShare.compareTo(BigDecimal.ZERO) > 0 &&
               purchaseDate != null;
    }

    @Override
    public String toString() {
        return "PurchaseResponseDTO{" +
                "id='" + id + '\'' +
                ", symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", pricePerShare=" + pricePerShare +
                ", commission=" + commission +
                ", purchaseDate=" + purchaseDate +
                ", totalCost=" + totalCost +
                ", currentPrice=" + currentPrice +
                ", totalValue=" + totalValue +
                ", profitLoss=" + profitLoss +
                ", profitLossPercentage=" + profitLossPercentage +
                '}';
    }
}
