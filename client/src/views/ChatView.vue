<template>
  <div class="chat-layout">
    <ChatSidebar
      :current-user="authStore.user"
      :online-users="chatStore.onlineUsers"
      :unread-counts="chatStore.unreadCounts"
      :current-target="chatStore.currentTarget"
      @select-target="handleSelectTarget"
      @logout="handleLogout"
    />
    <div class="chat-main">
      <div class="chat-header">
        <h2>{{ chatTitle }}</h2>
        <span v-if="chatStore.currentTarget" class="online-status">
          {{ isTargetOnline ? '在线' : '离线' }}
        </span>
      </div>
      <div class="messages-container" ref="messagesContainer">
        <ChatMessage
          v-for="msg in filteredMessages"
          :key="msg.id"
          :message="msg"
          :current-user-id="authStore.user?.id || 0"
          @loaded="scrollToBottom"
        />
      </div>
      <ChatInput
        :placeholder="inputPlaceholder"
        @send="handleSend"
        @send-image="handleSendImage"
        @toggle-emoji="showEmoji = !showEmoji"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useSocket } from '../composables/useSocket'
import ChatSidebar from '../components/ChatSidebar.vue'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'
import type { MessageResponse } from '../types'
import api from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()
const chatStore = useChatStore()
const socket = useSocket()
const messagesContainer = ref<HTMLElement>()
const showEmoji = ref(false)

const chatTitle = computed(() => {
  if (!chatStore.currentTarget) return '群聊'
  const user = chatStore.onlineUsers.find(u => u.id === chatStore.currentTarget)
  return user ? user.username : `用户 #${chatStore.currentTarget}`
})

const isTargetOnline = computed(() => {
  if (!chatStore.currentTarget) return false
  return chatStore.onlineUsers.some(u => u.id === chatStore.currentTarget)
})

const inputPlaceholder = computed(() => {
  if (!chatStore.currentTarget) return '说点什么...'
  return `对 ${chatTitle.value} 说...`
})

const filteredMessages = computed(() => {
  return chatStore.messages.filter(msg => {
    if (chatStore.currentTarget === null) {
      // Group chat: show messages with no target
      return msg.targetId === null
    }
    const myId = authStore.user?.id
    // DM: show messages between current user and target
    return (
      (msg.userId === myId && msg.targetId === chatStore.currentTarget) ||
      (msg.userId === chatStore.currentTarget && msg.targetId === myId)
    )
  })
})

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function loadHistory(targetId: number | null) {
  try {
    const params: any = { limit: 50 }
    if (targetId !== null) params.targetId = targetId
    const { data } = await api.get<MessageResponse[]>('/chat/history', { params })
    chatStore.setMessages(data)
    scrollToBottom()
  } catch (err) {
    console.error('Failed to load history:', err)
  }
}

async function loadUnread() {
  try {
    const { data } = await api.get('/chat/unread')
    chatStore.setUnreadCounts(data)
  } catch (err) {
    console.error('Failed to load unread:', err)
  }
}

function handleSelectTarget(targetId: number | null) {
  chatStore.setCurrentTarget(targetId)
  loadHistory(targetId)
  if (targetId !== null) {
    socket.joinDm(targetId)
    // Mark as read
    api.put(`/chat/read?targetId=${targetId}`).catch(() => {})
  }
}

function handleSend(content: string, format: 'plain' | 'markdown') {
  socket.sendMessage(content, 'text', format, chatStore.currentTarget || undefined)
}

function handleSendImage(file: File) {
  const formData = new FormData()
  formData.append('image', file)
  api.post('/chat/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(({ data }) => {
    socket.sendMessage(data.url, 'image', 'plain', chatStore.currentTarget || undefined)
  }).catch(err => {
    console.error('Image upload failed:', err)
  })
}

function handleLogout() {
  socket.disconnect()
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  if (!authStore.user) {
    try {
      const { data } = await api.get('/user/profile')
      authStore.setAuth(authStore.token!, data)
    } catch {
      handleLogout()
      return
    }
  }

  socket.connect()
  loadHistory(null)
  loadUnread()
})

onUnmounted(() => {
  socket.disconnect()
})

watch(() => chatStore.messages.length, () => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.chat-header {
  background: #1e293b;
  border-bottom: 1px solid #334155;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.chat-header h2 {
  font-size: 1.1rem;
  color: #f1f5f9;
  font-weight: 600;
}
.online-status {
  font-size: 0.8rem;
  color: #10b981;
}
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: #0f172a;
}
</style>
