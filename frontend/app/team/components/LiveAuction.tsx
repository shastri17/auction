'use client'

import { useState, useEffect } from 'react'
import { Gavel, DollarSign, Users, Clock, TrendingUp, AlertCircle, Trophy } from 'lucide-react'
import { teamAPI } from '@/lib/api'
import { useWebSocket } from '@/lib/websocket'
import PlayerProfile from '../../admin/components/PlayerProfile'
import { calculateMaxSafeBid } from '@/lib/calculations'

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
  const [auctionExists, setAuctionExists] = useState(false)

  // WebSocket connection for real-time updates
  const { sendMessage, isConnected } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'auction_created':
        case 'auction_started':
          setAuctionExists(true)
          fetchCurrentAuction()
          break
        case 'auction_updated':
        case 'next_player':
        case 'player_assigned':
          fetchCurrentAuction()
          break
        case 'auction_completed':
        case 'auction_ended':
          setAuctionExists(false)
          setCurrentAuction(null)
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
          const auction = data.data[0]
          // Check if auction exists
          setAuctionExists(true)
          
          // Validate that the auction has a current_player before setting it
          if (auction.current_player) {
            setCurrentAuction(auction)
            fetchBids(auction.id)
          } else {
            console.log('Auction found but no current player assigned')
            setCurrentAuction(null)
          }
        } else {
          console.log('No active auctions found')
          setAuctionExists(false)
          setCurrentAuction(null)
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
      setCurrentAuction(null)
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
    if (!currentAuction || !currentAuction.current_player || bidAmount <= (currentAuction.current_bid || 0)) {
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
    if (!currentAuction || !currentAuction.current_player || amount <= (currentAuction.current_bid || 0)) {
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
    if ((currentAuction.current_bid || 0) <= 200) {
      return 200
    }
    
    // Otherwise, calculate next bid amount
    return getNextBidAmount(currentAuction.current_bid || 0)
  }

  // Calculate maximum safe bid using centralized function
  const maxSafeBid = dashboard ? calculateMaxSafeBid(dashboard) : remainingPoints
  const nextBidAmount = getCurrentBidAmount()
  const canAffordNextBid = nextBidAmount <= maxSafeBid



  if (!auctionExists) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50">
        <div className="text-center max-w-2xl mx-auto p-8">
          {/* Animated Gavel Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-gray-500 via-slate-600 to-zinc-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500">
              <Gavel className="h-12 w-12 text-white drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          {/* Main Heading */}
          <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-slate-700 to-zinc-700 bg-clip-text text-transparent mb-8">
            No Active Auction
          </h3>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">Waiting for Auction to Start</span>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-gray-300 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-32 right-32 w-1.5 h-1.5 bg-slate-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-32 w-1 h-1 bg-zinc-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
    )
  }

  // Add null check for current_player
  if (!currentAuction) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="text-center max-w-2xl mx-auto p-8">
          {/* Animated Gavel Icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-500">
              <Gavel className="h-12 w-12 text-white drop-shadow-lg animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          {/* Main Heading */}
          <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
            Waiting for Next Player
          </h3>
          
          {/* Status indicator */}
          <div className="mt-8 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 font-medium">Auction Session Active</span>
          </div>
          
          {/* Floating particles */}
          <div className="absolute top-20 left-20 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-60"></div>
          <div className="absolute top-32 right-32 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-32 w-1 h-1 bg-indigo-300 rounded-full animate-ping opacity-60" style={{ animationDelay: '2s' }}></div>
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
      <div className="flex-1">
        {/* Player Info */}
        <div className="space-y-6">
          {/* Player Card */}
                     <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 border border-gray-100">
             {/* Header with gradient background */}
             <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white relative overflow-hidden">
               {/* Animated background elements */}
               <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-10 animate-pulse" style={{ animationDuration: '4s' }}></div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
               
               <div className="relative z-10 flex items-center justify-between">
                 <div className="flex items-center space-x-6">
                   {/* Player Avatar */}
                   <div className="relative">
                     <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 border-white border-opacity-30 backdrop-blur-sm">
                       <span className="text-3xl font-bold text-white drop-shadow-lg">
                         {currentAuction.current_player.name.split(' ').map(n => n[0]).join('')}
                       </span>
                     </div>
                     {/* Glow effect */}
                     <div className="absolute inset-0 w-20 h-20 bg-white rounded-full opacity-20 blur-xl animate-pulse"></div>
                   </div>
                   
                   {/* Player Info */}
                   <div>
                     <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-2">{currentAuction.current_player.name}</h2>
                     <div className="flex items-center space-x-6 text-lg opacity-90">
                       <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                         <Clock className="h-5 w-5 mr-2" />
                         {currentAuction.current_player.age} years
                       </span>
                       <span className="flex items-center bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                         <Users className="h-5 w-5 mr-2" />
                         {currentAuction.current_player.gender === 'female' ? 'Female' : 'Male'}
                       </span>
                     </div>
                   </div>
                 </div>
                 
                 {/* Base Price Badge */}
                 <div className="text-right">
                   <div className="bg-white bg-opacity-20 rounded-2xl px-6 py-4 backdrop-blur-sm border border-white border-opacity-30">
                     <div className="text-sm opacity-90 mb-1">Base Price</div>
                     <div className="text-4xl font-bold text-white drop-shadow-lg">{currentAuction.current_player.base_price}</div>
                   </div>
                 </div>
               </div>
            </div>
            
                         {/* Player Details */}
             <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-lg">
                   <div className="flex items-center space-x-3 mb-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                       <Trophy className="h-5 w-5 text-white" />
                     </div>
                     <span className="text-lg font-semibold text-gray-800">Playing Strength</span>
                   </div>
                   <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                     {currentAuction.current_player.playing_category}
                   </span>
                 </div>

                 <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100 shadow-lg">
                   <div className="flex items-center space-x-3 mb-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                       <AlertCircle className="h-5 w-5 text-white" />
                     </div>
                     <span className="text-lg font-semibold text-gray-800">Achievements</span>
                   </div>
                   <p className="text-sm text-gray-700 leading-relaxed">
                     {currentAuction.current_player.accomplishments || 'No accomplishments listed'}
                   </p>
                 </div>

                 <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100 shadow-lg">
                   <div className="flex items-center space-x-3 mb-3">
                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                       <Users className="h-5 w-5 text-white" />
                     </div>
                     <span className="text-lg font-semibold text-gray-800">Category</span>
                   </div>
                   <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
                     {currentAuction.current_player.gender === 'female' ? 'Women' : 
                       currentAuction.current_player.age < 35 ? 'Men Under 35' : 'Men 35+'}
                   </span>
                 </div>
               </div>
            </div>
          </div>

          {/* Maximum Safe Bid */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden transform hover:scale-105 transition-all duration-500 border border-orange-200">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 animate-pulse opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent opacity-10 animate-pulse" style={{ animationDuration: '3s' }}></div>
            
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold mb-3 flex items-center">
                    <span className="mr-3 text-3xl">💰</span>
                    Maximum Safe Bid
                  </h4>
                  <p className="text-lg opacity-90 leading-relaxed">Based on your remaining points and minimum players required</p>
                </div>
                <div className="text-right">
                  <div className="bg-white bg-opacity-20 rounded-2xl px-8 py-6 backdrop-blur-sm border border-white border-opacity-30 shadow-xl">
                    <div className="text-5xl font-bold animate-bounce text-white drop-shadow-lg">
                      <span className="text-black font-extrabold">{maxSafeBid.toLocaleString()}</span>
                    </div>
                    <div className="text-lg opacity-90 mt-2 font-semibold">points</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced animated particles */}
            <div className="absolute top-6 right-6 w-4 h-4 bg-yellow-300 rounded-full animate-ping shadow-lg"></div>
            <div className="absolute bottom-6 left-8 w-3 h-3 bg-yellow-300 rounded-full animate-ping shadow-lg" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-8 left-6 w-2 h-2 bg-yellow-300 rounded-full animate-ping shadow-lg" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-10 right-10 w-2 h-2 bg-white rounded-full animate-ping opacity-60" style={{ animationDelay: '1.5s' }}></div>
            <div className="absolute bottom-10 right-4 w-3 h-3 bg-white rounded-full animate-ping opacity-40" style={{ animationDelay: '2s' }}></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-4 right-4 text-yellow-300 animate-ping text-2xl" style={{ animationDelay: '0.3s' }}>✨</div>
            <div className="absolute bottom-4 left-4 text-yellow-300 animate-ping text-2xl" style={{ animationDelay: '0.8s' }}>✨</div>
            <div className="absolute top-12 left-12 text-yellow-300 animate-ping text-xl" style={{ animationDelay: '1.2s' }}>💎</div>
          </div>
        </div>
      </div>
    </div>
  )
} 