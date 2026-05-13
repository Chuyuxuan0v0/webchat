<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-header">
        <h1 class="auth-title">Webchat</h1>
        <p class="auth-subtitle">和你的朋友们实时聊天</p>
      </div>

      <div class="auth-tabs">
        <button
          :class="['tab', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'; clearError()"
        >
          登录
        </button>
        <button
          :class="['tab', { active: activeTab === 'register' }]"
          @click="activeTab = 'register'; clearError()"
        >
          注册
        </button>
      </div>

      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
      </div>

      <!-- Login Form -->
      <form v-if="activeTab === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-email">邮箱</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            placeholder="请输入邮箱"
            autocomplete="email"
          />
          <span v-if="errors.loginEmail" class="field-error">{{ errors.loginEmail }}</span>
        </div>

        <div class="form-group">
          <label for="login-password">密码</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          <span v-if="errors.loginPassword" class="field-error">{{ errors.loginPassword }}</span>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <!-- Register Form -->
      <form v-else class="auth-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-email">邮箱</label>
          <input
            id="reg-email"
            v-model="registerForm.email"
            type="email"
            placeholder="请输入邮箱"
            autocomplete="email"
          />
          <span v-if="errors.regEmail" class="field-error">{{ errors.regEmail }}</span>
        </div>

        <div class="form-group">
          <label for="reg-username">用户名</label>
          <input
            id="reg-username"
            v-model="registerForm.username"
            type="text"
            placeholder="请输入用户名"
            autocomplete="username"
          />
          <span v-if="errors.regUsername" class="field-error">{{ errors.regUsername }}</span>
        </div>

        <div class="form-group">
          <label for="reg-password">密码</label>
          <input
            id="reg-password"
            v-model="registerForm.password"
            type="password"
            placeholder="至少 6 个字符"
            autocomplete="new-password"
          />
          <span v-if="errors.regPassword" class="field-error">{{ errors.regPassword }}</span>
        </div>

        <div class="form-group">
          <label>选择头像</label>
          <div class="avatar-grid">
            <div
              :class="['avatar-option', { selected: registerForm.avatar === 'male' }]"
              @click="registerForm.avatar = 'male'; customAvatarUrl = ''"
            >
              <img :src="maleAvatar" alt="男生头像" />
              <div v-if="registerForm.avatar === 'male'" class="avatar-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <div
              :class="['avatar-option', { selected: registerForm.avatar === 'female' }]"
              @click="registerForm.avatar = 'female'; customAvatarUrl = ''"
            >
              <img :src="femaleAvatar" alt="女生头像" />
              <div v-if="registerForm.avatar === 'female'" class="avatar-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <label
              :class="['avatar-option', 'avatar-upload', { selected: registerForm.avatar === 'custom' }]"
            >
              <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="handleCustomAvatar" hidden />
              <div v-if="customAvatarUrl" class="custom-preview">
                <img :src="customAvatarUrl" alt="自定义头像" />
              </div>
              <div v-else class="upload-placeholder">
                <span class="upload-icon">+</span>
                <span class="upload-text">上传</span>
              </div>
              <div v-if="registerForm.avatar === 'custom'" class="avatar-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </label>
          </div>
          <span v-if="errors.regAvatar" class="field-error">{{ errors.regAvatar }}</span>
        </div>

        <div class="form-group">
          <label for="reg-bio">个性签名 <span class="optional">（选填）</span></label>
          <textarea
            id="reg-bio"
            v-model="registerForm.bio"
            placeholder="写一句话介绍自己..."
            rows="3"
          ></textarea>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../utils/api'
import type { AuthResponse } from '../types'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>('login')
const loading = ref(false)
const errorMsg = ref('')
const customAvatarUrl = ref('')
const customAvatarFile = ref<File | null>(null)

const maleAvatar = new URL('../assets/avatars/male.svg', import.meta.url).href
const femaleAvatar = new URL('../assets/avatars/female.svg', import.meta.url).href

const loginForm = reactive({
  email: '',
  password: '',
})

const registerForm = reactive({
  email: '',
  username: '',
  password: '',
  avatar: 'male',
  bio: '',
})

const errors = reactive({
  loginEmail: '',
  loginPassword: '',
  regEmail: '',
  regUsername: '',
  regPassword: '',
  regAvatar: '',
})

