package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"auction-backend/database"
	"auction-backend/handlers"
	"auction-backend/middleware"
	"auction-backend/routes"
	"auction-backend/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize Redis for sessions
	redisClient := database.InitRedis()

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Set Gin mode
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create Gin router
	r := gin.Default()

	// CORS configuration

	// CORS must come first
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://13.234.48.132:3000", "http://127.0.0.1:3000", "http://localhost:3000"}, // allow all origins
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// OPTIONS catch-all to make sure preflight never fails
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Initialize handlers with dependencies
	handlers := handlers.NewHandlers(db, redisClient, hub)

	// Setup middleware
	r.Use(middleware.Logger())
	r.Use(middleware.Recovery())

	// Setup routes
	routes.SetupRoutes(r, handlers)

	// Get port from environment or use default
	port := os.Getenv("PORT")
	if port == "" {
		port = "9999"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
