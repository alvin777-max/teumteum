import { getCategoryLabel, getTransportLabel } from '../../../shared/types/domain'
import { formatTimeRange } from '../../../shared/utils/format'
import { isRandomCondition, useConditionStore } from '../../condition/store'

/** 조건 요약 칩: 위치 · 시간 · 이동수단 · 카테고리 (RES-01 ①). 랜덤이면 '랜덤 추천' 칩 */
export default function ConditionSummary() {
  const condition = useConditionStore()
  const { origin, destination, startTime, availableMinutes, transportType, categories } = condition

  const labels = [
    destination ? `${origin?.name ?? '출발지 미정'} → ${destination.name}` : `${origin?.name ?? '출발지 미정'} 출발`,
    formatTimeRange(startTime, availableMinutes),
    getTransportLabel(transportType),
    isRandomCondition(condition) ? '랜덤 추천' : categories.map(getCategoryLabel).join(' + '),
  ]

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <span key={label} className="rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
          {label}
        </span>
      ))}
    </div>
  )
}
