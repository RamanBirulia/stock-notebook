package com.stocknotebook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
    @NotBlank(message = "Username is required")
    @Size(
        min = 3,
        max = 50,
        message = "Username must be between 3 and 50 characters"
    )
    String username,

    @NotBlank(message = "Password is required")
    @Size(
        min = 5,
        max = 100,
        message = "Password must be between 5 and 100 characters"
    )
    String password
) {
    // Compact constructor for validation and normalization
    public LoginRequestDTO {
        username = username != null ? username.trim() : null;
        // Note: password is not trimmed to preserve exact input
    }

    // Business validation method
    public boolean isValid() {
        return (
            username != null &&
            !username.isEmpty() &&
            password != null &&
            !password.isEmpty()
        );
    }

    // Override toString to protect password
    @Override
    public String toString() {
        return (
            "LoginRequestDTO{" +
            "username='" +
            username +
            '\'' +
            ", password='[PROTECTED]'" +
            '}'
        );
    }
}
