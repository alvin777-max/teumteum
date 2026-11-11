import { Link } from 'react-router'
import { useConditionStore } from '../store'

/**
 * 출발지(필수)·도착지(선택) 입력란. 누르면 위치 설정(CON-02)으로 이동.
 * 도착지를 비우면 출발지 주변에서 끝나는 코스 (돌아오는 시간은 계산 안 함)
 */
export default function LocationFields() {
  const origin = useConditionStore((s) => s.origin)
  const destination = useConditionStore((s) => s.destination)

  return (
    <div className="flex flex-col gap-2">
      <LocationRow to="/condition/location?type=origin" label="출발지" tag="필수" value={origin?.name} placeholder="출발지를 설정해 주세요" />
      <LocationRow to="/condition/location?type=destination" label="도착지" tag="선택" value={destination?.name} placeholder="입력 안 함" />
      {origin === null && <p className="text-xs text-neutral-400">위치를 사용할 수 없어요. 출발지를 직접 설정해 주세요.</p>}
      {destination === null && <p className="text-xs text-neutral-400">도착지를 비우면 출발지 주변에서 끝나는 코스를 추천해요.</p>}
    </div>
  )
}

interface LocationRowProps {
  to: string
  label: string
  tag: string
  value?: string
  placeholder: string
}

function LocationRow({ to, label, tag, value, placeholder }: LocationRowProps) {
  return (
    <Link to={to} className="flex h-12 items-center gap-3 rounded-xl border border-line px-4 text-sm">
      <span className="w-12 shrink-0 font-semibold text-neutral-500">{label}</span>
      <span className={`flex-1 truncate ${value ? 'text-neutral-800' : 'text-neutral-400'}`}>{value ?? placeholder}</span>
      <span className="shrink-0 text-xs text-neutral-400">{tag}</span>
    </Link>
  )
}
