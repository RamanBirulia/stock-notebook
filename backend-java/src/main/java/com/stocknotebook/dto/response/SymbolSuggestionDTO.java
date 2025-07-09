package com.stocknotebook.dto.response;

public record SymbolSuggestionDTO(
    String symbol,
    String name,
    String description,
    String sector,
    String industry,
    String exchange,
    String marketCapCategory,
    String country,
    String currency
) {
    // Compact constructor for validation and normalization
    public SymbolSuggestionDTO {
        // No validation needed here as we want to allow null values from database
    }

    // Business methods
    public boolean isValid() {
        return (
            symbol != null &&
            !symbol.trim().isEmpty() &&
            name != null &&
            !name.trim().isEmpty()
        );
    }

    public boolean isLargeCap() {
        return "LARGE".equalsIgnoreCase(marketCapCategory);
    }

    public boolean isMidCap() {
        return "MID".equalsIgnoreCase(marketCapCategory);
    }

    public boolean isSmallCap() {
        return "SMALL".equalsIgnoreCase(marketCapCategory);
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

    public String getShortDescription() {
        if (description != null && description.length() > 100) {
            return description.substring(0, 97) + "...";
        }
        return description;
    }

    public String getFullDescription() {
        StringBuilder sb = new StringBuilder();
        sb.append(symbol);

        if (name != null && !name.trim().isEmpty()) {
            sb.append(" - ").append(name);
        }

        if (sector != null && !sector.trim().isEmpty()) {
            sb.append(" | ").append(sector);
        }

        if (exchange != null && !exchange.trim().isEmpty()) {
            sb.append(" (").append(exchange).append(")");
        }

        return sb.toString();
    }

    @Override
    public String toString() {
        return (
            "SymbolSuggestionDTO{" +
            "symbol='" +
            symbol +
            '\'' +
            ", name='" +
            name +
            '\'' +
            ", description='" +
            description +
            '\'' +
            ", sector='" +
            sector +
            '\'' +
            ", industry='" +
            industry +
            '\'' +
            ", exchange='" +
            exchange +
            '\'' +
            ", marketCapCategory='" +
            marketCapCategory +
            '\'' +
            ", country='" +
            country +
            '\'' +
            ", currency='" +
            currency +
            '\'' +
            '}'
        );
    }
}
