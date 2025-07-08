package com.stocknotebook.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserInfoDTO(
    String id,
    String username,
    LocalDateTime lastLogin
) {
    // Compact constructor for validation and normalization
    public UserInfoDTO {
        // No validation needed here as we want to allow null values
    }

    // Constructor from UUID
    public UserInfoDTO(UUID id, String username, LocalDateTime lastLogin) {
        this(id != null ? id.toString() : null, username, lastLogin);
    }

    // Business methods
    public boolean hasLastLogin() {
        return lastLogin != null;
    }

    public boolean isValid() {
        return id != null && !id.isEmpty() && username != null && !username.isEmpty();
    }

    public boolean isValidId() {
        if (id == null || id.isEmpty()) {
            return false;
        }
        try {
            UUID.fromString(id);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public String toString() {
        return "UserInfoDTO{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", lastLogin=" + lastLogin +
                '}';
    }
}
