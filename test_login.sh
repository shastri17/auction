#!/bin/bash

echo "Testing login API..."

# Test admin login
echo "Testing admin login..."
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@auction.com",
    "password": "admin123"
  }'

echo -e "\n\n"

# Test team login
echo "Testing team login..."
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "team@auction.com",
    "password": "team123"
  }'

echo -e "\n\n"

# Test invalid login
echo "Testing invalid login..."
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }'

echo -e "\n\n" 