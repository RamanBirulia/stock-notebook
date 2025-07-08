package com.stocknotebook.security;

import com.stocknotebook.config.PublicEndpointsConfig;
import com.stocknotebook.entity.User;
import com.stocknotebook.service.AuthService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(
        JwtAuthenticationFilter.class
    );

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthService authService;
    private final PublicEndpointsConfig publicEndpointsConfig;

    public JwtAuthenticationFilter(
        AuthService authService,
        PublicEndpointsConfig publicEndpointsConfig
    ) {
        this.authService = authService;
        this.publicEndpointsConfig = publicEndpointsConfig;
    }

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request,
        @NonNull HttpServletResponse response,
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        log.debug("Processing request: {} {}", request.getMethod(), requestURI);

        try {
            // Extract JWT token from request
            String token = extractTokenFromRequest(request);

            if (token != null) {
                log.debug("JWT token found in request");

                // Validate token and get user
                Optional<User> userOpt = authService.validateTokenAndGetUser(
                    token
                );

                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    log.debug(
                        "JWT token validated successfully for user: {}",
                        user.getUsername()
                    );

                    // Create authentication and set in security context
                    Authentication authentication =
                        authService.createAuthentication(user);
                    SecurityContextHolder.getContext().setAuthentication(
                        authentication
                    );

                    log.debug(
                        "Security context set for user: {}",
                        user.getUsername()
                    );
                } else {
                    log.debug("Invalid JWT token");
                    // Don't set authentication - let Spring Security handle unauthorized access
                }
            } else {
                log.debug("No JWT token found in request");
                // No token found - let Spring Security handle unauthorized access
            }
        } catch (Exception e) {
            log.error("Error processing JWT token", e);
            // Clear security context on error
            SecurityContextHolder.clearContext();
        }

        // Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader(AUTHORIZATION_HEADER);

        if (
            StringUtils.hasText(authHeader) &&
            authHeader.startsWith(BEARER_PREFIX)
        ) {
            String token = authHeader.substring(BEARER_PREFIX.length());
            log.debug("Extracted JWT token from Authorization header");
            return token;
        }

        return null;
    }

    /**
     * Determine if the filter should be applied to this request
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip JWT validation for public endpoints
        boolean isPublicEndpoint = publicEndpointsConfig.isPublicEndpoint(path);

        if (isPublicEndpoint) {
            log.debug("Skipping JWT validation for public endpoint: {}", path);
            return true;
        }

        return false;
    }
}
