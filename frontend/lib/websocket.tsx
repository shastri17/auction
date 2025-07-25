"use client"

import { useEffect, useRef, useCallback, useState, createContext, useContext } from 'react'

interface WebSocketMessage {
  type: string
  data: any
  user_id?: string
  team_id?: string
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onOpen?: () => void
  onClose?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

// Shared WebSocket context to prevent multiple connections
interface WebSocketContextType {
  sendMessage: (message: WebSocketMessage) => void
  isConnected: boolean
  addMessageHandler: (handler: (message: WebSocketMessage) => void) => void
  removeMessageHandler: (handler: (message: WebSocketMessage) => void) => void
}

const WebSocketContext = createContext<WebSocketContextType>(null!)

// Global WebSocket instance
let globalWs: WebSocket | null = null
let globalMessageHandlers: Set<(message: WebSocketMessage) => void> = new Set()
let globalIsConnected = false
let globalConnectionListeners: Set<() => void> = new Set()

const notifyConnectionChange = () => {
  globalConnectionListeners.forEach(listener => listener())
}

export function WebSocketProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [isConnected, setIsConnected] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectInterval = 3000

  const connect = useCallback(() => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9999'
      globalWs = new WebSocket(`${wsUrl}/api/v1/ws`)

      // Set connection timeout
      const connectionTimeout = setTimeout(() => {
        if (globalWs && globalWs.readyState !== WebSocket.OPEN) {
          console.log('WebSocket connection timeout')
          globalWs.close()
        }
      }, 5000) // 5 second timeout

      globalWs.onopen = () => {
        console.log('WebSocket connected')
        clearTimeout(connectionTimeout)
        reconnectAttempts.current = 0
        globalIsConnected = true
        setIsConnected(true)
        notifyConnectionChange()
      }

      globalWs.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          // Notify all handlers
          globalMessageHandlers.forEach(handler => handler(message))
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      globalWs.onclose = () => {
        console.log('WebSocket disconnected')
        globalIsConnected = false
        setIsConnected(false)
        notifyConnectionChange()
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          setTimeout(() => {
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`)
            connect()
          }, reconnectInterval)
        }
      }

      globalWs.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [maxReconnectAttempts, reconnectInterval])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (globalWs && globalWs.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }, [])

  const addMessageHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
    globalMessageHandlers.add(handler)
  }, [])

  const removeMessageHandler = useCallback((handler: (message: WebSocketMessage) => void) => {
    globalMessageHandlers.delete(handler)
  }, [])

  useEffect(() => {
    connect()

    // Add connection listener
    globalConnectionListeners.add(() => setIsConnected(globalIsConnected))

    return () => {
      if (globalWs) {
        globalWs.close()
        globalWs = null
      }
      globalConnectionListeners.delete(() => setIsConnected(globalIsConnected))
    }
  }, [connect])

  return (
    <WebSocketContext.Provider value={{
      sendMessage,
      isConnected,
      addMessageHandler,
      removeMessageHandler
    }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const context = useContext(WebSocketContext)
  
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider')
  }

  useEffect(() => {
    if (options.onMessage) {
      context.addMessageHandler(options.onMessage)
      
      return () => {
        context.removeMessageHandler(options.onMessage!)
      }
    }
  }, [context, options.onMessage])

  useEffect(() => {
    if (context.isConnected && options.onOpen) {
      options.onOpen()
    }
  }, [context.isConnected, options.onOpen])

  return {
    sendMessage: context.sendMessage,
    isConnected: context.isConnected
  }
} 