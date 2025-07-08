package com.stocknotebook.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "stock_data",
       indexes = {
           @Index(name = "idx_stock_data_symbol", columnList = "symbol"),
           @Index(name = "idx_stock_data_date", columnList = "data_date"),
           @Index(name = "idx_stock_data_symbol_date", columnList = "symbol, data_date"),
           @Index(name = "idx_stock_data_created_at", columnList = "created_at")
       },
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_stock_data_symbol_date", columnNames = {"symbol", "data_date"})
       })
public class StockData extends BaseEntity {

    @NotBlank(message = "Symbol is required")
    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "volume")
    private Long volume;

    @NotNull(message = "Data date is required")
    @Column(name = "data_date", nullable = false)
    private LocalDate dataDate;

    // Constructors
    public StockData() {
        super();
    }

    public StockData(String symbol, BigDecimal price, Long volume, LocalDate dataDate) {
        super();
        this.symbol = symbol;
        this.price = price;
        this.volume = volume;
        this.dataDate = dataDate;
    }

    // Getters and Setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol != null ? symbol.toUpperCase() : null;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Long getVolume() {
        return volume;
    }

    public void setVolume(Long volume) {
        this.volume = volume;
    }

    public LocalDate getDataDate() {
        return dataDate;
    }

    public void setDataDate(LocalDate dataDate) {
        this.dataDate = dataDate;
    }

    // Business methods
    public boolean isToday() {
        return dataDate != null && dataDate.equals(LocalDate.now());
    }

    public boolean isOlderThan(int days) {
        if (dataDate == null) {
            return true;
        }
        return dataDate.isBefore(LocalDate.now().minusDays(days));
    }

    public boolean isWeekend() {
        if (dataDate == null) {
            return false;
        }
        int dayOfWeek = dataDate.getDayOfWeek().getValue();
        return dayOfWeek == 6 || dayOfWeek == 7; // Saturday or Sunday
    }

    // Pre-persist callback to normalize symbol
    @PrePersist
    @PreUpdate
    private void normalizeSymbol() {
        if (this.symbol != null) {
            this.symbol = this.symbol.toUpperCase().trim();
        }
    }

    // Override equals and hashCode based on symbol and date (natural key)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        StockData stockData = (StockData) o;
        return Objects.equals(symbol, stockData.symbol) &&
                Objects.equals(dataDate, stockData.dataDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(symbol, dataDate);
    }

    @Override
    public String toString() {
        return "StockData{" +
                "id=" + getId() +
                ", symbol='" + symbol + '\'' +
                ", price=" + price +
                ", volume=" + volume +
                ", dataDate=" + dataDate +
                ", createdAt=" + getCreatedAt() +
                ", updatedAt=" + getUpdatedAt() +
                '}';
    }
}
