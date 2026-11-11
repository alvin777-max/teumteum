import { Link } from 'react-router'
import { useConditionStore } from '../store'

/** 출발지(필수)·도착지(선택) 입력란. 누르면 위치 설정(CON-02)으로 이동 */
export default function LocationFields() {
  const origin = useConditionStore((s) => s.origin)
  const destination = useConditionStore((s) => s.destination)

  return (
    <div className="flex flex-col gap-2">
      <LocationRow to="/condition/location?type=origin" label="출발" value={origin?.name} placeholder="출발지를 설정해 주세요 (필수)" />
      <LocationRow to="/condition/location?type=destination" label="도착" value={destination?.name} placeholder="선택 안 함" />
      {origin === null && (
        <p className="text-xs text-neutral-400">현재 위치를 쓸 수 없으면 출발지를 직접 설정해 주세요.</p>
      )}
    </div>
  )
}

function LocationRow({ to, label, value, placeholder }: { to: string; label: string; value?: string; placeholder: string }) {
  return (
    <Link to={to} className="flex h-12 items-center gap-3 rounded-xl border border-line px-4 text-sm">
      <span className="w-8 shrink-0 font-semibold text-neutral-500">{label}</span>
      <span className={value ? 'text-neutral-800' : 'text-neutral-400'}>{value ?? placeholder}</span>
    </Link>
  )
}
