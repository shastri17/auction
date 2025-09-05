#!/bin/bash

# Quick Deployment Script for Auction App
# This script provides a simple way to deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        error "Docker is not running. Please start Docker first."
    fi
    log "Docker is running"
}

# Setup environment files
setup_env() {
    log "Setting up environment files..."
    
    # Backend environment
    if [ ! -f ".env.prod" ]; then
        if [ -f "env.prod.example" ]; then
            cp env.prod.example .env.prod
            warning "Please edit .env.prod with your configuration"
        else
            error "Environment example file not found"
        fi
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env.prod" ]; then
        if [ -f "frontend/env.prod.example" ]; then
            cp frontend/env.prod.example frontend/.env.prod
            warning "Please edit frontend/.env.prod with your configuration"
        fi
    fi
    
    log "Environment files setup completed"
}

# Deploy application
deploy() {
    log "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || true
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to start
    log "Waiting for services to start..."
    sleep 30
    
    # Check health
    if curl -f http://localhost:9999/health > /dev/null 2>&1; then
        log "Backend is healthy"
    else
        warning "Backend health check failed"
    fi
    
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Frontend is healthy"
    else
        warning "Frontend health check failed"
    fi
    
    log "Deployment completed!"
    info "Application is running at: http://localhost:3000"
    info "API is available at: http://localhost:9999"
}

# Show logs
show_logs() {
    log "Showing application logs..."
    docker-compose -f docker-compose.prod.yml logs -f
}

# Stop application
stop() {
    log "Stopping application..."
    docker-compose -f docker-compose.prod.yml down
    log "Application stopped"
}

# Show status
status() {
    log "Application status:"
    docker-compose -f docker-compose.prod.yml ps
}

# Main function
main() {
    case "${1:-deploy}" in
        "deploy")
            check_docker
            setup_env
            deploy
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            stop
            ;;
        "status")
            status
            ;;
        "restart")
            stop
            sleep 5
            check_docker
            deploy
            ;;
        "help"|"--help"|"-h")
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  deploy    Deploy the application (default)"
            echo "  logs      Show application logs"
            echo "  stop      Stop the application"
            echo "  status    Show application status"
            echo "  restart   Restart the application"
            echo "  help      Show this help message"
            ;;
        *)
            error "Unknown command: $1"
            ;;
    esac
}

# Run main function
main "$@"
