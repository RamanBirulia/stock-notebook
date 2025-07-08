# How to Contribute to Stock Notebook Backend

This guide provides standards and best practices for contributing to the Stock Notebook Java backend.

RUN AND BUILD BACKEND ONLY IN DOCKER CONTAINER

## Code Style and Standards

### Java Conventions
- Follow Oracle Java Code Conventions
- Use **camelCase** for variables and methods
- Use **PascalCase** for classes and interfaces
- Use **UPPER_SNAKE_CASE** for constants
- Maximum line length: 120 characters

### Naming Conventions
```java
// Classes
public class UserService { }
public class StockDataRepository { }

// Methods
public void calculatePortfolioValue() { }
public Optional<User> findUserById(Long id) { }

// Variables
private String userName;
private BigDecimal totalValue;

// Constants
public static final String CACHE_NAME_STOCK_PRICES = "stock-prices";

// DTOs (Data Transfer Objects) - Use Java Records
public record LoginRequestDTO(String username, String password) { }
public record RegisterRequestDTO(String username, String password, String email) { }
public record StockDetailsResponseDTO(String symbol, BigDecimal price, LocalDateTime lastUpdated) { }
```

### Package Structure
```
com.stocknotebook.{layer}.{domain}
├── controller.auth      # AuthController
├── service.stock        # StockService, StockDataService
├── repository.user      # UserRepository
├── entity.portfolio     # Purchase, StockData
├── dto.request.auth     # LoginRequestDTO, RegisterRequestDTO
└── dto.response.stock   # StockDetailsResponseDTO
```

**DTO Naming Convention:**
- All classes in the `dto` package (request and response) MUST end with the `DTO` suffix
- This clearly identifies Data Transfer Objects and distinguishes them from entities
- Examples: `LoginRequestDTO`, `CreatePurchaseRequestDTO`, `UserResponseDTO`

## Architecture Guidelines

### Layered Architecture
1. **Controller Layer**: Handle HTTP requests, validation, response formatting
2. **Service Layer**: Business logic, transaction management, orchestration
3. **Repository Layer**: Data access, database operations
4. **Entity Layer**: JPA entities, database mapping

### Architectural Rules
- **Use Java Records**: Prefer Java records for DTOs and immutable data classes
- **Stream API**: Use Java Stream API for collection operations where applicable
- **No Business Logic in Controllers**: Controllers should only handle HTTP concerns
- **No Entities in Controllers**: Controllers should only work with DTOs, never entities
- **Service Layer Responsibilities**: All business logic must be in the service layer

### Dependency Injection
```java
@Service
@RequiredArgsConstructor
public class StockService {
    private final StockDataRepository stockDataRepository;
    private final YahooFinanceClient yahooFinanceClient;
    private final CacheService cacheService;
}
```

### Error Handling
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse("USER_NOT_FOUND", ex.getMessage()));
    }
}
```

## Development Practices

### Entity Design
```java
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Purchase> purchases = new ArrayList<>();
}
```

### Service Layer
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public Optional<UserDTO> findById(Long id) {
        log.debug("Finding user by id: {}", id);
        return userRepository.findById(id)
            .map(this::mapToDTO);
    }

    public UserDTO createUser(RegisterRequestDTO request) {
        log.info("Creating new user: {}", request.username());

        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> findActiveUsers() {
        return userRepository.findByActiveTrue()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(user.getId(), user.getUsername(), user.getCreatedAt());
    }
}
```

### Controller Layer
```java
@RestController
@RequestMapping("/api/auth")
@Validated
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO request) {

        AuthResponseDTO response = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(
            @Valid @RequestBody LoginRequestDTO request) {

        AuthResponseDTO response = authService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }
}
```

### Repository Layer
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT u FROM User u LEFT JOIN FETCH u.purchases WHERE u.id = :id")
    Optional<User> findByIdWithPurchases(@Param("id") Long id);
}
```

## Testing Standards

### Unit Tests
```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void createUser_WhenValidRequest_ShouldReturnUser() {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setPassword("password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");

        // When
        User result = userService.createUser(request);

        // Then
        assertThat(result.getUsername()).isEqualTo("testuser");
        assertThat(result.getPasswordHash()).isEqualTo("hashedPassword");
        verify(userRepository).save(any(User.class));
    }
}
```

### Integration Tests
```java
@SpringBootTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class UserControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @Test
    void register_WhenValidRequest_ShouldCreateUser() {
        RegisterRequest request = new RegisterRequest("testuser", "password123");

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/register", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody().getUser().getUsername()).isEqualTo("testuser");
    }
}
```

## Security Guidelines

### Authentication
```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

### Input Validation
```java
public record CreatePurchaseRequestDTO(
    @NotBlank(message = "Symbol is required")
    @Size(min = 1, max = 10, message = "Symbol must be between 1 and 10 characters")
    String symbol,

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    Integer quantity,

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    BigDecimal pricePerShare,

    @PastOrPresent(message = "Purchase date cannot be in the future")
    LocalDate purchaseDate,

    @DecimalMin(value = "0.00", message = "Commission cannot be negative")
    BigDecimal commission
) {
    public CreatePurchaseRequestDTO {
        // Compact constructor for validation
        if (commission == null) {
            commission = BigDecimal.ZERO;
        }
    }
}
```

