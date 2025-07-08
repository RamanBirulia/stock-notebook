package com.stocknotebook.controller;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(
        HealthController.class
    );

    @Autowired
    private DataSource dataSource;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Stock Notebook Backend");
        response.put("version", "1.0.0");

        // Check database connection
        try (Connection connection = dataSource.getConnection()) {
            response.put("database", "Connected");
            response.put("database_url", connection.getMetaData().getURL());
        } catch (Exception e) {
            response.put("database", "Disconnected");
            response.put("database_error", e.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/health")
    public ResponseEntity<Map<String, Object>> apiHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Stock tracker backend is running");
        response.put("timestamp", LocalDateTime.now());

        log.info("Health request received for username");

        return ResponseEntity.ok(response);
    }
}
