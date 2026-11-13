'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import { API_URL } from '@/lib/constants'
import { useAuth } from './AuthContext'

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

interface SocketContextType {
  socket: Socket | null
  status: ConnectionStatus
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  status: 'disconnected',
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')

  useEffect(() => {
    if (!token) {
      setSocket(null)
      setStatus('disconnected')
      return
    }

    setStatus('connecting')

    const newSocket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => setStatus('connected'))
    newSocket.on('disconnect', () => setStatus('disconnected'))
    newSocket.on('connect_error', (err) => {
      // Si el servidor rechazó el token, reintentar no tiene sentido.
      if (err.message === 'Token inválido' || err.message === 'Usuario no encontrado') {
        newSocket.disconnect()
      }
      setStatus('disconnected')
    })
    // La reconexión automática la maneja socket.io; aquí solo se refleja el estado en la UI.
    newSocket.io.on('reconnect_attempt', () => setStatus('connecting'))

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
      setStatus('disconnected')
    }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket(): SocketContextType {
  return useContext(SocketContext)
}
