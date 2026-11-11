import { useState } from 'react'
import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import { formatMinutes } from '../../../shared/utils/format'
import { findMockCourse, MOCK_ALTERNATIVES } from '../mock'

interface PlaceReplaceProps {
  courseId: string
  placeId: string
}

/**
 * 장소 교체 (DET-03): 같은 세분류 위주, 남은 시간에 들어가는 곳만 표시
 * TODO(나혜빈): 대체 장소 API 연동, 교체 후 코스 재계산
 */
export default function PlaceReplace({ courseId, placeId }: PlaceReplaceProps) {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const current = findMockCourse(courseId)?.places.find((p) => p.placeId === placeId)
  if (!current) return <EmptyState message="교체할 장소를 찾을 수 없습니다." />

  return (
    <>
      <div className="flex flex-col gap-5 px-4 py-5">
        <p className="text-lg font-bold">이 장소만 바꿔볼까요?</p>

        <section className="rounded-xl bg-neutral-100 p-4 text-sm">
          <p className="text-xs text-neutral-500">현재 장소</p>
          <p className="mt-1 font-bold">{current.name}</p>
          <p className="text-xs text-neutral-500">
            {current.subCategory} · 체류 {formatMinutes(current.stayMinutes)}
          </p>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold">대체 장소</h3>
          <ul className="flex flex-col gap-2">
            {MOCK_ALTERNATIVES.map((alt) => (
              <li key={alt.placeId}>
                <button
                  type="button"
                  aria-pressed={selectedId === alt.placeId}
                  onClick={() => setSelectedId(alt.placeId)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${
                    selectedId === alt.placeId ? 'border-primary bg-primary-light' : 'border-line'
                  }`}
                >
                  <span>
                    <span className="block font-semibold">{alt.name}</span>
                    <span className="text-xs text-neutral-500">
                      {alt.subCategory} · 체류 {formatMinutes(alt.stayMinutes)} · 이동 {formatMinutes(alt.travelMinutes)}
                    </span>
                  </span>
                  <span className={`text-sm font-semibold ${alt.diffMinutes > 0 ? 'text-red-500' : 'text-primary'}`}>
                    {alt.diffMinutes > 0 ? '+' : '−'}
                    {formatMinutes(Math.abs(alt.diffMinutes))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BottomActionBar>
        <Button disabled={selectedId === null} onClick={() => navigate(`/results/${courseId}`, { replace: true })}>
          이 장소로 교체
        </Button>
      </BottomActionBar>
    </>
  )
}
