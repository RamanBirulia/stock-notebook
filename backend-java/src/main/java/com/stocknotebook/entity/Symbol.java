package com.stocknotebook.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "symbols")
public class Symbol extends BaseEntity {

    @NotBlank(message = "Symbol cannot be blank")
    @Size(max = 10, message = "Symbol must be at most 10 characters")
    @Pattern(regexp = "^[A-Z0-9.-]+$", message = "Symbol must contain only uppercase letters, numbers, dots, and hyphens")
    @Column(name = "symbol", nullable = false, unique = true, length = 10)
    private String symbol;

    @NotBlank(message = "Company name cannot be blank")
    @Size(max = 500, message = "Company name must be at most 500 characters")
    @Column(name = "company_name", nullable = false, length = 500)
    private String companyName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Size(max = 100, message = "Sector must be at most 100 characters")
    @Column(name = "sector", length = 100)
    private String sector;

    @Size(max = 100, message = "Industry must be at most 100 characters")
    @Column(name = "industry", length = 100)
    private String industry;

    @Size(max = 50, message = "Exchange must be at most 50 characters")
    @Column(name = "exchange", length = 50)
    private String exchange;

    @Enumerated(EnumType.STRING)
    @Column(name = "market_cap_category", length = 20)
    private MarketCapCategory marketCapCategory;

    @Size(max = 50, message = "Country must be at most 50 characters")
    @Column(name = "country", length = 50)
    private String country = "US";

    @Size(max = 10, message = "Currency must be at most 10 characters")
    @Column(name = "currency", length = 10)
    private String currency = "USD";

    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Symbol() {
        super();
    }

    public Symbol(String symbol, String companyName) {
        this();
        this.symbol = symbol;
        this.companyName = companyName;
    }

    public Symbol(String symbol, String companyName, String description, String sector, String industry) {
        this(symbol, companyName);
        this.description = description;
        this.sector = sector;
        this.industry = industry;
    }

    // Getters and Setters
    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }

    public MarketCapCategory getMarketCapCategory() {
        return marketCapCategory;
    }

    public void setMarketCapCategory(MarketCapCategory marketCapCategory) {
        this.marketCapCategory = marketCapCategory;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    // Enum for market cap categories
    public enum MarketCapCategory {
        LARGE, MID, SMALL, MICRO, NANO
    }

    @Override
    public String toString() {
        return "Symbol{" +
                "id=" + getId() +
                ", symbol='" + symbol + '\'' +
                ", companyName='" + companyName + '\'' +
                ", sector='" + sector + '\'' +
                ", industry='" + industry + '\'' +
                ", exchange='" + exchange + '\'' +
                ", marketCapCategory=" + marketCapCategory +
                ", country='" + country + '\'' +
                ", currency='" + currency + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
