# Auction App Setup Guide

## Prerequisites

### Required Software
- **Go** 1.21 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 15 or higher
- **Redis** 7 or higher
- **Git**

### Optional
- **Docker** and **Docker Compose** (for containerized setup)
- **Make** (for using Makefile commands)

## Quick Start

### Option 1: Using Make (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd auction

# Install all dependencies
make install

# Setup database (see Database Setup section)
make db-setup

# Start development servers
make dev
```

### Option 2: Manual Setup

```bash
# Backend setup
cd backend
go mod tidy
cp env.example .env
# Edit .env with your database credentials

# Frontend setup
cd ../frontend
npm install

# Start backend (in one terminal)
cd backend && go run main.go

# Start frontend (in another terminal)
cd frontend && npm run dev
```

### Option 3: Docker Setup

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f
```

## Database Setup

### PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # macOS
   brew install postgresql
   brew services start postgresql

   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database**
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE auction_db;
   CREATE USER auction_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE auction_db TO auction_user;
   \q
   ```

3. **Configure Environment**
   ```bash
   # Copy example environment file
   cp backend/env.example backend/.env

   # Edit the file with your database credentials
   nano backend/.env
   ```

### Redis Setup

1. **Install Redis**
   ```bash
   # macOS
   brew install redis
   brew services start redis

   # Ubuntu/Debian
   sudo apt install redis-server
   sudo systemctl start redis-server
   sudo systemctl enable redis-server
   ```

2. **Verify Redis is running**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=auction_user
DB_PASSWORD=your_password
DB_NAME=auction_db
DB_PORT=5432

# Redis Configuration
REDIS_ADDR=localhost:6379
REDIS_PASSWORD=

# Server Configuration
PORT=8080
GIN_MODE=debug

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRY=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Auction Configuration
TEAM_POINTS=12000
BASE_BID_AMOUNT=200
MIN_PLAYERS_PER_TEAM=12
MAX_PLAYERS_PER_TEAM=20
```

### Frontend Environment Variables

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

## Development Workflow

### Starting Development

```bash
# Start both frontend and backend
make dev

# Or start individually
make dev-backend  # Backend only
make dev-frontend # Frontend only
```

### Available Make Commands

```bash
make help          # Show all available commands
make install       # Install all dependencies
make dev           # Start development servers
make build         # Build both applications
make test          # Run tests
make clean         # Clean build artifacts
make format        # Format Go code
make lint          # Lint code
```

### Database Operations

```bash
# Run database migrations
cd backend && go run main.go

# Seed initial data (if available)
make seed

# Reset database
make db-reset
```

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:8080/health

# Get players
curl http://localhost:8080/api/v1/players

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Using Postman

1. Import the API collection (if available)
2. Set base URL to `http://localhost:8080`
3. Test endpoints

## WebSocket Testing

### Using wscat

```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c ws://localhost:8080/api/v1/ws

# Send a message
{"type": "bid", "data": {"player_id": "123", "amount": 400}}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U auction_user -d auction_db
```

#### 2. Redis Connection Error
```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
sudo systemctl start redis-server
```

#### 3. Port Already in Use
```bash
# Check what's using the port
lsof -i :8080
lsof -i :3000

# Kill the process
kill -9 <PID>
```

#### 4. Go Module Issues
```bash
# Clean and reinstall
cd backend
go clean -modcache
go mod tidy
```

#### 5. Node.js Issues
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Logs

```bash
# Backend logs
cd backend && go run main.go

# Frontend logs
cd frontend && npm run dev

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Production Deployment

### Using Docker

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment

```bash
# Build applications
make build

# Set production environment
export GIN_MODE=release
export NODE_ENV=production

# Run applications
./backend/bin/server
cd frontend && npm start
```

## Development Tips

### Code Organization

- **Backend**: Follow Go project layout conventions
- **Frontend**: Use Next.js App Router structure
- **Database**: Use GORM for ORM operations
- **API**: RESTful design with versioning

### Testing

```bash
# Backend tests
cd backend && go test ./...

# Frontend tests
cd frontend && npm test

# E2E tests (if available)
npm run test:e2e
```

### Debugging

- Use `fmt.Printf` for Go debugging
- Use browser dev tools for frontend
- Check WebSocket connections in Network tab
- Monitor database queries with GORM debug mode

### Performance

- Use Redis for caching
- Optimize database queries
- Implement connection pooling
- Monitor memory usage

## Support

### Getting Help

1. Check the documentation in `/docs`
2. Review the architecture guide
3. Check GitHub issues
4. Contact the development team

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Reporting Issues

When reporting issues, please include:
- Operating system and version
- Go version (`go version`)
- Node.js version (`node --version`)
- PostgreSQL version
- Redis version
- Error messages and logs
- Steps to reproduce 