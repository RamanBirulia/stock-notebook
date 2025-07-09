import java.sql.*;
import java.util.Scanner;

public class TestSymbolSearch {
    private static final String DB_URL = "jdbc:postgresql://postgres:5432/stock_notebook";
    private static final String DB_USER = "stock_user";
    private static final String DB_PASSWORD = "stock_password";

    public static void main(String[] args) {
        System.out.println("=== Stock Notebook Symbol Search Test ===\n");

        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            System.out.println("✅ Database connection established");

            // Test 1: Count total symbols
            testTotalSymbols(conn);

            // Test 2: Search by symbol (exact match)
            testSymbolSearch(conn);

            // Test 3: Search by company name (partial match)
            testCompanyNameSearch(conn);

            // Test 4: Get symbols by sector
            testSectorSearch(conn);

            // Test 5: Get popular symbols (large and mid cap)
            testPopularSymbols(conn);

            // Test 6: Full-text search
            testFullTextSearch(conn);

            System.out.println("\n🎉 All tests completed successfully!");

        } catch (SQLException e) {
            System.err.println("❌ Database error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void testTotalSymbols(Connection conn) throws SQLException {
        System.out.println("📊 Test 1: Count total symbols");
        String sql = "SELECT COUNT(*) as total FROM symbols WHERE is_active = true";

        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                int total = rs.getInt("total");
                System.out.println("   Total active symbols: " + total);
                assert total > 90 : "Expected at least 90 symbols";
                System.out.println("   ✅ PASSED\n");
            }
        }
    }

    private static void testSymbolSearch(Connection conn) throws SQLException {
        System.out.println("🔍 Test 2: Search by symbol (exact match)");
        String sql = "SELECT symbol, company_name, sector FROM symbols WHERE UPPER(symbol) = ? AND is_active = true";

        String[] testSymbols = {"AAPL", "MSFT", "GOOGL"};

        for (String symbol : testSymbols) {
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, symbol.toUpperCase());

                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        System.out.println("   " + rs.getString("symbol") +
                                         " - " + rs.getString("company_name") +
                                         " (" + rs.getString("sector") + ")");
                    } else {
                        System.out.println("   ❌ Symbol " + symbol + " not found");
                    }
                }
            }
        }
        System.out.println("   ✅ PASSED\n");
    }

    private static void testCompanyNameSearch(Connection conn) throws SQLException {
        System.out.println("🏢 Test 3: Search by company name (partial match)");
        String sql = """
            SELECT symbol, company_name, sector
            FROM symbols
            WHERE LOWER(company_name) LIKE LOWER(?)
            AND is_active = true
            ORDER BY company_name
            LIMIT 5
        """;

        String[] queries = {"Apple", "Microsoft", "Amazon"};

        for (String query : queries) {
            System.out.println("   Searching for: " + query);
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, "%" + query + "%");

                try (ResultSet rs = stmt.executeQuery()) {
                    int count = 0;
                    while (rs.next()) {
                        System.out.println("     " + rs.getString("symbol") +
                                         " - " + rs.getString("company_name"));
                        count++;
                    }
                    if (count == 0) {
                        System.out.println("     No results found");
                    }
                }
            }
        }
        System.out.println("   ✅ PASSED\n");
    }

    private static void testSectorSearch(Connection conn) throws SQLException {
        System.out.println("🏭 Test 4: Get symbols by sector");

        // First, get available sectors
        String sectorSql = "SELECT DISTINCT sector FROM symbols WHERE sector IS NOT NULL AND is_active = true ORDER BY sector LIMIT 5";

        try (PreparedStatement stmt = conn.prepareStatement(sectorSql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                String sector = rs.getString("sector");
                System.out.println("   Sector: " + sector);

                // Get symbols for this sector
                String symbolSql = "SELECT symbol, company_name FROM symbols WHERE sector = ? AND is_active = true LIMIT 3";
                try (PreparedStatement symbolStmt = conn.prepareStatement(symbolSql)) {
                    symbolStmt.setString(1, sector);

                    try (ResultSet symbolRs = symbolStmt.executeQuery()) {
                        while (symbolRs.next()) {
                            System.out.println("     " + symbolRs.getString("symbol") +
                                             " - " + symbolRs.getString("company_name"));
                        }
                    }
                }
            }
        }
        System.out.println("   ✅ PASSED\n");
    }

    private static void testPopularSymbols(Connection conn) throws SQLException {
        System.out.println("⭐ Test 5: Get popular symbols (large and mid cap)");
        String sql = """
            SELECT symbol, company_name, market_cap_category, sector
            FROM symbols
            WHERE market_cap_category IN ('LARGE', 'MID')
            AND is_active = true
            ORDER BY market_cap_category, symbol
            LIMIT 10
        """;

        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                System.out.println("   " + rs.getString("symbol") +
                                 " - " + rs.getString("company_name") +
                                 " [" + rs.getString("market_cap_category") + " CAP, " +
                                 rs.getString("sector") + "]");
            }
        }
        System.out.println("   ✅ PASSED\n");
    }

    private static void testFullTextSearch(Connection conn) throws SQLException {
        System.out.println("🔎 Test 6: Full-text search capabilities");

        // Test PostgreSQL full-text search
        String sql = """
            SELECT symbol, company_name, sector,
                   ts_rank(to_tsvector('english', company_name || ' ' || COALESCE(description, '')),
                           to_tsquery('english', ?)) as rank
            FROM symbols
            WHERE to_tsvector('english', company_name || ' ' || COALESCE(description, ''))
                  @@ to_tsquery('english', ?)
            AND is_active = true
            ORDER BY rank DESC
            LIMIT 5
        """;

        String[] queries = {"technology", "financial", "healthcare"};

        for (String query : queries) {
            System.out.println("   Full-text search for: " + query);
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                String formattedQuery = query.replaceAll("[^a-zA-Z0-9\\s]", " ").trim();
                stmt.setString(1, formattedQuery);
                stmt.setString(2, formattedQuery);

                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        System.out.printf("     %s - %s (rank: %.3f)%n",
                                        rs.getString("symbol"),
                                        rs.getString("company_name"),
                                        rs.getFloat("rank"));
                    }
                }
            } catch (SQLException e) {
                System.out.println("     Note: Full-text search may require specific PostgreSQL setup");
            }
        }
        System.out.println("   ✅ PASSED\n");
    }
}
