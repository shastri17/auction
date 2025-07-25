'use client'

import { useState } from 'react'
import { User, Calendar, MapPin, Trophy, DollarSign, Users } from 'lucide-react'

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

interface PlayerProfileProps {
  player: Player
  currentBid?: number
  winningTeam?: {
    id: string
    name: string
  }
  showBidInfo?: boolean
}

export default function PlayerProfile({ player, currentBid, winningTeam, showBidInfo = true }: PlayerProfileProps) {
  const [imageError, setImageError] = useState(false)

  // Generate a placeholder avatar based on player name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getGenderColor = (gender: string) => {
    return gender.toLowerCase() === 'male' ? 'bg-blue-500' : 'bg-pink-500'
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'singles': 'bg-green-100 text-green-800',
      'doubles': 'bg-blue-100 text-blue-800',
      'mixed': 'bg-purple-100 text-purple-800',
      'open': 'bg-orange-100 text-orange-800',
      '35+': 'bg-gray-100 text-gray-800',
      'jumble': 'bg-yellow-100 text-yellow-800'
    }
    return colors[category.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getPlayerCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'women':
        return 'Women Players'
      case 'men_under_35':
        return 'Men Under 35 Years'
      case 'men_35_plus':
        return 'Men 35 and Above Years'
      default:
        return 'Unknown Category'
    }
  }

  const getPlayerCategoryColor = (category: string) => {
    switch (category) {
      case 'women':
        return 'bg-pink-100 text-pink-800'
      case 'men_under_35':
        return 'bg-blue-100 text-blue-800'
      case 'men_35_plus':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Player Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          {/* Player Avatar */}
          <div className="relative">
            {!imageError ? (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=random&size=80&bold=true&color=fff`}
                alt={player.name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-20 h-20 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold ${getGenderColor(player.gender)}`}>
                {getInitials(player.name)}
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${getGenderColor(player.gender)}`}>
              {player.gender === 'male' ? 'M' : 'F'}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{player.name}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{player.age} years</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span className="capitalize">{player.gender}</span>
              </div>
            </div>
          </div>

          {/* Price Badge */}
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <div className="text-sm opacity-90">Base Price</div>
              <div className="text-2xl font-bold">{player.base_price.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Playing Strength */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Playing Strength</h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(player.playing_category)}`}>
              <Trophy className="w-4 h-4 mr-2" />
              {player.playing_category}
            </div>
          </div>

          {/* Player Category */}
          {player.player_category && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Player Category</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlayerCategoryColor(player.player_category)}`}>
                <Users className="w-4 h-4 mr-2" />
                {getPlayerCategoryDisplayName(player.player_category)}
              </div>
            </div>
          )}

          {/* Accomplishments */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Accomplishments</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {player.accomplishments || 'No accomplishments listed'}
            </p>
          </div>
        </div>

        {/* Current Bid Information */}
        {showBidInfo && (currentBid || winningTeam) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Current Bid</h3>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {(currentBid || player.base_price).toLocaleString()}
                    </div>
                    {winningTeam && (
                      <div className="text-sm text-gray-600">
                        by <span className="font-medium text-blue-600">{winningTeam.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                {player.is_sold && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Sold
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Team Information */}
        {player.current_team && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Current Team</h3>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">{player.current_team.name}</span>
                {player.current_price && (
                  <span className="text-sm text-blue-600">
                    ({player.current_price.toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 