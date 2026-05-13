<template>
  <div class="chat-input">
    <div class="input-toolbar">
      <button class="toolbar-btn" @click="$emit('toggleEmoji')" title="表情">
        😊
      </button>
      <label class="toolbar-btn" title="上传图片">
        📷
        <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="handleImageUpload" hidden />
      </label>
      <button class="toolbar-btn" :class="{ active: isMarkdown }" @click="isMarkdown = !isMarkdown" title="切换 Markdown">
        MD
      </button>
    </div>
    <div class="input-area">
      <div
        ref="inputRef"
        class="text-input"
        contenteditable
        :data-placeholder="placeholder"
        @keydown="handleKeydown"
        @input="handleInput"
      ></div>
      <button class="send-btn" @click="handleSend" :disabled="!canSend">
        发送
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [content: string, format: 'plain' | 'markdown']
  sendImage: [file: File]
  toggleEmoji: []
}>()

const inputRef = ref<HTMLDivElement>()
const isMarkdown = ref(false)
const textContent = ref('')

const canSend = computed(() => textContent.value.trim().length > 0)

function handleInput() {
  textContent.value = inputRef.value?.innerText || ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const content = textContent.value.trim()
  if (!content) return
  emit('send', content, isMarkdown.value ? 'markdown' : 'plain')
  if (inputRef.value) {
    inputRef.value.innerText = ''
    textContent.value = ''
  }
}

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    emit('sendImage', file)
    ;(e.target as HTMLInputElement).value = ''
  }
}
</script>

<style scoped>
.chat-input {
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 12px 16px;
}
.input-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.toolbar-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  color: #94a3b8;
  transition: background 0.2s;
}
.toolbar-btn:hover {
  background: #334155;
}
.toolbar-btn.active {
  background: #3b82f6;
  color: #fff;
}
.input-area {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}
.text-input {
  flex: 1;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 10px 12px;
  color: #e2e8f0;
  font-size: 0.95rem;
  min-height: 40px;
  max-height: 120px;
  overflow-y: auto;
  outline: none;
  line-height: 1.5;
}
.text-input:empty::before {
  content: attr(data-placeholder);
  color: #475569;
}
.text-input:focus {
  border-color: #3b82f6;
}
.send-btn {
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}
.send-btn:hover:not(:disabled) {
  background: #2563eb;
}
.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
