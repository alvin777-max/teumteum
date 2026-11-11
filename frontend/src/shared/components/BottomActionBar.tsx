import type { ReactNode } from 'react'

/** 화면 하단 고정 버튼 영역 (버튼 1~2개) */
export default function BottomActionBar({ children }: { children: ReactNode }) {
  return <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-line bg-white p-4">{children}</div>
}
