import axios from 'axios'

const API_BASE_URL = 'http://13.234.48.132:9999'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  console.log('API Request:', config.method?.toUpperCase(), config.url)
  console.log('Using token:', token ? token.substring(0, 20) + '...' : 'No token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config?.url)
    console.log('Response data:', response.data)
    return response
  },
  (error) => {
    console.log('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    })
    
    // Only handle 401 errors, not network errors or other issues
    if (error.response?.status === 401) {
      console.log('Authentication error detected, logging out user')
      console.log('Current pathname:', window.location.pathname)
      // Clear all auth data
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      // Prevent multiple redirects
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Types
export interface DashboardStats {
  total_players: number
  total_teams: number
  active_auctions: number
  total_bids: number
  total_points: number
  pending_approvals: number
}

export interface TeamDashboard {
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

export interface Player {
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
  current_team?: {
    id: string
    name: string
  }
}

export interface Team {
  id: string
  name: string
  total_points: number
  used_points: number
  player_count: number
  min_players: number
  max_players: number
  players: Player[]
}

export interface TeamWithCategoryStats extends Team {
  categoryStats: {
    women: number
    men_under_35: number
    men_35_plus: number
  }
}

export interface Auction {
  id: string
  title: string
  status: 'pending' | 'active' | 'completed'
  current_player: Player
  current_bid: number
  winning_team: any
  start_time: string
  end_time?: string
}

export interface Bid {
  id: string
  auction_id: string
  player_id: string
  team_id: string
  amount: number
  is_winning: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string
  min_age?: number
  max_age?: number
  gender: string
  type: string
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/v1/auth/login', { email, password })
    return response.data
  },

  register: async (username: string, email: string, password: string, role: string) => {
    const response = await api.post('/api/v1/auth/register', { username, email, password, role })
    return response.data
  },
}

// Admin API
export const adminAPI = {
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get('/api/v1/admin/dashboard')
    return response.data.data
  },

  getAuctions: async (status?: string): Promise<Auction[]> => {
    const params = status ? { status } : {}
    const response = await api.get('/api/v1/auctions', { params })
    console.log('getAuctions response:', response.data)
    // Handle null response gracefully
    return response.data.data || []
  },

  createAuction: async (auction: Partial<Auction>): Promise<Auction> => {
    const response = await api.post('/api/v1/auctions', auction)
    return response.data.data
  },

  updateAuction: async (id: string, auction: Partial<Auction>): Promise<Auction> => {
    const response = await api.put(`/api/v1/auctions/${id}`, auction)
    return response.data.data
  },

  deleteAuction: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/auctions/${id}`)
  },

  startAuction: async (id: string): Promise<Auction> => {
    const response = await api.post(`/api/v1/admin/auctions/${id}/start`)
    return response.data.data
  },

  endAuction: async (id: string): Promise<Auction> => {
    const response = await api.post(`/api/v1/admin/auctions/${id}/end`)
    return response.data.data
  },

  nextPlayer: async (id: string): Promise<any> => {
    const response = await api.post(`/api/v1/admin/auctions/${id}/next-player`)
    return response.data.data
  },

  assignPlayerToAuction: async (auctionId: string, playerId: string): Promise<any> => {
    const response = await api.post(`/api/v1/admin/auctions/${auctionId}/assign-player`, { player_id: playerId })
    return response.data.data
  },

  getAuctionStatus: async (id: string): Promise<Auction> => {
    const response = await api.get(`/api/v1/admin/auctions/${id}/status`)
    return response.data.data
  },

  approvePlayer: async (playerId: string, approved: boolean): Promise<Player> => {
    const response = await api.post('/api/v1/admin/players/approve', { player_id: playerId, approved })
    return response.data.data
  },

  createTeam: async (team: Partial<Team>): Promise<Team> => {
    const response = await api.post('/api/v1/admin/teams/create', team)
    return response.data.data
  },

  updateTeamPoints: async (id: string, usedPoints: number): Promise<Team> => {
    const response = await api.put(`/api/v1/admin/teams/${id}/points`, { used_points: usedPoints })
    return response.data.data
  },

  createPlayer: async (data: any): Promise<Player> => {
    const response = await api.post('/api/v1/admin/players/create', data)
    return response.data.data
  },

  getTeamPlayers: async (teamId: string): Promise<Player[]> => {
    const response = await api.get(`/api/v1/teams/${teamId}/players`)
    return response.data.data
  },

  updateTeam: async (teamId: string, teamData: Partial<Team>): Promise<Team> => {
    const response = await api.put(`/api/v1/teams/${teamId}`, teamData)
    return response.data.data
  },

  assignPlayerToTeam: async (teamId: string, playerId: string, points: number): Promise<any> => {
    const response = await api.post(`/api/v1/admin/teams/${teamId}/assign-player`, {
      player_id: playerId,
      points: points
    })
    return response.data.data
  },

  getAvailablePlayers: async (): Promise<Player[]> => {
    const response = await api.get('/api/v1/admin/available-players')
    return response.data.data
  },
}

// Team API
export const teamAPI = {
  getDashboard: async (): Promise<TeamDashboard> => {
    console.log('Making API call to /api/v1/team/dashboard')
    const response = await api.get('/api/v1/team/dashboard')
    console.log('Raw API response:', response)
    console.log('Response data:', response.data)
    console.log('Response data.data:', response.data?.data)
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid API response structure')
    }
    
    return response.data.data
  },

  getRoster: async (): Promise<Player[]> => {
    const response = await api.get('/api/v1/team/roster')
    return response.data.data
  },

  getBudget: async (): Promise<any> => {
    const response = await api.get('/api/v1/team/budget')
    return response.data.data
  },

  retainPlayer: async (playerId: string): Promise<any> => {
    const response = await api.post('/api/v1/team/retain-player', { player_id: playerId })
    return response.data.data
  },

  createBid: async (auctionId: string, amount: number): Promise<Bid> => {
    const response = await api.post(`/api/v1/auctions/${auctionId}/bid`, { amount })
    return response.data.data
  },

  getAuctionBids: async (auctionId: string): Promise<Bid[]> => {
    const response = await api.get(`/api/v1/auctions/${auctionId}/bids`)
    return response.data.data
  },

  getCurrentBid: async (auctionId: string): Promise<any> => {
    const response = await api.get(`/api/v1/auctions/${auctionId}/current-bid`)
    return response.data.data
  },
}

// General API
export const generalAPI = {
  getPlayers: async (status?: string, category?: string): Promise<Player[]> => {
    const params: any = {}
    if (status) params.status = status
    if (category) params.category = category
    const response = await api.get('/api/v1/players', { params })
    return response.data.data
  },

  getPlayersByCategory: async (status?: string): Promise<{
    women: Player[]
    men_under_35: Player[]
    men_35_plus: Player[]
  }> => {
    const params: any = {}
    if (status) params.status = status
    const response = await api.get('/api/v1/players/categories', { params })
    return response.data.data
  },

  getPlayer: async (id: string): Promise<Player> => {
    const response = await api.get(`/api/v1/players/${id}`)
    return response.data.data
  },

  updatePlayer: async (id: string, player: Partial<Player>): Promise<Player> => {
    const response = await api.put(`/api/v1/players/${id}`, player)
    return response.data.data
  },

  deletePlayer: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/players/${id}`)
  },

  getTeams: async (): Promise<Team[]> => {
    const response = await api.get('/api/v1/teams')
    return response.data.data
  },

  getTeam: async (id: string): Promise<Team> => {
    const response = await api.get(`/api/v1/teams/${id}`)
    return response.data.data
  },

  updateTeam: async (id: string, team: Partial<Team>): Promise<Team> => {
    const response = await api.put(`/api/v1/teams/${id}`, team)
    return response.data.data
  },

  getTeamPlayers: async (id: string): Promise<Player[]> => {
    const response = await api.get(`/api/v1/teams/${id}/players`)
    return response.data.data
  },

  getTeamPoints: async (id: string): Promise<any> => {
    const response = await api.get(`/api/v1/teams/${id}/points`)
    return response.data.data
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/api/v1/categories')
    return response.data.data
  },
}

// WebSocket connection is now handled by the WebSocketProvider
// Use useWebSocket hook instead of this function

export default api 