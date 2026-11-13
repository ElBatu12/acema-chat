'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useSocket } from '@/context/SocketContext'
import { ChatList } from '@/components/chat/ChatList'
import { NewChatModal } from '@/components/chat/NewChatModal'
import { Spinner } from '@/components/ui/Spinner'
import clsx from 'clsx'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const params = useParams()
  const isInsideChat = Boolean(params?.chatId)

  const { user, loading, logout } = useAuth()
  const { status } = useSocket()
  const [showNewChat, setShowNewChat] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={clsx(
          'w-full md:w-80 flex-shrink-0 bg-slate-900 flex flex-col',
          isInsideChat ? 'hidden md:flex' : 'flex'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm">Acema Chat</span>
          </div>
          <div
            className={clsx('w-2 h-2 rounded-full transition-colors', {
              'bg-green-400': status === 'connected',
              'bg-yellow-400 animate-pulse': status === 'connecting',
              'bg-red-400': status === 'disconnected',
            })}
            title={
              status === 'connected'
                ? 'Conectado'
                : status === 'connecting'
                ? 'Conectando…'
                : 'Desconectado'
            }
          />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/60">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200 flex-shrink-0">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-700/60">
          <button
            onClick={() => setShowNewChat(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 active:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva conversación
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          <ChatList />
        </div>
      </aside>

      <main
        className={clsx(
          'flex-1 overflow-hidden',
          !isInsideChat ? 'hidden md:flex' : 'flex flex-col'
        )}
      >
        {children}
      </main>

      {showNewChat && <NewChatModal onClose={() => setShowNewChat(false)} />}
    </div>
  )
}
