'use client'

import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { Chat } from '@/types'
import { parseUtcDate } from '@/lib/date'

interface ChatItemProps {
  chat: Chat
  isActive: boolean
  onClick: () => void
}

function formatTime(isoString: string): string {
  const date = parseUtcDate(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  }
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return date.toLocaleDateString('es', { weekday: 'short' })
  return date.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
}

export function getChatDisplayName(chat: Chat, currentUserId: string): string {
  if (chat.name) return chat.name
  const others = chat.participants.filter((p) => p.id !== currentUserId)
  if (!others.length) return 'Chat'
  return others.map((p) => p.name).join(', ')
}

export function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  const { user } = useAuth()

  if (!user) return null

  const displayName = getChatDisplayName(chat, user.id)
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left',
        isActive ? 'bg-primary-500 text-white' : 'hover:bg-slate-800 text-slate-200'
      )}
    >
      <div
        className={clsx(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
          isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
        )}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm truncate">{displayName}</span>
          {chat.last_message && (
            <span
              className={clsx(
                'text-xs flex-shrink-0',
                isActive ? 'text-white/70' : 'text-slate-500'
              )}
            >
              {formatTime(chat.last_message.created_at)}
            </span>
          )}
        </div>
        {chat.last_message && (
          <p className={clsx('text-xs truncate mt-0.5', isActive ? 'text-white/70' : 'text-slate-400')}>
            {chat.last_message.sender.id === user.id ? 'Tú: ' : ''}
            {chat.last_message.content}
          </p>
        )}
      </div>
    </button>
  )
}
