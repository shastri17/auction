package main

import (
	"log"
	"strings"
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

	// Clear existing data
	log.Println("Clearing existing data...")
	db.Exec("DELETE FROM bids")
	db.Exec("DELETE FROM auctions")
	db.Exec("DELETE FROM player_categories")
	db.Exec("DELETE FROM retained_players")
	db.Exec("DELETE FROM players")
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM teams")
	db.Exec("DELETE FROM categories")

	// Create admin user
	adminUser := models.User{
		ID:        uuid.New(),
		Username:  "admin",
		Email:     "admin@auction.com",
		Password:  "admin123", // In production, this should be hashed
		Role:      "admin",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := db.Create(&adminUser).Error; err != nil {
		log.Printf("Failed to create admin user: %v", err)
	} else {
		log.Printf("Created admin user: %s (%s)", adminUser.Email, adminUser.Role)
	}

	// Create 5 teams
	teams := []models.Team{
		{
			ID:          uuid.New(),
			Name:        "Team Alpha",
			TotalPoints: 12000,
			UsedPoints:  0,
			PlayerCount: 0,
			MinPlayers:  12,
			MaxPlayers:  20,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New(),
			Name:        "Team Beta",
			TotalPoints: 12000,
			UsedPoints:  0,
			PlayerCount: 0,
			MinPlayers:  12,
			MaxPlayers:  20,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New(),
			Name:        "Team Gamma",
			TotalPoints: 12000,
			UsedPoints:  0,
			PlayerCount: 0,
			MinPlayers:  12,
			MaxPlayers:  20,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New(),
			Name:        "Team Delta",
			TotalPoints: 12000,
			UsedPoints:  0,
			PlayerCount: 0,
			MinPlayers:  12,
			MaxPlayers:  20,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New(),
			Name:        "Team Epsilon",
			TotalPoints: 12000,
			UsedPoints:  0,
			PlayerCount: 0,
			MinPlayers:  12,
			MaxPlayers:  20,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Insert teams
	for _, team := range teams {
		if err := db.Create(&team).Error; err != nil {
			log.Printf("Failed to create team %s: %v", team.Name, err)
		} else {
			log.Printf("Created team: %s", team.Name)
		}
	}

	// Create team users for each team
	for _, team := range teams {
		// Create email without spaces
		email := team.Name + "@auction.com"
		// Replace spaces with dots for valid email
		email = strings.ReplaceAll(email, " ", ".")

		user := models.User{
			ID:        uuid.New(),
			Username:  team.Name + "_user",
			Email:     email,
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

	// Create test players with users
	playerData := []struct {
		player models.Player
		user   models.User
	}{
		// Women Players
		{
			player: models.Player{
				Name:            "Sarah Johnson",
				Gender:          "female",
				DateOfBirth:     time.Date(1992, 8, 22, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567891",
				PlayingCategory: "Women's Open Singles",
				Accomplishments: "National Champion 2023, Regional Winner 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "sarah.johnson",
				Email:     "sarah.johnson@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "Emma Davis",
				Gender:          "female",
				DateOfBirth:     time.Date(1995, 3, 15, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567893",
				PlayingCategory: "Women's Open Singles",
				Accomplishments: "State Champion 2023, Regional Runner-up 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "emma.davis",
				Email:     "emma.davis@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "Lisa Chen",
				Gender:          "female",
				DateOfBirth:     time.Date(1988, 11, 8, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567894",
				PlayingCategory: "Women's Open Singles",
				Accomplishments: "Masters Champion 2023, Veteran Winner 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "lisa.chen",
				Email:     "lisa.chen@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		// Men Under 35
		{
			player: models.Player{
				Name:            "John Smith",
				Gender:          "male",
				DateOfBirth:     time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567890",
				PlayingCategory: "Men's Open Singles",
				Accomplishments: "State Champion 2022, National Runner-up 2021",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "john.smith",
				Email:     "john.smith@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "David Brown",
				Gender:          "male",
				DateOfBirth:     time.Date(1993, 7, 20, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567895",
				PlayingCategory: "Men's Open Singles",
				Accomplishments: "Regional Champion 2023, State Runner-up 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "david.brown",
				Email:     "david.brown@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "Alex Rodriguez",
				Gender:          "male",
				DateOfBirth:     time.Date(1998, 12, 3, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567896",
				PlayingCategory: "Men's Open Singles",
				Accomplishments: "Junior Champion 2023, Youth Winner 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "alex.rodriguez",
				Email:     "alex.rodriguez@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		// Men 35 and Above
		{
			player: models.Player{
				Name:            "Mike Wilson",
				Gender:          "male",
				DateOfBirth:     time.Date(1985, 12, 10, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567892",
				PlayingCategory: "Men's 35+ Singles",
				Accomplishments: "Veteran Champion 2023, Masters Winner 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "mike.wilson",
				Email:     "mike.wilson@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "Robert Taylor",
				Gender:          "male",
				DateOfBirth:     time.Date(1978, 4, 25, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567897",
				PlayingCategory: "Men's 35+ Singles",
				Accomplishments: "Senior Champion 2023, Veteran Runner-up 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "robert.taylor",
				Email:     "robert.taylor@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
		{
			player: models.Player{
				Name:            "James Anderson",
				Gender:          "male",
				DateOfBirth:     time.Date(1972, 9, 18, 0, 0, 0, 0, time.UTC),
				Mobile:          "+1234567898",
				PlayingCategory: "Men's 35+ Singles",
				Accomplishments: "Masters Champion 2023, Senior Winner 2022",
				IsRetained:      false,
				BasePrice:       200,
				CurrentPrice:    200,
				IsSold:          false,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			},
			user: models.User{
				Username:  "james.anderson",
				Email:     "james.anderson@player.com",
				Password:  "player123",
				Role:      "player",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			},
		},
	}

	// Create players and their users
	for _, data := range playerData {
		// Create user first
		data.user.ID = uuid.New()
		if err := db.Create(&data.user).Error; err != nil {
			log.Printf("Failed to create user for %s: %v", data.player.Name, err)
			continue
		}

		// Create player with user ID
		data.player.ID = uuid.New()
		data.player.UserID = data.user.ID
		if err := db.Create(&data.player).Error; err != nil {
			log.Printf("Failed to create player %s: %v", data.player.Name, err)
		} else {
			log.Printf("Created player: %s", data.player.Name)
		}
	}

	// Create categories
	categories := []models.Category{
		{
			Name:        "Men's - Open Singles",
			Description: "Open singles category for men",
			Gender:      "male",
			Type:        "singles",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Name:        "Women's - Open Singles",
			Description: "Open singles category for women",
			Gender:      "female",
			Type:        "singles",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			Name:        "Mixed Doubles - Open",
			Description: "Open mixed doubles category",
			Gender:      "mixed",
			Type:        "doubles",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	// Insert categories
	for _, category := range categories {
		category.ID = uuid.New()
		if err := db.Create(&category).Error; err != nil {
			log.Printf("Failed to create category %s: %v", category.Name, err)
		} else {
			log.Printf("Created category: %s", category.Name)
		}
	}

	log.Println("Database seeding completed!")
}
