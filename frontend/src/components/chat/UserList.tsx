'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { User } from '@/types'
import { Spinner } from '@/components/ui/Spinner'

interface UserListProps {
  users: User[]
  loading: boolean
  selected: string[]
  onToggle: (userId: string) => void
}

export function UserList({ users, loading, selected, onToggle }: UserListProps) {
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Spinner />
      </div>
    )
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Buscar usuarios..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
      />
      <div className="max-h-60 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            No se encontraron usuarios
          </p>
        ) : (
          filtered.map((user) => {
            const isSelected = selected.includes(user.id)
            return (
              <button
                key={user.id}
                onClick={() => onToggle(user.id)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors border',
                  isSelected
                    ? 'bg-primary-50 border-primary-200'
                    : 'border-transparent hover:bg-gray-50'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                {isSelected && (
                  <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
