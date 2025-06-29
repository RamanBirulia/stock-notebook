#!/bin/bash

# Test script for debugging Alpha Vantage API with comprehensive logging
# This script enables all logging and tests various API endpoints

echo "🔍 Starting API Debug Test with Full Logging..."
echo "================================================"

# Set environment variables for maximum logging
export ENABLE_API_REQUEST_LOGGING=true
export ENABLE_API_RESPONSE_LOGGING=true
export RUST_LOG=debug,stock_tracker_backend=debug

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Environment Variables:${NC}"
echo "ENABLE_API_REQUEST_LOGGING=$ENABLE_API_REQUEST_LOGGING"
echo "ENABLE_API_RESPONSE_LOGGING=$ENABLE_API_RESPONSE_LOGGING"
echo "RUST_LOG=$RUST_LOG"
echo "ALPHA_VANTAGE_API_KEY=${ALPHA_VANTAGE_API_KEY:-demo}"
echo ""

# Function to test API endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2

    echo -e "${YELLOW}Testing: $description${NC}"
    echo -e "${BLUE}Endpoint: $endpoint${NC}"
    echo "----------------------------------------"

    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$endpoint")
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    response_body=$(echo "$response" | sed '/HTTP_STATUS/d')

    if [ "$http_status" = "200" ]; then
        echo -e "${GREEN}✅ Success (HTTP $http_status)${NC}"
        echo "Response preview:"
        echo "$response_body" | head -5
    else
        echo -e "${RED}❌ Failed (HTTP $http_status)${NC}"
        echo "Response:"
        echo "$response_body"
    fi

    echo ""
    echo "Press Enter to continue..."
    read
}

# Base URL
BASE_URL="http://localhost:8080/api"

echo -e "${YELLOW}Starting tests...${NC}"
echo ""

# Test 1: Health check
test_endpoint "http://localhost:8080/health" "Health Check"

# Test 2: Stock price lookup
echo -e "${BLUE}📈 Testing Stock Price Lookup${NC}"
echo "Which symbol would you like to test? (default: AAPL)"
read -r symbol
symbol=${symbol:-AAPL}
test_endpoint "$BASE_URL/stock/$symbol" "Stock Details for $symbol"

# Test 3: Chart data
echo -e "${BLUE}📊 Testing Chart Data${NC}"
echo "Which period would you like to test? (1M/1Y/5Y, default: 1M)"
read -r period
period=${period:-1M}
test_endpoint "$BASE_URL/stock/$symbol/chart?period=$period" "Chart Data for $symbol ($period)"

# Test 4: Symbol search
echo -e "${BLUE}🔍 Testing Symbol Search${NC}"
echo "What would you like to search for? (default: Apple)"
read -r search_term
search_term=${search_term:-Apple}
test_endpoint "$BASE_URL/symbols/search?q=$search_term&limit=5" "Symbol Search for '$search_term'"

# Test 5: Cache stats
test_endpoint "$BASE_URL/admin/cache/stats" "Cache Statistics"

echo -e "${GREEN}🎉 All tests completed!${NC}"
echo ""
echo -e "${YELLOW}Debug Tips:${NC}"
echo "1. Check the server logs for detailed API request/response information"
echo "2. Look for '=== API REQUEST ===' and '=== API RESPONSE ===' markers"
echo "3. If you see parsing errors, the raw response will be logged as warnings"
echo "4. Rate limit messages will appear as errors in the logs"
echo ""
echo "To run the server with debug logging:"
echo "ENABLE_API_REQUEST_LOGGING=true ENABLE_API_RESPONSE_LOGGING=true RUST_LOG=debug cargo run"
