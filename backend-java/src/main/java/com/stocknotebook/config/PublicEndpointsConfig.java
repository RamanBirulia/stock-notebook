package com.stocknotebook.config;

import org.springframework.context.annotation.Configuration;
import java.util.Arrays;
import java.util.List;

@Configuration
public class PublicEndpointsConfig {

    /**
     * List of public endpoints that don't require authentication
     */
    private static final List<String> PUBLIC_ENDPOINTS = Arrays.asList(
        "/health",
        "/api/health",
        "/actuator/**",
        "/api/auth/login",
        "/api/auth/register"
    );

    /**
     * Get all public endpoints
     */
    public List<String> getPublicEndpoints() {
        return PUBLIC_ENDPOINTS;
    }

    /**
     * Get public endpoints as array for Spring Security RequestMatchers
     */
    public String[] getPublicEndpointsArray() {
        return PUBLIC_ENDPOINTS.toArray(new String[0]);
    }

    /**
     * Check if a given path is a public endpoint
     */
    public boolean isPublicEndpoint(String path) {
        return PUBLIC_ENDPOINTS.stream()
            .anyMatch(endpoint -> {
                if (endpoint.endsWith("/**")) {
                    // Handle wildcard patterns like "/actuator/**"
                    String prefix = endpoint.substring(0, endpoint.length() - 3);
                    return path.startsWith(prefix);
                } else {
                    // Exact match
                    return path.equals(endpoint);
                }
            });
    }
}
