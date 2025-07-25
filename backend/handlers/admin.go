package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"auction-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DashboardStats represents the admin dashboard statistics
type DashboardStats struct {
	TotalPlayers     int `json:"total_players"`
	TotalTeams       int `json:"total_teams"`
	ActiveAuctions   int `json:"active_auctions"`
	TotalBids        int `json:"total_bids"`
	TotalPoints      int `json:"total_points"`
	PendingApprovals int `json:"pending_approvals"`
}

// GetAdminDashboard returns admin dashboard statistics
func (h *Handlers) GetAdminDashboard(c *gin.Context) {
	var stats DashboardStats

	// Get total players
	var playerCount int64
	h.DB.Model(&models.Player{}).Count(&playerCount)
	stats.TotalPlayers = int(playerCount)

	// Get total teams
	var teamCount int64
	h.DB.Model(&models.Team{}).Count(&teamCount)
	stats.TotalTeams = int(teamCount)

	// Get active auctions
	var activeAuctionCount int64
	h.DB.Model(&models.Auction{}).Where("status = ?", "active").Count(&activeAuctionCount)
	stats.ActiveAuctions = int(activeAuctionCount)

	// Get total bids
	var bidCount int64
	h.DB.Model(&models.Bid{}).Count(&bidCount)
	stats.TotalBids = int(bidCount)

	// Get total points (sum of all team used points)
	var totalPoints int64
	h.DB.Model(&models.Team{}).Select("COALESCE(SUM(used_points), 0)").Scan(&totalPoints)
	stats.TotalPoints = int(totalPoints)

	// Get pending approvals (players not yet approved)
	var pendingCount int64
	h.DB.Model(&models.Player{}).Where("is_sold = ?", false).Count(&pendingCount)
	stats.PendingApprovals = int(pendingCount)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// GetAuctions returns all auctions with filtering
func (h *Handlers) GetAuctions(c *gin.Context) {
	var auctions []models.Auction

	query := h.DB

	// Add status filter if provided
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Find(&auctions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch auctions",
		})
		return
	}

	// Create response with related data
	type AuctionResponse struct {
		models.Auction
		CurrentPlayer *models.Player `json:"current_player,omitempty"`
		WinningTeam   *models.Team   `json:"winning_team,omitempty"`
	}

	var auctionResponses []AuctionResponse
	for _, auction := range auctions {
		response := AuctionResponse{
			Auction: auction,
		}

		// Load current player if exists
		if auction.CurrentPlayerID != nil {
			var player models.Player
			if err := h.DB.First(&player, *auction.CurrentPlayerID).Error; err == nil {
				response.CurrentPlayer = &player
			}
		}

		// Load winning team if exists
		if auction.WinningTeamID != nil {
			var team models.Team
			if err := h.DB.First(&team, *auction.WinningTeamID).Error; err == nil {
				response.WinningTeam = &team
			}
		}

		auctionResponses = append(auctionResponses, response)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    auctionResponses,
	})
}

// CreateAuction creates a new auction
func (h *Handlers) CreateAuction(c *gin.Context) {
	// Check if there's already an active auction
	var existingActiveAuction models.Auction
	if err := h.DB.Where("status = ?", "active").First(&existingActiveAuction).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"success": false,
			"error":   "There is already an active auction. Please end the current auction before creating a new one.",
		})
		return
	}

	var auction models.Auction
	if err := c.ShouldBindJSON(&auction); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid auction data",
		})
		return
	}

	auction.Status = "pending"
	auction.CreatedAt = time.Now()
	auction.UpdatedAt = time.Now()

	if err := h.DB.Create(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create auction",
		})
		return
	}

	// Broadcast auction creation
	h.Hub.Broadcast("auction_created", auction)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    auction,
	})
}

// UpdateAuction updates an existing auction
func (h *Handlers) UpdateAuction(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.First(&auction, auctionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	var updateData models.Auction
	if err := c.ShouldBindJSON(&updateData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid update data",
		})
		return
	}

	updateData.UpdatedAt = time.Now()

	if err := h.DB.Model(&auction).Updates(updateData).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update auction",
		})
		return
	}

	// Broadcast auction update
	h.Hub.Broadcast("auction_updated", auction)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    auction,
	})
}

// DeleteAuction deletes an auction
func (h *Handlers) DeleteAuction(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.First(&auction, auctionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	if err := h.DB.Delete(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to delete auction",
		})
		return
	}

	// Broadcast auction deletion
	h.Hub.Broadcast("auction_deleted", gin.H{"id": auctionID})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Auction deleted successfully",
	})
}

