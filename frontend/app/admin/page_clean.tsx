'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Gavel, 
  Trophy, 
  Plus,
  Settings,
  LogOut
} from 'lucide-react'
import { useWebSocket } from '@/lib/websocket'
import { adminAPI, generalAPI, Player, Team } from '@/lib/api'
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
    setSearchQuery('')
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

  const getFilteredPlayers = (players: Player[]) => {
    if (!searchQuery.trim()) return players
    return players.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return (
    <div className="space-y-6">
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

export default function AdminDashboard() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboardContent />
    </AuthGuard>
  )
}

function AdminDashboardContent() {
  const { isConnected } = useWebSocket()
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('auctions')
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showRosterModal, setShowRosterModal] = useState(false)
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [showAssignPlayerModal, setShowAssignPlayerModal] = useState(false)
  
  const [teamCategoryStats, setTeamCategoryStats] = useState<{[teamId: string]: {
    women: number;
    men_under_35: number;
    men_35_plus: number;
  }}>({})

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_id')
    window.location.href = '/login'
  }

  const calculateTeamCategoryStats = (teamPlayers: Player[]) => {
    const stats = {
      women: 0,
      men_under_35: 0,
      men_35_plus: 0
    }

    teamPlayers.forEach(player => {
      if (player.gender === 'female') {
        stats.women++
      } else if (player.gender === 'male') {
        if (player.age < 35) {
          stats.men_under_35++
        } else {
          stats.men_35_plus++
        }
      }
    })

    return stats
  }

  const fetchTeamsData = async () => {
    try {
      const teamsData = await generalAPI.getTeams()
      if (teamsData && Array.isArray(teamsData)) {
        setTeams(teamsData)
        
        const newTeamCategoryStats: {[teamId: string]: {
          women: number;
          men_under_35: number;
          men_35_plus: number;
        }} = {}
        
        for (const team of teamsData) {
          try {
            const teamPlayers = await generalAPI.getTeamPlayers(team.id)
            newTeamCategoryStats[team.id] = calculateTeamCategoryStats(teamPlayers)
          } catch (error) {
            console.error(`Failed to fetch players for team ${team.id}:`, error)
            newTeamCategoryStats[team.id] = { women: 0, men_under_35: 0, men_35_plus: 0 }
          }
        }
        
        setTeamCategoryStats(newTeamCategoryStats)
      } else {
        setTeams([])
        setTeamCategoryStats({})
      }
    } catch (error) {
      console.error('Failed to fetch teams data:', error)
      setTeams([])
      setTeamCategoryStats({})
    }
  }

  const fetchDashboardData = async () => {
    try {
      const playersData = await generalAPI.getPlayers()
      if (playersData && Array.isArray(playersData)) {
        setPlayers(playersData)
      } else {
        setPlayers([])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleViewRoster = async (team: Team) => {
    setSelectedTeam(team)
    try {
      const response = await adminAPI.getTeamPlayers(team.id)
      setTeamPlayers(response || [])
      setShowRosterModal(true)
    } catch (error) {
      console.error('Failed to fetch team players:', error)
      setTeamPlayers([])
      setShowRosterModal(true)
    }
  }

  const handleAssignPlayerToTeamFromPlayerCard = async (player: Player) => {
    setSelectedPlayer(player)
    setShowAssignPlayerModal(true)
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
              { id: 'auctions', name: 'Auctions', icon: Gavel },
              { id: 'teams', name: 'Teams', icon: Users },
              { id: 'players', name: 'Players', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  if (tab.id === 'teams') {
                    fetchTeamsData()
                  } else if (tab.id === 'players') {
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
                        (team.player_count || 0) >= (team.min_players || 0)
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}>
                        {team.player_count || 0}/{team.min_players || 0}
                      </span>
                    </div>

                    {/* Category Stats for this team */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Player Categories</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="font-semibold text-pink-600">{teamCategoryStats[team.id]?.women || 0}</div>
                          <div className="text-pink-500">Women</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-600">{teamCategoryStats[team.id]?.men_under_35 || 0}</div>
                          <div className="text-blue-500">U35</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{teamCategoryStats[team.id]?.men_35_plus || 0}</div>
                          <div className="text-green-500">35+</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Points Used</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {(team.used_points || 0).toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            / {(team.total_points || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                            style={{ width: `${team.total_points && team.used_points ? (team.used_points / team.total_points) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center bg-blue-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-blue-600">
                            {((team.total_points || 0) - (team.used_points || 0)).toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-600">Remaining Points</div>
                        </div>
                        <div className="text-center bg-green-50 rounded-lg p-3">
                          <div className="text-lg font-bold text-green-600">
                            {Math.min((team.total_points || 0) - (team.used_points || 0), 200).toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600">Max Bid</div>
                        </div>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button 
                          onClick={() => handleViewRoster(team)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm"
                        >
                          View Roster
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
        </div>
      </div>
    </div>
  )
}
