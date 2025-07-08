package com.stocknotebook.controller;

import com.stocknotebook.dto.request.LoginRequestDTO;
import com.stocknotebook.dto.request.RegisterRequestDTO;
import com.stocknotebook.dto.response.AuthResponseDTO;
import com.stocknotebook.dto.response.UserInfoDTO;
import com.stocknotebook.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(
        AuthController.class
    );

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
        @Valid @RequestBody LoginRequestDTO loginRequest
    ) {
        log.debug(
            "Login request received for username: {}",
            loginRequest.username()
        );

        try {
            AuthResponseDTO response = authService.authenticateUser(
                loginRequest
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Login failed for username: {}", loginRequest.username());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error(
                "Login error for username: {}",
                loginRequest.username(),
                e
            );
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Register endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(
        @Valid @RequestBody RegisterRequestDTO registerRequest
    ) {
        log.debug(
            "Registration request received for username: {}",
            registerRequest.username()
        );

        try {
            AuthResponseDTO response = authService.registerUser(
                registerRequest
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Username already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            } else if (e.getMessage().contains("Password confirmation")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error(
                "Registration error for username: {}",
                registerRequest.username(),
                e
            );
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoDTO> getCurrentUser() {
        log.debug("Current user info request received");

        try {
            UserInfoDTO userInfo = authService.getCurrentUserInfo();
            return ResponseEntity.ok(userInfo);
        } catch (RuntimeException e) {
            log.warn("No authenticated user found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting current user info", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Refresh token endpoint
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(
        @RequestBody RefreshTokenRequestDTO refreshRequest
    ) {
        log.debug("Token refresh request received");

        try {
            AuthResponseDTO response = authService.refreshToken(
                refreshRequest.refreshToken()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Invalid refresh token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Token refresh error", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Change password endpoint
     */
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
        @Valid @RequestBody ChangePasswordRequestDTO changePasswordRequest
    ) {
        log.debug("Change password request received");

        try {
            authService.changePassword(
                changePasswordRequest.currentPassword(),
                changePasswordRequest.newPassword()
            );
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("No authenticated user")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            } else if (e.getMessage().contains("Invalid current password")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Password change error", e);
            return ResponseEntity.status(
                HttpStatus.INTERNAL_SERVER_ERROR
            ).build();
        }
    }

    /**
     * Logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.debug("Logout request received");

        // In a stateless JWT implementation, logout is typically handled client-side
        // by removing the token from storage. Server-side logout would require
        // token blacklisting or shorter token expiration times.

        return ResponseEntity.ok().build();
    }

    /**
     * Request DTO for refresh token
     */
    public record RefreshTokenRequestDTO(String refreshToken) {}

    /**
     * Request DTO for change password
     */
    public record ChangePasswordRequestDTO(
        @jakarta.validation.constraints.NotBlank(
            message = "Current password is required"
        ) String currentPassword,
        @jakarta.validation.constraints.NotBlank(
            message = "New password is required"
        ) @jakarta.validation.constraints.Size(
            min = 6,
            max = 100,
            message = "New password must be between 6 and 100 characters"
        ) String newPassword
    ) {}
}
