'use client'

import { useRouter, useParams } from 'next/navigation'
import { ChatItem } from './ChatItem'
import { Spinner } from '@/components/ui/Spinner'
import { useChat } from '@/context/ChatContext'

export function ChatList() {
  const router = useRouter()
  const params = useParams()
  const { chats, loadingChats } = useChat()

  const activeChatId = params?.chatId as string | undefined

  if (loadingChats && chats.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!chats.length) {
    return (
      <p className="text-center text-slate-400 text-sm py-8 px-4">
        No tienes conversaciones aún
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 px-2">
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          onClick={() => router.push(`/chat/${chat.id}`)}
        />
      ))}
    </div>
  )
}
