# Auction App Architecture

## System Overview

The Auction App is a comprehensive tournament player bidding system built with a modern tech stack featuring real-time capabilities, secure authentication, and scalable architecture.

## Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin (HTTP web framework)
- **Database**: PostgreSQL 15+ with GORM ORM
- **Cache/Sessions**: Redis
- **Real-time**: WebSocket with Gorilla WebSocket
- **Authentication**: JWT tokens
- **Validation**: Custom validators with Go struct tags

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **Real-time**: Socket.io client
- **UI Components**: Headless UI + Heroicons
- **Charts**: Recharts for analytics

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Go/Gin)      │◄──►│   (PostgreSQL)  │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │   Redis Cache   │    │   File Storage  │
│   (Real-time)   │    │   Port: 6379    │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Modules

### 1. User Management System

#### User Roles
- **Admin**: Full system access, auction management, user approval
- **Team**: Team management, bidding, roster management
- **Player**: Profile management, registration

#### Authentication Flow
1. User registration with email verification
2. JWT token generation upon login
3. Role-based access control middleware
4. Session management with Redis

### 2. Auction Engine

#### Bidding System
- Real-time WebSocket communication
- Point-based currency (12,000 points per team)
- Incremental bidding (200 → 400 points)
- Automatic bid validation and conflict resolution

#### Auction States
- **Pending**: Auction created, not yet started
- **Active**: Live bidding in progress
- **Completed**: Auction finished, players assigned

### 3. Team Management

#### Team Structure
- 5 teams with shared login credentials
- Minimum 12 players per team
- Category-based player requirements
- Point budget tracking

#### Player Categories
- **Women/Girls**: Minimum 2 players
- **Below 35 Men**: Minimum 5 players
- **Above 35 Men**: Minimum 5 players

### 4. Tournament Categories

#### Supported Categories
1. **Men's Open Singles**
2. **Women's Open Singles**
3. **Mixed Doubles**
4. **Men's Open Doubles**
5. **Men's 35+ Singles**
6. **Men's 35+ Doubles**
7. **Mix Age Triples** (40+ + Women)
8. **Jumble Doubles** (Age mix)
9. **Men's Mix Age Doubles** (45+ + Total age ≥85)

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'player',
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Players
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    date_of_birth DATE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    playing_category VARCHAR(50) NOT NULL,
    accomplishments TEXT,
    base_price INTEGER DEFAULT 200,
    current_price INTEGER DEFAULT 200,
    is_sold BOOLEAN DEFAULT FALSE,
    current_team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Teams
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    total_points INTEGER DEFAULT 12000,
    used_points INTEGER DEFAULT 0,
    player_count INTEGER DEFAULT 0,
    min_players INTEGER DEFAULT 12,
    max_players INTEGER DEFAULT 20,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Auctions
```sql
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    current_player_id UUID REFERENCES players(id),
    current_bid INTEGER DEFAULT 0,
    winning_team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Bids
```sql
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES auctions(id) NOT NULL,
    player_id UUID REFERENCES players(id) NOT NULL,
    team_id UUID REFERENCES teams(id) NOT NULL,
    amount INTEGER NOT NULL,
    is_winning BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Players
- `GET /api/v1/players` - List all players
- `GET /api/v1/players/:id` - Get player details
- `PUT /api/v1/players/:id` - Update player
- `DELETE /api/v1/players/:id` - Delete player

### Teams
- `GET /api/v1/teams` - List all teams
- `GET /api/v1/teams/:id` - Get team details
- `PUT /api/v1/teams/:id` - Update team
- `GET /api/v1/teams/:id/players` - Get team players
- `GET /api/v1/teams/:id/points` - Get team points

### Auctions
- `GET /api/v1/auctions` - List all auctions
- `GET /api/v1/auctions/:id` - Get auction details
- `POST /api/v1/auctions` - Create auction (Admin)
- `PUT /api/v1/auctions/:id` - Update auction (Admin)
- `DELETE /api/v1/auctions/:id` - Delete auction (Admin)

### Bidding
- `POST /api/v1/auctions/:id/bid` - Place bid
- `GET /api/v1/auctions/:id/bids` - Get auction bids
- `GET /api/v1/auctions/:id/current-bid` - Get current bid

### Admin Routes
- `GET /api/v1/admin/dashboard` - Admin dashboard
- `POST /api/v1/admin/players/approve` - Approve player
- `POST /api/v1/admin/teams/create` - Create team
- `PUT /api/v1/admin/teams/:id/points` - Update team points
- `POST /api/v1/admin/auctions/:id/start` - Start auction
- `POST /api/v1/admin/auctions/:id/end` - End auction
- `POST /api/v1/admin/auctions/:id/next-player` - Next player

### WebSocket
- `GET /api/v1/ws` - WebSocket connection for real-time updates

## Real-time Features

### WebSocket Events
- `bid` - New bid placed
- `auction_status` - Auction status update
- `player_sold` - Player sold to team
- `team_update` - Team points/roster update
- `error` - Error notification

### Live Updates
- Real-time bidding interface
- Live auction status
- Team point updates
- Player assignment confirmations
- Admin notifications

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management with Redis

### Data Protection
- Input validation and sanitization
- SQL injection prevention with GORM
- XSS protection
- CORS configuration
- Rate limiting (planned)

## Performance Considerations

### Database Optimization
- Indexed foreign keys
- Query optimization with GORM
- Connection pooling
- Read replicas (for scale)

### Caching Strategy
- Redis for session storage
- Player data caching
- Auction status caching
- Team point caching

### Scalability
- Horizontal scaling with load balancers
- Database sharding (future)
- Microservices architecture (future)
- CDN for static assets

## Deployment

### Development
```bash
# Install dependencies
make install

# Start development servers
make dev

# Or use Docker
docker-compose up -d
```

### Production
```bash
# Build applications
make build

# Run with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring & Logging

### Logging
- Structured logging with Go
- Request/response logging
- Error tracking
- Performance metrics

### Monitoring
- Health check endpoints
- Database connection monitoring
- WebSocket connection monitoring
- Application metrics

## Future Enhancements

### Planned Features
- Mobile app (React Native)
- Advanced analytics dashboard
- Payment integration
- Email notifications
- Push notifications
- Video streaming for auctions
- AI-powered player recommendations

### Technical Improvements
- GraphQL API
- Event sourcing
- Message queues (RabbitMQ/Kafka)
- Kubernetes deployment
- CI/CD pipeline
- Automated testing
- Performance monitoring 