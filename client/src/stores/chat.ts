import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MessageResponse, SocketUser, UnreadCount } from '../types'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<MessageResponse[]>([])
  const onlineUsers = ref<SocketUser[]>([])
  const unreadCounts = ref<UnreadCount[]>([])
  const currentTarget = ref<number | null>(null)

  function addMessage(msg: MessageResponse) {
    messages.value.push(msg)
  }

  function setMessages(msgs: MessageResponse[]) {
    messages.value = msgs
  }

  function setOnlineUsers(users: SocketUser[]) {
    onlineUsers.value = users
  }

  function setUnreadCounts(counts: UnreadCount[]) {
    unreadCounts.value = counts
  }

  function setCurrentTarget(targetId: number | null) {
    currentTarget.value = targetId
  }

  return {
    messages, onlineUsers, unreadCounts, currentTarget,
    addMessage, setMessages, setOnlineUsers, setUnreadCounts, setCurrentTarget,
  }
})
