package com.stocknotebook.repository;

import com.stocknotebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find a user by username
     *
     * @param username the username to search for
     * @return Optional containing the user if found
     */
    Optional<User> findByUsername(String username);

    /**
     * Find a user by username with their purchases loaded
     *
     * @param username the username to search for
     * @return Optional containing the user with purchases if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.purchases WHERE u.username = :username")
    Optional<User> findByUsernameWithPurchases(@Param("username") String username);

    /**
     * Find a user by ID with their purchases loaded
     *
     * @param id the user ID to search for
     * @return Optional containing the user with purchases if found
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.purchases WHERE u.id = :id")
    Optional<User> findByIdWithPurchases(@Param("id") UUID id);

    /**
     * Check if a username already exists
     *
     * @param username the username to check
     * @return true if the username exists, false otherwise
     */
    boolean existsByUsername(String username);

    /**
     * Count the total number of users
     *
     * @return the total number of users
     */
    @Query("SELECT COUNT(u) FROM User u")
    long countUsers();

    /**
     * Find users created after a specific date
     *
     * @param date the date to compare against (in ISO format)
     * @return list of users created after the specified date
     */
    @Query("SELECT u FROM User u WHERE u.createdAt > :date ORDER BY u.createdAt DESC")
    java.util.List<User> findUsersCreatedAfter(@Param("date") java.time.LocalDateTime date);

    /**
     * Find users who have made purchases
     *
     * @return list of users who have at least one purchase
     */
    @Query("SELECT DISTINCT u FROM User u JOIN u.purchases p")
    java.util.List<User> findUsersWithPurchases();

    /**
     * Get user statistics
     *
     * @param userId the user ID
     * @return array containing [total_purchases, total_spent, unique_symbols]
     */
    @Query(value = """
        SELECT
            COUNT(p.id) as total_purchases,
            COALESCE(SUM(p.quantity * p.price_per_share + p.commission), 0) as total_spent,
            COUNT(DISTINCT p.symbol) as unique_symbols
        FROM users u
        LEFT JOIN purchases p ON u.id = p.user_id
        WHERE u.id = :userId
        GROUP BY u.id
        """, nativeQuery = true)
    Object[] getUserStatistics(@Param("userId") UUID userId);
}
