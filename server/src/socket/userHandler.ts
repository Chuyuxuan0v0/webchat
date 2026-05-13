import { Server, Socket } from 'socket.io'
import prisma from '../utils/db'
import { SocketUser } from '../types'

const onlineUsers = new Map<number, { socketId: string; user: SocketUser }>()

export function getOnlineUsers(): SocketUser[] {
  return Array.from(onlineUsers.values()).map(v => v.user)
}

export function handleUserConnect(io: Server, socket: Socket, user: SocketUser) {
  onlineUsers.set(user.id, { socketId: socket.id, user })
  socket.join('global')
  io.emit('userList', getOnlineUsers())
  socket.broadcast.emit('addUser', user)
}

export function handleUserDisconnect(io: Server, socket: Socket) {
  let disconnectedUser: SocketUser | undefined
  for (const [userId, data] of onlineUsers.entries()) {
    if (data.socketId === socket.id) {
      disconnectedUser = data.user
      onlineUsers.delete(userId)
      break
    }
  }
  if (disconnectedUser) {
    io.emit('userList', getOnlineUsers())
    io.emit('delUser', disconnectedUser)
  }
}

export function isUserOnline(userId: number): boolean {
  return onlineUsers.has(userId)
}

export function getUserSocketId(userId: number): string | undefined {
  return onlineUsers.get(userId)?.socketId
}
