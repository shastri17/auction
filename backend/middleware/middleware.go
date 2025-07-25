package middleware

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger middleware for request logging
func Logger() gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("%s - [%s] \"%s %s %s %d %s \"%s\" %s\"\n",
			param.ClientIP,
			param.TimeStamp.Format(time.RFC1123),
			param.Method,
			param.Path,
			param.Request.Proto,
			param.StatusCode,
			param.Latency,
			param.Request.UserAgent(),
			param.ErrorMessage,
		)
	})
}

// Recovery middleware for panic recovery
func Recovery() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			log.Printf("Panic recovered: %s", err)
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Internal server error",
		})
	})
}

// Auth middleware for JWT authentication
func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Remove "Bearer " prefix if present
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}

		// TODO: Implement JWT validation
		// For now, just check if token exists and extract user info from token
		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Extract user info from mock token (format: mock-jwt-token-{user_id})
		if len(token) > 15 && token[:15] == "mock-jwt-token-" {
			userID := token[15:] // Extract user ID from token

			// Set user info in context
			c.Set("user_id", userID)

			// Determine role based on user ID or token pattern
			// For team users, the token format is mock-jwt-token-team{team_id}
			if len(userID) > 4 && userID[:4] == "team" {
				teamID := userID[4:] // Extract team ID
				c.Set("user_role", "team")
				c.Set("team_id", teamID)
				log.Printf("Team user authenticated: userID=%s, teamID=%s", userID, teamID)
			} else {
				// For admin users
				c.Set("user_role", "admin")
				c.Set("team_id", userID)
				log.Printf("Admin user authenticated: userID=%s", userID)
			}
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RoleAuth middleware for role-based access control
func RoleAuth(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole := c.GetString("user_role")
		log.Printf("RoleAuth check: userRole=%s, requiredRoles=%v", userRole, roles)

		if userRole == "" {
			log.Printf("RoleAuth failed: no user role found")
			c.JSON(http.StatusForbidden, gin.H{"error": "Role not found"})
			c.Abort()
			return
		}

		allowed := false
		for _, role := range roles {
			if userRole == role {
				allowed = true
				break
			}
		}

		if !allowed {
			log.Printf("RoleAuth failed: userRole=%s not in allowed roles=%v", userRole, roles)
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		log.Printf("RoleAuth passed: userRole=%s", userRole)
		c.Next()
	}
}
