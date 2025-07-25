'use client'

import { useState, useEffect } from 'react'
import { Gavel, Play, Pause, Square, Users, DollarSign, Clock, Trophy } from 'lucide-react'
import { adminAPI } from '@/lib/api'
import { useWebSocket } from '@/lib/websocket'
import PlayerProfile from './PlayerProfile'

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
  const [bids, setBids] = useState<Bid[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [showAvailablePlayersModal, setShowAvailablePlayersModal] = useState(false)

  // WebSocket connection for real-time updates
  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (message) => {
      console.log('WebSocket message received:', message)
      
      switch (message.type) {
        case 'auction_started':
        case 'auction_updated':
        case 'next_player':
        case 'auction_completed':
          fetchAuctions()
          break
        case 'new_bid':
        case 'bid_placed':
          if (currentAuction) {
            fetchBids(currentAuction.id)
          }
          fetchAuctions() // Also refresh auction data to get updated current bid
          break
      }
    },
    onOpen: () => {
      console.log('WebSocket connected for admin dashboard')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
    }
  })

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
      const response = await fetch('/api/v1/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setTeams(data.data)
        } else {
          setTeams([])
        }
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
      if (data && Array.isArray(data)) {
        setAuctions(data)
        
        // Find active auction
        const activeAuction = data.find(a => a.status === 'active')
        if (activeAuction) {
          setCurrentAuction(activeAuction)
          fetchBids(activeAuction.id)
        }
      } else {
        setAuctions([])
      }
    } catch (error) {
      console.error('Failed to fetch auctions:', error)
      setAuctions([])
    }
  }

  const fetchBids = async (auctionId: string) => {
    try {
      const response = await fetch(`/api/v1/auctions/${auctionId}/bids`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data && Array.isArray(data.data)) {
          setBids(data.data)
        } else {
          setBids([])
        }
      } else {
        setBids([])
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error)
      setBids([])
    }
  }

  const startAuction = async (auctionId: string) => {
    setIsLoading(true)
    try {
      await adminAPI.startAuction(auctionId)
      await fetchAuctions()
      // Show success message
      alert('Auction started successfully!')
    } catch (error) {
      console.error('Failed to start auction:', error)
      alert('Failed to start auction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const endAuction = async (auctionId: string) => {
    setIsLoading(true)
    try {
      await adminAPI.endAuction(auctionId)
      await fetchAuctions()
      // Show success message
      alert('Auction ended successfully!')
    } catch (error) {
      console.error('Failed to end auction:', error)
      alert('Failed to end auction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const endCurrentPlayerAuction = async (auctionId: string) => {
    console.log('endCurrentPlayerAuction called with auctionId:', auctionId)
    setIsLoading(true)
    try {
      // Check if there are any bids for the current player
      const hasBids = currentAuction && currentAuction.current_bid > 0
      console.log('Current auction:', currentAuction)
      console.log('Has bids:', hasBids)
      
      // End current player auction and move to next player
      console.log('Calling adminAPI.nextPlayer...')
      const result = await adminAPI.nextPlayer(auctionId)
      console.log('adminAPI.nextPlayer result:', result)
      
      await fetchAuctions()
      
      if (hasBids) {
        alert('Player auction ended and assigned to winning team!')
      } else {
        alert('Player skipped - no bids received. Moving to next player.')
      }
    } catch (error) {
      console.error('Failed to end current player auction:', error)
      alert('Failed to end current player auction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextPlayer = async (auctionId: string) => {
    setIsLoading(true)
    try {
      await adminAPI.nextPlayer(auctionId)
      await fetchAuctions()
      // Refresh bids for the current auction
      if (currentAuction) {
        await fetchBids(currentAuction.id)
      }
      // Show success message
      alert('Moved to next player successfully!')
    } catch (error) {
      console.error('Failed to move to next player:', error)
      alert('Failed to move to next player. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-gray-600 bg-gray-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'completed': return <Square className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const createAuction = async () => {
    setIsLoading(true)
    try {
      // Create auction
      const newAuction = await adminAPI.createAuction({ title: 'Player Auction' })
      
      // Immediately start the auction
      await adminAPI.startAuction(newAuction.id)
      
      await fetchAuctions()
      alert('Auction created and started successfully!')
    } catch (error) {
      console.error('Failed to create and start auction:', error)
      alert('Failed to create and start auction. Please try again.')
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



  return (
    <div className="space-y-6">
      {/* Single Auction Management */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Auction Management</h3>
            <p className="text-gray-600">Create and start auctions with automatic player seeding</p>
          </div>
          <div className="flex space-x-3">
            {!currentAuction && (
              <button
                onClick={() => createAuction()}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating & Starting...' : 'Create & Start Auction'}
              </button>
            )}
            {currentAuction && currentAuction.status === 'pending' && (
              <button
                onClick={() => startAuction(currentAuction.id)}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Start Auction'}
              </button>
            )}
            {currentAuction && currentAuction.status === 'active' && (
              <button
                onClick={() => endAuction(currentAuction.id)}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Ending...' : 'End Auction'}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Auction Created</h3>
            <p className="text-gray-600 text-lg">Create an auction to get started</p>
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

            {/* Current Player Profile */}
            {currentAuction.current_player && (
              <PlayerProfile 
                player={currentAuction.current_player}
                currentBid={currentAuction.current_bid}
                winningTeam={currentAuction.winning_team}
                showBidInfo={true}
              />
            )}

            {/* Action Buttons */}
            {currentAuction.status === 'active' && (
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    console.log('Skip Player button clicked!')
                    console.log('Current auction ID:', currentAuction.id)
                    console.log('Is loading:', isLoading)
                    endCurrentPlayerAuction(currentAuction.id)
                  }}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {currentAuction.current_bid > 0 ? 'End Player Auction' : 'Skip Player'}
                </button>
                <button
                  onClick={() => endAuction(currentAuction.id)}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End All Auction
                </button>
              </div>
            )}

            {/* No Current Player - Manual Player Assignment */}
            {currentAuction.status === 'active' && !currentAuction.current_player && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">No Player Currently Up for Auction</h3>
                      <p className="text-blue-100 text-lg">All players have been processed. You can manually assign available players to continue the auction.</p>
                    </div>
                    <button
                      onClick={() => {
                        fetchAvailablePlayers()
                        setShowAvailablePlayersModal(true)
                      }}
                      disabled={isLoading}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white border-opacity-30"
                    >
                      {isLoading ? 'Loading...' : 'Assign Available Player'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Completed Auction - Manual Player Assignment */}
            {currentAuction.status === 'completed' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">Auction Completed</h3>
                      <p className="text-yellow-100 text-lg">All players have been auctioned. You can manually assign available players to continue the auction.</p>
                    </div>
                    <button
                      onClick={() => {
                        fetchAvailablePlayers()
                        setShowAvailablePlayersModal(true)
                      }}
                      disabled={isLoading}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white border-opacity-30"
                    >
                      {isLoading ? 'Loading...' : 'Assign Available Player'}
                    </button>
                  </div>
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
              <h2 className="text-2xl font-bold text-gray-900">Available Players</h2>
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
                      {isLoading ? 'Assigning...' : 'Assign to Auction'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
} 