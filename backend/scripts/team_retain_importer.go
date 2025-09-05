package main

import (
	"encoding/csv"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	"auction-backend/database"
	"auction-backend/models"

	"github.com/google/uuid"
)

func main() {
	// Check if CSV file path is provided
	if len(os.Args) < 2 {
		log.Fatal("Usage: go run team_retain_importer.go <path_to_csv_file> [--clear-existing]\n" +
			"This script will:\n" +
			"1. Create teams from the CSV data\n" +
			"2. Create team users for login (username: teamname_user, password: team123)\n" +
			"3. Import retained players and assign them to teams\n" +
			"4. Update team points and player counts\n\n" +
			"Use --clear-existing flag to clear all existing team data before import.")
	}

	csvFilePath := os.Args[1]
	clearExisting := false

	// Check for clear existing flag
	if len(os.Args) > 2 && os.Args[2] == "--clear-existing" {
		clearExisting = true
	}

	// Initialize database
	db, err := database.InitDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Clear existing data if requested
	if clearExisting {
		log.Println("Clearing existing team and retained player data...")
		db.Exec("DELETE FROM bids")
		db.Exec("DELETE FROM auctions")
		db.Exec("DELETE FROM retained_players")
		db.Exec("DELETE FROM player_categories")
		db.Exec("UPDATE players SET current_team_id = NULL, is_retained = false, retained_by = NULL")
		db.Exec("DELETE FROM users WHERE role = 'team'") // Clear team users
		db.Exec("DELETE FROM teams")
		log.Println("Existing team data and team users cleared.")
	}

	// Read CSV file
	retainedPlayers, err := readRetainCSVFile(csvFilePath)
	if err != nil {
		log.Fatal("Failed to read CSV file:", err)
	}

	log.Printf("Found %d retained players in CSV file", len(retainedPlayers))

	// Group players by team
	teamsData := groupPlayersByTeam(retainedPlayers)
	log.Printf("Found %d teams to create", len(teamsData))

	// Create teams and their retained players
	successCount := 0
	errorCount := 0

	for teamName, players := range teamsData {
		log.Printf("Creating team: %s with %d retained players", teamName, len(players))

		// Create team
		team := models.Team{
			ID:          uuid.New(),
			Name:        teamName,
			TotalPoints: 20000, // 20,000 points as requested
			UsedPoints:  0,     // Will be updated after adding retained players
			PlayerCount: 0,     // Will be updated after adding retained players
			MinPlayers:  14,    // 14 minimum players as requested
			MaxPlayers:  20,    // Keep max players as 20
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		if err := db.Create(&team).Error; err != nil {
			log.Printf("Failed to create team %s: %v", teamName, err)
			errorCount++
			continue
		}

		log.Printf("✓ Created team: %s", teamName)

		// Create team user for login
		teamUsername := generateTeamUsername(teamName)
		teamEmail := generateTeamEmail(teamName)

		// Check if team user already exists
		var existingTeamUser models.User
		if err := db.Where("username = ? OR email = ?", teamUsername, teamEmail).First(&existingTeamUser).Error; err == nil {
			log.Printf("Team user %s already exists for team %s, updating team ID...", teamUsername, teamName)
			existingTeamUser.TeamID = &team.ID
			existingTeamUser.UpdatedAt = time.Now()
			if err := db.Save(&existingTeamUser).Error; err != nil {
				log.Printf("Failed to update existing team user for %s: %v", teamName, err)
			} else {
				log.Printf("✓ Updated existing team user: %s for team %s", existingTeamUser.Email, teamName)
			}
		} else {
			// Create new team user
			teamUser := models.User{
				ID:        uuid.New(),
				Username:  teamUsername,
				Email:     teamEmail,
				Password:  "team123", // Default password for team users
				Role:      "team",
				TeamID:    &team.ID,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}

			if err := db.Create(&teamUser).Error; err != nil {
				log.Printf("Failed to create team user for %s: %v", teamName, err)
				// Don't increment error count as team was created successfully
			} else {
				log.Printf("✓ Created team user: %s (%s) for team %s", teamUser.Email, teamUser.Role, teamName)
			}
		}

		// Process retained players for this team
		teamUsedPoints := 0
		teamPlayerCount := 0

		for _, playerData := range players {
			log.Printf("Processing retained player: %s", playerData.Name)

			// Parse date of birth
			dob, err := parseDateOfBirth(playerData.DateOfBirth)
			if err != nil {
				log.Printf("Failed to parse date of birth for %s: %v", playerData.Name, err)
				errorCount++
				continue
			}

			// Check if user already exists
			var existingUser models.User
			username := generateUsername(playerData.Name)
			if err := db.Where("username = ?", username).First(&existingUser).Error; err == nil {
				log.Printf("User %s already exists, updating player info...", username)

				// Update existing player to be retained
				var existingPlayer models.Player
				if err := db.Where("user_id = ?", existingUser.ID).First(&existingPlayer).Error; err != nil {
					log.Printf("Failed to find existing player for %s: %v", playerData.Name, err)
					errorCount++
					continue
				}

				// Update player with retention info
				existingPlayer.IsRetained = true
				existingPlayer.RetainedBy = &team.ID
				existingPlayer.CurrentTeamID = &team.ID
				existingPlayer.BasePrice = playerData.BasePoints
				existingPlayer.CurrentPrice = playerData.BasePoints
				existingPlayer.UpdatedAt = time.Now()

				if err := db.Save(&existingPlayer).Error; err != nil {
					log.Printf("Failed to update existing player %s: %v", playerData.Name, err)
					errorCount++
					continue
				}

				log.Printf("✓ Updated existing player: %s (retained by %s)", existingPlayer.Name, teamName)
			} else {
				// Create new user
				user := models.User{
					ID:        uuid.New(),
					Username:  username,
					Email:     generateEmail(playerData.Name),
					Password:  "player123", // Default password for all players
					Role:      "player",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
				}

				if err := db.Create(&user).Error; err != nil {
					log.Printf("Failed to create user for %s: %v", playerData.Name, err)
					errorCount++
					continue
				}

				// Map playing category to appropriate format
				playingCategory := mapPlayingCategory("both", playerData.Gender) // Default to "both" since not specified

				// Create new player
				player := models.Player{
					ID:              uuid.New(),
					UserID:          user.ID,
					Name:            playerData.Name,
					Gender:          strings.ToLower(playerData.Gender),
					DateOfBirth:     dob,
					Mobile:          "", // Not provided in CSV
					PlayingCategory: playingCategory,
					Accomplishments: "Retained player", // Default accomplishment
					IsRetained:      true,
					RetainedBy:      &team.ID,
					CurrentTeamID:   &team.ID,
					BasePrice:       playerData.BasePoints,
					CurrentPrice:    playerData.BasePoints,
					IsSold:          true, // Retained players are considered "sold"
					CreatedAt:       time.Now(),
					UpdatedAt:       time.Now(),
				}

				if err := db.Create(&player).Error; err != nil {
					log.Printf("Failed to create player %s: %v", playerData.Name, err)
					errorCount++
					continue
				}

				log.Printf("✓ Created new retained player: %s (%s, %s)", player.Name, player.Gender, player.GetCategoryDisplayName())
			}

			// Create retained player record
			retainedPlayer := models.RetainedPlayer{
				ID:        uuid.New(),
				PlayerID:  uuid.New(), // We'll need to get the actual player ID
				TeamID:    team.ID,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}

			// Get the player ID (either existing or newly created)
			var player models.Player
			if err := db.Where("name = ? AND current_team_id = ?", playerData.Name, team.ID).First(&player).Error; err != nil {
				log.Printf("Failed to find player %s for retained player record: %v", playerData.Name, err)
				errorCount++
				continue
			}

			retainedPlayer.PlayerID = player.ID

			if err := db.Create(&retainedPlayer).Error; err != nil {
				log.Printf("Failed to create retained player record for %s: %v", playerData.Name, err)
				errorCount++
				continue
			}

			teamUsedPoints += playerData.BasePoints
			teamPlayerCount++
		}

		// Update team with used points and player count
		team.UsedPoints = teamUsedPoints
		team.PlayerCount = teamPlayerCount
		team.UpdatedAt = time.Now()

		if err := db.Save(&team).Error; err != nil {
			log.Printf("Failed to update team %s with points and player count: %v", teamName, err)
			errorCount++
		} else {
			log.Printf("✓ Updated team %s: %d players, %d points used, %d points remaining",
				teamName, teamPlayerCount, teamUsedPoints, team.TotalPoints-teamUsedPoints)
			successCount++
		}
	}

	log.Printf("Team import completed! Teams created: %d, Errors: %d", successCount, errorCount)
	log.Println("\nTeam login credentials created:")
	log.Println("Username format: teamname_user")
	log.Println("Password: team123")
	log.Println("Email format: teamname_user@team.com")
	log.Println("\nExample: For team 'PHOENIX SMASHERS':")
	log.Println("  Username: phoenix_smashers_user")
	log.Println("  Password: team123")
	log.Println("  Email: phoenix_smashers_user@team.com")
}

// RetainedPlayerData represents the structure of retained player data from CSV
type RetainedPlayerData struct {
	Name        string
	Gender      string
	BasePoints  int
	DateOfBirth string
	Age         int
	Team        string
}

// readRetainCSVFile reads retained player data from CSV file
func readRetainCSVFile(filePath string) ([]RetainedPlayerData, error) {
	// Open CSV file
	file, err := os.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open CSV file: %v", err)
	}
	defer file.Close()

	// Create CSV reader
	reader := csv.NewReader(file)
	reader.FieldsPerRecord = -1 // Allow variable number of fields

	// Read all records
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("failed to read CSV records: %v", err)
	}

	if len(records) < 2 {
		return nil, fmt.Errorf("CSV file must have at least a header row and one data row")
	}

	// Find column indices based on headers
	headerRow := records[0]
	columnMap := make(map[string]int)

	for i, header := range headerRow {
		header = strings.TrimSpace(header)
		columnMap[header] = i
	}

	// Validate required columns
	requiredColumns := []string{"Retain players", "Gender", "Base points", "Date of birth", "Age", "Team"}
	for _, col := range requiredColumns {
		if _, exists := columnMap[col]; !exists {
			return nil, fmt.Errorf("required column '%s' not found in CSV file", col)
		}
	}

	var players []RetainedPlayerData

	// Process data rows (skip header row)
	for i, row := range records[1:] {
		// Skip empty rows
		if len(row) == 0 || (len(row) == 1 && strings.TrimSpace(row[0]) == "") {
			continue
		}

		// Ensure row has enough columns
		for len(row) <= len(headerRow) {
			row = append(row, "")
		}

		// Parse base points
		basePoints := 2500 // Default value
		if pointsStr := getColumnValue(row, columnMap["Base points"]); pointsStr != "" {
			if parsedPoints, err := strconv.Atoi(strings.TrimSpace(pointsStr)); err == nil {
				basePoints = parsedPoints
			}
		}

		// Parse age - handle #NUM! error from Excel
		age := 0
		if ageStr := getColumnValue(row, columnMap["Age"]); ageStr != "" && ageStr != "#NUM!" {
			if parsedAge, err := strconv.Atoi(strings.TrimSpace(ageStr)); err == nil {
				age = parsedAge
			}
		}

		player := RetainedPlayerData{
			Name:        strings.TrimSpace(getColumnValue(row, columnMap["Retain players"])),
			Gender:      strings.TrimSpace(getColumnValue(row, columnMap["Gender"])),
			BasePoints:  basePoints,
			DateOfBirth: strings.TrimSpace(getColumnValue(row, columnMap["Date of birth"])),
			Age:         age,
			Team:        strings.TrimSpace(getColumnValue(row, columnMap["Team"])),
		}

		// Skip rows with empty names
		if player.Name == "" {
			log.Printf("Skipping row %d: empty name", i+2)
			continue
		}

		players = append(players, player)
	}

	return players, nil
}

