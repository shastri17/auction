#!/bin/bash

echo "🚀 Starting Auction Application with Docker Compose..."

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose ps

# Test the API
echo "🧪 Testing API endpoints..."

# Wait a bit more for the backend to fully start
sleep 10

# Test login endpoints
echo "Testing login endpoints..."

echo "Testing admin login..."
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@auction.com", "password": "admin123"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\nTesting team login..."
curl -X POST http://localhost:9999/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "team@auction.com", "password": "team123"}' \
  -w "\nStatus: %{http_code}\n"

echo -e "\nTesting health check..."
curl -X GET http://localhost:9999/health \
  -w "\nStatus: %{http_code}\n"

echo -e "\n🎉 Application is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:9999"
echo "🗄️  Database: localhost:5432"
echo "⚡ Redis: localhost:6379"

echo -e "\n📝 Login Credentials:"
echo "Admin: admin@auction.com / admin123"
echo "Team: team@auction.com / team123"

echo -e "\n🔍 To view logs:"
echo "docker-compose logs -f"

echo -e "\n🛑 To stop:"
echo "docker-compose down" 