'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Gavel, 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Play,
  Pause,
  Square,
  Plus,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  LogOut
} from 'lucide-react'
import { useWebSocket } from '@/lib/websocket'
import { adminAPI, generalAPI, Player } from '@/lib/api'
import PlayerSeeder from './components/PlayerSeeder'
import AuctionManager from './components/AuctionManager'
import AuthGuard from '@/components/AuthGuard'

// Player Categories View Component
function PlayerCategoriesView({ onAssignPlayerToTeam }: { onAssignPlayerToTeam: (player: Player) => void }) {
  const [categorizedPlayers, setCategorizedPlayers] = useState<{
    women: Player[]
    men_under_35: Player[]
    men_35_plus: Player[]
  }>({
    women: [],
    men_under_35: [],
    men_35_plus: []
  })
  const [activeCategory, setActiveCategory] = useState<string>('women')
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchCategorizedPlayers = async () => {
    setIsLoading(true)
    try {
      const data = await generalAPI.getPlayersByCategory()
      setCategorizedPlayers(data)
    } catch (error) {
      console.error('Failed to fetch categorized players:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorizedPlayers()
  }, [])

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    setSearchQuery('') // Clear search when changing category
    fetchCategorizedPlayers()
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
            onClick={() => handleCategoryChange(category.id)}
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {categories.find(c => c.id === activeCategory)?.name}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search players by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
              />
              <svg
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div key={player.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 ${getCategoryColor(activeCategory).replace('text-', 'bg-').replace('-800', '-100')} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className={`text-lg font-bold ${getCategoryIconColor(activeCategory)}`}>
                      {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{player.name}</h4>
                    <p className="text-sm text-gray-600">{player.age} years, {player.gender}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Playing Strength</p>
                    <p className="text-sm font-semibold text-gray-900">{player.playing_category}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Base Price</p>
                    <p className="text-lg font-bold text-gray-900">{player.base_price.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      player.is_sold 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {player.is_sold ? 'Sold' : 'Available'}
                    </span>
                  </div>
                  
                  {!player.is_sold && (
                    <div className="pt-4">
                      <button
                        onClick={() => onAssignPlayerToTeam(player)}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                      >
                        Add to Team
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          })()}
        </div>
      </div>
    </div>
  )
}

// Edit Team Form Component
function EditTeamForm({ team, onSave, onCancel }: { 
  team: Team; 
  onSave: (teamData: Partial<Team>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: team.name,
    totalPoints: team.totalPoints,
    minPlayers: team.minPlayers
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Team Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Points
        </label>
        <input
          type="number"
          value={formData.totalPoints}
          onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minimum Players Required
        </label>
        <input
          type="number"
          value={formData.minPlayers}
          onChange={(e) => setFormData({ ...formData, minPlayers: parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
          min="1"
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 btn-primary"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}

// Add Player Card Component
function AddPlayerCard({ player, team, onAssign }: { 
  player: Player; 
  team: Team; 
  onAssign: (playerId: string, points: number) => void; 
}) {
  const [points, setPoints] = useState(player.base_price)
  const [isAssigning, setIsAssigning] = useState(false)
  const remainingPoints = team.totalPoints - team.usedPoints
  const canAfford = points <= remainingPoints

  const handleAssign = async () => {
    if (!canAfford) return
    
    setIsAssigning(true)
    try {
      await onAssign(player.id, points)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-green-600">
            {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{player.name}</h4>
          <p className="text-sm text-gray-500">{player.age} years, {player.gender}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Playing Category</p>
          <p className="text-sm font-medium text-gray-900">{player.playing_category}</p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Base Price</p>
          <p className="text-sm font-medium text-gray-900">{player.base_price.toLocaleString()}</p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Points to Assign
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min={player.base_price}
            max={remainingPoints}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {points > remainingPoints && (
            <p className="text-xs text-red-600 mt-1">
              Exceeds remaining points ({remainingPoints.toLocaleString()})
            </p>
          )}
        </div>

        <button
          onClick={handleAssign}
          disabled={!canAfford || isAssigning}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            canAfford && !isAssigning
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAssigning ? 'Adding...' : `Add for ${points.toLocaleString()} points`}
        </button>
      </div>
    </div>
  )
}

// Assign Player to Team Card Component
function AssignPlayerToTeamCard({ player, team, onAssign }: { 
  player: Player; 
  team: Team; 
  onAssign: (teamId: string, points: number) => void; 
}) {
  const [points, setPoints] = useState(player.base_price)
  const [isAssigning, setIsAssigning] = useState(false)
  const remainingPoints = team.totalPoints - team.usedPoints
  const canAfford = points <= remainingPoints

  const handleAssign = async () => {
    if (!canAfford) return
    
    setIsAssigning(true)
    try {
      await onAssign(team.id, points)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {team.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </span>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{team.name}</h4>
          <p className="text-sm text-gray-500">{team.playerCount}/{team.minPlayers} players</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
          <p className="text-sm font-medium text-gray-900">
            {team.usedPoints.toLocaleString()} / {team.totalPoints.toLocaleString()} points used
          </p>
          <p className="text-xs text-gray-500">
            {remainingPoints.toLocaleString()} points remaining
          </p>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-wide mb-1">
            Points to Assign
          </label>
          <input
            type="number"
            value={points}
            onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
            min={player.base_price}
            max={remainingPoints}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {points > remainingPoints && (
            <p className="text-xs text-red-600 mt-1">
              Exceeds remaining points ({remainingPoints.toLocaleString()})
            </p>
          )}
        </div>

        <button
          onClick={handleAssign}
          disabled={!canAfford || isAssigning}
          className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            canAfford && !isAssigning
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAssigning ? 'Assigning...' : `Assign for ${points.toLocaleString()} points`}
        </button>
      </div>
    </div>
  )
}

// Assign Player to Team Form Component
function AssignPlayerToTeamForm({ player, teams, onAssign, onCancel }: { 
  player: Player; 
  teams: Team[]; 
  onAssign: (teamId: string, points: number) => void; 
  onCancel: () => void; 
}) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [points, setPoints] = useState(player.base_price)
  const [isAssigning, setIsAssigning] = useState(false)

  const selectedTeam = teams.find(team => team.id === selectedTeamId)
  const remainingPoints = selectedTeam ? selectedTeam.totalPoints - selectedTeam.usedPoints : 0
  const canAfford = selectedTeam && points <= remainingPoints

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId || !canAfford) return
    
    setIsAssigning(true)
    try {
      await onAssign(selectedTeamId, points)
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Team
        </label>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        >
          <option value="">Choose a team...</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} ({team.usedPoints.toLocaleString()}/{team.totalPoints.toLocaleString()} points used)
            </option>
          ))}
        </select>
      </div>

      {selectedTeam && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Remaining Points:</span> {remainingPoints.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Players:</span> {selectedTeam.playerCount}/{selectedTeam.minPlayers}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Points to Assign
        </label>
        <input
          type="number"
          value={points}
          onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
          min={player.base_price}
          max={remainingPoints}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />
        {selectedTeam && points > remainingPoints && (
          <p className="text-xs text-red-600 mt-1">
            Exceeds remaining points ({remainingPoints.toLocaleString()})
          </p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!selectedTeamId || !canAfford || isAssigning}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            selectedTeamId && canAfford && !isAssigning
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAssigning ? 'Assigning...' : `Assign for ${points.toLocaleString()} points`}
        </button>
      </div>
    </form>
  )
}

interface DashboardStats {
  totalPlayers: number
  totalTeams: number
  activeAuctions: number
  totalBids: number
  totalPoints: number
}

interface Auction {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed'
  currentPlayer: string
  currentBid: number
  startTime: string
  endTime?: string
}

interface Team {
  id: string
  name: string
  totalPoints: number
  usedPoints: number
  playerCount: number
  minPlayers: number
}

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboardContent />
    </AuthGuard>
  )
}

function AdminDashboardContent() {
  const { isConnected } = useWebSocket()
  const [stats, setStats] = useState<DashboardStats>({
    totalPlayers: 0,
    totalTeams: 0,
    activeAuctions: 0,
    totalBids: 0,
    totalPoints: 0
  })
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showRosterModal, setShowRosterModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [showAssignPlayerModal, setShowAssignPlayerModal] = useState(false)
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    
    // Redirect to login page
    window.location.href = '/login'
  }

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const statsData = await adminAPI.getDashboard()
      setStats({
        totalPlayers: statsData.total_players,
        totalTeams: statsData.total_teams,
        activeAuctions: statsData.active_auctions,
        totalBids: statsData.total_bids,
        totalPoints: statsData.total_points
      })

      // Fetch auctions
      const auctionsData = await adminAPI.getAuctions()
      if (auctionsData && Array.isArray(auctionsData)) {
        setAuctions(auctionsData.map(auction => ({
          id: auction.id,
          title: auction.title,
          status: auction.status,
          currentPlayer: auction.current_player?.name || 'No player',
          currentBid: auction.current_bid,
          startTime: auction.start_time
        })))
      } else {
        setAuctions([])
      }

      // Fetch teams
      const teamsData = await generalAPI.getTeams()
      if (teamsData && Array.isArray(teamsData)) {
        setTeams(teamsData.map(team => ({
          id: team.id,
          name: team.name,
          totalPoints: team.total_points,
          usedPoints: team.used_points,
          playerCount: team.player_count,
          minPlayers: team.min_players
        })))
      } else {
        setTeams([])
      }

      // Fetch players
      const playersData = await generalAPI.getPlayers()
      if (playersData && Array.isArray(playersData)) {
        setPlayers(playersData)
      } else {
        setPlayers([])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      // Fallback to mock data if API fails
      setStats({
        totalPlayers: 156,
        totalTeams: 5,
        activeAuctions: 2,
        totalBids: 89,
        totalPoints: 60000
      })
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleViewRoster = async (team: Team) => {
    setSelectedTeam(team)
    try {
      // Fetch team's players
      const response = await adminAPI.getTeamPlayers(team.id)
      setTeamPlayers(response || [])
      setShowRosterModal(true)
    } catch (error) {
      console.error('Failed to fetch team players:', error)
      setTeamPlayers([])
      setShowRosterModal(true)
    }
  }

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team)
    setShowEditModal(true)
  }

  const handleSaveTeam = async (updatedTeam: Partial<Team>) => {
    if (!selectedTeam) return
    
    try {
      await adminAPI.updateTeam(selectedTeam.id, updatedTeam)
      // Refresh dashboard data
      fetchDashboardData()
      setShowEditModal(false)
      setSelectedTeam(null)
    } catch (error) {
      console.error('Failed to update team:', error)
    }
  }

  const handleAddPlayerToTeam = async (team: Team) => {
    setSelectedTeam(team)
    try {
      // Fetch available players (not sold to any team)
      const response = await generalAPI.getPlayers()
      const available = response.filter((player: Player) => !player.is_sold)
      setAvailablePlayers(available)
      setShowAddPlayerModal(true)
    } catch (error) {
      console.error('Failed to fetch available players:', error)
      setAvailablePlayers([])
      setShowAddPlayerModal(true)
    }
  }

  const handleAssignPlayer = async (playerId: string, points: number) => {
    if (!selectedTeam) return
    
    try {
      await adminAPI.assignPlayerToTeam(selectedTeam.id, playerId, points)
      // Refresh dashboard data and team roster
      fetchDashboardData()
      if (showRosterModal) {
        const response = await adminAPI.getTeamPlayers(selectedTeam.id)
        setTeamPlayers(response || [])
      }
      setShowAddPlayerModal(false)
      setSelectedTeam(null)
    } catch (error) {
      console.error('Failed to assign player to team:', error)
    }
  }

  const handleAssignPlayerToTeamFromPlayerCard = async (player: Player) => {
    setSelectedPlayer(player)
    try {
      // Fetch teams for selection
      const teamsData = await generalAPI.getTeams()
      if (teamsData && Array.isArray(teamsData)) {
        const formattedTeams = teamsData.map(team => ({
          id: team.id,
          name: team.name,
          totalPoints: team.total_points,
          usedPoints: team.used_points,
          playerCount: team.player_count,
          minPlayers: team.min_players
        }))
        setTeams(formattedTeams)
      }
      setShowAssignPlayerModal(true)
    } catch (error) {
      console.error('Failed to fetch teams:', error)
      setShowAssignPlayerModal(true)
    }
  }

  const handleAssignPlayerToSpecificTeam = async (teamId: string, points: number) => {
    if (!selectedPlayer) return
    
    try {
      await adminAPI.assignPlayerToTeam(teamId, selectedPlayer.id, points)
      // Refresh dashboard data
      fetchDashboardData()
      setShowAssignPlayerModal(false)
      setSelectedPlayer(null)
    } catch (error) {
      console.error('Failed to assign player to team:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />
      case 'pending': return <Pause className="h-4 w-4" />
              case 'completed': return <Square className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-6">
              <button className="btn-secondary">
                <Settings className="h-4 w-4" />
              </button>
              <button 
                onClick={handleLogout}
                className="btn-secondary flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
              {/* Connection Status Dot */}
              <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg shadow-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-700">
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
          <nav className="flex justify-center space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'auctions', name: 'Auctions', icon: Gavel },
              { id: 'teams', name: 'Teams', icon: Users },
              { id: 'players', name: 'Players', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  // Refresh data when clicking on specific tabs
                  if (tab.id === 'players') {
                    fetchDashboardData()
                  }
                }}
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
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Players</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPlayers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Teams</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalTeams}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Gavel className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Auctions</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeAuctions}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Bids</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBids}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Points</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPoints.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Auctions</h3>
                <div className="space-y-4">
                  {auctions.map((auction) => (
                    <div key={auction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">{auction.title}</p>
                        <p className="text-sm text-gray-600">Current: {auction.currentPlayer}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(auction.status)}`}>
                          {getStatusIcon(auction.status)}
                          <span>{auction.status}</span>
                        </span>
                        <span className="text-sm font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                          {auction.currentBid} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Team Status</h3>
                <div className="space-y-4">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">{team.name}</p>
                        <p className="text-sm text-gray-600">
                          {team.playerCount}/{team.minPlayers} players
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {team.usedPoints}/{team.totalPoints} pts
                        </p>
                        <div className="w-32 bg-gray-200 rounded-full h-3 mt-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${(team.usedPoints / team.totalPoints) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Auction Management</h2>
            </div>

            <AuctionManager />
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Team
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{team.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      team.playerCount >= team.minPlayers 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {team.playerCount}/{team.minPlayers}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Points Used</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {team.usedPoints.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          / {team.totalPoints.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(team.usedPoints / team.totalPoints) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button 
                        onClick={() => handleViewRoster(team)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                      >
                        View Roster
                      </button>
                      <button 
                        onClick={() => handleEditTeam(team)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                      >
                        Edit Team
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Player Management</h2>
              <PlayerSeeder onPlayerAdded={fetchDashboardData} />
            </div>

            <PlayerCategoriesView onAssignPlayerToTeam={handleAssignPlayerToTeamFromPlayerCard} />
          </div>
        )}

        {/* Team Roster Modal */}
        {showRosterModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedTeam.name} - Team Roster
                </h3>
                <button
                  onClick={() => setShowRosterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {teamPlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamPlayers.map((player) => (
                    <div key={player.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {player.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{player.name}</h4>
                          <p className="text-sm text-gray-500">{player.age} years, {player.gender}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Playing Category</p>
                          <p className="text-sm font-medium text-gray-900">{player.playing_category}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Acquisition Price</p>
                          <p className="text-sm font-medium text-gray-900">{player.current_price.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No players in this team yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Team Modal */}
        {showEditModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Team</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <EditTeamForm 
                team={selectedTeam} 
                onSave={handleSaveTeam}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        )}

        {/* Add Player to Team Modal */}
        {showAddPlayerModal && selectedTeam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Add Player to {selectedTeam.name}
                </h3>
                <button
                  onClick={() => setShowAddPlayerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Team Budget</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {selectedTeam.usedPoints.toLocaleString()} / {selectedTeam.totalPoints.toLocaleString()} points used
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-900">Remaining Points</p>
                    <p className="text-lg font-semibold text-blue-900">
                      {(selectedTeam.totalPoints - selectedTeam.usedPoints).toLocaleString()} points
                    </p>
                  </div>
                </div>
              </div>

              {availablePlayers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePlayers.map((player) => (
                    <AddPlayerCard 
                      key={player.id}
                      player={player}
                      team={selectedTeam}
                      onAssign={handleAssignPlayer}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No available players to add</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assign Player to Team Modal */}
        {showAssignPlayerModal && selectedPlayer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Assign {selectedPlayer.name} to Team
                </h3>
                <button
                  onClick={() => setShowAssignPlayerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {selectedPlayer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">{selectedPlayer.name}</h4>
                    <p className="text-sm text-blue-700">{selectedPlayer.age} years, {selectedPlayer.gender} • {selectedPlayer.playing_category}</p>
                    <p className="text-sm text-blue-700">Base Price: {selectedPlayer.base_price.toLocaleString()} points</p>
                  </div>
                </div>
              </div>

              <AssignPlayerToTeamForm 
                player={selectedPlayer}
                teams={teams}
                onAssign={handleAssignPlayerToSpecificTeam}
                onCancel={() => setShowAssignPlayerModal(false)}
              />
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  )
} 