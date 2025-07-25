# Auction App - Tournament Player Bidding System

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS
- **Backend**: Go (Gin framework) with PostgreSQL
- **Real-time**: WebSocket connections
- **Authentication**: JWT tokens
- **Database**: PostgreSQL with GORM

### System Components

#### 1. User Management
- **Player Registration**: Complete profile with achievements
- **Team Access**: 5 teams with shared credentials
- **Admin Panel**: Centralized management
- **Role-based Access**: Admin, Team, Player roles

#### 2. Auction Engine
- **Real-time Bidding**: WebSocket-based live bidding
- **Point System**: 12,000 points per team
- **Bidding Rules**: 
  - Base: 200 points
  - Increments: 200 (up to 2000), then 400
- **Player Categories**: Women/Girls (min 2), Below 35 Men (min 5), Above 35 Men (min 5)

#### 3. Tournament Categories
- Men's/Women's Open Singles
- Mixed Doubles
- Men's Open Doubles
- Men's 35+ Singles/Doubles
- Mix Age Triples (40+ + Women)
- Jumble Doubles (Age mix)
- Men's Mix Age Doubles (45+ + Total age ≥85)

#### 4. Special Features
- **Retained Players**: 2 players per team
- **Re-auction System**: Unsold players re-auctioned
- **Real-time Dashboard**: Live updates, team status
- **Compliance Checking**: Category requirements validation

## Project Structure
```
auction/
├── frontend/          # Next.js frontend
├── backend/           # Go backend
├── docs/             # Documentation
└── docker-compose.yml # Development setup
```

## Getting Started

### Prerequisites
- Go 1.21+
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Installation
1. Clone the repository
2. Set up the database
3. Configure environment variables
4. Run the development servers

## Development Commands
- `make dev` - Start both frontend and backend
- `make build` - Build both applications
- `make test` - Run tests
- `make docker` - Run with Docker Compose

## Database Management
- `./seed-database.sh` - Seed the database with initial data (first time only)
- **Note**: Data is now persistent between restarts. Only run seed script when you want to reset to initial data. 