'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { useSocket } from '@/context/SocketContext'

interface MessageInputProps {
  chatId: string
}

const MAX_LENGTH = 2000

interface SendAck {
  ok: boolean
  error?: string
}

export function MessageInput({ chatId }: MessageInputProps) {
  const { socket, status } = useSocket()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isDisconnected = status !== 'connected'

  const sendMessage = () => {
    const trimmed = content.trim()
    if (!trimmed || !socket || sending || isDisconnected) return

    setSending(true)
    setError('')
    // El servidor responde con un ack; hasta recibirlo se deshabilita el envío para evitar duplicados.
    socket
      .timeout(8000)
      .emit('send_message', { chat_id: chatId, content: trimmed }, (err: Error | null, ack?: SendAck) => {
        setSending(false)
        if (err || !ack) {
          setError('No se pudo enviar el mensaje. Inténtalo de nuevo.')
          return
        }
        if (!ack.ok) {
          setError(ack.error || 'No se pudo enviar el mensaje')
          return
        }
        setContent('')
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto'
          textareaRef.current.focus()
        }
      })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`
  }

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {isDisconnected && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
          Sin conexión — intentando reconectar...
        </div>
      )}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg mb-3">
          {error}
        </div>
      )}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          disabled={isDisconnected || sending}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 max-h-32 overflow-y-auto"
        />
        <button
          onClick={sendMessage}
          disabled={!content.trim() || isDisconnected || sending}
          className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Enviar mensaje"
        >
          {sending ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
