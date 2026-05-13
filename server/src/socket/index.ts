import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import prisma from '../utils/db'
import { SocketUser } from '../types'
import { handleUserConnect, handleUserDisconnect } from './userHandler'
import { handleSendMessage, handleJoinDm } from './chatHandler'

export function initSocketIO(io: Server) {
  // JWT authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; email: string }
      // Attach user info to socket
      prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, username: true, avatar: true },
      }).then((user) => {
        if (!user) return next(new Error('User not found'))
        ;(socket as any).user = user
        next()
      }).catch(() => next(new Error('Authentication error')))
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    const user = (socket as any).user as SocketUser
    console.log(`User connected: ${user.username} (${user.email})`)

    handleUserConnect(io, socket, user)

    socket.on('sendMessage', (payload) => {
      handleSendMessage(io, socket, user, payload)
    })

    socket.on('joinDm', (targetId: number) => {
      handleJoinDm(socket, user, targetId)
    })

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.username}`)
      handleUserDisconnect(io, socket)
    })
  })
}
