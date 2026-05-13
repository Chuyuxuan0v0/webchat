<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="user-info">
        <UserAvatar :avatar="currentUser?.avatar || '0'" :size="40" />
        <div class="user-details">
          <div class="username">{{ currentUser?.username }}</div>
          <div class="bio">{{ currentUser?.bio || '暂无签名' }}</div>
        </div>
      </div>
      <button class="logout-btn" @click="$emit('logout')" title="退出登录">⏻</button>
    </div>

    <div class="section-title">
      <span>群聊</span>
    </div>
    <div class="chat-item" :class="{ active: currentTarget === null }" @click="$emit('selectTarget', null)">
      <span class="chat-icon">💬</span>
      <span class="chat-name">群聊</span>
    </div>

    <div class="section-title">
      <span>在线用户 ({{ onlineUsers.length }})</span>
    </div>
    <div
      v-for="user in filteredOnlineUsers"
      :key="user.id"
      class="chat-item"
      :class="{ active: currentTarget === user.id }"
      @click="$emit('selectTarget', user.id)"
    >
      <UserAvatar :avatar="user.avatar" :size="32" />
      <div class="user-meta">
        <span class="chat-name">{{ user.username }}</span>
        <span class="online-dot"></span>
      </div>
      <span v-if="getUnreadCount(user.id) > 0" class="unread-badge">
        {{ getUnreadCount(user.id) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import type { SocketUser, UnreadCount, UserPublic } from '../types'

const props = defineProps<{
  currentUser: UserPublic | null
  onlineUsers: SocketUser[]
  unreadCounts: UnreadCount[]
  currentTarget: number | null
}>()

defineEmits<{
  selectTarget: [targetId: number | null]
  logout: []
}>()

// Filter out the current user from the online users list
const filteredOnlineUsers = computed(() => {
  return props.onlineUsers.filter(u => u.id !== props.currentUser?.id)
})

function getUnreadCount(userId: number): number {
  const entry = props.unreadCounts.find(u => u.targetId === userId)
  return entry ? entry.count : 0
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #1e293b;
  border-right: 1px solid #334155;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
  flex: 1;
  min-width: 0;
}
.user-details {
  min-width: 0;
}
.username {
  font-weight: 600;
  font-size: 0.95rem;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bio {
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}
.logout-btn:hover {
  background: #334155;
}
.section-title {
  padding: 12px 16px 4px;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.chat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.chat-item:hover {
  background: #334155;
}
.chat-item.active {
  background: #172554;
  border-right: 3px solid #3b82f6;
}
.chat-icon {
  font-size: 1.2rem;
}
.chat-name {
  flex: 1;
  font-size: 0.9rem;
  color: #e2e8f0;
}
.user-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.online-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  flex-shrink: 0;
}
.unread-badge {
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>
