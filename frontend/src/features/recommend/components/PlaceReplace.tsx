import { useState } from 'react'
import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import { getCategoryLabel } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { useConditionStore } from '../../condition/store'
import { mockAlternatives } from '../mock'
import { useCourse, useRecommendExpired, useRecommendStore } from '../store'
import { getLegMode } from '../types'
import ExpiredState from './ExpiredState'

interface PlaceReplaceProps {
  courseId: string
  placeId: string
}

/**
 * 장소 교체 (DET-03): 같은 카테고리 후보 중 코스에 없는 곳 5곳 정도, 앞뒤 장소와 가까운 순.
 * 교체하면 바뀐 앞뒤 구간만 다시 계산하고, 이용 시간을 넘으면 경고 후 상세로 돌아간다.
 * TODO(나혜빈): 대체 장소 API 연동 (현재 mock)
 */
export default function PlaceReplace({ courseId, placeId }: PlaceReplaceProps) {
  const navigate = useNavigate()
  const course = useCourse(courseId)
  const expired = useRecommendExpired()
  const replacePlace = useRecommendStore((s) => s.replacePlace)
  const availableMinutes = useConditionStore((s) => s.availableMinutes)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const current = course?.places.find((p) => p.placeId === placeId)
  if (!course || !current || expired) return <ExpiredState />

  const alternatives = mockAlternatives(current)

  const handleReplace = () => {
    const alternative = alternatives.find((a) => a.placeId === selectedId)
    if (!alternative) return
    const updated = replacePlace(course, placeId, alternative)
    // 이용 시간을 넘으면 상세 화면에서 경고 토스트를 띄운다. 0분 = 시간 제한 없음
    const overTime = availableMinutes > 0 && updated.totalMinutes > availableMinutes
    navigate(`/results/${courseId}`, { replace: true, state: overTime ? { replaceWarning: true } : null })
  }

  return (
    <>
      <div className="flex flex-col gap-5 px-4 py-5">
        <p className="text-lg font-bold">이 장소만 바꿔볼까요?</p>

        <section className="rounded-xl bg-neutral-100 p-4 text-sm">
          <p className="text-xs text-neutral-500">지금</p>
          <p className="mt-1 font-bold">{current.name}</p>
          <p className="text-xs text-neutral-500">
            {getCategoryLabel(current.category)} › {current.subCategory} · 체류 {formatMinutes(current.stayMinutes)}
          </p>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-bold">바꿀 수 있는 곳</h3>
          <ul className="flex flex-col gap-2">
            {alternatives.map((alt) => (
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
                      {getLegMode(course, alt.transitInfo)} {formatMinutes(alt.travelMinutes)}
                    </span>
                  </span>
                  <span className={`text-sm font-semibold ${alt.diffMinutes > 0 ? 'text-red-500' : 'text-primary'}`}>
                    총 시간 {alt.diffMinutes > 0 ? '+' : '−'}
                    {formatMinutes(Math.abs(alt.diffMinutes))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <BottomActionBar>
        <Button disabled={selectedId === null} onClick={handleReplace}>
          이 장소로 교체
        </Button>
      </BottomActionBar>
    </>
  )
}
