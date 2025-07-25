'use client'

import { useState } from 'react'
import { Plus, X, User, Calendar, Phone, Award, Users } from 'lucide-react'
import { adminAPI } from '@/lib/api'

interface PlayerSeederProps {
  onPlayerAdded: () => void
}

interface PlayerFormData {
  name: string
  gender: 'male' | 'female'
  dateOfBirth: string
  mobile: string
  playingCategory: 'singles' | 'doubles' | 'both'
  accomplishments: string
}

export default function PlayerSeeder({ onPlayerAdded }: PlayerSeederProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<PlayerFormData>({
    name: '',
    gender: 'male',
    dateOfBirth: '',
    mobile: '',
    playingCategory: 'singles',
    accomplishments: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Transform data to match backend expectations
      const playerData = {
        name: formData.name,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        mobile: formData.mobile,
        playing_category: formData.playingCategory,
        accomplishments: formData.accomplishments
      }

      const response = await adminAPI.createPlayer(playerData)

      if (response) {
        setFormData({
          name: '',
          gender: 'male',
          dateOfBirth: '',
          mobile: '',
          playingCategory: 'singles',
          accomplishments: ''
        })
        setIsOpen(false)
        onPlayerAdded()
      } else {
        console.error('Failed to create player')
      }
    } catch (error) {
      console.error('Error creating player:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof PlayerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Player
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Player</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input-field"
                  placeholder="Enter player name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value as 'male' | 'female')}
                  className="input-field"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="input-field"
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Playing Category *
                </label>
                <select
                  value={formData.playingCategory}
                  onChange={(e) => handleInputChange('playingCategory', e.target.value as 'singles' | 'doubles' | 'both')}
                  className="input-field"
                >
                  <option value="singles">Singles</option>
                  <option value="doubles">Doubles</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Accomplishments
                </label>
                <textarea
                  value={formData.accomplishments}
                  onChange={(e) => handleInputChange('accomplishments', e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Enter player accomplishments"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? 'Adding...' : 'Add Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
} 