### Performance Guidelines

### Caching Strategy
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class StockService {

    private static final Logger log = LoggerFactory.getLogger(StockService.class);
    private final YahooFinanceClient yahooFinanceClient;
    private final StockDataRepository stockDataRepository;

    @Cacheable(value = "stock-prices", key = "#symbol")
    public StockPriceDTO getCurrentPrice(String symbol) {
        log.debug("Fetching current price for symbol: {}", symbol);
        BigDecimal price = yahooFinanceClient.getPrice(symbol);
        return new StockPriceDTO(symbol, price, LocalDateTime.now());
    }

    @CacheEvict(value = "stock-prices", key = "#symbol")
    public void evictPriceCache(String symbol) {
        log.debug("Evicting cache for symbol: {}", symbol);
    }

    @Transactional(readOnly = true)
    public List<StockPriceDTO> getMultiplePrices(List<String> symbols) {
        return symbols.stream()
            .map(this::getCurrentPrice)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getPortfolioValues(List<String> symbols) {
        return symbols.stream()
            .collect(Collectors.toMap(
                symbol -> symbol,
                symbol -> getCurrentPrice(symbol).price()
            ));
    }
}
```

### Database Optimization
```java
@Entity
@Table(name = "stock_data", indexes = {
    @Index(name = "idx_symbol_date", columnList = "symbol, data_date"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class StockData {

    @Query("SELECT s FROM StockData s WHERE s.symbol = :symbol AND s.dataDate >= :startDate")
    List<StockData> findBySymbolAndDateRange(@Param("symbol") String symbol,
                                           @Param("startDate") LocalDate startDate);
}
```

## Git Workflow

### Branch Naming
```
feature/user-authentication
bugfix/stock-price-calculation
hotfix/security-vulnerability
chore/update-dependencies
```

### Commit Messages
```
feat: add JWT authentication for user login
fix: resolve stock price calculation precision issue
docs: update API documentation for purchase endpoints
test: add unit tests for stock service
refactor: optimize database queries for dashboard
```

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## Code Review Guidelines

### What to Review
1. **Functionality**: Does the code work as expected?
2. **Design**: Is the code well-structured and maintainable?
3. **Performance**: Are there any performance bottlenecks?
4. **Security**: Are there any security vulnerabilities?
5. **Testing**: Is the code adequately tested?

### Review Comments
```java
// Good: Specific and actionable
// Consider using Optional.orElseThrow() for better readability
User user = userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException("User not found"));

// Good: Suggest improvement
// This method is doing too much. Consider extracting validation logic
// into a separate validatePurchaseRequest() method
```

## Documentation Standards

### JavaDoc
```java
/**
 * Calculates the current portfolio value for a user.
 *
 * @param userId the ID of the user
 * @param includeCommissions whether to include commission costs
 * @return the total portfolio value
 * @throws UserNotFoundException if user is not found
 * @since 1.0
 */
public BigDecimal calculatePortfolioValue(Long userId, boolean includeCommissions) {
    // Implementation
}
```

### API Documentation
```java
@Operation(summary = "Get user portfolio dashboard",
          description = "Returns portfolio summary including total value, P&L, and holdings")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Success"),
    @ApiResponse(responseCode = "401", description = "Unauthorized"),
    @ApiResponse(responseCode = "404", description = "User not found")
})
@GetMapping("/dashboard")
public ResponseEntity<DashboardResponse> getDashboard(Authentication auth) {
    // Implementation
}
```

## Examples

### Complete Feature Implementation

1. **Entity**
```java
@Entity
@Table(name = "purchases")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Purchase extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String symbol;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_per_share", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerShare;

    @Column(precision = 10, scale = 2)
    private BigDecimal commission = BigDecimal.ZERO;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public BigDecimal getTotalCost() {
        return pricePerShare.multiply(BigDecimal.valueOf(quantity)).add(commission);
    }
}
```

2. **Repository**
```java
@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    List<Purchase> findByUserIdOrderByPurchaseDateDesc(Long userId);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.symbol = :symbol")
    List<Purchase> findByUserIdAndSymbol(@Param("userId") Long userId,
                                        @Param("symbol") String symbol);

    @Query("SELECT DISTINCT p.symbol FROM Purchase p WHERE p.user.id = :userId")
    List<String> findDistinctSymbolsByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Purchase p WHERE p.user.id = :userId AND p.purchaseDate BETWEEN :startDate AND :endDate")
    List<Purchase> findByUserIdAndDateRange(@Param("userId") Long userId,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);
}
```

3. **Service**
```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
@RequiredArgsConstructor
public class PurchaseService {

    private static final Logger log = LoggerFactory.getLogger(PurchaseService.class);
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;
    private final StockService stockService;

