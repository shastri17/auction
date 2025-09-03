'use client'

import { useState, useEffect } from 'react'
import { Gavel, Users, DollarSign, Trophy, Plus, Check, X } from 'lucide-react'
import { adminAPI } from '@/lib/api'
import { generalAPI } from '@/lib/api' // Added import for generalAPI

interface Player {
  id: string
  name: string
  gender: string
  age: number
  playing_category: string
  player_category?: string
  accomplishments: string
  base_price: number
  current_price?: number
  is_sold: boolean
  current_team_id?: string
  current_team?: {
    id: string
    name: string
  }
}

interface Team {
  id: string
  name: string
  total_points: number
  used_points: number
  remaining_points: number
  player_count: number
  min_players: number
}

interface Auction {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed'
  current_player?: Player
  current_bid: number
  winning_team?: {
    id: string
    name: string
  }
  start_time: string
  end_time?: string
}

interface Bid {
  id: string
  amount: number
  team: {
    id: string
    name: string
  }
  created_at: string
}

export default function AuctionManager() {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [showAvailablePlayersModal, setShowAvailablePlayersModal] = useState(false)
  const [showBiddingModal, setShowBiddingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTeamForBid, setSelectedTeamForBid] = useState<string>('')
  const [showPullPlayerModal, setShowPullPlayerModal] = useState(false)
  const [selectedPlayerForPull, setSelectedPlayerForPull] = useState<Player | null>(null)
  const [playerSearchTerm, setPlayerSearchTerm] = useState('')

  useEffect(() => {
    fetchAuctions()
    fetchPlayers()
    fetchTeams()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/v1/players', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setPlayers(data.data)
        } else {
          setPlayers([])
        }
      } else {
        setPlayers([])
      }
    } catch (error) {
      console.error('Failed to fetch players:', error)
      setPlayers([])
    }
  }

  const fetchTeams = async () => {
    try {
      // Use the same approach as the admin page
      const teamsData = await generalAPI.getTeams()
      
      if (teamsData && Array.isArray(teamsData)) {
        console.log('Raw teams data from general API:', teamsData)
        // Map teams to match the structure used in the admin page
        const teamsWithPoints = teamsData.map((team: any) => {
          const totalPoints = team.total_points || 12000
          const usedPoints = team.used_points || 0
          const remainingPoints = totalPoints - usedPoints
          
          // Calculate actual player count from the players array
          const actualPlayerCount = team.players ? team.players.length : 0
          
          console.log(`Team ${team.name}: total=${totalPoints}, used=${usedPoints}, remaining=${remainingPoints}, players=${actualPlayerCount}`)
          return {
            id: team.id,
            name: team.name,
            total_points: totalPoints,
            used_points: usedPoints,
            remaining_points: remainingPoints,
            player_count: actualPlayerCount, // Use actual count from players array
            min_players: team.min_players || 12
          }
        })
        console.log('Teams with calculated points:', teamsWithPoints)
        setTeams(teamsWithPoints)
      } else {
        setTeams([])
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      setTeams([])
    }
  }

  const fetchAuctions = async () => {
    try {
      const data = await adminAPI.getAuctions()
      console.log('Fetched auctions data:', data)
      
      if (data && Array.isArray(data)) {
        setAuctions(data)
        
        // Find active auction
        const activeAuction = data.find(a => a.status === 'active')
        console.log('Found active auction:', activeAuction)
        
        if (activeAuction) {
          console.log('Setting current auction with player:', activeAuction.current_player)
          setCurrentAuction(activeAuction)
        } else {
          console.log('No active auction found')
          setCurrentAuction(null)
        }
      } else {
        setAuctions([])
        setCurrentAuction(null)
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error)
      setAuctions([])
      setCurrentAuction(null)
    }
  }

  const createAuction = async () => {
    setIsLoading(true)
    try {
      const newAuction = await adminAPI.createAuction({ title: 'Manual Player Auction Session' })
      await fetchAuctions()
      alert('Auction session started successfully! You can now pull players to begin assigning them to teams.')
    } catch (error) {
      console.error('Failed to create auction session:', error)
      alert('Failed to create auction session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }





  const endAuction = async (auctionId: string) => {
    setIsLoading(true)
    try {
      await adminAPI.endAuction(auctionId)
      await fetchAuctions()
      alert('Auction session ended successfully!')
    } catch (error) {
      console.error('Failed to end auction session:', error)
      alert('Failed to end auction session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailablePlayers = async () => {
    try {
      const players = await adminAPI.getAvailablePlayers()
      setAvailablePlayers(players)
    } catch (error) {
      console.error('Failed to fetch available players:', error)
    }
  }

  const assignPlayerToAuction = async (playerId: string) => {
    if (!currentAuction) return
    
    setIsLoading(true)
    try {
      await adminAPI.assignPlayerToAuction(currentAuction.id, playerId)
      await fetchAuctions()
      setShowAvailablePlayersModal(false)
      alert('Player assigned to auction successfully!')
    } catch (error) {
      console.error('Failed to assign player to auction:', error)
      alert('Failed to assign player to auction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const openBiddingModal = async (player: Player) => {
    // Set initial bid amount to player's base price
    // setManualBidAmount(player.base_price) // Removed
    // setSelectedTeamForBid('') // Removed
    setShowBiddingModal(true)
  }

  const assignPlayerToTeam = async (playerId: string, teamId: string, points: number) => {
    setIsLoading(true)
    try {
      console.log('Attempting to assign player:', { playerId, teamId, points })
      
      const result = await adminAPI.assignPlayerToTeam(teamId, playerId, points)
      console.log('Assignment successful:', result)
      
      // Refresh the auction data to reflect the changes
      await fetchAuctions()
      await fetchTeams()
      
      // Close the bidding modal and reset state
      setShowBiddingModal(false)
      setSelectedTeamForBid('')
      
      alert('Player assigned to team successfully! The auction session is now ready for the next player. Use "Pull Player to Auction" to manually select and bring in the next unsold player.')
    } catch (error: any) {
      console.error('Failed to assign player to team:', error)
      
      // Show more detailed error information
      let errorMessage = 'Failed to assign player to team. Please try again.'
      
      if (error.response?.data?.error) {
        errorMessage = `Error: ${error.response.data.error}`
      } else if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }



  // const placeManualBid = async () => { // Removed
  //   if (!currentAuction || !selectedTeamForBid || manualBidAmount < (currentAuction.current_player?.base_price || 0)) {
  //     alert('Please select a team and enter a valid bid amount.');
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     await adminAPI.placeManualBid(currentAuction.id, selectedTeamForBid, currentAuction.current_player!.id, manualBidAmount);
  //     await fetchAuctions();
  //     alert('Manual bid placed successfully!');
  //     setShowBiddingModal(false);
  //     setManualBidAmount(0);
  //     setSelectedTeamForBid('');
  //   } catch (error) {
  //     console.error('Failed to place manual bid:', error);
  //     alert('Failed to place manual bid. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-gray-600 bg-gray-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  // Filter players based on search term
  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(playerSearchTerm.toLowerCase())
  )

  const openPullPlayerModal = async () => {
    try {
      // Fetch available (unsold) players
      const players = await adminAPI.getAvailablePlayers()
      setAvailablePlayers(players)
      setPlayerSearchTerm('') // Clear search term when opening modal
      setShowPullPlayerModal(true)
    } catch (error) {
      console.error('Failed to fetch available players:', error)
      alert('Failed to fetch available players. Please try again.')
    }
  }

  const pullPlayerToAuction = async (player: Player) => {
    if (!currentAuction) {
      alert('No active auction found. Please create and start an auction first.')
      return
    }

    try {
      console.log('Pulling player to auction:', { playerId: player.id, playerName: player.name, auctionId: currentAuction.id })
      
      // Use the assignPlayerToAuction method to bring the player into the auction
      const result = await adminAPI.assignPlayerToAuction(currentAuction.id, player.id)
      console.log('Player pulled to auction successfully:', result)
      
      // Refresh the auction data to get the updated current player
      await fetchAuctions()
      
      // Also refresh players to ensure we have the latest data
      await fetchPlayers()
      
      // Close the modal
      setShowPullPlayerModal(false)
      setSelectedPlayerForPull(null)
      
      // Reset the bidding modal state
      setShowBiddingModal(false)
      setSelectedTeamForBid('')
      
      alert(`Player ${player.name} has been pulled into the auction! You can now assign them to a team.`)
    } catch (error) {
      console.error('Failed to pull player to auction:', error)
      alert('Failed to pull player to auction. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Manual Auction Workflow */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Manual Auction Workflow</h3>
          <p className="text-blue-700 text-sm">
            1. <strong>Start Session:</strong> Click "Start Auction Session" to create an active auction session<br/>
            2. <strong>Pull Player:</strong> Use the button below to select an unsold player and bring them into the auction<br/>
            3. <strong>Assign or Skip:</strong> Either assign the player to a team with points, or skip to the next player<br/>
            4. <strong>Repeat:</strong> Continue pulling players until all teams have completed their rosters
          </p>
        </div>
        
        <button
          onClick={openPullPlayerModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <span className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Pull Player to Auction</span>
          </span>
        </button>
      </div>

      {/* Auction Session Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Auction Session Management</h3>
            <p className="text-gray-600">Manage the auction session and player assignments</p>
          </div>
          <div className="flex space-x-3">
            {!currentAuction && (
              <button
                onClick={() => createAuction()}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Start Auction Session'}
              </button>
            )}



            {currentAuction && currentAuction.status === 'active' && (
              <button
                onClick={() => endAuction(currentAuction.id)}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ending...' : 'End Auction Session'}
              </button>
            )}
          </div>
        </div>

        {/* No Auction */}
        {!currentAuction && (
          <div className="text-center py-12">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Gavel className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Auction Session Started</h3>
            <p className="text-gray-600 text-lg">Start an auction session to begin manually assigning players to teams</p>
          </div>
        )}

        {/* Current Auction Status */}
        {currentAuction && (
          <div className="space-y-6">
            {/* Auction Info */}
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-bold">{currentAuction.title}</h4>
                  <p className="text-blue-100 text-lg">Auction Status</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30`}>
                  {currentAuction.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Current Player in Auction */}
            {currentAuction?.current_player ? (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {currentAuction.current_player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{currentAuction.current_player.name}</h3>
                      <p className="text-gray-600">{currentAuction.current_player.age} years, {currentAuction.current_player.gender}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {currentAuction.current_player.base_price?.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Base Price</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Playing Strength</div>
                    <div className="text-lg font-semibold text-gray-900">{currentAuction.current_player.playing_category}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Category</div>
                    <div className="text-lg font-semibold text-gray-900">{currentAuction.current_player.player_category || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">Accomplishments</div>
                    <div className="text-lg font-semibold text-gray-900">{currentAuction.current_player.accomplishments || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => openBiddingModal(currentAuction.current_player!)}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Trophy className="w-5 h-5" />
                    <span>Assign Player to Team</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Ready for Next Player</h3>
                  <p className="text-blue-700 mb-4">
                    The auction session is ready for the next player. Use the "Pull Player to Auction" button above to bring in an unsold player for team assignment.
                  </p>
                  <button
                    onClick={openPullPlayerModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Pull Next Player
                  </button>
                </div>
              </div>
            )}


          </div>
        )}
      </div>

      {/* Available Players Modal */}
      {showAvailablePlayersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Select Player to Pull</h2>
              <button
                onClick={() => setShowAvailablePlayersModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {availablePlayers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No available players found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlayers.map((player) => (
                  <div key={player.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="font-bold text-white text-lg">
                          {player.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-600">{player.age} years, {player.gender}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Playing Strength:</span> 
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {player.playing_category}
                        </span>
                      </div>
                      {player.player_category && (
                        <div className="text-sm">
                          <span className="font-semibold text-gray-700">Category:</span> 
                          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {player.player_category}
                          </span>
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="font-semibold text-gray-700">Base Price:</span> 
                        <span className="ml-2 text-lg font-bold text-gray-900">{player.base_price.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => assignPlayerToAuction(player.id)}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Pulling...' : 'Pull to Auction'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bidding Management Modal */}
      {showBiddingModal && currentAuction?.current_player && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Team Assignment - {currentAuction.current_player.name}</h2>
              <button
                onClick={() => setShowBiddingModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            


            {/* Direct Team Assignment Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Player to Team</h3>
              {teams.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Loading teams...</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
                    <select
                      value={selectedTeamForBid}
                      onChange={(e) => setSelectedTeamForBid(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Points</label>
                    <input
                      id="assignment-points-input"
                      type="number"
                      min={currentAuction?.current_player?.base_price || 0}
                      max={selectedTeamForBid ? (teams.find(t => t.id === selectedTeamForBid)?.remaining_points || 0) : 0}
                      defaultValue={currentAuction?.current_player?.base_price || 0}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter points"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Base price: {currentAuction?.current_player?.base_price?.toLocaleString()} points
                    </p>
                  </div>

                  {selectedTeamForBid && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {(teams.find(t => t.id === selectedTeamForBid)?.remaining_points || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Total Points Remaining</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {(() => {
                              const team = teams.find(t => t.id === selectedTeamForBid);
                              if (!team) return 0;
                              
                              const remainingPoints = team.remaining_points || 0;
                              const currentPlayers = team.player_count || 0;
                              const minPlayers = team.min_players || 12;
                              const playersNeeded = Math.max(0, minPlayers - currentPlayers);
                              
                              // Calculate maximum safe bid: remaining points minus ((players needed - 1) × base price)
                              // This ensures the team has enough points left to fill all remaining slots at base price
                              // We subtract 1 from players needed because we're bidding on 1 player now
                              const basePrice = 200;
                              const maxSafeBid = remainingPoints - ((playersNeeded - 1) * basePrice);
                              
                              // Return the safe bid amount, but not less than 0
                              return Math.max(maxSafeBid, 0);
                            })()}
                          </div>
                          <div className="text-sm text-gray-600">Maximum Safe Bid</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {teams.find(t => t.id === selectedTeamForBid)?.player_count || 0}
                          </div>
                          <div className="text-sm text-gray-600">Total Players</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (!selectedTeamForBid) {
                        alert('Please select a team first.');
                        return;
                      }
                      
                      if (!currentAuction?.current_player) {
                        alert('No current player in the auction. Please pull a player first.');
                        return;
                      }
                      
                      const pointsInput = document.getElementById('assignment-points-input') as HTMLInputElement;
                      if (!pointsInput) {
                        alert('Points input field not found. Please try again.');
                        return;
                      }
                      const points = Number(pointsInput.value) || currentAuction?.current_player?.base_price || 0;
                      
                      console.log('Assigning player with details:', {
                        playerId: currentAuction!.current_player!.id,
                        teamId: selectedTeamForBid,
                        points: points,
                        playerName: currentAuction!.current_player!.name,
                        teamName: teams.find(t => t.id === selectedTeamForBid)?.name
                      });
                      
                      // Debug current auction state
                      console.log('Current auction state:', currentAuction)
                      console.log('Current player:', currentAuction?.current_player)
                      
                      // Frontend validation
                      const selectedTeam = teams.find(t => t.id === selectedTeamForBid);
                      if (!selectedTeam) {
                        alert('Selected team not found. Please try again.');
                        return;
                      }
                      
                      if (points > selectedTeam.remaining_points) {
                        alert(`Team ${selectedTeam.name} only has ${selectedTeam.remaining_points.toLocaleString()} points remaining, but you're trying to assign ${points.toLocaleString()} points.`);
                        return;
                      }
                      
                      if (currentAuction.current_player?.is_sold) {
                        alert('This player is already sold to another team.');
                        return;
                      }
                      
                      assignPlayerToTeam(
                        currentAuction!.current_player!.id, 
                        selectedTeamForBid, 
                        points
                      );
                    }}
                    disabled={isLoading || !selectedTeamForBid}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Assigning Player...' : 'Assign Player to Team'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBiddingModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Next Step:</strong> After assigning or skipping this player, use the "Pull Player to Auction" button to bring the next unsold player into the auction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pull Player Modal */}
      {showPullPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Pull Player to Auction</h3>
              <button
                onClick={() => {
                  setShowPullPlayerModal(false)
                  setPlayerSearchTerm('') // Clear search term when closing modal
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Select an unsold player to bring into the current auction. Only players who haven't been sold to any team are shown.
              </p>
              
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search players by name..."
                  value={playerSearchTerm}
                  onChange={(e) => setPlayerSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Search Results Count */}
              {playerSearchTerm && (
                <div className="mt-2 text-sm text-gray-600">
                  Found {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} matching "{playerSearchTerm}"
                </div>
              )}
            </div>

            {filteredPlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>{playerSearchTerm ? `No players found matching "${playerSearchTerm}"` : 'No unsold players available.'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">
                          {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{player.name}</h4>
                        <p className="text-sm text-gray-600">{player.age} years, {player.gender}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Category:</span> {player.player_category}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Base Price:</span> {player.base_price?.toLocaleString()} points
                      </div>
                    </div>

                    <button
                      onClick={() => pullPlayerToAuction(player)}
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Pulling Player...' : 'Pull to Auction'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowPullPlayerModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 