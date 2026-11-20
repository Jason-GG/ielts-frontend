import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getAuthToken, setAuthToken } from '../api/client'
import type { PlatformUser, UserMembership } from '../types'

export interface BookingModalTarget {
  serviceType: 'speaking_mock' | 'self_study_camp' | 'tutor_onboarding'
  title: string
  planName?: string
}

interface AuthContextValue {
  user: PlatformUser | null
  loading: boolean
  loginOpen: boolean
  membershipOpen: boolean
  bookingTarget: BookingModalTarget | null
  openLoginModal: () => void
  closeLoginModal: () => void
  openMembershipModal: () => void
  closeMembershipModal: () => void
  openBookingModal: (target: BookingModalTarget) => void
  closeBookingModal: () => void
  loginWithPassword: (account: string, password: string) => Promise<void>
  registerAccount: (payload: {
    username: string
    password: string
    display_name?: string
    email?: string
    phone?: string
  }) => Promise<void>
  loginWithDemoWechat: () => Promise<void>
  logout: () => Promise<void>
  updateMemberships: (memberships: UserMembership[]) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(getAuthToken()))
  const [loginOpen, setLoginOpen] = useState(false)
  const [membershipOpen, setMembershipOpen] = useState(false)
  const [bookingTarget, setBookingTarget] = useState<BookingModalTarget | null>(null)

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }
    api
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const loginWithPassword = useCallback(async (account: string, password: string) => {
    const res = await api.login({ account, password })
    setAuthToken(res.token)
    setUser(res.user)
    setLoginOpen(false)
  }, [])

  const registerAccount = useCallback(
    async (payload: { username: string; password: string; display_name?: string; email?: string; phone?: string }) => {
      const res = await api.register(payload)
      setAuthToken(res.token)
      setUser(res.user)
      setLoginOpen(false)
    },
    [],
  )

  const loginWithDemoWechat = useCallback(async () => {
    const res = await api.demoWechatLogin()
    setAuthToken(res.token)
    setUser(res.user)
    setLoginOpen(false)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // ignore logout network errors
    }
    setAuthToken(null)
    setUser(null)
  }, [])

  const updateMemberships = useCallback((memberships: UserMembership[]) => {
    setUser((prev) => (prev ? { ...prev, memberships, is_vip: memberships.length > 0 } : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginOpen,
        membershipOpen,
        bookingTarget,
        openLoginModal: () => setLoginOpen(true),
        closeLoginModal: () => setLoginOpen(false),
        openMembershipModal: () => setMembershipOpen(true),
        closeMembershipModal: () => setMembershipOpen(false),
        openBookingModal: (target) => setBookingTarget(target),
        closeBookingModal: () => setBookingTarget(null),
        loginWithPassword,
        registerAccount,
        loginWithDemoWechat,
        logout,
        updateMemberships,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