function clearError() {
  errorMsg.value = ''
  errors.loginEmail = ''
  errors.loginPassword = ''
  errors.regEmail = ''
  errors.regUsername = ''
  errors.regPassword = ''
  errors.regAvatar = ''
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateLogin(): boolean {
  let valid = true
  errors.loginEmail = ''
  errors.loginPassword = ''

  if (!loginForm.email) {
    errors.loginEmail = '请输入邮箱'
    valid = false
  } else if (!validateEmail(loginForm.email)) {
    errors.loginEmail = '请输入有效的邮箱地址'
    valid = false
  }

  if (!loginForm.password) {
    errors.loginPassword = '请输入密码'
    valid = false
  }

  return valid
}

function validateRegister(): boolean {
  let valid = true
  errors.regEmail = ''
  errors.regUsername = ''
  errors.regPassword = ''
  errors.regAvatar = ''

  if (!registerForm.email) {
    errors.regEmail = '请输入邮箱'
    valid = false
  } else if (!validateEmail(registerForm.email)) {
    errors.regEmail = '请输入有效的邮箱地址'
    valid = false
  }

  if (!registerForm.username) {
    errors.regUsername = '请输入用户名'
    valid = false
  } else if (registerForm.username.length < 2) {
    errors.regUsername = '用户名至少 2 个字符'
    valid = false
  }

  if (!registerForm.password) {
    errors.regPassword = '请输入密码'
    valid = false
  } else if (registerForm.password.length < 6) {
    errors.regPassword = '密码至少 6 个字符'
    valid = false
  }

  return valid
}

function handleCustomAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  customAvatarFile.value = file
  customAvatarUrl.value = URL.createObjectURL(file)
  registerForm.avatar = 'custom'
}

async function handleLogin() {
  clearError()
  if (!validateLogin()) return

  loading.value = true
  try {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      email: loginForm.email,
      password: loginForm.password,
    })
    authStore.setAuth(data.token, data.user)
    router.push('/')
  } catch (err: any) {
    const status = err.response?.status
    if (status === 401) {
      errorMsg.value = '邮箱或密码错误'
    } else if (status === 404) {
      errorMsg.value = '该邮箱未注册'
    } else {
      errorMsg.value = err.response?.data?.message || '登录失败，请重试'
    }
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  clearError()
  if (!validateRegister()) return

  loading.value = true
  try {
    let avatarValue = registerForm.avatar

    // Upload custom avatar if selected
    if (registerForm.avatar === 'custom' && customAvatarFile.value) {
      const formData = new FormData()
      formData.append('avatar', customAvatarFile.value)
      const uploadRes = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      avatarValue = uploadRes.data.url
    }

    const payload: any = {
      email: registerForm.email,
      username: registerForm.username,
      password: registerForm.password,
      avatar: avatarValue,
    }
    if (registerForm.bio.trim()) {
      payload.bio = registerForm.bio.trim()
    }

    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    authStore.setAuth(data.token, data.user)
    router.push('/')
  } catch (err: any) {
    const status = err.response?.status
    if (status === 409) {
      errorMsg.value = '该邮箱已被注册'
    } else {
      errorMsg.value = err.response?.data?.message || '注册失败，请重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #0f172a;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background: #1e293b;
  border-radius: 16px;
  padding: 40px 36px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid #334155;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.auth-tabs {
  display: flex;
  background: #0f172a;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 28px;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab:hover {
  color: #cbd5e1;
}

.tab.active {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.error-banner {
  background: #451a2a;
  border: 1px solid #7f1d1d;
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 20px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #cbd5e1;
}

.optional {
  color: #64748b;
  font-weight: 400;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e2e8f0;
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
  font-family: inherit;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #475569;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-group textarea {
  resize: vertical;
  min-height: 72px;
}

.field-error {
  font-size: 12px;
  color: #f87171;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 4px;
}

.avatar-upload {
  cursor: pointer;
  border: 2px dashed #475569;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-upload:hover {
  border-color: #3b82f6;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: #64748b;
}

.upload-icon {
  font-size: 24px;
  font-weight: 300;
  line-height: 1;
}

.upload-text {
  font-size: 11px;
}

.custom-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-option {
  position: relative;
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s ease, transform 0.15s ease;
}

.avatar-option:hover {
  transform: scale(1.1);
  border-color: #475569;
}

.avatar-option.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.avatar-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.avatar-check {
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-check svg {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.btn-primary {
  width: 100%;
  padding: 12px 24px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 28px 20px;
  }

  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
