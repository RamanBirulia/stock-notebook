package com.stocknotebook.service;

import com.stocknotebook.dto.response.UserInfoDTO;
import com.stocknotebook.entity.User;
import com.stocknotebook.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(
        UserService.class
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Find a user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        log.debug("Finding user by ID: {}", id);
        return userRepository.findById(id);
    }

    /**
     * Find a user by ID and return DTO
     */
    @Transactional(readOnly = true)
    public Optional<UserInfoDTO> findUserInfoById(UUID id) {
        log.debug("Finding user info by ID: {}", id);
        return userRepository.findById(id).map(this::mapToUserInfoDTO);
    }

    /**
     * Find a user by username
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUsername(String username) {
        log.debug("Finding user by username: {}", username);
        return userRepository.findByUsername(username);
    }

    /**
     * Find a user by username and return DTO
     */
    @Transactional(readOnly = true)
    public Optional<UserInfoDTO> findUserInfoByUsername(String username) {
        log.debug("Finding user info by username: {}", username);
        return userRepository
            .findByUsername(username)
            .map(this::mapToUserInfoDTO);
    }

    /**
     * Find a user by ID with purchases loaded
     */
    @Transactional(readOnly = true)
    public Optional<User> findByIdWithPurchases(UUID id) {
        log.debug("Finding user by ID with purchases: {}", id);
        return userRepository.findByIdWithPurchases(id);
    }

    /**
     * Create a new user
     */
    public User createUser(String username, String password) {
        log.debug("Creating new user with username: {}", username);

        // Validate input
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Username cannot be null or empty"
            );
        }

        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException(
                "Password cannot be null or empty"
            );
        }

        String normalizedUsername = username.trim().toLowerCase();

        // Check if username already exists
        if (userRepository.existsByUsername(normalizedUsername)) {
            log.warn(
                "Attempt to create user with existing username: {}",
                normalizedUsername
            );
            throw new IllegalArgumentException("Username already exists");
        }

        // Create new user
        User user = new User(
            normalizedUsername,
            passwordEncoder.encode(password)
        );
        User savedUser = userRepository.save(user);

        log.info("Successfully created user: {}", savedUser.getUsername());
        return savedUser;
    }

    /**
     * Create a new user and return DTO
     */
    public UserInfoDTO createUserAndReturnDTO(
        String username,
        String password
    ) {
        User user = createUser(username, password);
        return mapToUserInfoDTO(user);
    }

    /**
     * Update user's last login timestamp
     */
    public Optional<User> updateLastLogin(UUID userId) {
        log.debug("Updating last login for user: {}", userId);

        return userRepository
            .findById(userId)
            .map(user -> {
                user.updateLastLogin();
                User savedUser = userRepository.save(user);
                log.debug(
                    "Updated last login for user: {}",
                    savedUser.getUsername()
                );
                return savedUser;
            });
    }

    /**
     * Change user's password
     */
    public boolean changePassword(
        UUID userId,
        String currentPassword,
        String newPassword
    ) {
        log.debug("Changing password for user: {}", userId);

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            log.warn("User not found for password change: {}", userId);
            return false;
        }

        User user = userOpt.get();

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            log.warn("Invalid current password for user: {}", userId);
            return false;
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info(
            "Successfully changed password for user: {}",
            user.getUsername()
        );
        return true;
    }

    /**
     * Verify user credentials
     */
    @Transactional(readOnly = true)
    public Optional<User> verifyCredentials(String username, String password) {
        log.debug("Verifying credentials for username: {}", username);

        if (username == null || password == null) {
            return Optional.empty();
        }

        return userRepository
            .findByUsername(username.trim().toLowerCase())
            .filter(user ->
                passwordEncoder.matches(password, user.getPasswordHash())
            )
            .map(user -> {
                log.debug("Credentials verified for user: {}", username);
                return user;
            });
    }

    /**
     * Get all users as DTOs (admin function)
     */
    @Transactional(readOnly = true)
    public List<UserInfoDTO> getAllUsersAsDTO() {
        log.debug("Fetching all users as DTOs");

        return userRepository
            .findAll()
            .stream()
            .map(this::mapToUserInfoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get users with purchases as DTOs
     */
    @Transactional(readOnly = true)
    public List<UserInfoDTO> getUsersWithPurchasesAsDTO() {
        log.debug("Fetching users with purchases as DTOs");

        return userRepository
            .findUsersWithPurchases()
            .stream()
            .map(this::mapToUserInfoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserStatistics(UUID userId) {
        log.debug("Getting statistics for user: {}", userId);

        if (!userRepository.existsById(userId)) {
            log.warn("User not found for statistics: {}", userId);
            return Map.of();
        }

        Object[] stats = userRepository.getUserStatistics(userId);

        return Map.of(
            "totalPurchases",
            stats[0],
            "totalSpent",
            stats[1],
            "uniqueSymbols",
            stats[2]
        );
    }

    /**
     * Check if username is available
     */
    @Transactional(readOnly = true)
    public boolean isUsernameAvailable(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }

        String normalizedUsername = username.trim().toLowerCase();
        return !userRepository.existsByUsername(normalizedUsername);
    }

    /**
     * Get total number of users
     */
    @Transactional(readOnly = true)
    public long getTotalUserCount() {
        return userRepository.countUsers();
    }

    /**
     * Get recent users (created in the last 30 days) as DTOs
     */
    @Transactional(readOnly = true)
    public List<UserInfoDTO> getRecentUsersAsDTO() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        return userRepository
            .findUsersCreatedAfter(thirtyDaysAgo)
            .stream()
            .map(this::mapToUserInfoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get users created after a specific date as DTOs
     */
    @Transactional(readOnly = true)
    public List<UserInfoDTO> getUsersCreatedAfter(LocalDateTime date) {
        log.debug("Getting users created after: {}", date);

        return userRepository
            .findUsersCreatedAfter(date)
            .stream()
            .map(this::mapToUserInfoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Delete a user (admin function)
     */
    public boolean deleteUser(UUID userId) {
        log.debug("Deleting user: {}", userId);

        if (!userRepository.existsById(userId)) {
            log.warn("User not found for deletion: {}", userId);
            return false;
        }

        userRepository.deleteById(userId);
        log.info("Successfully deleted user: {}", userId);
        return true;
    }

    /**
     * Update user information
     */
    public Optional<UserInfoDTO> updateUser(UUID userId, String newUsername) {
        log.debug("Updating user: {}", userId);

        return userRepository
            .findById(userId)
            .map(existingUser -> {
                // Update username if provided and different
                if (
                    newUsername != null &&
                    !newUsername.equals(existingUser.getUsername())
                ) {
                    String normalizedUsername = newUsername
                        .trim()
                        .toLowerCase();
                    if (userRepository.existsByUsername(normalizedUsername)) {
                        throw new IllegalArgumentException(
                            "Username already exists"
                        );
                    }
                    existingUser.setUsername(normalizedUsername);
                }

                User savedUser = userRepository.save(existingUser);
                log.info(
                    "Successfully updated user: {}",
                    savedUser.getUsername()
                );
                return mapToUserInfoDTO(savedUser);
            });
    }

    /**
     * Get user activity summary
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserActivitySummary() {
        log.debug("Getting user activity summary");

        long totalUsers = userRepository.countUsers();
        List<User> recentUsers = userRepository.findUsersCreatedAfter(
            LocalDateTime.now().minusDays(30)
        );
        List<User> activeUsers = userRepository.findUsersWithPurchases();

        return Map.of(
            "totalUsers",
            totalUsers,
            "recentUsers",
            recentUsers.size(),
            "activeUsers",
            activeUsers.size(),
            "userActivityRate",
            activeUsers.size() > 0
                ? ((double) activeUsers.size() / totalUsers) * 100
                : 0.0
        );
    }

    /**
     * Find users by username pattern
     */
    @Transactional(readOnly = true)
    public List<UserInfoDTO> findUsersByUsernamePattern(String pattern) {
        log.debug("Finding users by username pattern: {}", pattern);

        return userRepository
            .findAll()
            .stream()
            .filter(user ->
                user.getUsername().toLowerCase().contains(pattern.toLowerCase())
            )
            .map(this::mapToUserInfoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get users with statistics
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsersWithStatistics() {
        log.debug("Getting users with statistics");

        return userRepository
            .findAll()
            .stream()
            .map(user -> {
                Object[] stats = userRepository.getUserStatistics(user.getId());
                return Map.of(
                    "user",
                    mapToUserInfoDTO(user),
                    "totalPurchases",
                    stats[0],
                    "totalSpent",
                    stats[1],
                    "uniqueSymbols",
                    stats[2]
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Map User entity to UserInfoDTO
     */
    private UserInfoDTO mapToUserInfoDTO(User user) {
        return new UserInfoDTO(
            user.getId(),
            user.getUsername(),
            user.getLastLogin()
        );
    }
}
