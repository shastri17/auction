'use client'

import { useState, useEffect } from 'react'
import { Gavel, DollarSign, Users, Clock, TrendingUp, AlertCircle, Trophy } from 'lucide-react'
import { teamAPI } from '@/lib/api'
import { useWebSocket } from '@/lib/websocket'
import PlayerProfile from '../../admin/components/PlayerProfile'

interface LiveAuctionProps {
  teamId: string
  dashboard?: any
  remainingPoints?: number
}

interface Player {
  id: string
  name: string
  gender: string
  age: number
  playing_category: string
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

interface CurrentAuction {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed'
  current_player: Player
  current_bid: number
  winning_team?: {
    id: string
    name: string
  }
  start_time: string
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

export default function LiveAuction({ teamId, dashboard, remainingPoints: propRemainingPoints }: LiveAuctionProps) {
  const [currentAuction, setCurrentAuction] = useState<CurrentAuction | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState(0)
  const [isBidding, setIsBidding] = useState(false)
  const [remainingPoints, setRemainingPoints] = useState(propRemainingPoints || 0)

  // WebSocket connection for real-time updates
  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (message) => {
      console.log('WebSocket message received:', message)
      
      switch (message.type) {
        case 'auction_started':
        case 'auction_updated':
        case 'next_player':
        case 'auction_completed':
          fetchCurrentAuction()
          break
        case 'new_bid':
        case 'bid_placed':
          if (currentAuction) {
            fetchBids(currentAuction.id)
          }
          fetchCurrentAuction() // Also refresh auction data to get updated current bid
          break
      }
    },
    onOpen: () => {
      console.log('WebSocket connected for team dashboard')
    },
    onError: (error) => {
      console.error('WebSocket error:', error)
    }
  })

  useEffect(() => {
    fetchCurrentAuction()
  }, [])

  // Update remainingPoints when prop changes
  useEffect(() => {
    if (propRemainingPoints !== undefined) {
      setRemainingPoints(propRemainingPoints)
    }
  }, [propRemainingPoints])