// groupPlayersByTeam groups players by their team name
func groupPlayersByTeam(players []RetainedPlayerData) map[string][]RetainedPlayerData {
	teams := make(map[string][]RetainedPlayerData)

	for _, player := range players {
		teamName := strings.TrimSpace(player.Team)
		if teamName != "" {
			teams[teamName] = append(teams[teamName], player)
		}
	}

	return teams
}

// getColumnValue safely gets a column value from a row
func getColumnValue(row []string, columnIndex int) string {
	if columnIndex < len(row) {
		return row[columnIndex]
	}
	return ""
}

// parseDateOfBirth parses date in various formats
func parseDateOfBirth(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, fmt.Errorf("empty date string")
	}

	// Try different date formats
	formats := []string{
		"1/2/06",     // M/D/YY
		"1/2/2006",   // M/D/YYYY
		"01/02/06",   // MM/DD/YY
		"01/02/2006", // MM/DD/YYYY
		"2/1/06",     // D/M/YY
		"2/1/2006",   // D/M/YYYY
		"02/01/06",   // DD/MM/YY
		"02/01/2006", // DD/MM/YYYY
	}

	for _, format := range formats {
		if t, err := time.Parse(format, dateStr); err == nil {
			// Handle 2-digit years
			if t.Year() < 1950 {
				t = t.AddDate(100, 0, 0) // Add 100 years for 2-digit years
			}
			return t, nil
		}
	}

	// If none of the formats work, try to parse manually
	parts := strings.Split(dateStr, "/")
	if len(parts) == 3 {
		month, err1 := strconv.Atoi(parts[0])
		day, err2 := strconv.Atoi(parts[1])
		year, err3 := strconv.Atoi(parts[2])

		if err1 == nil && err2 == nil && err3 == nil {
			// Handle 2-digit years
			if year < 100 {
				if year > 50 { // Assume years 51-99 are 1951-1999
					year += 1900
				} else { // Assume years 00-50 are 2000-2050
					year += 2000
				}
			}

			// Validate date
			if month >= 1 && month <= 12 && day >= 1 && day <= 31 {
				return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC), nil
			}
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date: %s", dateStr)
}

