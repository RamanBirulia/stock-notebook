package com.stocknotebook.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "purchases", indexes = {
    @Index(name = "idx_purchases_user_id", columnList = "user_id"),
    @Index(name = "idx_purchases_symbol", columnList = "symbol"),
    @Index(name = "idx_purchases_user_symbol", columnList = "user_id, symbol"),
    @Index(name = "idx_purchases_purchase_date", columnList = "purchase_date")
})
public class Purchase extends BaseEntity {

    @NotBlank(message = "Symbol is required")
    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull(message = "Price per share is required")
    @Positive(message = "Price per share must be positive")
    @Column(name = "price_per_share", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerShare;

    @NotNull(message = "Commission is required")
    @PositiveOrZero(message = "Commission must be zero or positive")
    @Column(name = "commission", nullable = false, precision = 10, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO;

    @NotNull(message = "Purchase date is required")
    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Constructors
    public Purchase() {
        super();
        this.commission = BigDecimal.ZERO;
    }

    public Purchase(String symbol, Integer quantity, BigDecimal pricePerShare,
                   BigDecimal commission, LocalDate purchaseDate, User user) {
        super();
        this.symbol = symbol;
        this.quantity = quantity;
        this.pricePerShare = pricePerShare;
        this.commission = commission != null ? commission : BigDecimal.ZERO;
        this.purchaseDate = purchaseDate;
        this.user = user;
    }

    // Getters and Setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol != null ? symbol.toUpperCase() : null;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePerShare() {
        return pricePerShare;
    }

    public void setPricePerShare(BigDecimal pricePerShare) {
        this.pricePerShare = pricePerShare;
    }

    public BigDecimal getCommission() {
        return commission;
    }

    public void setCommission(BigDecimal commission) {
        this.commission = commission != null ? commission : BigDecimal.ZERO;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Business methods
    public BigDecimal getTotalCost() {
        if (pricePerShare == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal totalPrice = pricePerShare.multiply(BigDecimal.valueOf(quantity));
        return totalPrice.add(commission != null ? commission : BigDecimal.ZERO);
    }

    public BigDecimal getTotalValue(BigDecimal currentPrice) {
        if (currentPrice == null || quantity == null) {
            return BigDecimal.ZERO;
        }
        return currentPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal getProfitLoss(BigDecimal currentPrice) {
        return getTotalValue(currentPrice).subtract(getTotalCost());
    }

    public BigDecimal getProfitLossPercentage(BigDecimal currentPrice) {
        BigDecimal totalCost = getTotalCost();
        if (totalCost.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal profitLoss = getProfitLoss(currentPrice);
        return profitLoss.divide(totalCost, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    // Pre-persist callback to normalize symbol
    @PrePersist
    @PreUpdate
    private void normalizeSymbol() {
        if (this.symbol != null) {
            this.symbol = this.symbol.toUpperCase().trim();
        }
    }

    // Override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;
        Purchase purchase = (Purchase) o;
        return Objects.equals(symbol, purchase.symbol) &&
                Objects.equals(quantity, purchase.quantity) &&
                Objects.equals(pricePerShare, purchase.pricePerShare) &&
                Objects.equals(purchaseDate, purchase.purchaseDate) &&
                Objects.equals(user, purchase.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), symbol, quantity, pricePerShare, purchaseDate, user);
    }

    @Override
    public String toString() {
        return "Purchase{" +
                "id=" + getId() +
                ", symbol='" + symbol + '\'' +
                ", quantity=" + quantity +
                ", pricePerShare=" + pricePerShare +
                ", commission=" + commission +
                ", purchaseDate=" + purchaseDate +
                ", userId=" + (user != null ? user.getId() : null) +
                ", totalCost=" + getTotalCost() +
                ", createdAt=" + getCreatedAt() +
                '}';
    }
}
