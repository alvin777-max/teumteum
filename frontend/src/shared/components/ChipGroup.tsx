import type { ReactNode } from 'react'

interface ChipGroupProps {
  children: ReactNode
  /** true면 가로 스크롤, false면 줄바꿈 */
  scroll?: boolean
}

export default function ChipGroup({ children, scroll = true }: ChipGroupProps) {
  return (
    <div className={`flex gap-2 ${scroll ? 'overflow-x-auto [scrollbar-width:none]' : 'flex-wrap'}`}>{children}</div>
  )
}
