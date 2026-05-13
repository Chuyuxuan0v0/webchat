import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserPublic } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserPublic | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  function setAuth(t: string, u: UserPublic) {
    token.value = t
    user.value = u
    localStorage.setItem('token', t)
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, token, setAuth, logout }
})
