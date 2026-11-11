import type { ReactNode } from 'react'

interface ChipProps {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
}

/** 카테고리·반경·세부 카테고리 등 선택용 칩. 단일/복수 선택은 쓰는 쪽에서 정한다. */
export default function Chip({ selected = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-sm whitespace-nowrap ${
        selected ? 'border-primary bg-primary-light font-semibold text-primary' : 'border-line bg-white text-neutral-600'
      }`}
    >
      {children}
    </button>
  )
}
