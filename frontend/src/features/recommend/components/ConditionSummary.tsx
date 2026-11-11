import { getCategoryLabel, getTransportLabel } from '../../../shared/types/domain'
import { addMinutesToTime, formatMinutes } from '../../../shared/utils/format'
import { isRandomCondition, useConditionStore } from '../../condition/store'

/** 조건 요약 칩 (RES-01 ①) */
export default function ConditionSummary() {
  const condition = useConditionStore()
  const { origin, destination, startTime, availableMinutes, transportType, categories } = condition

  const labels = [
    `${origin?.name ?? '출발지 미정'} 출발`,
    ...(destination ? [`${destination.name} 도착`] : []),
    `${startTime}~${addMinutesToTime(startTime, availableMinutes)} (${formatMinutes(availableMinutes)})`,
    getTransportLabel(transportType),
    ...(isRandomCondition(condition) ? ['랜덤 추천'] : categories.map(getCategoryLabel)),
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
