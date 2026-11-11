import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import EmptyState from '../../../shared/components/EmptyState'
import { CATEGORIES, getCategoryLabel, type CategoryCode } from '../../../shared/types/domain'
import { MOCK_NEARBY } from '../mock'

const RADIUS_OPTIONS = [500, 1000, 3000]

type SheetLevel = 'half' | 'full'

interface NearbySheetProps {
  /** 위치 권한 거부 여부 */
  denied: boolean
  radius: number
  onRadiusChange: (radius: number) => void
}

/**
 * 주변 장소 탐색 바텀시트 (HOM-02): 반만 / 전체 / 내리기(홈으로)
 * TODO: 주변 장소 API 연동, 마커 누르면 카드 강조, 장소 상세 화면 연결 (현재 목업 코스 상세로 이동)
 */
export default function NearbySheet({ denied, radius, onRadiusChange }: NearbySheetProps) {
  const navigate = useNavigate()
  const [level, setLevel] = useState<SheetLevel>('half')
  const [category, setCategory] = useState<CategoryCode | null>(null)

  const places = MOCK_NEARBY.filter((p) => p.distance <= radius && (category === null || p.category === category))

  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-2xl bg-white shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-[height] ${
        level === 'half' ? 'h-[50%]' : 'h-[calc(100%-5rem)]'
      }`}
    >
      {/* 손잡이: 누르면 반만 ↔ 전체 */}
      <button
        type="button"
        aria-label={level === 'half' ? '시트 펼치기' : '시트 반만 보기'}
        onClick={() => setLevel(level === 'half' ? 'full' : 'half')}
        className="flex h-6 shrink-0 items-center justify-center"
      >
        <span className="h-1 w-10 rounded-full bg-neutral-300" />
      </button>

      <div className="flex items-center justify-between px-4 pb-2">
        <h2 className="font-bold">주변 장소</h2>
        <div className="flex items-center gap-2">
          <select
            value={radius}
            onChange={(e) => onRadiusChange(Number(e.target.value))}
            aria-label="반경"
            className="h-8 rounded-lg border border-line px-2 text-xs"
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r < 1000 ? `${r}m` : `${r / 1000}km`}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => navigate('/')} className="text-xs text-neutral-500">
            내리기
          </button>
        </div>
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
        {denied ? (
          <EmptyState message="주변 장소를 보려면 위치 권한이 필요해요. 브라우저 설정에서 허용해 주세요." />
        ) : places.length === 0 ? (
          <EmptyState message="이 반경에 장소가 없어요. 반경을 넓혀보세요." />
        ) : (
          <ul className="flex flex-col gap-2">
            {places.map((place) => (
              <li key={place.placeId}>
                <Link to="/results/mock-3" className="flex gap-3 rounded-xl border border-line p-3">
                  <div className="size-14 shrink-0 rounded-lg bg-neutral-200" />
                  <div className="flex flex-col justify-center">
                    <p className="font-semibold">{place.name}</p>
                    <p className="text-xs text-neutral-500">
                      {getCategoryLabel(place.category)} · {place.distance < 1000 ? `${place.distance}m` : `${(place.distance / 1000).toFixed(1)}km`}
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
