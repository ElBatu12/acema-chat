'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Chat, Message, User } from '@/types'
import { chatsApi, usersApi } from '@/lib/api'
import { useAuth } from './AuthContext'
import { useSocket } from './SocketContext'

interface ChatContextType {
  chats: Chat[]
  users: User[]
  messages: Record<string, Message[]>
  loadingChats: boolean
  loadingUsers: boolean
  loadingMessages: boolean
  fetchChats: () => Promise<void>
  fetchUsers: () => Promise<void>
  fetchMessages: (chatId: string) => Promise<void>
  createChat: (participantIds: string[], name?: string) => Promise<Chat>
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { socket } = useSocket()

  const [chats, setChats] = useState<Chat[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Ref para leer los chats cargados dentro del handler de reconexión sin re-suscribirlo en cada cambio.
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const fetchChats = useCallback(async () => {
    setLoadingChats(true)
    try {
      const data = await chatsApi.list()
      setChats(data)
    } finally {
      setLoadingChats(false)
    }
  }, [])

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true)
    try {
      const data = await usersApi.list()
      setUsers(data)
    } finally {
      setLoadingUsers(false)
    }
  }, [])

  const fetchMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true)
    try {
      const data = await chatsApi.messages(chatId)
      setMessages((prev) => ({ ...prev, [chatId]: data }))
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const createChat = useCallback(
    async (participantIds: string[], name?: string) => {
      const newChat = await chatsApi.create({ participant_ids: participantIds, name })
      setChats((prev) => {
        if (prev.some((c) => c.id === newChat.id)) return prev
        return [newChat, ...prev]
      })
      return newChat
    },
    []
  )

  const handleNewChat = useCallback((newChat: Chat) => {
    setChats((prev) => {
      if (prev.some((c) => c.id === newChat.id)) return prev
      return [newChat, ...prev]
    })
  }, [])

  const handleNewMessage = useCallback(
    (message: Message) => {
      // Se evitan duplicados por id (p. ej. un mensaje que llega por socket y también por la carga del historial).
      setMessages((prev) => {
        const current = prev[message.chat_id] || []
        if (current.some((m) => m.id === message.id)) return prev
        return { ...prev, [message.chat_id]: [...current, message] }
      })

      // Si el chat aún no está en la lista (lo creó otro usuario), se recarga desde el servidor.
      let chatKnown = false
      setChats((prev) => {
        chatKnown = prev.some((chat) => chat.id === message.chat_id)
        if (!chatKnown) return prev
        // El chat con el mensaje más reciente sube al inicio de la lista.
        const updated = prev.map((chat) =>
          chat.id === message.chat_id ? { ...chat, last_message: message } : chat
        )
        return [
          ...updated.filter((c) => c.id === message.chat_id),
          ...updated.filter((c) => c.id !== message.chat_id),
        ]
      })
      if (!chatKnown) fetchChats()
    },
    [fetchChats]
  )

  useEffect(() => {
    if (!user) {
      // Al cerrar sesión se limpia todo el estado para no exponer datos al siguiente usuario.
      setChats([])
      setUsers([])
      setMessages({})
      return
    }
    fetchChats()
    fetchUsers()
  }, [user, fetchChats, fetchUsers])
  useEffect(() => {
    if (!socket || !user) return
    // Al reconectar se resincroniza lo que pudo llegar mientras no había conexión (se ignora la primera conexión).
    let firstConnect = true
    const onConnect = () => {
      if (firstConnect) {
        firstConnect = false
        return
      }
      fetchChats()
      Object.keys(messagesRef.current).forEach((id) => {
        chatsApi
          .messages(id)
          .then((data) => setMessages((prev) => ({ ...prev, [id]: data })))
          .catch(() => undefined)
      })
    }
    socket.on('connect', onConnect)
    return () => {
      socket.off('connect', onConnect)
    }
  }, [socket, user, fetchChats])

  useEffect(() => {
    if (!socket) return

    socket.on('new_message', handleNewMessage)
    socket.on('new_chat', handleNewChat)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('new_chat', handleNewChat)
    }
  }, [socket, handleNewMessage, handleNewChat])

  return (
    <ChatContext.Provider
      value={{
        chats,
        users,
        messages,
        loadingChats,
        loadingUsers,
        loadingMessages,
        fetchChats,
        fetchUsers,
        fetchMessages,
        createChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}
