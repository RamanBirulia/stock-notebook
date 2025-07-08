package com.stocknotebook.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePurchaseRequestDTO(
    @NotBlank(message = "Symbol is required")
    @Size(min = 1, max = 10, message = "Symbol must be between 1 and 10 characters")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "Symbol must contain only uppercase letters and numbers")
    String symbol,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Max(value = 1000000, message = "Quantity cannot exceed 1,000,000 shares")
    Integer quantity,

    @NotNull(message = "Price per share is required")
    @DecimalMin(value = "0.01", message = "Price per share must be at least $0.01")
    @DecimalMax(value = "999999.99", message = "Price per share cannot exceed $999,999.99")
    @Digits(integer = 6, fraction = 2, message = "Price per share must have at most 6 digits before decimal and 2 after")
    BigDecimal pricePerShare,

    @NotNull(message = "Commission is required")
    @DecimalMin(value = "0.00", message = "Commission must be zero or positive")
    @DecimalMax(value = "9999.99", message = "Commission cannot exceed $9,999.99")
    @Digits(integer = 4, fraction = 2, message = "Commission must have at most 4 digits before decimal and 2 after")
    BigDecimal commission,

    @NotNull(message = "Purchase date is required")
    @PastOrPresent(message = "Purchase date cannot be in the future")
    LocalDate purchaseDate
) {
    // Compact constructor for validation and normalization
    public CreatePurchaseRequestDTO {
        symbol = symbol != null ? symbol.trim().toUpperCase() : null;
        commission = commission != null ? commission : BigDecimal.ZERO;
    }

    // Business methods
    public BigDecimal getTotalCost() {
        if (pricePerShare == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalPrice = pricePerShare.multiply(BigDecimal.valueOf(quantity));
        return totalPrice.add(commission != null ? commission : BigDecimal.ZERO);
    }

    public boolean isValid() {
        return symbol != null && !symbol.trim().isEmpty() &&
               quantity != null && quantity > 0 &&
               pricePerShare != null && pricePerShare.compareTo(BigDecimal.ZERO) > 0 &&
               commission != null && commission.compareTo(BigDecimal.ZERO) >= 0 &&
               purchaseDate != null && !purchaseDate.isAfter(LocalDate.now());
    }

    @Override
    public String toString() {
        return "CreatePurchaseRequestDTO{" +
                "symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", pricePerShare=" + pricePerShare +
                ", commission=" + commission +
                ", purchaseDate=" + purchaseDate +
                ", totalCost=" + getTotalCost() +
                '}';
    }
}