    public PurchaseResponseDTO createPurchase(Long userId, CreatePurchaseRequestDTO request) {
        log.info("Creating purchase for user {} and symbol {}", userId, request.symbol());

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        Purchase purchase = new Purchase();
        purchase.setSymbol(request.symbol().toUpperCase());
        purchase.setQuantity(request.quantity());
        purchase.setPricePerShare(request.pricePerShare());
        purchase.setCommission(request.commission());
        purchase.setPurchaseDate(request.purchaseDate());
        purchase.setUser(user);

        Purchase savedPurchase = purchaseRepository.save(purchase);
        return mapToDTO(savedPurchase);
    }

    @Transactional(readOnly = true)
    public List<PurchaseResponseDTO> getUserPurchases(Long userId) {
        return purchaseRepository.findByUserIdOrderByPurchaseDateDesc(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryDTO getPortfolioSummary(Long userId) {
        List<Purchase> purchases = purchaseRepository.findByUserIdOrderByPurchaseDateDesc(userId);

        Map<String, List<Purchase>> groupedBySymbol = purchases.stream()
            .collect(Collectors.groupingBy(Purchase::getSymbol));

        List<PortfolioPositionDTO> positions = groupedBySymbol.entrySet().stream()
            .map(entry -> calculatePosition(entry.getKey(), entry.getValue()))
            .collect(Collectors.toList());

        BigDecimal totalValue = positions.stream()
            .map(PortfolioPositionDTO::currentValue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PortfolioSummaryDTO(positions, totalValue);
    }

    private PortfolioPositionDTO calculatePosition(String symbol, List<Purchase> purchases) {
        Integer totalQuantity = purchases.stream()
            .mapToInt(Purchase::getQuantity)
            .sum();

        BigDecimal totalCost = purchases.stream()
            .map(Purchase::getTotalCost)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averagePrice = totalCost.divide(BigDecimal.valueOf(totalQuantity),
            RoundingMode.HALF_UP);

        StockPriceDTO currentPrice = stockService.getCurrentPrice(symbol);
        BigDecimal currentValue = currentPrice.price().multiply(BigDecimal.valueOf(totalQuantity));

        return new PortfolioPositionDTO(symbol, totalQuantity, averagePrice,
            currentPrice.price(), currentValue);
    }

    private PurchaseResponseDTO mapToDTO(Purchase purchase) {
        return new PurchaseResponseDTO(
            purchase.getId(),
            purchase.getSymbol(),
            purchase.getQuantity(),
            purchase.getPricePerShare(),
            purchase.getCommission(),
            purchase.getPurchaseDate()
        );
    }
}
```



4. **Controller**
```java
@RestController
@RequestMapping("/api/purchases")
@Validated
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PurchaseResponseDTO> createPurchase(
            @Valid @RequestBody CreatePurchaseRequestDTO request,
            Authentication authentication) {

        Long userId = getUserId(authentication);
        PurchaseResponseDTO response = purchaseService.createPurchase(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponseDTO>> getUserPurchases(
            Authentication authentication) {

        Long userId = getUserId(authentication);
        List<PurchaseResponseDTO> purchases = purchaseService.getUserPurchases(userId);
        return ResponseEntity.ok(purchases);
    }

    @GetMapping("/portfolio")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PortfolioSummaryDTO> getPortfolioSummary(
            Authentication authentication) {

        Long userId = getUserId(authentication);
        PortfolioSummaryDTO summary = purchaseService.getPortfolioSummary(userId);
        return ResponseEntity.ok(summary);
    }

    private Long getUserId(Authentication authentication) {
        return ((UserPrincipal) authentication.getPrincipal()).getId();
    }
}
```

5. **DTOs (Using Records)**
```java
// Request DTOs
public record CreatePurchaseRequestDTO(
    String symbol,
    Integer quantity,
    BigDecimal pricePerShare,
    BigDecimal commission,
    LocalDate purchaseDate
) {}

// Response DTOs
public record PurchaseResponseDTO(
    Long id,
    String symbol,
    Integer quantity,
    BigDecimal pricePerShare,
    BigDecimal commission,
    LocalDate purchaseDate
) {}

public record PortfolioPositionDTO(
    String symbol,
    Integer quantity,
    BigDecimal averagePrice,
    BigDecimal currentPrice,
    BigDecimal currentValue
) {}

public record PortfolioSummaryDTO(
    List<PortfolioPositionDTO> positions,
    BigDecimal totalValue
) {}

public record StockPriceDTO(
    String symbol,
    BigDecimal price,
    LocalDateTime timestamp
) {}

public record UserDTO(
    Long id,
    String username,
    LocalDateTime createdAt
) {}

public record AuthResponseDTO(
    String token,
    UserDTO user
) {}
```

## Key Benefits of This Approach

1. **Type Safety**: Records provide compile-time safety and immutability
2. **Reduced Boilerplate**: Less code to write and maintain
3. **Clear Separation**: Controllers only handle HTTP, services handle business logic
4. **Stream Processing**: Efficient and readable collection operations
5. **Testability**: Each layer can be tested independently

This guide ensures consistent, maintainable, and high-quality code contributions to the Stock Notebook backend.
