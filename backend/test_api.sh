#!/bin/bash

# Stock Symbol Autocomplete API Test Script
# This script tests the new autocomplete functionality

set -e  # Exit on any error

BASE_URL="http://localhost:8080"
API_KEY="demo"  # Use demo key for testing

echo "🧪 Stock Symbol Autocomplete API Test Script"
echo "=============================================="

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s "$BASE_URL/health" > /dev/null; then
    echo "❌ Server is not running at $BASE_URL"
    echo "   Please start the server with: cargo run"
    exit 1
fi
echo "✅ Server is running"

# Function to test login and get token
get_auth_token() {
    echo "🔐 Testing authentication..."

    # Try to register a test user (might fail if user exists)
    curl -s -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","password":"testpass"}' > /dev/null 2>&1 || true

    # Login to get token
    local response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","password":"testpass"}')

    if echo "$response" | grep -q '"token"'; then
        echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
    else
        echo "❌ Failed to get authentication token"
        echo "Response: $response"
        exit 1
    fi
}

# Get authentication token
TOKEN=$(get_auth_token)
if [ -n "$TOKEN" ]; then
    echo "✅ Got authentication token"
else
    echo "❌ Failed to get authentication token"
    exit 1
fi

echo ""
echo "🔍 Testing Symbol Search Functionality"
echo "======================================"

# Test 1: Search for Apple (AAPL)
echo "1️⃣  Testing search for 'AAPL'..."
response=$(curl -s "$BASE_URL/api/symbols/search?q=AAPL&limit=3" \
    -H "Authorization: Bearer $TOKEN")

if echo "$response" | grep -q "Apple"; then
    echo "✅ AAPL search successful"
    echo "   Results: $(echo "$response" | jq -r '.[0].symbol + " - " + .[0].name' 2>/dev/null || echo "Raw: $response")"
else
    echo "❌ AAPL search failed"
    echo "   Response: $response"
fi

# Test 2: Search for Microsoft (MSFT)
echo "2️⃣  Testing search for 'MSFT'..."
response=$(curl -s "$BASE_URL/api/symbols/search?q=MSFT&limit=3" \
    -H "Authorization: Bearer $TOKEN")

if echo "$response" | grep -q "Microsoft\|MSFT"; then
    echo "✅ MSFT search successful"
    echo "   Results: $(echo "$response" | jq -r '.[0].symbol + " - " + .[0].name' 2>/dev/null || echo "Raw: $response")"
else
    echo "❌ MSFT search failed"
    echo "   Response: $response"
fi

# Test 3: Search by company name (Tesla)
echo "3️⃣  Testing search for 'Tesla'..."
response=$(curl -s "$BASE_URL/api/symbols/search?q=Tesla&limit=3" \
    -H "Authorization: Bearer $TOKEN")

if echo "$response" | grep -q "Tesla\|TSLA"; then
    echo "✅ Tesla search successful"
    echo "   Results: $(echo "$response" | jq -r '.[0].symbol + " - " + .[0].name' 2>/dev/null || echo "Raw: $response")"
else
    echo "❌ Tesla search failed"
    echo "   Response: $response"
fi

# Test 4: Empty query should return empty array
echo "4️⃣  Testing empty query..."
response=$(curl -s "$BASE_URL/api/symbols/search?q=&limit=3" \
    -H "Authorization: Bearer $TOKEN")

if echo "$response" | grep -q "\[\]"; then
    echo "✅ Empty query handled correctly"
else
    echo "❌ Empty query not handled correctly"
    echo "   Response: $response"
fi

# Test 5: Test limit parameter
echo "5️⃣  Testing limit parameter..."
response=$(curl -s "$BASE_URL/api/symbols/search?q=A&limit=2" \
    -H "Authorization: Bearer $TOKEN")

count=$(echo "$response" | jq '. | length' 2>/dev/null || echo "unknown")
if [ "$count" = "2" ]; then
    echo "✅ Limit parameter working correctly"
else
    echo "❌ Limit parameter not working correctly"
    echo "   Expected: 2, Got: $count"
fi

echo ""
echo "🔧 Testing Admin Endpoints"
echo "=========================="

# Test cache stats
echo "1️⃣  Testing cache statistics..."
response=$(curl -s "$BASE_URL/api/admin/cache/stats")

if echo "$response" | grep -q "symbol_cache_entries"; then
    echo "✅ Cache stats endpoint working"
    echo "   Cache entries: $(echo "$response" | jq '.symbol_cache_entries' 2>/dev/null || echo "unknown")"
else
    echo "❌ Cache stats endpoint failed"
    echo "   Response: $response"
fi

# Test cache cleanup
echo "2️⃣  Testing cache cleanup..."
response=$(curl -s -X POST "$BASE_URL/api/admin/cache/cleanup")

if echo "$response" | grep -q "cleaned up"; then
    echo "✅ Cache cleanup endpoint working"
else
    echo "❌ Cache cleanup endpoint failed"
    echo "   Response: $response"
fi

echo ""
echo "⚡ Performance Test"
echo "=================="

echo "🕐 Testing search response time..."
start_time=$(date +%s%N)
curl -s "$BASE_URL/api/symbols/search?q=AAPL&limit=5" \
    -H "Authorization: Bearer $TOKEN" > /dev/null
end_time=$(date +%s%N)

duration_ms=$(( (end_time - start_time) / 1000000 ))
echo "⏱️  Search completed in ${duration_ms}ms"

if [ $duration_ms -lt 1000 ]; then
    echo "✅ Performance is good (< 1 second)"
elif [ $duration_ms -lt 5000 ]; then
    echo "⚠️  Performance is acceptable (< 5 seconds)"
else
    echo "❌ Performance is poor (> 5 seconds)"
fi

echo ""
echo "📋 Test Summary"
echo "==============="
echo "✅ All tests completed!"
echo ""
echo "💡 Tips for frontend integration:"
echo "   - Use the search endpoint: GET /api/symbols/search?q={query}&limit={limit}"
echo "   - Include Authorization header: Bearer {token}"
echo "   - Debounce requests to avoid excessive API calls"
echo "   - Handle empty responses gracefully"
echo "   - Cache results on the frontend for better UX"
echo ""
echo "📚 Documentation:"
echo "   - Backend API: See backend/AUTOCOMPLETE_API.md"
echo "   - Frontend Guide: See frontend-example/README.md"
echo "   - Implementation Summary: See AUTOCOMPLETE_SUMMARY.md"
echo ""
echo "🎉 Ready to integrate with your frontend!"
