package routes

import (
	"auction-backend/handlers"
	"auction-backend/middleware"

	"fmt"

	"github.com/gin-gonic/gin"
)

// SetupRoutes configures all API routes
func SetupRoutes(r *gin.Engine, h *handlers.Handlers) {
	// API v1 group
	v1 := r.Group("/api/v1")
	{
		// Public routes
		v1.POST("/auth/login", h.Login)
		v1.POST("/auth/register", h.Register)
		v1.GET("/players", h.GetPlayers)
		v1.GET("/teams", h.GetTeams)
		v1.GET("/categories", h.GetCategories)

		// Protected routes
		protected := v1.Group("/")
		protected.Use(middleware.Auth())
		{
			// Player management
			protected.GET("/players/categories", h.GetPlayersByCategory)
			protected.GET("/players/:id", h.GetPlayer)
			protected.PUT("/players/:id", h.UpdatePlayer)
			protected.DELETE("/players/:id", h.DeletePlayer)

			// Team management
			protected.GET("/teams/:id", h.GetTeam)
			protected.PUT("/teams/:id", h.UpdateTeam)
			protected.GET("/teams/:id/players", h.GetTeamPlayers)
			protected.GET("/teams/:id/points", h.GetTeamPoints)

			// Auction management
			protected.GET("/auctions", h.GetAuctions)
			protected.POST("/auctions", middleware.RoleAuth("admin"), h.CreateAuction)
			protected.PUT("/auctions/:id", middleware.RoleAuth("admin"), h.UpdateAuction)
			protected.DELETE("/auctions/:id", middleware.RoleAuth("admin"), h.DeleteAuction)

			// Bidding
			protected.POST("/auctions/:id/bid", h.CreateBid)
			protected.GET("/auctions/:id/bids", h.GetAuctionBids)
			protected.GET("/auctions/:id/current-bid", h.GetCurrentBid)

			// Admin routes
			admin := protected.Group("/admin")
			admin.Use(middleware.RoleAuth("admin"))
			{
				admin.GET("/dashboard", h.GetAdminDashboard)
				admin.POST("/players/create", h.CreatePlayer)
				admin.POST("/players/approve", h.ApprovePlayer)
				admin.POST("/teams/create", h.CreateTeam)
				admin.PUT("/teams/:id/points", h.UpdateTeamPoints)
				admin.POST("/teams/:id/assign-player", h.AssignPlayerToTeam)
				admin.POST("/auctions/:id/assign-player", h.AssignPlayerToAuction)
				admin.POST("/auctions/:id/next-player", h.NextPlayer)
				admin.GET("/auctions/:id/status", h.GetAuctionStatus)
				admin.POST("/auctions/:id/start", h.StartAuction)
				admin.POST("/auctions/:id/end", h.EndAuction)
				admin.GET("/available-players", h.GetAvailablePlayers)
				admin.GET("/auctions/:id", h.GetAuction)
			}

			// Team routes
			team := protected.Group("/team")
			team.Use(middleware.RoleAuth("team"))
			{
				team.GET("/dashboard", h.GetTeamDashboard)
				team.GET("/roster", h.GetTeamRoster)
				team.GET("/budget", h.GetTeamBudget)
				team.POST("/retain-player", h.RetainPlayer)
			}
		}

	}

	// WebSocket route (public, no authentication required)
	v1.GET("/ws", h.HandleWebSocket)

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	r.GET("/debug/routes", func(c *gin.Context) {
		routes := []string{}
		for _, ri := range r.Routes() {
			routes = append(routes, fmt.Sprintf("%s %s", ri.Method, ri.Path))
		}
		c.JSON(200, routes)
	})
}
