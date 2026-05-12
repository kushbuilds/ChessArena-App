import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi, userApi } from '../services/api'
import { User } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('chess_token')
    const savedUser = localStorage.getItem('chess_user')
    if (saved && savedUser) {
      setToken(saved)
      try { setUser(JSON.parse(savedUser)) } catch {}
      userApi.getProfile(JSON.parse(savedUser).username)
        .then(u => setUser(u))
        .catch(() => { localStorage.removeItem('chess_token'); localStorage.removeItem('chess_user') })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    const data = await authApi.login(username, password)
    localStorage.setItem('chess_token', data.token)
    const profile = await userApi.getProfile(data.username)
    localStorage.setItem('chess_user', JSON.stringify(profile))
    setToken(data.token)
    setUser(profile)
  }

  const register = async (username: string, email: string, password: string) => {
    const data = await authApi.register(username, email, password)
    localStorage.setItem('chess_token', data.token)
    const profile = await userApi.getProfile(data.username)
    localStorage.setItem('chess_user', JSON.stringify(profile))
    setToken(data.token)
    setUser(profile)
  }

  const logout = () => {
    localStorage.removeItem('chess_token')
    localStorage.removeItem('chess_user')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!user) return
    const profile = await userApi.getProfile(user.username)
    setUser(profile)
    localStorage.setItem('chess_user', JSON.stringify(profile))
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
