import { io, Socket } from 'socket.io-client'
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import type { MessageResponse, SocketUser } from '../types'

let socket: Socket | null = null

export function useSocket() {
  const connected = ref(false)
  const authStore = useAuthStore()
  const chatStore = useChatStore()

  function connect() {
    if (socket?.connected) return

    socket = io('/', {
      auth: { token: authStore.token },
    })

    socket.on('connect', () => {
      connected.value = true
    })

    socket.on('disconnect', () => {
      connected.value = false
    })

    socket.on('userList', (users: SocketUser[]) => {
      chatStore.setOnlineUsers(users)
    })

    socket.on('receiveMessage', (msg: MessageResponse) => {
      chatStore.addMessage(msg)
    })

    socket.on('unreadUpdate', (counts: { targetId: number; count: number }[]) => {
      chatStore.setUnreadCounts(counts)
    })
  }

  function disconnect() {
    socket?.disconnect()
    socket = null
    connected.value = false
  }

  function sendMessage(content: string, type: 'text' | 'image', format: 'plain' | 'markdown', targetId?: number) {
    socket?.emit('sendMessage', { content, type, format, targetId })
  }

  function joinDm(targetId: number) {
    socket?.emit('joinDm', { targetId })
  }

  return { connected, connect, disconnect, sendMessage, joinDm }
}
