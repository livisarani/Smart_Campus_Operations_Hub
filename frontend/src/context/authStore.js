// src/context/authStore.js
import { create } from 'zustand'
import axios from 'axios'
import { authApi } from '../api/index.js'

const normalizeUser = (user) => {
  if (!user) return null
  return {
    ...user,
    name: user.name || user.fullName || user.username,
    roles: user.roles || (user.role ? [user.role] : []),
    provider: user.provider || 'LOCAL',
  }
}

const syncAuthHeaders = (token, user) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common.Authorization
  }

  if (user?.email) localStorage.setItem('userEmail', user.email)
  if (user?.name) localStorage.setItem('userName', user.name)
}

const clearLegacyUserHeaders = () => {
  delete axios.defaults.headers.common.Authorization
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userName')
}

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initAuth: async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) { clearLegacyUserHeaders(); set({ loading: false }); return }
    try {
      const { data } = await authApi.getMe()
      const normalized = normalizeUser(data)
      syncAuthHeaders(token, normalized)
      set({ user: normalized, isAuthenticated: true, loading: false })
    } catch {
      localStorage.clear()
      clearLegacyUserHeaders()
      set({ user: null, isAuthenticated: false, loading: false })
    }
  },

  setTokensAndUser: (accessToken, refreshToken, user) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const normalized = normalizeUser(user)
    syncAuthHeaders(accessToken, normalized)
    set({ user: normalized, isAuthenticated: true, loading: false })
  },

  loginWithPassword: async (username, password) => {
    const { data } = await authApi.login({ username, password })
    localStorage.setItem('accessToken', data.token)
    localStorage.setItem('refreshToken', data.token)
    const normalized = normalizeUser(data)
    syncAuthHeaders(data.token, normalized)
    set({ user: normalized, isAuthenticated: true, loading: false })
  },

  logout: async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    localStorage.clear()
    clearLegacyUserHeaders()
    set({ user: null, isAuthenticated: false })
  },

  hasRole: (role) => {
    const { user } = get()
    return user?.roles?.includes(role) ?? false
  },

  isAdmin: () => get().hasRole('ADMIN'),
}))

export default useAuthStore
