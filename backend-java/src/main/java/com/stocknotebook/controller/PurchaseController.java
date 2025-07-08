package com.stocknotebook.controller;

import com.stocknotebook.dto.request.CreatePurchaseRequestDTO;
import com.stocknotebook.dto.response.PortfolioSummaryDTO;
import com.stocknotebook.dto.response.PurchaseResponseDTO;
import com.stocknotebook.service.AuthService;
import com.stocknotebook.service.PurchaseService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private static final Logger log = LoggerFactory.getLogger(PurchaseController.class);

    private final PurchaseService purchaseService;
    private final AuthService authService;

    public PurchaseController(PurchaseService purchaseService, AuthService authService) {
        this.purchaseService = purchaseService;
        this.authService = authService;
    }

    /**
     * Create a new purchase
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PurchaseResponseDTO> createPurchase(
            @Valid @RequestBody CreatePurchaseRequestDTO request) {
        log.debug("Create purchase request received for symbol: {}", request.symbol());

        try {
            UUID userId = getCurrentUserId();
            PurchaseResponseDTO response = purchaseService.createPurchase(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.warn("Failed to create purchase: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error creating purchase", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all purchases for the current user
     */
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponseDTO>> getUserPurchases() {
        log.debug("Get user purchases request received");

        try {
            UUID userId = getCurrentUserId();
            List<PurchaseResponseDTO> purchases = purchaseService.getUserPurchases(userId);
            return ResponseEntity.ok(purchases);
        } catch (RuntimeException e) {
            log.warn("Failed to get user purchases: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting user purchases", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get purchases for a specific symbol
     */
    @GetMapping("/symbol/{symbol}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponseDTO>> getPurchasesBySymbol(
            @PathVariable String symbol) {
        log.debug("Get purchases by symbol request received for: {}", symbol);

        try {
            UUID userId = getCurrentUserId();
            List<PurchaseResponseDTO> purchases = purchaseService.getUserPurchasesBySymbol(userId, symbol);
            return ResponseEntity.ok(purchases);
        } catch (RuntimeException e) {
            log.warn("Failed to get purchases by symbol: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting purchases by symbol", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get purchase by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PurchaseResponseDTO> getPurchaseById(@PathVariable UUID id) {
        log.debug("Get purchase by ID request received for: {}", id);

        try {
            Optional<PurchaseResponseDTO> purchase = purchaseService.findById(id);
            return purchase
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting purchase by ID", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update a purchase
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PurchaseResponseDTO> updatePurchase(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePurchaseRequestDTO request) {
        log.debug("Update purchase request received for ID: {}", id);

        try {
            Optional<PurchaseResponseDTO> updatedPurchase = purchaseService.updatePurchase(id, request);
            return updatedPurchase
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            log.warn("Failed to update purchase: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error updating purchase", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a purchase
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deletePurchase(@PathVariable UUID id) {
        log.debug("Delete purchase request received for ID: {}", id);

        try {
            boolean deleted = purchaseService.deletePurchase(id);
            return deleted
                ? ResponseEntity.ok().build()
                : ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting purchase", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get portfolio summary
     */
    @GetMapping("/portfolio")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PortfolioSummaryDTO> getPortfolioSummary() {
        log.debug("Get portfolio summary request received");

        try {
            UUID userId = getCurrentUserId();
            PortfolioSummaryDTO summary = purchaseService.getPortfolioSummary(userId);
            return ResponseEntity.ok(summary);
        } catch (RuntimeException e) {
            log.warn("Failed to get portfolio summary: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting portfolio summary", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get purchases within a date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponseDTO>> getPurchasesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        log.debug("Get purchases by date range request received: {} to {}", startDate, endDate);

        try {
            UUID userId = getCurrentUserId();
            List<PurchaseResponseDTO> purchases = purchaseService.getPurchasesByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(purchases);
        } catch (RuntimeException e) {
            log.warn("Failed to get purchases by date range: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting purchases by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent purchases
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponseDTO>> getRecentPurchases(
            @RequestParam(defaultValue = "10") int limit) {
        log.debug("Get recent purchases request received with limit: {}", limit);

        try {
            UUID userId = getCurrentUserId();
            List<PurchaseResponseDTO> purchases = purchaseService.getRecentPurchases(userId, limit);
            return ResponseEntity.ok(purchases);
        } catch (RuntimeException e) {
            log.warn("Failed to get recent purchases: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting recent purchases", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get unique symbols for the current user
     */
    @GetMapping("/symbols")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<String>> getUserSymbols() {
        log.debug("Get user symbols request received");

        try {
            UUID userId = getCurrentUserId();
            List<String> symbols = purchaseService.getUserSymbols(userId);
            return ResponseEntity.ok(symbols);
        } catch (RuntimeException e) {
            log.warn("Failed to get user symbols: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Error getting user symbols", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current user ID from security context
     */
    private UUID getCurrentUserId() {
        return authService.getCurrentUserId()
            .orElseThrow(() -> new RuntimeException("No authenticated user found"));
    }
}
