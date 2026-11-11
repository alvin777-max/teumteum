import { useState } from 'react'
import { getCategoryLabel } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { buildSchedule, type Course, type CoursePlace } from '../types'

interface CourseScheduleProps {
  course: Course
  /** 넘기면 장소마다 '교체' 버튼 표시 (DET-01). 저장한 코스 상세(MY-03)에서는 넘기지 않는다 */
  onReplace?: (place: CoursePlace) => void
}

/** 코스 일정: 출발지 → 장소(방문 순서) → 도착지 (DET-01 ②, MY-03) */
export default function CourseSchedule({ course, onReplace }: CourseScheduleProps) {
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null)

  const { rows, endTime } = buildSchedule(course)

  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-line pl-5">
      <Point label="S" title={course.origin.name} sub={`${course.startTime} 출발`} />

      {rows.map(({ place, arrive, leave }) => {
        const open = openPlaceId === place.placeId
        return (
          <li key={place.placeId} className="relative">
            <p className="mb-1 text-xs text-neutral-400">↓ 이동 {formatMinutes(place.travelMinutes)}</p>
            <span className="absolute top-6 -left-[31px] flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {place.visitOrder}
            </span>
            <div className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setOpenPlaceId(open ? null : place.placeId)}
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={open}
                >
                  <p className="truncate font-bold">{place.name}</p>
                  <p className="text-xs text-neutral-500">
                    {getCategoryLabel(place.category)} › {place.subCategory}
                  </p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {arrive}–{leave} · 체류 {formatMinutes(place.stayMinutes)}
                  </p>
                </button>
                {onReplace && (
                  <button
                    type="button"
                    onClick={() => onReplace(place)}
                    className="shrink-0 rounded-lg border border-line px-2.5 py-1 text-xs"
                  >
                    교체
                  </button>
                )}
              </div>

              {open && (
                <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-xs text-neutral-600">
                  <div className="aspect-video rounded-lg bg-neutral-200">
                    {place.imageUrl && <img src={place.imageUrl} alt="" className="size-full rounded-lg object-cover" />}
                  </div>
                  <p>📍 {place.address}</p>
                  {place.openingHours && <p>🕒 {place.openingHours}</p>}
                  {place.description && <p>{place.description}</p>}
                </div>
              )}
            </div>
          </li>
        )
      })}

      {course.destination && (
        <>
          <p className="text-xs text-neutral-400">↓ 이동 {formatMinutes(course.finalTravelMinutes)}</p>
          <Point label="E" title={course.destination.name} sub={`${endTime} 도착`} />
        </>
      )}
    </ol>
  )
}

function Point({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <li className="relative">
      <span className="absolute top-0.5 -left-[31px] flex size-5 items-center justify-center rounded-full bg-neutral-700 text-[11px] font-bold text-white">
        {label}
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-neutral-500">{sub}</p>
    </li>
  )
}
