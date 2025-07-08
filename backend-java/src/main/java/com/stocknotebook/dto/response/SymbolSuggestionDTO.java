package com.stocknotebook.dto.response;

public record SymbolSuggestionDTO(
    String symbol,
    String name,
    String exchange,
    String assetType
) {
    // Compact constructor for validation and normalization
    public SymbolSuggestionDTO {
        // No validation needed here as we want to allow null values from external API
    }

    // Business methods
    public boolean isValid() {
        return symbol != null && !symbol.trim().isEmpty() &&
               name != null && !name.trim().isEmpty();
    }

    public boolean isEquity() {
        return "EQUITY".equalsIgnoreCase(assetType) || "Stock".equalsIgnoreCase(assetType);
    }

    public boolean isFromExchange(String exchangeName) {
        return exchange != null && exchange.equalsIgnoreCase(exchangeName);
    }

    public String getDisplayName() {
        if (name != null && !name.trim().isEmpty()) {
            return name;
        }
        return symbol;
    }

    public String getFullDescription() {
        StringBuilder sb = new StringBuilder();
        sb.append(symbol);

        if (name != null && !name.trim().isEmpty()) {
            sb.append(" - ").append(name);
        }

        if (exchange != null && !exchange.trim().isEmpty()) {
            sb.append(" (").append(exchange).append(")");
        }

        return sb.toString();
    }

    @Override
    public String toString() {
        return "SymbolSuggestionDTO{" +
                "symbol='" + symbol + '\'' +
                ", name='" + name + '\'' +
                ", exchange='" + exchange + '\'' +
                ", assetType='" + assetType + '\'' +
                '}';
    }
}
