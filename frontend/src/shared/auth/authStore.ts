import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface AuthUser {
  email: string
  nickname: string
}

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  isLoggedIn: boolean
  setLogin: (accessToken: string, user: AuthUser) => void
  updateUser: (user: Partial<AuthUser>) => void
  logout: () => void
}

/**
 * 로그인 상태. 새로고침해도 유지되도록 localStorage 에 저장한다.
 * shared/api/client.ts 가 이 토큰을 요청 헤더에 붙인다.
 * TODO(김용현): 로그인 API 연동 후 토큰 만료·재발급 처리
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isLoggedIn: false,
      setLogin: (accessToken, user) => set({ accessToken, user, isLoggedIn: true }),
      updateUser: (user) => set((state) => ({ user: state.user ? { ...state.user, ...user } : null })),
      logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
    }),
    { name: 'teumteum-auth', storage: createJSONStorage(() => localStorage) },
  ),
)
