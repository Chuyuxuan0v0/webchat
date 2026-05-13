<template>
  <div class="message" :class="{ 'message-own': isOwn, 'message-other': !isOwn, 'message-system': isSystem }">
    <template v-if="isSystem">
      <div class="system-text">{{ message.content }}</div>
    </template>
    <template v-else>
      <UserAvatar v-if="!isOwn" :avatar="message.avatar" :size="36" />
      <div class="bubble-wrapper">
        <div v-if="!isOwn" class="sender-name">{{ message.username }}</div>
        <div class="bubble" :class="{ 'bubble-own': isOwn, 'bubble-other': !isOwn }">
          <template v-if="message.type === 'image'">
            <img :src="imageUrl" class="message-image" @load="$emit('loaded')" />
          </template>
          <template v-else>
            <div v-if="message.format === 'markdown'" v-html="renderedContent" class="markdown-content"></div>
            <div v-else class="text-content">{{ message.content }}</div>
          </template>
        </div>
        <div class="message-time">{{ formatTime(message.createdAt) }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import UserAvatar from './UserAvatar.vue'
import type { MessageResponse } from '../types'

const props = defineProps<{
  message: MessageResponse
  currentUserId: number
}>()

defineEmits<{ loaded: [] }>()

const isOwn = computed(() => props.message.userId === props.currentUserId)
const isSystem = computed(() => props.message.userId === 0)

const imageUrl = computed(() => {
  if (props.message.content.startsWith('/uploads')) return props.message.content
  return props.message.content
})

const renderedContent = computed(() => {
  if (props.message.format === 'markdown') {
    const rawHtml = marked(props.message.content) as string
    return DOMPurify.sanitize(rawHtml)
  }
  return DOMPurify.sanitize(props.message.content)
})

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' + time
}
</script>

<style scoped>
.message {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  align-items: flex-start;
}
.message-own {
  flex-direction: row-reverse;
}
.message-system {
  justify-content: center;
}
.system-text {
  color: #64748b;
  font-size: 0.8rem;
  background: #1e293b;
  padding: 4px 12px;
  border-radius: 12px;
}
.bubble-wrapper {
  max-width: 65%;
}
.sender-name {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
  padding-left: 4px;
}
.bubble {
  padding: 10px 14px;
  border-radius: 12px;
  word-break: break-word;
  line-height: 1.5;
}
.bubble-other {
  background: #1e293b;
  color: #e2e8f0;
  border-top-left-radius: 4px;
}
.bubble-own {
  background: #3b82f6;
  color: #fff;
  border-top-right-radius: 4px;
}
.message-time {
  font-size: 0.7rem;
  color: #475569;
  margin-top: 4px;
  padding: 0 4px;
}
.message-own .message-time {
  text-align: right;
}
.message-image {
  max-width: 240px;
  max-height: 240px;
  border-radius: 8px;
  display: block;
}
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 8px 0 4px;
}
.markdown-content :deep(code) {
  background: rgba(0,0,0,0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
.markdown-content :deep(pre) {
  background: rgba(0,0,0,0.2);
  padding: 8px 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
}
.markdown-content :deep(a) {
  color: #93c5fd;
}
</style>
