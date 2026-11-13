'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/chat' : '/login')
    }
  }, [user, loading, router])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  )
}
