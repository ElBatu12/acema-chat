'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChat } from '@/context/ChatContext'
import { UserList } from './UserList'
import { Spinner } from '@/components/ui/Spinner'

interface NewChatModalProps {
  onClose: () => void
}

export function NewChatModal({ onClose }: NewChatModalProps) {
  const router = useRouter()
  const { users, loadingUsers, createChat } = useChat()

  const [selected, setSelected] = useState<string[]>([])
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const toggleUser = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = async () => {
    if (selected.length === 0) {
      setError('Selecciona al menos un participante')
      return
    }

    setCreating(true)
    setError('')

    try {
      const chat = await createChat(selected, name.trim() || undefined)
      onClose()
      router.push(`/chat/${chat.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la conversación')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Nueva conversación</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {selected.length > 1 && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Nombre del grupo (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Participantes
          </p>

          <UserList
            users={users}
            loading={loadingUsers}
            selected={selected}
            onToggle={toggleUser}
          />

          {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || selected.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {creating && <Spinner size="sm" />}
            {creating ? 'Creando...' : 'Crear conversación'}
          </button>
        </div>
      </div>
    </div>
  )
}