// generateUsername creates a username from the player's name
func generateUsername(name string) string {
	// Convert to lowercase and replace spaces with dots
	username := strings.ToLower(name)
	username = strings.ReplaceAll(username, " ", ".")
	username = strings.ReplaceAll(username, "h.", "h")
	username = strings.ReplaceAll(username, "k.", "k")
	username = strings.ReplaceAll(username, "s.", "s")
	// Remove any special characters
	username = strings.ReplaceAll(username, "(", "")
	username = strings.ReplaceAll(username, ")", "")
	username = strings.ReplaceAll(username, "-", "")
	username = strings.ReplaceAll(username, "'", "")
	username = strings.ReplaceAll(username, "dr ", "")
	username = strings.ReplaceAll(username, "dr.", "")
	return username
}

// generateEmail creates an email from the player's name
func generateEmail(name string) string {
	username := generateUsername(name)
	return username + "@player.com"
}

// mapPlayingCategory maps the playing category to appropriate format
func mapPlayingCategory(category, gender string) string {
	category = strings.ToLower(strings.TrimSpace(category))
	gender = strings.ToLower(strings.TrimSpace(gender))

	switch category {
	case "singles":
		if gender == "female" {
			return "Women's Open Singles"
		}
		return "Men's Open Singles"
	case "doubles":
		if gender == "female" {
			return "Women's Open Doubles"
		}
		return "Men's Open Doubles"
	case "both":
		return "Open Singles & Doubles"
	case "mixed":
		return "Mixed Doubles"
	case "na", "n/a", "not applicable":
		return "Open Singles"
	default:
		return "Open Singles & Doubles" // Default to both for retained players
	}
}

// generateTeamUsername creates a username from the team name
func generateTeamUsername(teamName string) string {
	// Convert to lowercase and replace spaces with underscores
	username := strings.ToLower(teamName)
	username = strings.ReplaceAll(username, " ", "_")
	username = strings.ReplaceAll(username, "-", "_")
	// Remove any special characters
	username = strings.ReplaceAll(username, "(", "")
	username = strings.ReplaceAll(username, ")", "")
	username = strings.ReplaceAll(username, "'", "")
	username = strings.ReplaceAll(username, ".", "")
	username = strings.ReplaceAll(username, ",", "")
	return username + "_user"
}

// generateTeamEmail creates an email from the team name
func generateTeamEmail(teamName string) string {
	username := generateTeamUsername(teamName)
	return username + "@team.com"
}
