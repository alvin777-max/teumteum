import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'

interface AppHeaderProps {
  title?: ReactNode
  showBack?: boolean
  /** 우측 액션 (프로필·설정·찜 등) */
  right?: ReactNode
}

export default function AppHeader({ title, showBack = true, right }: AppHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-1 border-b border-line bg-white px-2">
      {showBack && (
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center text-xl"
        >
          ←
        </button>
      )}
      <h1 className="flex-1 truncate px-2 text-base font-bold">{title}</h1>
      {right && <div className="flex items-center">{right}</div>}
    </header>
  )
}
