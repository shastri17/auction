# Auction App Deployment Guide

This guide covers multiple deployment options for your auction application, from simple VPS deployment to cloud platforms.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [VPS Deployment (Recommended)](#vps-deployment-recommended)
4. [Cloud Platform Deployment](#cloud-platform-deployment)
5. [Environment Configuration](#environment-configuration)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Server Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB SSD
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB SSD
- **OS**: Ubuntu 20.04+ or CentOS 8+ (Ubuntu recommended)

### Software Requirements
- Docker & Docker Compose
- Git
- Nginx (for reverse proxy)
- Certbot (for SSL certificates)

## Deployment Options

### 1. VPS Deployment (Recommended)
- **Cost**: $5-20/month
- **Providers**: DigitalOcean, Linode, Vultr, AWS EC2
- **Pros**: Full control, cost-effective, easy scaling
- **Cons**: Manual setup, server management

### 2. Cloud Platform Deployment
- **AWS**: ECS, EKS, or EC2
- **Google Cloud**: Cloud Run, GKE, or Compute Engine
- **Azure**: Container Instances, AKS, or VMs
- **Pros**: Managed services, auto-scaling, high availability
- **Cons**: Higher cost, vendor lock-in

### 3. Container Platform Deployment
- **Docker Swarm**: Simple orchestration
- **Kubernetes**: Advanced orchestration
- **Pros**: Scalability, high availability
- **Cons**: Complex setup, learning curve

## VPS Deployment (Recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Logout and login again to apply docker group changes
```

### Step 2: Application Deployment

```bash
# Clone your repository
git clone <your-repo-url> /opt/auction
cd /opt/auction

# Create production environment file
cp backend/env.example backend/.env.prod

# Edit production environment
nano backend/.env.prod
```

### Step 3: Production Environment Configuration

Create `backend/.env.prod`:
```env
# Database Configuration
DB_HOST=postgres
DB_USER=auction_user
DB_PASSWORD=your_secure_password_here
DB_NAME=auction_db
DB_PORT=5432

# Redis Configuration
REDIS_ADDR=redis:6379
REDIS_PASSWORD=your_redis_password_here

# Server Configuration
PORT=9999
GIN_MODE=release

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRY=24h

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Auction Configuration
TEAM_POINTS=12000
BASE_BID_AMOUNT=200
MIN_PLAYERS_PER_TEAM=12
MAX_PLAYERS_PER_TEAM=20
```

Create `frontend/.env.prod`:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
```

### Step 4: Deploy with Docker

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Cloud Platform Deployment

### AWS Deployment

#### Option 1: AWS ECS with Fargate

1. **Create ECS Cluster**
```bash
aws ecs create-cluster --cluster-name auction-cluster
```

2. **Create Task Definition**
```json
{
  "family": "auction-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/auction-backend:latest",
      "portMappings": [{"containerPort": 9999}],
      "environment": [
        {"name": "DB_HOST", "value": "your-rds-endpoint"},
        {"name": "GIN_MODE", "value": "release"}
      ]
    }
  ]
}
```

3. **Create Service**
```bash
aws ecs create-service \
  --cluster auction-cluster \
  --service-name auction-service \
  --task-definition auction-app:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

#### Option 2: AWS EC2 with Docker

```bash
# Launch EC2 instance (t3.medium or larger)
# Install Docker and Docker Compose
# Follow VPS deployment steps
```

### Google Cloud Deployment

#### Option 1: Cloud Run

```bash
# Build and push images
gcloud builds submit --tag gcr.io/PROJECT-ID/auction-backend ./backend
gcloud builds submit --tag gcr.io/PROJECT-ID/auction-frontend ./frontend

# Deploy to Cloud Run
gcloud run deploy auction-backend \
  --image gcr.io/PROJECT-ID/auction-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy auction-frontend \
  --image gcr.io/PROJECT-ID/auction-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

#### Option 2: GKE (Google Kubernetes Engine)

```bash
# Create cluster
gcloud container clusters create auction-cluster \
  --num-nodes=3 \
  --zone=us-central1-a

# Deploy application
kubectl apply -f k8s/
```

## Environment Configuration

### Production Environment Variables

#### Backend (.env.prod)
```env
# Database Configuration
DB_HOST=postgres
DB_USER=auction_user
DB_PASSWORD=your_secure_password_here
DB_NAME=auction_db
DB_PORT=5432

# Redis Configuration
REDIS_ADDR=redis:6379
REDIS_PASSWORD=your_redis_password_here

# Server Configuration
PORT=9999
GIN_MODE=release

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRY=24h

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Auction Configuration
TEAM_POINTS=12000
BASE_BID_AMOUNT=200
MIN_PLAYERS_PER_TEAM=12
MAX_PLAYERS_PER_TEAM=20
```

#### Frontend (.env.prod)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_WS_URL=wss://yourdomain.com/ws
```

### Security Considerations

1. **Use strong passwords** for database and Redis
2. **Generate secure JWT secrets** (32+ characters)
3. **Enable HTTPS** with SSL certificates
4. **Configure firewall** to only allow necessary ports
5. **Regular security updates** for the server
6. **Backup strategy** for database

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Stop Nginx temporarily
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Configure Nginx with SSL
sudo nano /etc/nginx/sites-available/auction
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:9999/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:9999/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site and restart Nginx
sudo ln -s /etc/nginx/sites-available/auction /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring & Maintenance

### Health Checks

```bash
# Check application status
curl -f http://localhost:9999/health || echo "Backend down"
curl -f http://localhost:3000 || echo "Frontend down"

# Check database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check Redis
docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
```

### Logging

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# View system logs
sudo journalctl -u nginx -f
```

### Backup Strategy

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U auction_user auction_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f /opt/auction/docker-compose.prod.yml exec -T postgres pg_dump -U auction_user auction_db > $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_backup_*.sql" -mtime +7 -delete
```

### Updates

```bash
# Update application
cd /opt/auction
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Update system packages
sudo apt update && sudo apt upgrade -y
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check environment variables
docker-compose -f docker-compose.prod.yml config

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### 2. Database Connection Issues
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready

# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U auction_user -d auction_db
```

#### 3. WebSocket Connection Issues
```bash
# Check if WebSocket is accessible
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost:9999/ws

# Check Nginx configuration
sudo nginx -t
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect yourdomain.com:443
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_players_category ON players(category);
CREATE INDEX idx_players_status ON players(status);
CREATE INDEX idx_bids_player_id ON bids(player_id);
CREATE INDEX idx_bids_team_id ON bids(team_id);
```

#### 2. Redis Configuration
```bash
# Optimize Redis for production
echo "maxmemory 256mb" >> /etc/redis/redis.conf
echo "maxmemory-policy allkeys-lru" >> /etc/redis/redis.conf
```

#### 3. Nginx Optimization
```nginx
# Add to Nginx configuration
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Cost Estimation

### VPS Deployment
- **DigitalOcean**: $12-24/month (2-4GB RAM)
- **Linode**: $10-20/month (2-4GB RAM)
- **Vultr**: $6-12/month (1-2GB RAM)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

### Cloud Platform
- **AWS**: $20-50/month (depending on usage)
- **Google Cloud**: $15-40/month
- **Azure**: $20-45/month

## Next Steps

1. **Choose your deployment option** based on budget and requirements
2. **Set up monitoring** (Prometheus, Grafana, or simple health checks)
3. **Implement CI/CD** for automated deployments
4. **Set up backups** and disaster recovery
5. **Configure monitoring alerts** for uptime and performance
6. **Plan for scaling** as your user base grows

## Support

For deployment issues:
1. Check the logs first
2. Verify environment configuration
3. Test individual components
4. Check network connectivity
5. Review security settings

Remember to keep your deployment secure and regularly updated!
