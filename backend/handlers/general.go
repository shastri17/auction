package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"auction-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LoginRequest represents login request
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// RegisterRequest represents registration request
type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required"`
}

// Login handles user authentication
func (h *Handlers) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	var user models.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Invalid credentials",
		})
		return
	}

	// TODO: Implement password hashing and verification
	// For now, just check if password matches
	if user.Password != req.Password {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Invalid credentials",
		})
		return
	}

	// Generate token based on user role
	var token string
	if user.Role == "team" && user.TeamID != nil {
		// For team users, use the format expected by middleware
		token = "mock-jwt-token-team" + user.TeamID.String()
	} else {
		// For admin users, use user ID
		token = "mock-jwt-token-" + user.ID.String()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token": token,
			"user":  user,
		},
	})
}

// Register handles user registration
func (h *Handlers) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := h.DB.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "User already exists",
		})
		return
	}

	// TODO: Hash password
	user := models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  req.Password, // Should be hashed
		Role:      req.Role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := h.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create user",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    user,
	})
}

// GetPlayers returns all players with filtering
func (h *Handlers) GetPlayers(c *gin.Context) {
	var players []models.Player

	query := h.DB.Preload("User")

	// Add filters
	if status := c.Query("status"); status != "" {
		if status == "sold" {
			query = query.Where("is_sold = ?", true)
		} else if status == "unsold" {
			query = query.Where("is_sold = ?", false)
		}
	}

	if category := c.Query("category"); category != "" {
		query = query.Where("playing_category = ?", category)
	}

	// Add player category filter (women, men_under_35, men_35_plus)
	if playerCategory := c.Query("player_category"); playerCategory != "" {
		switch playerCategory {
		case "women":
			query = query.Where("gender = ?", "female")
		case "men_under_35":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) < ?", "male", 35)
		case "men_35_plus":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) >= ?", "male", 35)
		}
	}

	if err := query.Find(&players).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch players",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    players,
	})
}

// GetAuction returns a specific auction
func (h *Handlers) GetAuction(c *gin.Context) {
	auctionID := c.Param("id")

	var auction models.Auction
	if err := h.DB.First(&auction, auctionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    auction,
	})
}

// GetPlayer returns a specific player
func (h *Handlers) GetPlayer(c *gin.Context) {
	playerID := c.Param("id")

	var player models.Player
	if err := h.DB.Preload("User").First(&player, playerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    player,
	})
}

// UpdatePlayer updates a player
func (h *Handlers) UpdatePlayer(c *gin.Context) {
	playerID := c.Param("id")
	var player models.Player

	if err := h.DB.First(&player, playerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	var updateData models.Player
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid update data",
		})
		return
	}

	updateData.UpdatedAt = time.Now()

	if err := h.DB.Model(&player).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update player",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    player,
	})
}

// DeletePlayer deletes a player
func (h *Handlers) DeletePlayer(c *gin.Context) {
	playerID := c.Param("id")
	var player models.Player

	if err := h.DB.First(&player, playerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	if err := h.DB.Delete(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to delete player",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Player deleted successfully",
	})
}

// GetTeams returns all teams
func (h *Handlers) GetTeams(c *gin.Context) {
	var teams []models.Team

	if err := h.DB.Preload("Players").Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch teams",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    teams,
	})
}

// GetTeam returns a specific team
func (h *Handlers) GetTeam(c *gin.Context) {
	teamID := c.Param("id")

	var team models.Team
	if err := h.DB.Preload("Players").First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    team,
	})
}

// UpdateTeam updates a team
func (h *Handlers) UpdateTeam(c *gin.Context) {
	teamID := c.Param("id")
	var team models.Team

	if err := h.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	var updateData models.Team
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid update data",
		})
		return
	}

	updateData.UpdatedAt = time.Now()

	if err := h.DB.Model(&team).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update team",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    team,
	})
}

// GetTeamPlayers returns players for a specific team
func (h *Handlers) GetTeamPlayers(c *gin.Context) {
	teamID := c.Param("id")

	var players []models.Player
	if err := h.DB.Where("current_team_id = ?", teamID).Preload("User").Find(&players).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch team players",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    players,
	})
}

// GetTeamPoints returns points for a specific team
func (h *Handlers) GetTeamPoints(c *gin.Context) {
	teamID := c.Param("id")

	var team models.Team
	if err := h.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	points := gin.H{
		"total_points":     team.TotalPoints,
		"used_points":      team.UsedPoints,
		"remaining_points": team.TotalPoints - team.UsedPoints,
		"percentage_used":  float64(team.UsedPoints) / float64(team.TotalPoints) * 100,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    points,
	})
}

// GetCategories returns all tournament categories
func (h *Handlers) GetCategories(c *gin.Context) {
	var categories []models.Category

	if err := h.DB.Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch categories",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    categories,
	})
}

// HandleWebSocket handles WebSocket connections
func (h *Handlers) HandleWebSocket(c *gin.Context) {
	h.Hub.HandleWebSocket(c)
}

