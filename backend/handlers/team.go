package handlers

import (
	"net/http"
	"time"

	"auction-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// TeamDashboard represents team dashboard data
type TeamDashboard struct {
	TeamID          string          `json:"team_id"`
	TeamName        string          `json:"team_name"`
	TotalPoints     int             `json:"total_points"`
	UsedPoints      int             `json:"used_points"`
	RemainingPoints int             `json:"remaining_points"`
	PlayerCount     int             `json:"player_count"`
	MinPlayers      int             `json:"min_players"`
	MaxPlayers      int             `json:"max_players"`
	Players         []models.Player `json:"players"`
	RecentBids      []models.Bid    `json:"recent_bids"`
}

// GetTeamDashboard returns team dashboard data
func (h *Handlers) GetTeamDashboard(c *gin.Context) {
	// Get team ID from context (set by auth middleware)
	teamID, exists := c.Get("team_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Parse team ID as UUID
	teamUUID, err := uuid.Parse(teamID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid team ID",
		})
		return
	}

	var team models.Team
	if err := h.DB.First(&team, teamUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Get team players
	var players []models.Player
	h.DB.Where("current_team_id = ?", team.ID).Find(&players)

	// Get recent bids
	var recentBids []models.Bid
	h.DB.Where("team_id = ?", team.ID).
		Order("created_at DESC").
		Limit(5).
		Find(&recentBids)

	dashboard := TeamDashboard{
		TeamID:          team.ID.String(),
		TeamName:        team.Name,
		TotalPoints:     team.TotalPoints,
		UsedPoints:      team.UsedPoints,
		RemainingPoints: team.TotalPoints - team.UsedPoints,
		PlayerCount:     len(players),
		MinPlayers:      team.MinPlayers,
		MaxPlayers:      team.MaxPlayers,
		Players:         players,
		RecentBids:      recentBids,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dashboard,
	})
}

// GetTeamRoster returns team's player roster
func (h *Handlers) GetTeamRoster(c *gin.Context) {
	teamID, exists := c.Get("team_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	var players []models.Player
	if err := h.DB.Where("current_team_id = ?", teamID).Find(&players).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to fetch roster",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    players,
	})
}

// GetTeamBudget returns team's budget information
func (h *Handlers) GetTeamBudget(c *gin.Context) {
	teamID, exists := c.Get("team_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	// Parse team ID as UUID
	teamUUID, err := uuid.Parse(teamID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid team ID",
		})
		return
	}

	var team models.Team
	if err := h.DB.First(&team, teamUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

	budget := gin.H{
		"total_points":     team.TotalPoints,
		"used_points":      team.UsedPoints,
		"remaining_points": team.TotalPoints - team.UsedPoints,
		"min_players":      team.MinPlayers,
		"max_players":      team.MaxPlayers,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    budget,
	})
}

// RetainPlayer retains a player for the team
func (h *Handlers) RetainPlayer(c *gin.Context) {
	teamID, exists := c.Get("team_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"error":   "Team not found",
		})
		return
	}

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

	// Parse player ID
	playerUUID, err := uuid.Parse(req.PlayerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid player ID",
		})
		return
	}

	// Get player
	var player models.Player
	if err := h.DB.First(&player, playerUUID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"error":   "Player not found",
		})
		return
	}

	// Check if player is already retained
	if player.IsRetained {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Player is already retained",
		})
		return
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

	// Update player as retained
	player.IsRetained = true
	player.RetainedBy = &teamUUID
	player.UpdatedAt = time.Now()

	if err := h.DB.Save(&player).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retain player",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    player,
	})
}
