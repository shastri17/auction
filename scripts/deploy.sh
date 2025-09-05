#!/bin/bash

# Auction App Deployment Script
# This script automates the deployment process for different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="auction"
APP_DIR="/opt/auction"
BACKUP_DIR="/opt/backups"
LOG_FILE="/var/log/auction-deploy.log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root for security reasons"
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if Git is installed
    if ! command -v git &> /dev/null; then
        error "Git is not installed. Please install Git first."
    fi
    
    log "Prerequisites check passed"
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p /var/log
    
    # Set proper permissions
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR
    
    log "Directories created successfully"
}

# Backup current deployment
backup_current() {
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        log "Creating backup of current deployment..."
        
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
        
        # Keep only last 5 backups
        cd $BACKUP_DIR
        ls -t | tail -n +6 | xargs -r rm -rf
        
        log "Backup created: $BACKUP_NAME"
    fi
}

# Clone or update repository
update_code() {
    log "Updating application code..."
    
    if [ -d "$APP_DIR/.git" ]; then
        cd $APP_DIR
        git fetch origin
        git reset --hard origin/main
        log "Code updated from repository"
    else
        if [ -z "$REPO_URL" ]; then
            error "REPO_URL environment variable is required for initial deployment"
        fi
        git clone $REPO_URL $APP_DIR
        log "Code cloned from repository"
    fi
}

# Setup environment
setup_environment() {
    log "Setting up environment configuration..."
    
    cd $APP_DIR
    
    # Copy environment files if they don't exist
    if [ ! -f ".env.prod" ]; then
        if [ -f "env.prod.example" ]; then
            cp env.prod.example .env.prod
            warning "Please edit .env.prod with your production configuration"
        else
            error "Environment configuration file not found"
        fi
    fi
    
    if [ ! -f "frontend/.env.prod" ]; then
        if [ -f "frontend/env.prod.example" ]; then
            cp frontend/env.prod.example frontend/.env.prod
            warning "Please edit frontend/.env.prod with your production configuration"
        fi
    fi
    
    log "Environment setup completed"
}

# Build and deploy
deploy_application() {
    log "Building and deploying application..."
    
    cd $APP_DIR
    
    # Stop existing containers
    if [ -f "docker-compose.prod.yml" ]; then
        docker-compose -f docker-compose.prod.yml down || true
    fi
    
    # Build and start services
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_service_health
    
    log "Application deployed successfully"
}

# Check service health
check_service_health() {
    log "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:9999/health > /dev/null 2>&1; then
        log "Backend is healthy"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Frontend is healthy"
    else
        error "Frontend health check failed"
    fi
    
    # Check database
    if docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U auction_user -d auction_db > /dev/null 2>&1; then
        log "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.prod.yml exec -T redis redis-cli ping > /dev/null 2>&1; then
        log "Redis is healthy"
    else
        error "Redis health check failed"
    fi
}

# Setup SSL certificates
setup_ssl() {
    if [ "$SETUP_SSL" = "true" ] && [ -n "$DOMAIN" ]; then
        log "Setting up SSL certificates..."
        
        # Install certbot if not installed
        if ! command -v certbot &> /dev/null; then
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        # Stop nginx temporarily
        docker-compose -f docker-compose.prod.yml stop nginx || true
        
        # Get SSL certificate
        sudo certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN
        
        # Update nginx configuration with domain
        sudo sed -i "s/yourdomain.com/$DOMAIN/g" $APP_DIR/nginx/conf.d/auction.conf
        
        # Start nginx
        docker-compose -f docker-compose.prod.yml start nginx
        
        log "SSL certificates setup completed"
    fi
}

# Setup monitoring
setup_monitoring() {
    if [ "$SETUP_MONITORING" = "true" ]; then
        log "Setting up monitoring..."
        
        # Create monitoring script
        cat > $APP_DIR/scripts/monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script

LOG_FILE="/var/log/auction-monitor.log"

check_service() {
    local service=$1
    local url=$2
    
    if curl -f $url > /dev/null 2>&1; then
        echo "$(date): $service is healthy" >> $LOG_FILE
    else
        echo "$(date): $service is down" >> $LOG_FILE
        # Send alert (implement your preferred method)
    fi
}

check_service "Backend" "http://localhost:9999/health"
check_service "Frontend" "http://localhost:3000"
EOF
        
        chmod +x $APP_DIR/scripts/monitor.sh
        
        # Add to crontab
        (crontab -l 2>/dev/null; echo "*/5 * * * * $APP_DIR/scripts/monitor.sh") | crontab -
        
        log "Monitoring setup completed"
    fi
}

# Main deployment function
main() {
    log "Starting deployment process..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --repo-url)
                REPO_URL="$2"
                shift 2
                ;;
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --setup-ssl)
                SETUP_SSL="true"
                shift
                ;;
            --setup-monitoring)
                SETUP_MONITORING="true"
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --repo-url URL     Git repository URL"
                echo "  --domain DOMAIN    Domain name for SSL setup"
                echo "  --setup-ssl        Setup SSL certificates"
                echo "  --setup-monitoring Setup basic monitoring"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Run deployment steps
    check_root
    check_prerequisites
    create_directories
    backup_current
    update_code
    setup_environment
    deploy_application
    setup_ssl
    setup_monitoring
    
    log "Deployment completed successfully!"
    info "Application is running at: http://localhost:3000"
    info "API is available at: http://localhost:9999"
    
    if [ -n "$DOMAIN" ]; then
        info "Production URL: https://$DOMAIN"
    fi
}

# Run main function
main "$@"
