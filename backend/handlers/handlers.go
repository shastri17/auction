package handlers

import (
	"auction-backend/websocket"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

// Handlers struct holds all handler dependencies
type Handlers struct {
	DB          *gorm.DB
	RedisClient *redis.Client
	Hub         *websocket.Hub
}

// NewHandlers creates a new Handlers instance
func NewHandlers(db *gorm.DB, redisClient *redis.Client, hub *websocket.Hub) *Handlers {
	return &Handlers{
		DB:          db,
		RedisClient: redisClient,
		Hub:         hub,
	}
}