  const fetchCurrentAuction = async () => {
    try {
      const response = await fetch('/api/v1/auctions?status=active', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.data && data.data.length > 0) {
          setCurrentAuction(data.data[0])
          fetchBids(data.data[0].id)
        }
      } else if (response.status === 401) {
        // Handle 401 error properly
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_id')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Failed to fetch current auction:', error)
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
        setBids(data.data || [])
      } else if (response.status === 401) {
        // Handle 401 error properly
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_id')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error)
    }
  }



  const handleBid = async () => {
    if (!currentAuction || bidAmount <= currentAuction.current_bid) {
      alert('Bid must be higher than current bid')
      return
    }

    if (bidAmount > remainingPoints) {
      alert('Insufficient points for this bid')
      return
    }

    setIsBidding(true)
    try {
      const response = await teamAPI.createBid(currentAuction.id, bidAmount)
      if (response) {
        setBidAmount(0)
        await fetchCurrentAuction()
      }
    } catch (error) {
      console.error('Failed to place bid:', error)
      alert('Failed to place bid. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  const handleQuickBid = async (amount: number) => {
    if (!currentAuction || amount <= currentAuction.current_bid) {
      alert('Bid must be higher than current bid')
      return
    }

    if (amount > remainingPoints) {
      alert('Insufficient points for this bid')
      return
    }

    setIsBidding(true)
    try {
      const response = await teamAPI.createBid(currentAuction.id, amount)
      if (response) {
        setBidAmount(0)
        await fetchCurrentAuction()
      }
    } catch (error) {
      console.error('Failed to place bid:', error)
      alert('Failed to place bid. Please try again.')
    } finally {
      setIsBidding(false)
    }
  }

  const getBidIncrement = (currentBid: number) => {
    if (currentBid < 2000) {
      return 200
    } else {
      return 400
    }
  }

  const getNextBidAmount = (currentBid: number) => {
    return currentBid + getBidIncrement(currentBid)
  }

  const getCurrentBidAmount = () => {
    if (!currentAuction) return 0
    
    // If no bids yet (current_bid is 0 or base price), allow first bid at base price
    if (currentAuction.current_bid <= 200) {
      return 200
    }
    
    // Otherwise, calculate next bid amount
    return getNextBidAmount(currentAuction.current_bid)
  }

  // Calculate maximum safe bid based on remaining players needed
  const minPlayersRequired = 12
  const getMaxSafeBid = () => {
    const playersAcquired = dashboard?.player_count || 0
    const remainingPlayersNeeded = minPlayersRequired - playersAcquired - 1 // -1 for current player being bid on
    
    if (remainingPlayersNeeded <= 0) {
      // Already have minimum players, can bid up to remaining points
      return remainingPoints
    }
    
    // Calculate minimum points needed for remaining players (200 base price each)
    const minPointsForRemainingPlayers = remainingPlayersNeeded * 200
    const safePointsToBid = remainingPoints - minPointsForRemainingPlayers
    
    return Math.max(0, safePointsToBid)
  }

  const maxSafeBid = getMaxSafeBid()
  const nextBidAmount = getCurrentBidAmount()
  const canAffordNextBid = nextBidAmount <= maxSafeBid

  // Debug logging
  console.log('Dashboard data:', dashboard)
  console.log('Remaining points:', remainingPoints)
  console.log('Players acquired:', dashboard?.player_count || 0)
  console.log('Max safe bid:', maxSafeBid)

  if (!currentAuction) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Gavel className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Auction</h3>
          <p className="text-gray-500">Wait for the admin to start an auction</p>
        </div>
      </div>
    )
  }

  const isWinningBid = currentAuction.winning_team?.id === teamId
  const canBid = remainingPoints >= getCurrentBidAmount() && !isWinningBid && canAffordNextBid

    return (
    <div className="h-full flex flex-col bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Live Auction</h3>
          <p className="text-sm text-gray-600 mt-1">Bid on the current player</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Player Info */}
        <div className="lg:col-span-2 space-y-6">
                                {/* Player Card */}
                      <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300">
                                                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
                          <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {currentAuction.current_player.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentAuction.current_player.name}</h2>
                    <div className="flex items-center space-x-4 text-sm opacity-90 mt-1">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {currentAuction.current_player.age} years
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {currentAuction.current_player.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3">
                    <div className="text-sm opacity-90">Base Price</div>
                    <div className="text-3xl font-bold">{currentAuction.current_player.base_price}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Player Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-gray-700">Playing Strength</span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {currentAuction.current_player.playing_category}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">Current Price</span>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {currentAuction.current_player.current_price || currentAuction.current_player.base_price}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700">Achievements</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {currentAuction.current_player.accomplishments || 'No accomplishments listed'}
                  </p>
                </div>
              </div>
            </div>
          </div>

                                {/* Maximum Safe Bid */}
                      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl p-6 text-white shadow-lg relative overflow-hidden transform hover:scale-105 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 animate-pulse opacity-30"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-bold mb-2 flex items-center">
                                <span className="mr-2">💰</span>
                                Maximum Safe Bid
                              </h4>
                              <p className="text-sm opacity-90">Based on your remaining points and minimum players required</p>
                            </div>
                            <div className="text-right">
                              <div className="text-4xl font-bold animate-bounce bg-white bg-opacity-30 rounded-lg px-4 py-2 backdrop-blur-sm shadow-lg border border-white border-opacity-30">
                                <span className="text-black font-extrabold drop-shadow-lg">{maxSafeBid.toLocaleString()}</span>
                              </div>
                              <div className="text-sm opacity-90 mt-1 font-semibold">points</div>
                            </div>
                          </div>
                        </div>
                        {/* Enhanced animated particles */}
                        <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-300 rounded-full animate-ping shadow-lg"></div>
                        <div className="absolute bottom-4 left-6 w-3 h-3 bg-yellow-300 rounded-full animate-ping shadow-lg" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-6 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-ping shadow-lg" style={{ animationDelay: '1s' }}></div>
                        <div className="absolute top-8 right-8 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute bottom-8 right-2 w-3 h-3 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
                        {/* Floating sparkles */}
                        <div className="absolute top-2 right-2 text-yellow-300 animate-ping" style={{ animationDelay: '0.3s' }}>✨</div>
                        <div className="absolute bottom-2 left-2 text-yellow-300 animate-ping" style={{ animationDelay: '0.8s' }}>✨</div>
                      </div>
        </div>

        {/* Right Column - Bidding */}
        <div className="flex flex-col space-y-4">
          {/* Current Bid Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Current Bid</h4>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {currentAuction.current_bid > 0 ? currentAuction.current_bid.toLocaleString() : '0'}
            </div>
            {currentAuction.current_bid > 0 ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">by</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {isWinningBid ? 'You' : currentAuction.winning_team?.name || 'Unknown'}
                </span>
                {isWinningBid && (
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-medium">
                    Winning!
                  </span>
                )}
              </div>
            ) : (
              <p className="text-blue-700 text-sm">No bids yet - Be the first!</p>
            )}
          </div>

          {/* Next Bid Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Next Bid</h4>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {getCurrentBidAmount().toLocaleString()}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>Increment: {getBidIncrement(currentAuction.current_bid).toLocaleString()}</p>
              <p>Max Safe: {maxSafeBid.toLocaleString()}</p>
            </div>
          </div>

          {/* Bid Button - Moved to bottom */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => handleQuickBid(getCurrentBidAmount())}
              disabled={isBidding || !canBid}
              className={`w-full px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ease-in-out ${
                isBidding || !canBid
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1'
              }`}
            >
              {isBidding 
                ? 'Placing Bid...' 
                : isWinningBid 
                  ? 'You\'re Winning!' 
                  : `Place Bid ${getCurrentBidAmount().toLocaleString()}`
              }
            </button>
            
            {!canBid && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 animate-pulse">
                {isWinningBid 
                  ? "You're winning - wait for others to bid"
                  : !canAffordNextBid
                  ? `Need ${(minPlayersRequired - (dashboard?.player_count || 0)) * 200} for remaining players`
                  : `Need ${getCurrentBidAmount().toLocaleString()} points`
                }
              </div>
            )}
            
            {!isConnected && (
              <p className="mt-4 text-red-600 text-sm text-center animate-pulse">Not connected to auction server</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 