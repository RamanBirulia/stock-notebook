package com.stocknotebook.dto.response;

public record AuthResponseDTO(
    String token,
    UserInfoDTO user
) {
    // Compact constructor for validation if needed
    public AuthResponseDTO {
        // No validation needed here as we want to allow null values in some cases
    }

    // Business methods
    public boolean isValid() {
        return token != null && !token.isEmpty() && user != null && user.isValid();
    }

    public boolean hasToken() {
        return token != null && !token.isEmpty();
    }

    public boolean hasUser() {
        return user != null;
    }

    // Override toString to protect sensitive token information
    @Override
    public String toString() {
        return "AuthResponseDTO{" +
                "token='" + (token != null ? "[PROTECTED]" : null) + '\'' +
                ", user=" + user +
                '}';
    }
}
