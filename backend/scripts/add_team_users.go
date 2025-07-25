package main

import (
	"log"
	"time"

	"auction-backend/database"
	"auction-backend/models"

	"github.com/google/uuid"
)

func main() {
	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get existing teams
	var teams []models.Team
	if err := db.Find(&teams).Error; err != nil {
		log.Fatal("Failed to fetch teams:", err)
	}

	// Create team users for each team
	for _, team := range teams {
		user := models.User{
			ID:        uuid.New(),
			Username:  team.Name + "_user",
			Email:     team.Name + "@auction.com",
			Password:  "password123", // In production, this should be hashed
			Role:      "team",
			TeamID:    &team.ID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&user).Error; err != nil {
			log.Printf("Failed to create user for %s: %v", team.Name, err)
		} else {
			log.Printf("Created user: %s (%s) for team %s", user.Email, user.Role, team.Name)
		}
	}

	log.Println("Team users created successfully!")
}
