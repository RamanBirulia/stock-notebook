package com.stocknotebook.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9._-]+$", message = "Username can only contain letters, numbers, dots, underscores, and hyphens")
    String username,

    @NotBlank(message = "Password is required")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    String password,

    @NotBlank(message = "Password confirmation is required")
    String confirmPassword
) {
    // Compact constructor for validation and normalization
    public RegisterRequestDTO {
        username = username != null ? username.trim().toLowerCase() : null;
        // Note: passwords are not trimmed to preserve exact input
    }

    // Business validation methods
    public boolean isPasswordConfirmed() {
        return password != null && password.equals(confirmPassword);
    }

    public boolean isValidUsername() {
        return username != null &&
               username.length() >= 3 &&
               username.length() <= 50 &&
               username.matches("^[a-zA-Z0-9._-]+$");
    }

    public boolean isValidPassword() {
        return password != null && password.length() >= 6 && password.length() <= 100;
    }

    public boolean isValid() {
        return isValidUsername() && isValidPassword() && isPasswordConfirmed();
    }

    // Override toString to protect passwords
    @Override
    public String toString() {
        return "RegisterRequestDTO{" +
                "username='" + username + '\'' +
                ", password='[PROTECTED]'" +
                ", confirmPassword='[PROTECTED]'" +
                '}';
    }
}
