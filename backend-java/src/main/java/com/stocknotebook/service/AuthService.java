package com.stocknotebook.service;

import com.stocknotebook.dto.request.LoginRequestDTO;
import com.stocknotebook.dto.request.RegisterRequestDTO;
import com.stocknotebook.dto.response.AuthResponseDTO;
import com.stocknotebook.dto.response.UserInfoDTO;
import com.stocknotebook.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.SecretKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(
        AuthService.class
    );

    private final UserService userService;
    private final SecretKey secretKey;
    private final long jwtExpirationMs;

    public AuthService(
        UserService userService,
        @Value("${app.jwt.secret}") String jwtSecret,
        @Value("${app.jwt.expiration}") long jwtExpirationMs
    ) {
        this.userService = userService;
        this.secretKey = Keys.hmacShaKeyFor(
            jwtSecret.getBytes(StandardCharsets.UTF_8)
        );
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Authenticate user and return auth response
     */
    public AuthResponseDTO authenticateUser(LoginRequestDTO loginRequest) {
        log.debug("Authenticating user: {}", loginRequest.username());

        Optional<User> userOpt = userService.verifyCredentials(
            loginRequest.username(),
            loginRequest.password()
        );

        if (userOpt.isEmpty()) {
            log.warn(
                "Authentication failed for username: {}",
                loginRequest.username()
            );
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();

        // Generate JWT token
        String token = generateToken(user);

        // Update last login
        userService.updateLastLogin(user.getId());

        // Create response
        UserInfoDTO userInfo = new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getLastLogin()
        );

        log.info("User authenticated successfully: {}", user.getUsername());
        return new AuthResponseDTO(token, userInfo);
    }

    /**
     * Register new user and return auth response
     */
    public AuthResponseDTO registerUser(RegisterRequestDTO registerRequest) {
        log.debug("Registering user: {}", registerRequest.username());

        // Validate password confirmation
        if (!registerRequest.isPasswordConfirmed()) {
            log.warn(
                "Password confirmation failed for username: {}",
                registerRequest.username()
            );
            throw new RuntimeException("Password confirmation does not match");
        }

        // Check if username is available
        if (!userService.isUsernameAvailable(registerRequest.username())) {
            log.warn("Username already exists: {}", registerRequest.username());
            throw new RuntimeException("Username already exists");
        }

        // Create new user
        User user = userService.createUser(
            registerRequest.username(),
            registerRequest.password()
        );

        // Generate JWT token
        String token = generateToken(user);

        // Update last login (first login)
        userService.updateLastLogin(user.getId());

        // Create response
        UserInfoDTO userInfo = new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getLastLogin()
        );

        log.info("User registered successfully: {}", user.getUsername());
        return new AuthResponseDTO(token, userInfo);
    }

    /**
     * Get current user information
     */
    @Transactional(readOnly = true)
    public UserInfoDTO getCurrentUserInfo() {
        log.debug("Getting current user info");

        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            log.warn("No authenticated user found");
            throw new RuntimeException("No authenticated user found");
        }

        User user = userOpt.get();
        return new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getLastLogin()
        );
    }

    /**
     * Change user password
     */
    public void changePassword(String currentPassword, String newPassword) {
        log.debug("Changing password for current user");

        Optional<User> userOpt = getCurrentUser();
        if (userOpt.isEmpty()) {
            log.warn("No authenticated user found for password change");
            throw new RuntimeException("No authenticated user found");
        }

        User user = userOpt.get();
        boolean success = userService.changePassword(
            user.getId(),
            currentPassword,
            newPassword
        );

        if (!success) {
            log.warn("Password change failed for user: {}", user.getUsername());
            throw new RuntimeException("Invalid current password");
        }

        log.info(
            "Password changed successfully for user: {}",
            user.getUsername()
        );
    }

    /**
     * Generate JWT token for a user
     */
    public String generateToken(User user) {
        log.debug("Generating JWT token for user: {}", user.getUsername());

        Instant now = Instant.now();
        Instant expiration = now.plus(jwtExpirationMs, ChronoUnit.MILLIS);

        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("username", user.getUsername())
            .claim("user_id", user.getId().toString())
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiration))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Validate JWT token and extract user ID
     */
    public Optional<UUID> validateTokenAndGetUserId(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            String userIdStr = claims.getSubject();
            UUID userId = UUID.fromString(userIdStr);

            log.debug("Token validated successfully for user ID: {}", userId);
            return Optional.of(userId);
        } catch (ExpiredJwtException e) {
            log.warn("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token is unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token is malformed: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT token is invalid: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT token validation error", e);
        }

        return Optional.empty();
    }

    /**
     * Validate JWT token and get user
     */
    public Optional<User> validateTokenAndGetUser(String token) {
        Optional<UUID> userIdOpt = validateTokenAndGetUserId(token);

        if (userIdOpt.isEmpty()) {
            return Optional.empty();
        }

        UUID userId = userIdOpt.get();
        return userService.findById(userId);
    }

    /**
     * Extract username from JWT token
     */
    public Optional<String> extractUsername(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            return Optional.ofNullable(claims.get("username", String.class));
        } catch (Exception e) {
            log.debug("Failed to extract username from token", e);
            return Optional.empty();
        }
    }

    /**
     * Check if JWT token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            Date expiration = claims.getExpiration();
            return expiration.before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        } catch (Exception e) {
            log.debug("Error checking token expiration", e);
            return true;
        }
    }

    /**
     * Get current authenticated user from security context
     */
    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser() {
        try {
            Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.empty();
            }

            Object principal = authentication.getPrincipal();

            if (principal instanceof String) {
                // If principal is user ID string
                UUID userId = UUID.fromString((String) principal);
                return userService.findById(userId);
            } else if (principal instanceof User) {
                // If principal is User object
                return Optional.of((User) principal);
            }

            return Optional.empty();
        } catch (Exception e) {
            log.debug("Error getting current user from security context", e);
            return Optional.empty();
        }
    }

    /**
     * Get current authenticated user ID from security context
     */
    public Optional<UUID> getCurrentUserId() {
        try {
            Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                return Optional.empty();
            }

            Object principal = authentication.getPrincipal();

            if (principal instanceof String) {
                // If principal is user ID string
                return Optional.of(UUID.fromString((String) principal));
            } else if (principal instanceof User) {
                // If principal is User object
                return Optional.of(((User) principal).getId());
            }

            return Optional.empty();
        } catch (Exception e) {
            log.debug("Error getting current user ID from security context", e);
            return Optional.empty();
        }
    }

    /**
     * Generate refresh token for a user
     */
    public String generateRefreshToken(User user) {
        log.debug("Generating refresh token for user: {}", user.getUsername());

        // Generate refresh token with longer expiration (7 days)
        Instant now = Instant.now();
        Instant expiration = now.plus(7, ChronoUnit.DAYS);

        return Jwts.builder()
            .setSubject(user.getId().toString())
            .claim("username", user.getUsername())
            .claim("user_id", user.getId().toString())
            .claim("type", "refresh")
            .setIssuedAt(Date.from(now))
            .setExpiration(Date.from(expiration))
            .signWith(secretKey, SignatureAlgorithm.HS256)
            .compact();
    }

    /**
     * Validate refresh token and get user
     */
    public Optional<User> validateRefreshToken(String refreshToken) {
        log.debug("Validating refresh token");

        try {
            Claims claims = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(refreshToken)
                .getPayload();

            String type = claims.get("type", String.class);
            if (!"refresh".equals(type)) {
                log.warn("Invalid token type for refresh token");
                return Optional.empty();
            }

            String userIdStr = claims.getSubject();
            UUID userId = UUID.fromString(userIdStr);

            return userService.findById(userId);
        } catch (Exception e) {
            log.debug("Failed to validate refresh token", e);
            return Optional.empty();
        }
    }

    /**
     * Refresh JWT token
     */
    public AuthResponseDTO refreshToken(String refreshToken) {
        log.debug("Refreshing JWT token");

        Optional<User> userOpt = validateRefreshToken(refreshToken);
        if (userOpt.isEmpty()) {
            log.warn("Invalid refresh token");
            throw new RuntimeException("Invalid refresh token");
        }

        User user = userOpt.get();

        // Generate new JWT token
        String newToken = generateToken(user);

        // Create response
        UserInfoDTO userInfo = new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getLastLogin()
        );

        log.info("Token refreshed for user: {}", user.getUsername());
        return new AuthResponseDTO(newToken, userInfo);
    }

    /**
     * Create authentication token for security context
     */
    public Authentication createAuthentication(User user) {
        return new UserAuthentication(user);
    }

    /**
     * Get token expiration time
     */
    public long getTokenExpirationMs() {
        return jwtExpirationMs;
    }

    /**
     * Custom Authentication implementation for JWT
     */
    private static class UserAuthentication implements Authentication {

        private final User user;
        private boolean authenticated = true;

        public UserAuthentication(User user) {
            this.user = user;
        }

        @Override
        public String getName() {
            return user.getUsername();
        }

        @Override
        public Object getPrincipal() {
            return user;
        }

        @Override
        public Object getCredentials() {
            return null; // No credentials needed for JWT
        }

        @Override
        public Object getDetails() {
            return user;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            // Return user roles/authorities if needed
            return java.util.Collections.emptyList();
        }

        @Override
        public boolean isAuthenticated() {
            return authenticated;
        }

        @Override
        public void setAuthenticated(boolean isAuthenticated)
            throws IllegalArgumentException {
            this.authenticated = isAuthenticated;
        }
    }
}
