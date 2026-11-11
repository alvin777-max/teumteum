import { NavLink } from 'react-router'
import { useAuthStore } from '../auth/authStore'

/**
 * 하단바: 홈·주변 탐색 화면에만 고정 (화면설계서 v2.0)
 * 비로그인 상태에서 '저장한 코스'를 누르면 보호 라우트가 로그인 화면으로 보낸다.
 */
export default function BottomNav() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const items = [
    { to: '/', label: '홈', icon: '🏠', end: true },
    { to: '/nearby', label: '주변 탐색', icon: '📍', end: false },
    { to: '/mypage/courses', label: '저장한 코스', icon: '🔖', end: false },
    isLoggedIn
      ? { to: '/mypage', label: '마이', icon: '👤', end: true }
      : { to: '/login', label: '로그인', icon: '👤', end: true },
  ]

  return (
    <nav className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-line bg-white pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${isActive ? 'font-bold text-primary' : 'text-neutral-500'}`
          }
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
