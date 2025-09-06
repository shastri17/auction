/**
 * Utility functions for auction calculations
 */

export interface TeamDashboard {
  team_id: string
  team_name: string
  total_points: number
  used_points: number
  remaining_points: number
  player_count: number
  min_players: number
  max_players: number
}

/**
 * Calculate the maximum safe bid amount for a team
 * This ensures the team can still acquire the minimum required players
 * 
 * @param dashboard - Team dashboard data
 * @param basePricePerPlayer - Base price per player (default: 200)
 * @param excludeCurrentPlayer - Whether to exclude the current player being bid on (default: true)
 * @returns Maximum safe bid amount
 */
export function calculateMaxSafeBid(
  dashboard: TeamDashboard,
  basePricePerPlayer: number = 200,
  excludeCurrentPlayer: boolean = true
): number {
  const { remaining_points, player_count, min_players } = dashboard
  
  // Calculate remaining players needed
  const remainingPlayersNeeded = Math.max(0, min_players - player_count - (excludeCurrentPlayer ? 1 : 0))
  
  if (remainingPlayersNeeded <= 0) {
    // Team already has enough players, can bid all remaining points
    return remaining_points
  }
  
  // Calculate minimum points needed for remaining players
  const minPointsForRemainingPlayers = remainingPlayersNeeded * basePricePerPlayer
  const safePointsToBid = remaining_points - minPointsForRemainingPlayers
  
  return Math.max(0, safePointsToBid)
}

/**
 * Calculate points per remaining player needed
 * 
 * @param dashboard - Team dashboard data
 * @param excludeCurrentPlayer - Whether to exclude the current player being bid on (default: true)
 * @returns Points per remaining player
 */
export function calculatePointsPerRemainingPlayer(
  dashboard: TeamDashboard,
  excludeCurrentPlayer: boolean = true
): number {
  const { remaining_points, player_count, min_players } = dashboard
  
  const remainingPlayersNeeded = Math.max(0, min_players - player_count - (excludeCurrentPlayer ? 1 : 0))
  
  if (remainingPlayersNeeded <= 0) {
    return 0
  }
  
  return remaining_points / remainingPlayersNeeded
}
