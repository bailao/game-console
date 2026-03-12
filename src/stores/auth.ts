import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  username: string
  nickname: string
  role: 'admin' | 'editor' | 'viewer'
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('userInfo') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)

  function login(credentials: { username: string; password: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      // Mock login - in production this would call an API
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        const mockToken = 'mock-jwt-token-' + Date.now()
        const mockUser: UserInfo = {
          id: 1,
          username: 'admin',
          nickname: '超级管理员',
          role: 'admin',
        }
        token.value = mockToken
        userInfo.value = mockUser
        localStorage.setItem('token', mockToken)
        localStorage.setItem('userInfo', JSON.stringify(mockUser))
        resolve()
      } else {
        reject(new Error('用户名或密码错误'))
      }
    })
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout,
  }
})
