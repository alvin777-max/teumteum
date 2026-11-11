import { useEffect } from 'react'
import { Link } from 'react-router'

interface ToastProps {
  message: string
  /** 메시지 옆 링크 (예: '저장한 코스 보기') */
  action?: { label: string; to: string }
  onClose: () => void
  /** 자동으로 닫히기까지 시간(ms) */
  duration?: number
}

export default function Toast({ message, action, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-30 mx-auto flex w-[calc(100%-2rem)] max-w-112 items-center justify-between gap-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg"
    >
      <span>{message}</span>
      {action && (
        <Link to={action.to} className="shrink-0 font-semibold text-primary-light underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
