#!/bin/bash

# AWS Deployment Script for Auction App
# This script deploys the application to AWS using various services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="auction"
AWS_REGION="us-east-1"
ECR_REPOSITORY="auction-app"

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

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured. Please run 'aws configure' first."
    fi
    
    log "AWS CLI check passed"
}

# Create ECR repository
create_ecr_repository() {
    log "Creating ECR repository..."
    
    # Check if repository exists
    if aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION &> /dev/null; then
        log "ECR repository already exists"
    else
        aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
        log "ECR repository created"
    fi
    
    # Get login token
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
}

# Build and push Docker images
build_and_push_images() {
    log "Building and pushing Docker images..."
    
    ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY
    
    # Build backend image
    docker build -t $ECR_URI-backend:latest ./backend
    docker push $ECR_URI-backend:latest
    
    # Build frontend image
    docker build -t $ECR_URI-frontend:latest ./frontend
    docker push $ECR_URI-frontend:latest
    
    log "Images pushed to ECR"
}

# Deploy to ECS
deploy_to_ecs() {
    log "Deploying to ECS..."
    
    # Create cluster if it doesn't exist
    if ! aws ecs describe-clusters --clusters $APP_NAME-cluster --region $AWS_REGION &> /dev/null; then
        aws ecs create-cluster --cluster-name $APP_NAME-cluster --region $AWS_REGION
        log "ECS cluster created"
    fi
    
    # Create task definition
    ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY
    
    cat > task-definition.json << EOF
{
  "family": "$APP_NAME-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "$ECR_URI-backend:latest",
      "portMappings": [
        {
          "containerPort": 9999,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "DB_HOST",
          "value": "your-rds-endpoint"
        },
        {
          "name": "GIN_MODE",
          "value": "release"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$APP_NAME",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    },
    {
      "name": "frontend",
      "image": "$ECR_URI-frontend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NEXT_PUBLIC_API_URL",
          "value": "https://your-domain.com/api"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$APP_NAME",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF
    
    # Register task definition
    aws ecs register-task-definition --cli-input-json file://task-definition.json --region $AWS_REGION
    
    # Create or update service
    if aws ecs describe-services --cluster $APP_NAME-cluster --services $APP_NAME-service --region $AWS_REGION &> /dev/null; then
        aws ecs update-service --cluster $APP_NAME-cluster --service $APP_NAME-service --task-definition $APP_NAME-task --region $AWS_REGION
        log "ECS service updated"
    else
        # Create service (you'll need to provide VPC and subnet IDs)
        warning "Please create the ECS service manually with proper VPC configuration"
        info "Use the task definition: $APP_NAME-task"
    fi
    
    # Clean up
    rm task-definition.json
}

# Deploy to EC2
deploy_to_ec2() {
    log "Deploying to EC2..."
    
    # This is a simplified version - in practice, you'd use more sophisticated deployment
    warning "EC2 deployment requires manual setup of the instance"
    info "Please follow the VPS deployment guide on your EC2 instance"
}

# Main function
main() {
    log "Starting AWS deployment..."
    
    # Parse command line arguments
    DEPLOYMENT_TYPE="ecs"
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --type)
                DEPLOYMENT_TYPE="$2"
                shift 2
                ;;
            --region)
                AWS_REGION="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --type TYPE        Deployment type (ecs, ec2)"
                echo "  --region REGION    AWS region"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                ;;
        esac
    done
    
    # Run deployment steps
    check_aws_cli
    
    case $DEPLOYMENT_TYPE in
        "ecs")
            create_ecr_repository
            build_and_push_images
            deploy_to_ecs
            ;;
        "ec2")
            deploy_to_ec2
            ;;
        *)
            error "Unknown deployment type: $DEPLOYMENT_TYPE"
            ;;
    esac
    
    log "AWS deployment completed!"
}

# Run main function
main "$@"
