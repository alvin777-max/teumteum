import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuthStore } from './authStore'

/** 로그인 후 돌아갈 곳. 로그인 화면이 location.state 로 받는다 */
export interface LoginRedirectState {
  from: string
  /** 'save': 코스 저장 중이었음 → 로그인 후 저장을 이어서 진행 */
  pendingAction?: 'save'
}

/** 회원 전용 화면을 감싼다. 비로그인이면 로그인 화면으로 보내고, 로그인 후 원래 화면으로 돌아온다 */
export default function RequireAuth() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const location = useLocation()

  if (!isLoggedIn) {
    const state: LoginRedirectState = { from: location.pathname }
    return <Navigate to="/login" replace state={state} />
  }
  return <Outlet />
}