// StartAuction starts an auction
func (h *Handlers) StartAuction(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.Where("id = ?", auctionID).First(&auction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	// Get the first unsold player to start the auction (following category order)
	firstPlayer, err := h.getNextPlayerByCategoryOrder(nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "No players available for auction",
		})
		return
	}

	// Assign first player and start auction
	auction.Status = "active"
	auction.StartTime = time.Now()
	auction.CurrentPlayerID = &firstPlayer.ID
	auction.CurrentBid = 0 // Start with 0 to allow first bid at base price
	auction.UpdatedAt = time.Now()

	// Debug logging
	log.Printf("StartAuction: Setting CurrentBid to 0 for auction %s", auction.ID)

	if err := h.DB.Save(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to start auction",
		})
		return
	}

	// Broadcast auction start with first player
	h.Hub.Broadcast("auction_started", gin.H{
		"auction": auction,
		"player":  firstPlayer,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"auction": auction,
			"player":  firstPlayer,
		},
	})
}

// EndAuction ends an auction
func (h *Handlers) EndAuction(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.Where("id = ?", auctionID).First(&auction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	auction.Status = "completed"
	endTime := time.Now()
	auction.EndTime = &endTime
	auction.UpdatedAt = time.Now()

	if err := h.DB.Save(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to end auction",
		})
		return
	}

	// Broadcast auction end
	h.Hub.Broadcast("auction_ended", auction)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    auction,
	})
}

// getNextPlayerByCategoryOrder gets the next unsold player based on category priority
// Priority order: 1. Women, 2. Men Under 35, 3. Men 35+
func (h *Handlers) getNextPlayerByCategoryOrder(currentPlayerID *uuid.UUID) (*models.Player, error) {
	// Define category priority order
	categoryOrder := []string{"women", "men_under_35", "men_35_plus"}

	// If there's a current player, get their category to determine where to start
	var currentCategory string
	if currentPlayerID != nil {
		var currentPlayer models.Player
		if err := h.DB.First(&currentPlayer, currentPlayerID).Error; err == nil {
			currentCategory = currentPlayer.GetPlayerCategory()
		}
	}

	// Find the starting category index
	startCategoryIndex := 0
	if currentCategory != "" {
		for i, category := range categoryOrder {
			if category == currentCategory {
				startCategoryIndex = i
				break
			}
		}
	}

	// Try to find next player in the same category first (if there's a current player)
	if currentPlayerID != nil {
		var nextPlayer models.Player
		query := h.DB.Where("is_sold = ? AND id > ?", false, currentPlayerID)

		// Add category filter based on current player's category
		switch currentCategory {
		case "women":
			query = query.Where("gender = ?", "female")
		case "men_under_35":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) < 35", "male")
		case "men_35_plus":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) >= 35", "male")
		}

		if err := query.First(&nextPlayer).Error; err == nil {
			return &nextPlayer, nil
		}
	}

	// If no next player in same category, move to next category
	for i := startCategoryIndex; i < len(categoryOrder); i++ {
		category := categoryOrder[i]

		// Skip the current category if we already tried it
		if i == startCategoryIndex && currentPlayerID != nil {
			continue
		}

		var nextPlayer models.Player
		query := h.DB.Where("is_sold = ?", false)

		// Add category filter
		switch category {
		case "women":
			query = query.Where("gender = ?", "female")
		case "men_under_35":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) < 35", "male")
		case "men_35_plus":
			query = query.Where("gender = ? AND EXTRACT(YEAR FROM AGE(date_of_birth)) >= 35", "male")
		}

		if err := query.First(&nextPlayer).Error; err == nil {
			return &nextPlayer, nil
		}
	}

	// If no players found in any category, return error
	return nil, gorm.ErrRecordNotFound
}

