rpackage main

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
		log.Fatal("Usage: go run csv_player_importer.go <path_to_csv_file> [--clear-existing]")
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

	// Clear existing player data if requested
	if clearExisting {
		log.Println("Clearing existing player data...")
		db.Exec("DELETE FROM bids")
		db.Exec("DELETE FROM auctions")
		db.Exec("DELETE FROM player_categories")
		db.Exec("DELETE FROM retained_players")
		db.Exec("DELETE FROM players")
		db.Exec("DELETE FROM users WHERE role = 'player'")
		log.Println("Existing player data cleared.")
	}

	// Read CSV file
	players, err := readCSVFile(csvFilePath)
	if err != nil {
		log.Fatal("Failed to read CSV file:", err)
	}

	log.Printf("Found %d players in CSV file", len(players))

	// Create players and their users
	successCount := 0
	errorCount := 0

	for i, data := range players {
		log.Printf("Processing player %d/%d: %s", i+1, len(players), data.Name)

		// Parse date of birth
		dob, err := parseDateOfBirth(data.DateOfBirth)
		if err != nil {
			log.Printf("Failed to parse date of birth for %s: %v", data.Name, err)
			errorCount++
			continue
		}

		// Check if user already exists
		var existingUser models.User
		username := generateUsername(data.Name)
		if err := db.Where("username = ?", username).First(&existingUser).Error; err == nil {
			log.Printf("User %s already exists, skipping...", username)
			errorCount++
			continue
		}

		// Create user first
		user := models.User{
			ID:        uuid.New(),
			Username:  username,
			Email:     generateEmail(data.Name),
			Password:  "player123", // Default password for all players
			Role:      "player",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.Create(&user).Error; err != nil {
			log.Printf("Failed to create user for %s: %v", data.Name, err)
			errorCount++
			continue
		}

		// Map playing category to appropriate format
		playingCategory := mapPlayingCategory(data.PlayingCategory, data.Gender)

		// Create player
		player := models.Player{
			ID:              uuid.New(),
			UserID:          user.ID,
			Name:            data.Name,
			Gender:          strings.ToLower(data.Gender),
			DateOfBirth:     dob,
			Mobile:          data.PhoneNumber,
			PlayingCategory: playingCategory,
			Accomplishments: data.Accomplishments,
			IsRetained:      false,
			BasePrice:       200, // Default base price
			CurrentPrice:    200,
			IsSold:          false,
			CreatedAt:       time.Now(),
			UpdatedAt:       time.Now(),
		}

		if err := db.Create(&player).Error; err != nil {
			log.Printf("Failed to create player %s: %v", data.Name, err)
			errorCount++
		} else {
			log.Printf("✓ Created player: %s (%s, %s)", player.Name, player.Gender, player.GetCategoryDisplayName())
			successCount++
		}
	}

	log.Printf("Import completed! Success: %d, Errors: %d", successCount, errorCount)
}

// PlayerData represents the structure of player data from CSV
type PlayerData struct {
	Name            string
	Gender          string
	PhoneNumber     string
	PlayingCategory string
	Accomplishments string
	DateOfBirth     string
	BaseLocation    string
	Age             int
	AuctionBucket   string
}

// readCSVFile reads player data from CSV file
func readCSVFile(filePath string) ([]PlayerData, error) {
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
	requiredColumns := []string{"Name as per Aadhaar", "Gender", "Phone number", "Playing category", "Badminton accomplishments", "Date of birth", "Your base location", "Age", "Auction Bucket"}
	for _, col := range requiredColumns {
		if _, exists := columnMap[col]; !exists {
			return nil, fmt.Errorf("required column '%s' not found in CSV file", col)
		}
	}

	var players []PlayerData

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

		// Parse age - handle #NUM! error from Excel
		age := 0
		if ageStr := getColumnValue(row, columnMap["Age"]); ageStr != "" && ageStr != "#NUM!" {
			if parsedAge, err := strconv.Atoi(strings.TrimSpace(ageStr)); err == nil {
				age = parsedAge
			}
		}

		player := PlayerData{
			Name:            strings.TrimSpace(getColumnValue(row, columnMap["Name as per Aadhaar"])),
			Gender:          strings.TrimSpace(getColumnValue(row, columnMap["Gender"])),
			PhoneNumber:     strings.TrimSpace(getColumnValue(row, columnMap["Phone number"])),
			PlayingCategory: strings.TrimSpace(getColumnValue(row, columnMap["Playing category"])),
			Accomplishments: strings.TrimSpace(getColumnValue(row, columnMap["Badminton accomplishments"])),
			DateOfBirth:     strings.TrimSpace(getColumnValue(row, columnMap["Date of birth"])),
			BaseLocation:    strings.TrimSpace(getColumnValue(row, columnMap["Your base location"])),
			Age:             age,
			AuctionBucket:   strings.TrimSpace(getColumnValue(row, columnMap["Auction Bucket"])),
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
		return "Open Singles"
	}
}
