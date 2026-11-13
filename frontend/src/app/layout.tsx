import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { ChatProvider } from '@/context/ChatContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Acema Chat',
  description: 'Plataforma de mensajería en tiempo real',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>{children}</ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
