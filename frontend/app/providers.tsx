"use client"

import { WebSocketProvider } from '@/lib/websocket'
 
export function Providers({ children }: { children: React.ReactNode }) {
  return <WebSocketProvider>{children}</WebSocketProvider>
} 