// NextPlayer moves to the next player in auction
func (h *Handlers) NextPlayer(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.Where("id = ?", auctionID).First(&auction).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	// Mark current player as sold if there's a winning bid
	if auction.WinningTeamID != nil {
		var currentPlayer models.Player
		if err := h.DB.First(&currentPlayer, auction.CurrentPlayerID).Error; err == nil {
			// Start a transaction to ensure data consistency
			tx := h.DB.Begin()

			// Update player information
			currentPlayer.IsSold = true
			currentPlayer.CurrentTeamID = auction.WinningTeamID
			currentPlayer.CurrentPrice = auction.CurrentBid
			if err := tx.Save(&currentPlayer).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to update player",
				})
				return
			}

			// Deduct points from winning team
			var winningTeam models.Team
			if err := tx.First(&winningTeam, auction.WinningTeamID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to find winning team",
				})
				return
			}

			// Update team's used points
			winningTeam.UsedPoints += auction.CurrentBid
			if err := tx.Save(&winningTeam).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to update team points",
				})
				return
			}

			// Commit transaction
			tx.Commit()
		}
	}

	// Get next unsold player based on category order
	nextPlayer, err := h.getNextPlayerByCategoryOrder(auction.CurrentPlayerID)
	if err != nil {
		// No more players available, but don't end the auction
		// Just clear the current player and let admin manually assign players
		auction.CurrentPlayerID = nil
		auction.CurrentBid = 0
		auction.WinningTeamID = nil
		auction.UpdatedAt = time.Now()
		h.DB.Save(&auction)

		// Broadcast that no more players are available
		h.Hub.Broadcast("no_more_players", gin.H{
			"auction_id": auction.ID,
			"message":    "No more players available for automatic seeding",
		})

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"auction":         auction,
				"message":         "No more players available. Admin can manually assign players.",
				"no_more_players": true,
			},
		})
		return
	}

	// Move to next player
	auction.CurrentPlayerID = &nextPlayer.ID
	auction.CurrentBid = 0      // Start with 0 to allow first bid at base price
	auction.WinningTeamID = nil // Reset winning team for new player
	auction.UpdatedAt = time.Now()

	// Debug logging
	log.Printf("NextPlayer: Setting CurrentBid to 0 for next player %s", nextPlayer.ID)

	if err := h.DB.Save(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update auction",
		})
		return
	}

	// Broadcast next player
	h.Hub.Broadcast("next_player", gin.H{
		"auction_id":  auction.ID,
		"player":      nextPlayer,
		"current_bid": auction.CurrentBid,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"auction": auction,
			"player":  nextPlayer,
		},
	})
}

// GetAuctionStatus returns current auction status
func (h *Handlers) GetAuctionStatus(c *gin.Context) {
	auctionID := c.Param("id")
	var auction models.Auction

	if err := h.DB.Preload("CurrentPlayer").Preload("WinningTeam").First(&auction, auctionID).Error; err != nil {
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

// AssignPlayerToAuction assigns a specific player to an auction
func (h *Handlers) AssignPlayerToAuction(c *gin.Context) {
	auctionID := c.Param("id")
	var req struct {
		PlayerID string `json:"player_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// Parse UUIDs
	parsedAuctionID, err := uuid.Parse(auctionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid auction ID",
		})
		return
	}

	parsedPlayerID, err := uuid.Parse(req.PlayerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid player ID",
		})
		return
	}

	var auction models.Auction
	if err := h.DB.First(&auction, parsedAuctionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Auction not found",
		})
		return
	}

	var player models.Player
	if err := h.DB.First(&player, parsedPlayerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	// Check if player is already sold
	if player.IsSold {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Player is already sold",
		})
		return
	}

	// Assign player to auction and reactivate if completed
	auction.CurrentPlayerID = &player.ID
	auction.CurrentBid = 0      // Start with 0 to allow first bid at base price
	auction.WinningTeamID = nil // Reset winning team
	auction.UpdatedAt = time.Now()

	// If auction was completed, reactivate it
	if auction.Status == "completed" {
		auction.Status = "active"
		auction.EndTime = nil // Clear end time
	}

	if err := h.DB.Save(&auction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to assign player to auction",
		})
		return
	}

	// Broadcast player assignment
	h.Hub.Broadcast("player_assigned", gin.H{
		"auction_id":  auction.ID,
		"player":      player,
		"current_bid": auction.CurrentBid,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"auction": auction,
			"player":  player,
		},
	})
}

// GetAvailablePlayers returns all unsold players for manual assignment
func (h *Handlers) GetAvailablePlayers(c *gin.Context) {
	var players []models.Player

	if err := h.DB.Where("is_sold = ?", false).Find(&players).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch available players",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    players,
	})
}

// ApprovePlayer approves a player registration
func (h *Handlers) ApprovePlayer(c *gin.Context) {
	var req struct {
		PlayerID string `json:"player_id" binding:"required"`
		Approved bool   `json:"approved"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	var player models.Player
	if err := h.DB.First(&player, req.PlayerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	// Update player approval status
	player.UpdatedAt = time.Now()
	if err := h.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update player",
		})
		return
	}

	// Broadcast player approval
	h.Hub.Broadcast("player_approved", gin.H{
		"player_id": player.ID,
		"approved":  req.Approved,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    player,
	})
}

// CreateTeam creates a new team
func (h *Handlers) CreateTeam(c *gin.Context) {
	var team models.Team
	if err := c.ShouldBindJSON(&team); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid team data",
		})
		return
	}

	team.TotalPoints = 12000
	team.UsedPoints = 0
	team.PlayerCount = 0
	team.MinPlayers = 12
	team.MaxPlayers = 20
	team.CreatedAt = time.Now()
	team.UpdatedAt = time.Now()

	if err := h.DB.Create(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create team",
		})
		return
	}

	// Broadcast team creation
	h.Hub.Broadcast("team_created", team)

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    team,
	})
}

