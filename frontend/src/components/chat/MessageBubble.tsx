import type { Message } from '@/types'
import { formatClock } from '@/lib/date'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
}


export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3 animate-slide-in`}>
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">
            {message.sender.name}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
            isOwn
              ? 'bg-primary-500 text-white rounded-br-sm'
              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {formatClock(message.created_at)}
        </span>
      </div>
    </div>
  )
}
