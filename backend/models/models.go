package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents the user authentication model
type User struct {
	ID        uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Username  string     `json:"username" gorm:"unique;not null"`
	Email     string     `json:"email" gorm:"unique;not null"`
	Password  string     `json:"-" gorm:"not null"`
	Role      string     `json:"role" gorm:"not null;default:'player'"` // admin, team, player
	TeamID    *uuid.UUID `json:"team_id" gorm:"type:uuid"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// Player represents a registered player
type Player struct {
	ID              uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID          uuid.UUID  `json:"user_id" gorm:"type:uuid;not null"`
	User            User       `json:"user" gorm:"foreignKey:UserID"`
	Name            string     `json:"name" gorm:"not null"`
	Gender          string     `json:"gender" gorm:"not null"` // male, female
	DateOfBirth     time.Time  `json:"date_of_birth" gorm:"not null"`
	Mobile          string     `json:"mobile" gorm:"not null"`
	PlayingCategory string     `json:"playing_category" gorm:"not null"` // singles, doubles, both
	Accomplishments string     `json:"accomplishments" gorm:"type:text"`
	Age             int        `json:"age" gorm:"-"`
	PlayerCategory  string     `json:"player_category" gorm:"-"` // women, men_under_35, men_35_plus
	IsRetained      bool       `json:"is_retained" gorm:"default:false"`
	RetainedBy      *uuid.UUID `json:"retained_by" gorm:"type:uuid"`
	CurrentTeamID   *uuid.UUID `json:"current_team_id" gorm:"type:uuid"`
	BasePrice       int        `json:"base_price" gorm:"default:200"`
	CurrentPrice    int        `json:"current_price" gorm:"default:200"`
	IsSold          bool       `json:"is_sold" gorm:"default:false"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// Team represents a team in the auction
type Team struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	TotalPoints int       `json:"total_points" gorm:"default:12000"`
	UsedPoints  int       `json:"used_points" gorm:"default:0"`
	PlayerCount int       `json:"player_count" gorm:"default:0"`
	MinPlayers  int       `json:"min_players" gorm:"default:12"`
	MaxPlayers  int       `json:"max_players" gorm:"default:20"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Players     []Player  `json:"players" gorm:"foreignKey:CurrentTeamID"`
}

// Category represents tournament categories
type Category struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null;unique"`
	Description string    `json:"description" gorm:"type:text"`
	MinAge      *int      `json:"min_age"`
	MaxAge      *int      `json:"max_age"`
	Gender      string    `json:"gender"` // male, female, mixed
	Type        string    `json:"type"`   // singles, doubles, triples
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// PlayerCategory represents the relationship between players and categories
type PlayerCategory struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PlayerID   uuid.UUID `json:"player_id" gorm:"type:uuid;not null"`
	CategoryID uuid.UUID `json:"category_id" gorm:"type:uuid;not null"`
	Player     Player    `json:"player" gorm:"foreignKey:PlayerID"`
	Category   Category  `json:"category" gorm:"foreignKey:CategoryID"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// Auction represents an auction session
type Auction struct {
	ID              uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Title           string     `json:"title" gorm:"not null"`
	Status          string     `json:"status" gorm:"default:'pending'"` // pending, active, completed
	StartTime       time.Time  `json:"start_time"`
	EndTime         *time.Time `json:"end_time"`
	CurrentPlayerID *uuid.UUID `json:"current_player_id" gorm:"type:uuid"`
	CurrentBid      int        `json:"current_bid" gorm:"default:0"`
	WinningTeamID   *uuid.UUID `json:"winning_team_id" gorm:"type:uuid"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// Bid represents a bid in an auction
type Bid struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	AuctionID uuid.UUID `json:"auction_id" gorm:"type:uuid;not null"`
	PlayerID  uuid.UUID `json:"player_id" gorm:"type:uuid;not null"`
	TeamID    uuid.UUID `json:"team_id" gorm:"type:uuid;not null"`
	Amount    int       `json:"amount" gorm:"not null"`
	IsWinning bool      `json:"is_winning" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Auction   Auction   `json:"auction" gorm:"foreignKey:AuctionID"`
	Player    Player    `json:"player" gorm:"foreignKey:PlayerID"`
	Team      Team      `json:"team" gorm:"foreignKey:TeamID"`
}

// RetainedPlayer represents players retained by teams
type RetainedPlayer struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	PlayerID  uuid.UUID `json:"player_id" gorm:"type:uuid;not null"`
	TeamID    uuid.UUID `json:"team_id" gorm:"type:uuid;not null"`
	Player    Player    `json:"player" gorm:"foreignKey:PlayerID"`
	Team      Team      `json:"team" gorm:"foreignKey:TeamID"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate hook to set timestamps
func (u *User) BeforeCreate(tx *gorm.DB) error {
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
	return nil
}

func (u *User) BeforeUpdate(tx *gorm.DB) error {
	u.UpdatedAt = time.Now()
	return nil
}

// CalculateAge calculates player age based on date of birth
func (p *Player) CalculateAge() {
	if !p.DateOfBirth.IsZero() {
		now := time.Now()
		p.Age = now.Year() - p.DateOfBirth.Year()
		if now.YearDay() < p.DateOfBirth.YearDay() {
			p.Age--
		}
	}
}

// GetPlayerCategory returns the category based on gender and age
func (p *Player) GetPlayerCategory() string {
	p.CalculateAge()

	if p.Gender == "female" {
		return "women"
	} else if p.Gender == "male" {
		if p.Age < 35 {
			return "men_under_35"
		} else {
			return "men_35_plus"
		}
	}

	return "unknown"
}

// GetCategoryDisplayName returns the display name for the category
func (p *Player) GetCategoryDisplayName() string {
	switch p.GetPlayerCategory() {
	case "women":
		return "Women Players"
	case "men_under_35":
		return "Men Under 35 Years"
	case "men_35_plus":
		return "Men 35 and Above Years"
	default:
		return "Unknown Category"
	}
}

// BeforeSave hook to calculate age
func (p *Player) BeforeSave(tx *gorm.DB) error {
	p.CalculateAge()
	return nil
}

// AfterFind hook to calculate age when player is loaded from database
func (p *Player) AfterFind(tx *gorm.DB) error {
	p.CalculateAge()
	p.PlayerCategory = p.GetPlayerCategory()
	return nil
}