// UpdateTeamPoints updates team points
func (h *Handlers) UpdateTeamPoints(c *gin.Context) {
	teamID := c.Param("id")
	var team models.Team

	if err := h.DB.First(&team, teamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	var req struct {
		UsedPoints int `json:"used_points"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	team.UsedPoints = req.UsedPoints
	team.UpdatedAt = time.Now()

	if err := h.DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update team points",
		})
		return
	}

	// Broadcast team update
	h.Hub.Broadcast("team_updated", team)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    team,
	})
}

// CreatePlayer creates a new player for auction
func (h *Handlers) CreatePlayer(c *gin.Context) {
	var req struct {
		Name            string `json:"name" binding:"required"`
		Gender          string `json:"gender" binding:"required"`
		DateOfBirth     string `json:"date_of_birth" binding:"required"`
		Mobile          string `json:"mobile" binding:"required"`
		PlayingCategory string `json:"playing_category" binding:"required"`
		Accomplishments string `json:"accomplishments"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// Parse date of birth
	dob, err := time.Parse("2006-01-02", req.DateOfBirth)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid date format",
		})
		return
	}

	// Create a user for the player
	user := models.User{
		Username:  req.Name,
		Email:     fmt.Sprintf("%s@player.com", strings.ToLower(strings.ReplaceAll(req.Name, " ", "."))),
		Password:  "player123", // Default password
		Role:      "player",
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

	// Create the player
	player := models.Player{
		UserID:          user.ID,
		Name:            req.Name,
		Gender:          req.Gender,
		DateOfBirth:     dob,
		Mobile:          req.Mobile,
		PlayingCategory: req.PlayingCategory,
		Accomplishments: req.Accomplishments,
		BasePrice:       200,
		CurrentPrice:    200,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := h.DB.Create(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to create player",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"data":    player,
	})
}

// AssignPlayerToTeam assigns a player to a team with specified points
func (h *Handlers) AssignPlayerToTeam(c *gin.Context) {
	teamID := c.Param("id")

	var req struct {
		PlayerID string `json:"player_id" binding:"required"`
		Points   int    `json:"points" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request data",
		})
		return
	}

	// Parse UUIDs
	parsedTeamID, err := uuid.Parse(teamID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid team ID",
		})
		return
	}

	parsedPlayerID, err := uuid.Parse(req.PlayerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid player ID",
		})
		return
	}

	// Start a transaction
	tx := h.DB.Begin()

	// Get the team
	var team models.Team
	if err := tx.First(&team, parsedTeamID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Check if team has enough points
	if team.UsedPoints+req.Points > team.TotalPoints {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Team does not have enough points",
		})
		return
	}

	// Get the player
	var player models.Player
	if err := tx.First(&player, parsedPlayerID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	// Check if player is already sold
	if player.IsSold {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Player is already sold to another team",
		})
		return
	}

	// Update player
	player.IsSold = true
	player.CurrentPrice = req.Points
	player.CurrentTeamID = &team.ID
	player.UpdatedAt = time.Now()

	if err := tx.Save(&player).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update player",
		})
		return
	}

	// Update team
	team.UsedPoints += req.Points
	team.PlayerCount += 1
	team.UpdatedAt = time.Now()

	if err := tx.Save(&team).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update team",
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to commit transaction",
		})
		return
	}

	// Broadcast update via WebSocket
	h.Hub.Broadcast("player_assigned", gin.H{
		"player_id": player.ID,
		"team_id":   team.ID,
		"points":    req.Points,
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"player": player,
			"team":   team,
		},
	})
}
