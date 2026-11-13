import { API_URL } from './constants'
import type { User, Chat, Message } from '@/types'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

// FastAPI devuelve `detail` como string (errores propios) o como array (errores de validación 422).
function extractErrorMessage(detail: unknown, status: number): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: (string | number)[] }
    const field = first.loc?.[first.loc.length - 1]
    const msg = (first.msg || '').replace(/^Value error, /, '')
    if (field === 'email') return 'El formato del correo electrónico no es válido'
    return msg || 'Datos inválidos'
  }
  return `Error ${status}`
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response: Response
  try {
    // fetch solo lanza excepción por fallos de red, no por códigos HTTP de error.
    response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión.', 0)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Error desconocido' }))
    throw new ApiError(extractErrorMessage(errorData.detail, response.status), response.status)
  }

  return response.json()
}

interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

interface CreateChatData {
  participant_ids: string[]
  name?: string
}

export const authApi = {
  register: (data: RegisterData) =>
    request<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginData) =>
    request<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<User>('/api/v1/auth/me'),
}

export const usersApi = {
  list: () => request<User[]>('/api/v1/users'),
}

export const chatsApi = {
  list: () => request<Chat[]>('/api/v1/chats'),

  create: (data: CreateChatData) =>
    request<Chat>('/api/v1/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  messages: (chatId: string) => request<Message[]>(`/api/v1/chats/${chatId}/messages`),
}
