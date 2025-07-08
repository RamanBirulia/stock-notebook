package com.stocknotebook.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

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

        return ResponseEntity.ok(response);
    }
}
