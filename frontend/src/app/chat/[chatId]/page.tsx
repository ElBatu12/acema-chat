'use client'

import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useChat } from '@/context/ChatContext'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { MessageInput } from '@/components/chat/MessageInput'
import { SkeletonMessageList } from '@/components/ui/SkeletonMessage'
import { Spinner } from '@/components/ui/Spinner'
import type { Chat } from '@/types'

function getDisplayName(chat: Chat, currentUserId: string): string {
  if (chat.name) return chat.name
  const others = chat.participants.filter((p) => p.id !== currentUserId)
  if (!others.length) return 'Chat'
  return others.map((p) => p.name).join(', ')
}

export default function ChatPage() {
  const params = useParams()
  const chatId = params.chatId as string

  const { user } = useAuth()
  const { chats, messages, loadingMessages, loadingChats, fetchMessages } = useChat()

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const chat = chats.find((c) => c.id === chatId)
  const chatMessages = messages[chatId] || []

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId)
    }
  }, [chatId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  if (!chat) {
    if (loadingChats) {
      return (
        <div className="flex h-full items-center justify-center bg-gray-50">
          <Spinner size="lg" />
        </div>
      )
    }
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gray-50 text-gray-500 gap-2">
        <p className="text-sm font-medium">Conversación no encontrada</p>
        <Link href="/chat" className="text-xs text-primary-600 hover:underline">
          Volver a mis conversaciones
        </Link>
      </div>
    )
  }

  const displayName = user ? getDisplayName(chat, user.id) : ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-gray-100 bg-white shadow-sm">
        <Link
          href="/chat"
          className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Volver a chats"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">{displayName}</h2>
          <p className="text-xs text-gray-400">
            {chat.participants.length} participante{chat.participants.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50">
        {loadingMessages ? (
          <SkeletonMessageList />
        ) : chatMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">
              No hay mensajes aún. ¡Sé el primero en escribir!
            </p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput chatId={chatId} />
    </div>
  )
}
