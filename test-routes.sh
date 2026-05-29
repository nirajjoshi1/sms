#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL (change this for production testing)
BASE_URL="${1:-http://localhost:5000}"

echo -e "${YELLOW}Testing routes on: $BASE_URL${NC}\n"

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local path=$2
    local description=$3
    local data=$4

    echo -e "${YELLOW}Testing: $description${NC}"
    echo "  → $method $BASE_URL$path"

    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path")
    else
        response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$path" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi

    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "  ${GREEN}✓ Success ($http_code)${NC}"
        echo "  Response: $body" | head -c 200
        echo ""
    else
        echo -e "  ${RED}✗ Failed ($http_code)${NC}"
        echo "  Response: $body"
    fi
    echo ""
}

# Run tests
echo "=== Health Checks ==="
test_endpoint "GET" "/health" "Health endpoint"
test_endpoint "GET" "/api/v1" "API base endpoint"
test_endpoint "GET" "/api/v1/debug" "Debug endpoint"

echo "=== Auth Routes ==="
test_endpoint "POST" "/api/v1/auth/login" "Login endpoint (should fail without credentials)" \
    '{"email":"test@example.com","password":"wrongpassword"}'

echo -e "${GREEN}Test completed!${NC}"
echo -e "\n${YELLOW}To test production:${NC}"
echo "  ./test-routes.sh https://your-app.vercel.app"
