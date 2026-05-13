// Auth types
export interface RegisterInput {
  email: string
  username: string
  password: string
  avatar: string
  bio?: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: UserPublic
}

export interface UserPublic {
  id: number
  email: string
  username: string
  avatar: string
  bio: string | null
}

// Chat types
export interface MessagePayload {
  content: string
  type: 'text' | 'image'
  format: 'plain' | 'markdown'
  targetId?: number
}

export interface MessageResponse {
  id: number
  content: string
  type: string
  format: string
  userId: number
  username: string
  avatar: string
  targetId: number | null
  createdAt: string
}

export interface ChatHistoryQuery {
  targetId?: string
  cursor?: string
  limit?: string
}

export interface UnreadCount {
  targetId: number
  count: number
}

// Socket types
export interface SocketUser {
  id: number
  email: string
  username: string
  avatar: string
}
