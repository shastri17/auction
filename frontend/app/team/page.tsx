'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  Gavel, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Minus,
  Clock,
  Trophy,
  Target,
  BarChart3,
  UserCheck,
  Calendar,
  Zap,
  LogOut
} from 'lucide-react'
import { teamAPI, adminAPI, generalAPI } from '@/lib/api'
import LiveAuction from './components/LiveAuction'
import { useWebSocket } from '@/lib/websocket'
import AuthGuard from '@/components/AuthGuard'

// Team Roster View Component
function TeamRosterView({ players }: { players: Player[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('women')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Categorize players
  const categorizedPlayers = {
    women: players.filter(player => player.gender === 'female'),
    men_under_35: players.filter(player => player.gender === 'male' && player.age < 35),
    men_35_plus: players.filter(player => player.gender === 'male' && player.age >= 35)
  }

  const categories = [
    { id: 'women', name: 'Women Players', color: 'pink', icon: '👩' },
    { id: 'men_under_35', name: 'Men Under 35 Years', color: 'blue', icon: '👨' },
    { id: 'men_35_plus', name: 'Men 35 and Above Years', color: 'green', icon: '👴' }
  ]

  const getCategoryColor = (categoryId: string) => {
    switch (categoryId) {
      case 'women': return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'men_under_35': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'men_35_plus': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIconColor = (categoryId: string) => {
    switch (categoryId) {
      case 'women': return 'text-pink-600'
      case 'men_under_35': return 'text-blue-600'
      case 'men_35_plus': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  // Filter players based on search query
  const getFilteredPlayers = (players: Player[]) => {
    if (!searchQuery.trim()) return players
    return players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
              activeCategory === category.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category.id)}`}>
              {categorizedPlayers[category.id as keyof typeof categorizedPlayers]?.length || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Players Grid */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex justify-end">
          <div className="relative">
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <svg
              className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const currentPlayers = categorizedPlayers[activeCategory as keyof typeof categorizedPlayers] || []
            const filteredPlayers = getFilteredPlayers(currentPlayers)
            
            if (filteredPlayers.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500 col-span-full">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>
                    {searchQuery.trim() 
                      ? `No players found matching "${searchQuery}" in this category`
                      : 'No players found in this category'
                    }
                  </p>
                </div>
              )
            }
            
            return filteredPlayers.map((player) => (
              <div key={player.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getCategoryColor(activeCategory).replace('text-', 'bg-').replace('-800', '-100')} rounded-full flex items-center justify-center`}>
                      <span className={`text-sm font-medium ${getCategoryIconColor(activeCategory)}`}>
                        {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                      <p className="text-sm text-gray-500">{player.playing_category}</p>
                    </div>
                  </div>
                  <span className="badge badge-info">{player.gender}</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Age:</span>
                    <span className="font-medium">{player.age} years</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Base Price:</span>
                    <span className="font-medium">{player.base_price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.is_sold 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.is_sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}

interface TeamDashboard {
  team_id: string
  team_name: string
  total_points: number
  used_points: number
  remaining_points: number
  player_count: number
  min_players: number
  max_players: number
  players: Player[]
  recent_bids: Bid[]
}

interface Player {
  id: string
  name: string
  gender: string
  age: number
  playing_category: string
  accomplishments: string
  base_price: number
  current_price: number
  is_sold: boolean
  current_team_id?: string
}

interface Bid {
  id: string
  auction_id: string
  player_id: string
  team_id: string
  amount: number
  is_winning: boolean
  created_at: string
}

interface Auction {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed'
  current_player: Player
  current_bid: number
  winning_team: any
}

export default function TeamDashboard() {
  return (
    <AuthGuard requiredRole="team">
      <TeamDashboardContent />
    </AuthGuard>
  )
}

function TeamDashboardContent() {
  const [dashboard, setDashboard] = useState<TeamDashboard | null>(null)
  const [currentAuction, setCurrentAuction] = useState<Auction | null>(null)
  const [bidAmount, setBidAmount] = useState(0)
  const [isBidding, setIsBidding] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [playersLoading, setPlayersLoading] = useState(false)
  const [teams, setTeams] = useState<any[]>([])
  
  // WebSocket for real-time updates
  const { isConnected } = useWebSocket()
  const router = useRouter()

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    
    // Redirect to login page
    window.location.href = '/login'
  }

  const fetchTeamData = async () => {
    try {
      // Use the actual logged-in user's token
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No auth token found')
        router.push('/login')
        return
      }
      
      console.log('Fetching team dashboard data...')
      
      // Fetch team dashboard data
      const dashboardData = await teamAPI.getDashboard()
      console.log('Team dashboard data received:', dashboardData)
      setDashboard(dashboardData)

      // Fetch current auction data
      console.log('Fetching auction data...')
      const auctions = await adminAPI.getAuctions('active')
      console.log('Auction data received:', auctions)
      if (auctions.length > 0) {
        const activeAuction = auctions[0]
        setCurrentAuction({
          id: activeAuction.id,
          title: activeAuction.title,
          status: activeAuction.status,
          current_player: activeAuction.current_player,
          current_bid: activeAuction.current_bid,
          winning_team: activeAuction.winning_team
        })
      }
    } catch (error: any) {
      console.error('Failed to fetch team data:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        stack: error.stack
      })
      
      // If it's an authentication error (401), redirect to login
      if (error.response?.status === 401) {
        console.log('Authentication error in team dashboard, logging out')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_role')
        localStorage.removeItem('user_id')
        router.push('/login')
        return
      }
      
      // For network errors or other issues, don't logout immediately
      // Just show error state and let user retry
      console.log('Non-authentication error, not logging out:', error.message)
      setDashboard(null)
    }
  }

  useEffect(() => {
    console.log('Team dashboard useEffect triggered')
    console.log('Current auth token:', localStorage.getItem('auth_token'))
    console.log('Current user role:', localStorage.getItem('user_role'))
    
    fetchTeamData()
  }, []) // Only run once on mount

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    // Refresh data when clicking on roster tab
    if (tabId === 'roster') {
      fetchTeamData()
    }
    if (tabId === 'players') {
      // Fetch all players when tab is clicked
      fetchAllPlayers()
    }
  }

  const fetchAllPlayers = async () => {
    try {
      setPlayersLoading(true)
      const [players, teamsData] = await Promise.all([
        generalAPI.getPlayers(),
        generalAPI.getTeams()
      ])
      setAllPlayers(players)
      setFilteredPlayers(players)
      setTeams(teamsData)
    } catch (error) {
      console.error('Failed to fetch all players:', error)
    } finally {
      setPlayersLoading(false)
    }
  }

  const handleBid = async () => {
    if (bidAmount <= getCurrentBidAmount() || !dashboard) return

    setIsBidding(true)
    try {
      // TODO: Make API call to place bid
      console.log('Placing bid:', bidAmount)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update local state
      if (currentAuction) {
        setCurrentAuction({
          ...currentAuction,
          current_bid: bidAmount,
          winning_team: { id: dashboard.team_id, name: dashboard.team_name }
        })
      }
      
      setBidAmount(0)
    } catch (error) {
      console.error('Bid failed:', error)
    } finally {
      setIsBidding(false)
    }
  }

  const getBidIncrement = (currentBid: number) => {
    return currentBid >= 2000 ? 400 : 200
  }

  const getNextBidAmount = (currentBid: number) => {
    const increment = getBidIncrement(currentBid)
    return currentBid + increment
  }

  const getCurrentBidAmount = () => {
    return currentAuction?.current_bid || 0
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">If this takes too long, please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">{dashboard.team_name}</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Remaining Points</p>
                <p className="text-lg font-semibold text-primary-600">{dashboard.remaining_points.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Players</p>
                <p className="text-lg font-semibold text-gray-900">{dashboard.player_count}/{dashboard.min_players}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="btn-secondary flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
              {/* Connection Status Dot */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center">
            <div className="flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'auction', name: 'Live Auction', icon: Gavel },
                { id: 'roster', name: 'Roster', icon: Users },
                { id: 'budget', name: 'Budget', icon: DollarSign },
                { id: 'players', name: 'All Players', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboard.total_points.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Used Points</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboard.used_points.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Players</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboard.player_count}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Min Required</p>
                    <p className="text-2xl font-semibold text-gray-900">{dashboard.min_players}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Points Used</span>
                    <span>{dashboard.used_points.toLocaleString()} / {dashboard.total_points.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(dashboard.used_points / dashboard.total_points) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Players Acquired</span>
                    <span>{dashboard.player_count} / {dashboard.min_players} (min) / {dashboard.max_players} (max)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 relative">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        dashboard.player_count >= dashboard.min_players ? 'bg-green-600' : 'bg-yellow-600'
                      }`}
                      style={{ 
                        width: `${Math.min((dashboard.player_count / dashboard.min_players) * 100, 100)}%` 
                      }}
                    ></div>
                    {dashboard.player_count >= dashboard.min_players && (
                      <div className="absolute top-0 right-0 w-1 h-3 bg-green-800 rounded-r-full"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bids</h3>
                <div className="space-y-3">
                  {dashboard.recent_bids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{bid.amount} points</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`badge ${bid.is_winning ? 'badge-success' : 'badge-warning'}`}>
                        {bid.is_winning ? 'Winning' : 'Outbid'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Roster</h3>
                <div className="space-y-3">
                  {dashboard.players.slice(0, 5).map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-500">{player.playing_category}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {player.current_price} pts
                      </span>
                    </div>
                  ))}
                  {dashboard.players.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{dashboard.players.length - 5} more players
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auction' && (
          <div className="h-full">
            <LiveAuction 
              teamId={dashboard?.team_id || ''} 
              dashboard={dashboard}
              remainingPoints={dashboard?.remaining_points}
            />
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Team Roster</h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {dashboard.player_count} players • {dashboard.remaining_points.toLocaleString()} points remaining
                </span>
              </div>
            </div>

            <TeamRosterView players={dashboard.players} />
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Budget Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Budget</h3>
                <p className="text-3xl font-bold text-blue-600">{dashboard.total_points.toLocaleString()}</p>
                <p className="text-sm text-gray-500">points</p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Used Points</h3>
                <p className="text-3xl font-bold text-green-600">{dashboard.used_points.toLocaleString()}</p>
                <p className="text-sm text-gray-500">points</p>
              </div>

              <div className="card text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Remaining</h3>
                <p className="text-3xl font-bold text-purple-600">{dashboard.remaining_points.toLocaleString()}</p>
                <p className="text-sm text-gray-500">points</p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Points Used</span>
                    <span>{((dashboard.used_points / dashboard.total_points) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${(dashboard.used_points / dashboard.total_points) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Average Cost per Player</h4>
                    <p className="text-2xl font-bold text-primary-600">
                      {dashboard.player_count > 0 ? Math.round(dashboard.used_points / dashboard.player_count) : 0}
                    </p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Points per Remaining Player</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard.remaining_points / Math.max(1, dashboard.min_players - dashboard.player_count)}
                    </p>
                    <p className="text-sm text-gray-500">points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Players</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="input-field pl-10 pr-4 py-2 w-64"
                    onChange={(e) => {
                      const query = e.target.value.toLowerCase()
                      const filtered = allPlayers.filter(player => 
                        player.name.toLowerCase().includes(query) ||
                        player.playing_category.toLowerCase().includes(query)
                      )
                      setFilteredPlayers(filtered)
                    }}
                  />
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {playersLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-gray-600">Loading players...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => (
                  <div key={player.id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                        <p className="text-sm text-gray-500">{player.playing_category}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${player.is_sold ? 'badge-success' : 'badge-warning'}`}>
                          {player.is_sold ? 'Sold' : 'Available'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Age:</span>
                        <span className="font-medium">{player.age} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gender:</span>
                        <span className="font-medium capitalize">{player.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Base Price:</span>
                        <span className="font-medium">{player.base_price} pts</span>
                      </div>
                      {player.is_sold && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Sold For:</span>
                          <span className="font-medium text-green-600">{player.current_price} pts</span>
                        </div>
                      )}
                      {player.current_team_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Team:</span>
                          <span className="font-medium text-blue-600">
                            {(() => {
                              // Find team name from teams data
                              const team = teams.find(t => t.id === player.current_team_id)
                              return team ? team.name : `Team ${player.current_team_id.slice(0, 8)}`
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {player.accomplishments && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 line-clamp-2">{player.accomplishments}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 