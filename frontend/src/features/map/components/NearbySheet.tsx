import { useRef, useState, type PointerEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import EmptyState from '../../../shared/components/EmptyState'
import { CATEGORIES, getCategoryIcon, getCategoryLabel, type CategoryCode } from '../../../shared/types/domain'
import { formatDistance, MOCK_NEARBY, walkMinutes } from '../mock'

const RADIUS_OPTIONS = [500, 1000, 3000]

type SheetLevel = 'half' | 'full'

/** 손잡이를 이만큼(px) 이상 끌면 단계를 바꾼다 */
const DRAG_THRESHOLD = 40

interface NearbySheetProps {
  radius: number
  onRadiusChange: (radius: number) => void
}

/**
 * 주변 장소 탐색 바텀시트 (HOM-02): 손잡이를 끌어 반만 / 전체 / 내리기(홈으로) 3단계.
 * 장소 카드를 누르면 장소 1곳짜리 상세(DET-01)로 이동한다.
 * TODO(정종일): 주변 장소 API 연동 / TODO(유지수): 마커 누르면 해당 카드 강조
 */
export default function NearbySheet({ radius, onRadiusChange }: NearbySheetProps) {
  const navigate = useNavigate()
  const [level, setLevel] = useState<SheetLevel>('half')
  const [category, setCategory] = useState<CategoryCode | null>(null)
  const dragStartY = useRef<number | null>(null)

  const places = MOCK_NEARBY.filter((p) => p.distance <= radius && (category === null || p.category === category))

  const onPointerDown = (e: PointerEvent) => {
    dragStartY.current = e.clientY
  }
  const onPointerUp = (e: PointerEvent) => {
    if (dragStartY.current === null) return
    const dy = e.clientY - dragStartY.current
    dragStartY.current = null
    if (Math.abs(dy) < DRAG_THRESHOLD) {
      // 짧게 누르면 반만 ↔ 전체
      setLevel(level === 'half' ? 'full' : 'half')
    } else if (dy < 0) {
      setLevel('full')
    } else if (level === 'full') {
      setLevel('half')
    } else {
      // 반만 상태에서 끝까지 내리면 홈으로
      navigate('/')
    }
  }

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-[height] ${
        level === 'half' ? 'h-[50%]' : 'h-[calc(100%-5rem)]'
      }`}
    >
      <button
        type="button"
        aria-label="시트 높이 조절 (끌어서 펼치기·내리기)"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="flex h-7 shrink-0 touch-none items-center justify-center"
      >
        <span className="h-1 w-10 rounded-full bg-neutral-300" />
      </button>

      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="font-bold">내 주변 장소</h2>
        <select
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          aria-label="반경"
          className="h-8 rounded-lg border border-line px-2 text-xs"
        >
          {RADIUS_OPTIONS.map((r) => (
            <option key={r} value={r}>
              반경 {formatDistance(r)}
            </option>
          ))}
        </select>
      </div>

      <div className="px-4 pb-2">
        <ChipGroup>
          <Chip selected={category === null} onClick={() => setCategory(null)}>
            전체
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.code} selected={category === c.code} onClick={() => setCategory(c.code)}>
              {c.label}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {places.length === 0 ? (
          <EmptyState message="이 반경에 장소가 없어요. 반경을 넓혀보세요." />
        ) : (
          <ul className="flex flex-col gap-2">
            {places.map((place) => (
              <li key={place.placeId}>
                <Link to={`/results/place-${place.placeId}`} className="flex gap-3 rounded-xl border border-line p-3">
                  <div aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl">
                    {getCategoryIcon(place.category)}
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="font-semibold">{place.name}</p>
                    <p className="text-xs text-neutral-500">
                      {getCategoryLabel(place.category)} · {formatDistance(place.distance)} · 도보 {walkMinutes(place.distance)}분
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
