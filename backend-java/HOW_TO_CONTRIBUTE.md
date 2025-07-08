# How to Contribute to Stock Notebook Backend

This guide provides standards and best practices for contributing to the Stock Notebook Java backend.

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
```

### Package Structure
```
com.stocknotebook.{layer}.{domain}
├── controller.auth      # AuthController
├── service.stock        # StockService, StockDataService
├── repository.user      # UserRepository
├── entity.portfolio     # Purchase, StockData
├── dto.request.auth     # LoginRequest, RegisterRequest
└── dto.response.stock   # StockDetailsResponse
```

## Architecture Guidelines

### Layered Architecture
1. **Controller Layer**: Handle HTTP requests, validation, response formatting
2. **Service Layer**: Business logic, transaction management, orchestration
3. **Repository Layer**: Data access, database operations
4. **Entity Layer**: JPA entities, database mapping

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
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserService {
    
    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        log.debug("Finding user by id: {}", id);
        return userRepository.findById(id);
    }
    
    public User createUser(RegisterRequest request) {
        log.info("Creating new user: {}", request.getUsername());
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        
        User user = User.builder()
            .username(request.getUsername())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .build();
            
        return userRepository.save(user);
    }
}
```

### Controller Layer
```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request) {
        
        User user = userService.createUser(request);
        String token = jwtTokenProvider.generateToken(user);
        
        AuthResponse response = AuthResponse.builder()
            .token(token)
            .user(userMapper.toUserInfo(user))
            .build();
            
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
        RegisterRequest request = RegisterRequest.builder()
            .username("testuser")
            .password("password123")
            .build();
            
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
@Data
@Builder
public class CreatePurchaseRequest {
    
    @NotBlank(message = "Symbol is required")
    @Size(min = 1, max = 10, message = "Symbol must be between 1 and 10 characters")
    private String symbol;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerShare;
    
    @PastOrPresent(message = "Purchase date cannot be in the future")
    private LocalDate purchaseDate;
}
```

## Performance Guidelines

### Caching Strategy
```java
@Service
@RequiredArgsConstructor
public class StockService {
    
    @Cacheable(value = "stock-prices", key = "#symbol")
    public BigDecimal getCurrentPrice(String symbol) {
        return yahooFinanceClient.fetchCurrentPrice(symbol);
    }
    
    @CacheEvict(value = "stock-prices", key = "#symbol")
    public void evictPriceCache(String symbol) {
        log.info("Evicting price cache for symbol: {}", symbol);
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
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
}
```

3. **Service**
```java
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PurchaseService {
    
    private final PurchaseRepository purchaseRepository;
    private final UserService userService;
    private final PurchaseMapper purchaseMapper;
    
    public Purchase createPurchase(Long userId, CreatePurchaseRequest request) {
        log.info("Creating purchase for user {} and symbol {}", userId, request.getSymbol());
        
        User user = userService.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        
        Purchase purchase = Purchase.builder()
            .symbol(request.getSymbol().toUpperCase())
            .quantity(request.getQuantity())
            .pricePerShare(request.getPricePerShare())
            .commission(request.getCommission())
            .purchaseDate(request.getPurchaseDate())
            .user(user)
            .build();
            
        return purchaseRepository.save(purchase);
    }
    
    @Transactional(readOnly = true)
    public List<Purchase> getUserPurchases(Long userId) {
        return purchaseRepository.findByUserIdOrderByPurchaseDateDesc(userId);
    }
}
```

4. **Controller**
```java
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@Validated
public class PurchaseController {
    
    private final PurchaseService purchaseService;
    private final PurchaseMapper purchaseMapper;
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PurchaseResponse> createPurchase(
            @Valid @RequestBody CreatePurchaseRequest request,
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        Purchase purchase = purchaseService.createPurchase(userId, request);
        PurchaseResponse response = purchaseMapper.toResponse(purchase);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<PurchaseResponse>> getUserPurchases(
            Authentication authentication) {
        
        Long userId = getUserId(authentication);
        List<Purchase> purchases = purchaseService.getUserPurchases(userId);
        List<PurchaseResponse> response = purchaseMapper.toResponseList(purchases);
        
        return ResponseEntity.ok(response);
    }
}
```

This guide ensures consistent, maintainable, and high-quality code contributions to the Stock Notebook backend.