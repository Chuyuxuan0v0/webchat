<template>
  <div class="avatar" :style="{ width: size + 'px', height: size + 'px' }">
    <img :src="avatarSrc" :alt="`头像`" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  avatar: string
  size?: number
}>()

const maleAvatar = new URL('../assets/avatars/male.svg', import.meta.url).href
const femaleAvatar = new URL('../assets/avatars/female.svg', import.meta.url).href

const avatarSrc = computed(() => {
  if (props.avatar === 'male') return maleAvatar
  if (props.avatar === 'female') return femaleAvatar
  // Custom uploaded avatar (starts with /uploads/)
  if (props.avatar.startsWith('/uploads/')) return props.avatar
  // Fallback
  return maleAvatar
})
</script>

<style scoped>
.avatar {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
