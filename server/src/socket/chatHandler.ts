import { Server, Socket } from 'socket.io'
import prisma from '../utils/db'
import { MessagePayload, MessageResponse, SocketUser } from '../types'
import { isUserOnline, getUserSocketId } from './userHandler'

function getDmRoomName(userId1: number, userId2: number): string {
  const min = Math.min(userId1, userId2)
  const max = Math.max(userId1, userId2)
  return `dm:${min}:${max}`
}

export function handleSendMessage(io: Server, socket: Socket, user: SocketUser, payload: MessagePayload) {
  const { content, type, format, targetId } = payload

  if (!content || !type) return

  // Persist to database
  prisma.message.create({
    data: {
      content,
      type,
      format: format || 'plain',
      userId: user.id,
      targetId: targetId || null,
      isRead: targetId ? false : true, // group messages are always "read"
    },
    include: { user: { select: { id: true, username: true, avatar: true } } },
  }).then((msg) => {
    const messageResponse: MessageResponse = {
      id: msg.id,
      content: msg.content,
      type: msg.type,
      format: msg.format,
      userId: msg.user.id,
      username: msg.user.username,
      avatar: msg.user.avatar,
      targetId: msg.targetId,
      createdAt: msg.createdAt.toISOString(),
    }

    if (targetId) {
      // Private message
      const roomName = getDmRoomName(user.id, targetId)
      socket.join(roomName)
      // If target user is online, join them to the room and send
      const targetSocketId = getUserSocketId(targetId)
      if (targetSocketId) {
        io.sockets.sockets.get(targetSocketId)?.join(roomName)
        io.to(roomName).emit('receiveMessage', messageResponse)
      } else {
        // Target offline, just emit to sender
        socket.emit('receiveMessage', messageResponse)
      }
    } else {
      // Group message
      io.to('global').emit('receiveMessage', messageResponse)
    }
  }).catch((err) => {
    console.error('Message save error:', err)
  })
}

export function handleJoinDm(socket: Socket, user: SocketUser, targetId: number) {
  const roomName = getDmRoomName(user.id, targetId)
  socket.join(roomName)
}
