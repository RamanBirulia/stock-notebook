package com.stocknotebook.service;

import com.stocknotebook.dto.request.CreatePurchaseRequestDTO;
import com.stocknotebook.dto.response.PortfolioPositionDTO;
import com.stocknotebook.dto.response.PortfolioSummaryDTO;
import com.stocknotebook.dto.response.PurchaseResponseDTO;
import com.stocknotebook.dto.response.StockPriceDTO;
import com.stocknotebook.entity.Purchase;
import com.stocknotebook.entity.User;
import com.stocknotebook.repository.PurchaseRepository;
import com.stocknotebook.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PurchaseService {

    private static final Logger log = LoggerFactory.getLogger(
        PurchaseService.class
    );

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final StockService stockService;

    public PurchaseService(
        PurchaseRepository purchaseRepository,
        UserRepository userRepository,
        StockService stockService
    ) {
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
        this.stockService = stockService;
    }

    /**
     * Create a new purchase
     */
    public PurchaseResponseDTO createPurchase(
        UUID userId,
        CreatePurchaseRequestDTO request
    ) {
        log.info(
            "Creating purchase for user: {}, symbol: {}",
            userId,
            request.symbol()
        );

        // Validate user exists
        User user = userRepository
            .findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Create purchase entity
        Purchase purchase = new Purchase(
            request.symbol(),
            request.quantity(),
            request.pricePerShare(),
            request.commission(),
            request.purchaseDate(),
            user
        );

        Purchase savedPurchase = purchaseRepository.save(purchase);
        log.info(
            "Successfully created purchase: {} for user: {}",
            savedPurchase.getId(),
            user.getUsername()
        );

        return mapToDTO(savedPurchase);
    }

    /**
     * Get all purchases for a user
     */
    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getUserPurchases(UUID userId) {
        log.info("Getting purchases for user: {}", userId);

        return purchaseRepository
            .findByUserId(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get purchases for a specific symbol by user
     */
    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getUserPurchasesBySymbol(
        UUID userId,
        String symbol
    ) {
        log.info(
            "Getting purchases for user: {} and symbol: {}",
            userId,
            symbol
        );

        return purchaseRepository
            .findByUserIdAndSymbol(userId, symbol.toUpperCase())
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get portfolio summary with current prices
     */
    @Transactional(readOnly = true)
    public PortfolioSummaryDTO getPortfolioSummary(UUID userId) {
        log.info("Getting portfolio summary for user: {}", userId);

        List<Purchase> purchases = purchaseRepository.findByUserId(userId);

        if (purchases.isEmpty()) {
            return new PortfolioSummaryDTO(
                List.of(),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                0,
                0,
                LocalDateTime.now()
            );
        }

        // Group purchases by symbol
        Map<String, List<Purchase>> groupedBySymbol = purchases
            .stream()
            .collect(Collectors.groupingBy(Purchase::getSymbol));

        // Calculate positions
        List<PortfolioPositionDTO> positions = groupedBySymbol
            .entrySet()
            .stream()
            .map(entry -> calculatePosition(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());

        // Calculate totals
        BigDecimal totalValue = positions
            .stream()
            .map(PortfolioPositionDTO::currentValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = positions
            .stream()
            .map(PortfolioPositionDTO::totalSpent)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal profitLoss = totalValue.subtract(totalSpent);
        BigDecimal profitLossPercentage = totalSpent.compareTo(
                BigDecimal.ZERO
            ) >
            0
            ? profitLoss
                .divide(totalSpent, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        int totalPurchases = purchases.size();

        return new PortfolioSummaryDTO(
            positions,
            totalValue,
            totalSpent,
            profitLoss,
            profitLossPercentage,
            positions.size(),
            totalPurchases,
            LocalDateTime.now()
        );
    }

    /**
     * Get purchases within a date range
     */
    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getPurchasesByDateRange(
        UUID userId,
        LocalDate startDate,
        LocalDate endDate
    ) {
        log.info(
            "Getting purchases for user: {} between {} and {}",
            userId,
            startDate,
            endDate
        );

        return purchaseRepository
            .findByUserIdAndDateRange(userId, startDate, endDate)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get recent purchases for a user
     */
    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getRecentPurchases(
        UUID userId,
        int limit
    ) {
        log.info("Getting {} recent purchases for user: {}", limit, userId);

        return purchaseRepository
            .findRecentPurchasesByUserId(userId, limit)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get unique symbols for a user
     */
    @Transactional(readOnly = true)
    public List<String> getUserSymbols(UUID userId) {
        log.info("Getting symbols for user: {}", userId);
        return purchaseRepository.findDistinctSymbolsByUserId(userId);
    }

    /**
     * Update a purchase
     */
    public Optional<PurchaseResponseDTO> updatePurchase(
        UUID purchaseId,
        CreatePurchaseRequestDTO request
    ) {
        log.info("Updating purchase: {}", purchaseId);

        return purchaseRepository
            .findById(purchaseId)
            .map(purchase -> {
                purchase.setSymbol(request.symbol());
                purchase.setQuantity(request.quantity());
                purchase.setPricePerShare(request.pricePerShare());
                purchase.setCommission(request.commission());
                purchase.setPurchaseDate(request.purchaseDate());

                Purchase savedPurchase = purchaseRepository.save(purchase);
                log.info(
                    "Successfully updated purchase: {}",
                    savedPurchase.getId()
                );

                return mapToDTO(savedPurchase);
            });
    }

    /**
     * Delete a purchase
     */
    public boolean deletePurchase(UUID purchaseId) {
        log.info("Deleting purchase: {}", purchaseId);

        if (!purchaseRepository.existsById(purchaseId)) {
            log.warn("Purchase not found for deletion: {}", purchaseId);
            return false;
        }

        purchaseRepository.deleteById(purchaseId);
        log.info("Successfully deleted purchase: {}", purchaseId);
        return true;
    }

    /**
     * Get purchase by ID
     */
    @Transactional(readOnly = true)
    public Optional<PurchaseResponseDTO> findById(UUID purchaseId) {
        log.info("Finding purchase by ID: {}", purchaseId);

        return purchaseRepository.findById(purchaseId).map(this::mapToDTO);
    }

    /**
     * Calculate position for a symbol
     */
    private PortfolioPositionDTO calculatePosition(
        String symbol,
        List<Purchase> purchases
    ) {
        // Calculate totals using streams
        Integer totalQuantity = purchases
            .stream()
            .mapToInt(Purchase::getQuantity)
            .sum();

        BigDecimal totalCost = purchases
            .stream()
            .map(Purchase::getTotalCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommission = purchases
            .stream()
            .map(Purchase::getCommission)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averagePrice = totalQuantity > 0
            ? totalCost.divide(
                BigDecimal.valueOf(totalQuantity),
                4,
                RoundingMode.HALF_UP
            )
            : BigDecimal.ZERO;

        // Get current price
        StockPriceDTO currentPriceDTO = stockService.getCurrentPrice(symbol);
        BigDecimal currentPrice = currentPriceDTO.price();
        BigDecimal currentValue = currentPrice.multiply(
            BigDecimal.valueOf(totalQuantity)
        );

        // Calculate profit/loss
        BigDecimal profitLoss = currentValue.subtract(totalCost);
        BigDecimal profitLossPercentage = totalCost.compareTo(BigDecimal.ZERO) >
            0
            ? profitLoss
                .divide(totalCost, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
            : BigDecimal.ZERO;

        // Get purchase dates
        LocalDate firstPurchaseDate = purchases
            .stream()
            .map(Purchase::getPurchaseDate)
            .min(LocalDate::compareTo)
            .orElse(null);

        LocalDate lastPurchaseDate = purchases
            .stream()
            .map(Purchase::getPurchaseDate)
            .max(LocalDate::compareTo)
            .orElse(null);

        return new PortfolioPositionDTO(
            symbol,
            totalQuantity,
            averagePrice,
            currentPrice,
            currentValue,
            totalCost,
            totalCommission,
            profitLoss,
            profitLossPercentage,
            purchases.size(),
            firstPurchaseDate,
            lastPurchaseDate
        );
    }

    /**
     * Map Purchase entity to DTO
     */
    private PurchaseResponseDTO mapToDTO(Purchase purchase) {
        return new PurchaseResponseDTO(
            purchase.getId().toString(),
            purchase.getSymbol(),
            purchase.getQuantity(),
            purchase.getPricePerShare(),
            purchase.getCommission(),
            purchase.getPurchaseDate(),
            purchase.getTotalCost(),
            null, // Current price would be fetched separately if needed
            null, // Total value would be calculated separately if needed
            null, // Profit/loss would be calculated separately if needed
            null // Profit/loss percentage would be calculated separately if needed
        );
    }

    /**
     * Map Purchase entity to DTO with current price
     */
    private PurchaseResponseDTO mapToDTOWithCurrentPrice(Purchase purchase) {
        try {
            StockPriceDTO currentPriceDTO = stockService.getCurrentPrice(
                purchase.getSymbol()
            );
            BigDecimal currentPrice = currentPriceDTO.price();
            BigDecimal totalValue = currentPrice.multiply(
                BigDecimal.valueOf(purchase.getQuantity())
            );
            BigDecimal totalCost = purchase.getTotalCost();
            BigDecimal profitLoss = totalValue.subtract(totalCost);
            BigDecimal profitLossPercentage = totalCost.compareTo(
                    BigDecimal.ZERO
                ) >
                0
                ? profitLoss
                    .divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

            return new PurchaseResponseDTO(
                purchase.getId().toString(),
                purchase.getSymbol(),
                purchase.getQuantity(),
                purchase.getPricePerShare(),
                purchase.getCommission(),
                purchase.getPurchaseDate(),
                totalCost,
                currentPrice,
                totalValue,
                profitLoss,
                profitLossPercentage
            );
        } catch (Exception e) {
            log.warn(
                "Failed to get current price for symbol: {}",
                purchase.getSymbol()
            );
            return mapToDTO(purchase);
        }
    }
}