// CreateBid creates a new bid for a player in an auction
func (h *Handlers) CreateBid(c *gin.Context) {
	auctionID := c.Param("id")
	var req struct {
		Amount int `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// Get team ID from context (set by auth middleware)
	teamID, exists := c.Get("team_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Parse auction ID as UUID
	auctionUUID, err := uuid.Parse(auctionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid auction ID",
		})
		return
	}

	// Get auction
	var auction models.Auction
	if err := h.DB.First(&auction, auctionUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	// Check if auction is active
	if auction.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Auction is not active",
		})
		return
	}

	// Debug logging
	log.Printf("CreateBid: CurrentBid=%d, RequestedAmount=%d", auction.CurrentBid, req.Amount)

	// Check if bid is valid
	// For the first bid (CurrentBid = 0), allow bidding at base price (200) or higher
	// For subsequent bids, require bid to be higher than current bid
	if auction.CurrentBid == 0 {
		// First bid - must be at least base price (200)
		if req.Amount < 200 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "First bid must be at least ₹200",
			})
			return
		}
	} else {
		// Subsequent bids - must be higher than current bid
		if req.Amount <= auction.CurrentBid {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Bid must be higher than current bid",
			})
			return
		}
	}

	// Parse team ID to UUID
	teamUUID, err := uuid.Parse(teamID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid team ID",
		})
		return
	}

	// Get team to check available points
	var team models.Team
	if err := h.DB.First(&team, teamUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Check if team has enough points
	remainingPoints := team.TotalPoints - team.UsedPoints
	if req.Amount > remainingPoints {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Insufficient points",
		})
		return
	}

	// Smart bidding validation: Check if bid would leave team without enough points for minimum players
	const minPlayersRequired = 12
	const basePricePerPlayer = 200

	// Calculate how many more players the team needs
	playersAcquired := team.PlayerCount
	remainingPlayersNeeded := minPlayersRequired - playersAcquired - 1 // -1 for current player being bid on

	if remainingPlayersNeeded > 0 {
		// Calculate minimum points needed for remaining players
		minPointsForRemainingPlayers := remainingPlayersNeeded * basePricePerPlayer

		// Calculate points that would remain after this bid
		pointsAfterBid := remainingPoints - req.Amount

		// Check if bidding would leave team without enough points for minimum players
		if pointsAfterBid < minPointsForRemainingPlayers {
			maxSafeBid := remainingPoints - minPointsForRemainingPlayers
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Bid too high! You need at least " + fmt.Sprintf("%d", minPointsForRemainingPlayers) + " points for " + fmt.Sprintf("%d", remainingPlayersNeeded) + " more players. Max safe bid: " + fmt.Sprintf("%d", maxSafeBid),
			})
			return
		}
	}

	// Check if the same team is already winning the current bid
	if auction.WinningTeamID != nil && *auction.WinningTeamID == team.ID {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "You are already winning the current bid. Another team must bid first.",
		})
		return
	}

	// Create bid
	bid := models.Bid{
		AuctionID: auction.ID,
		PlayerID:  *auction.CurrentPlayerID,
		TeamID:    teamUUID,
		Amount:    req.Amount,
		IsWinning: true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Start transaction
	tx := h.DB.Begin()

	// Set all previous bids for this auction to not winning
	if err := tx.Model(&models.Bid{}).
		Where("auction_id = ?", auctionID).
		Update("is_winning", false).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update bids",
		})
		return
	}

	// Create new bid
	if err := tx.Create(&bid).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create bid",
		})
		return
	}

	// Update auction current bid
	auction.CurrentBid = req.Amount
	auction.WinningTeamID = &team.ID
	auction.UpdatedAt = time.Now()

	if err := tx.Save(&auction).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update auction",
		})
		return
	}

	// Commit transaction
	tx.Commit()

	// Broadcast new bid
	h.Hub.Broadcast("new_bid", gin.H{
		"auction_id":  auction.ID,
		"bid":         bid,
		"team":        team,
		"current_bid": auction.CurrentBid,
	})

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    bid,
	})
}

// GetAuctionBids gets all bids for an auction
func (h *Handlers) GetAuctionBids(c *gin.Context) {
	auctionID := c.Param("id")

	var bids []models.Bid
	if err := h.DB.Where("auction_id = ?", auctionID).
		Preload("Team").
		Order("created_at DESC").
		Find(&bids).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch bids",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bids,
	})
}

// GetCurrentBid gets the current winning bid for an auction
func (h *Handlers) GetCurrentBid(c *gin.Context) {
	auctionID := c.Param("id")

	var bid models.Bid
	if err := h.DB.Where("auction_id = ? AND is_winning = ?", auctionID, true).
		Preload("Team").
		First(&bid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "No winning bid found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bid,
	})
}

// GetPlayersByCategory returns players grouped by category
func (h *Handlers) GetPlayersByCategory(c *gin.Context) {
	var players []models.Player

	query := h.DB.Preload("User")

	// Add status filter if provided
	if status := c.Query("status"); status != "" {
		if status == "sold" {
			query = query.Where("is_sold = ?", true)
		} else if status == "unsold" {
			query = query.Where("is_sold = ?", false)
		}
	}

	if err := query.Find(&players).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch players",
		})
		return
	}

	// Group players by category
	categorizedPlayers := map[string][]models.Player{
		"women":        {},
		"men_under_35": {},
		"men_35_plus":  {},
	}

	for _, player := range players {
		category := player.GetPlayerCategory()
		if category != "unknown" {
			categorizedPlayers[category] = append(categorizedPlayers[category], player)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    categorizedPlayers,
	})
}
