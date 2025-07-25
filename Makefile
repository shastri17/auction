.PHONY: help install dev build test clean docker-setup

# Default target
help:
	@echo "Available commands:"
	@echo "  install     - Install all dependencies"
	@echo "  dev         - Start development servers (frontend + backend)"
	@echo "  dev-backend - Start only backend server"
	@echo "  dev-frontend- Start only frontend server"
	@echo "  build       - Build both applications"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  docker-setup - Setup with Docker Compose"

# Install all dependencies
install:
	@echo "Installing backend dependencies..."
	cd backend && go mod tidy
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

# Start development servers
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8080"
	@echo "Frontend: http://localhost:3000"
	@make -j2 dev-backend dev-frontend

# Start backend server
dev-backend:
	@echo "Starting backend server..."
	cd backend && go run main.go

# Start frontend server
dev-frontend:
	@echo "Starting frontend server..."
	cd frontend && npm run dev

# Build both applications
build:
	@echo "Building backend..."
	cd backend && go build -o bin/server main.go
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Build complete!"

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	cd frontend && npm test
	@echo "Tests complete!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/bin
	rm -rf frontend/.next
	rm -rf frontend/node_modules
	@echo "Clean complete!"

# Docker setup
docker-setup:
	@echo "Setting up with Docker Compose..."
	docker-compose up -d
	@echo "Docker setup complete!"

# Database setup
db-setup:
	@echo "Setting up database..."
	@echo "Please ensure PostgreSQL is running and create a database named 'auction_db'"
	@echo "Then copy env.example to .env in the backend directory and update the database credentials"

# Seed data
seed:
	@echo "Seeding database with initial data..."
	cd backend && go run cmd/seed/main.go

# Format code
format:
	@echo "Formatting Go code..."
	cd backend && go fmt ./...
	@echo "Formatting complete!"

# Lint code
lint:
	@echo "Linting Go code..."
	cd backend && golangci-lint run
	@echo "Linting frontend code..."
	cd frontend && npm run lint
	@echo "Linting complete!" 