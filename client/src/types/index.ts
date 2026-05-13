export interface UserPublic {
  id: number
  email: string
  username: string
  avatar: string
  bio: string | null
}

export interface AuthResponse {
  token: string
  user: UserPublic
}

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

export interface MessageResponse {
  id: number
  content: string
  type: 'text' | 'image'
  format: 'plain' | 'markdown'
  userId: number
  username: string
  avatar: string
  targetId: number | null
  createdAt: string
}

export interface UnreadCount {
  targetId: number
  count: number
}

export interface SocketUser {
  id: number
  email: string
  username: string
  avatar: string
}
