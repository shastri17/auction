'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'team'
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token')
      const userRole = localStorage.getItem('user_role')

      if (!token) {
        // No token, redirect to login
        router.push('/login')
        return
      }

      if (requiredRole && userRole !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard
        if (userRole === 'admin') {
          router.push('/admin')
        } else if (userRole === 'team') {
          router.push('/team')
        } else {
          router.push('/login')
        }
        return
      }

      // Authenticated and correct role
      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        router.push('/login')
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [router, requiredRole])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 