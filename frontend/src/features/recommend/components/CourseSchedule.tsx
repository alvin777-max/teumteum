import { useState } from 'react'
import { getCategoryLabel, getKakaoMapLink } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { buildSchedule, getLegMode, type Course, type CoursePlace } from '../types'
import PlaceThumbnail from './PlaceThumbnail'

interface CourseScheduleProps {
  course: Course
  /** 넘기면 장소마다 '교체' 버튼 표시 (DET-01). 저장한 코스 상세(MY-03)에서는 넘기지 않는다 */
  onReplace?: (place: CoursePlace) => void
}

/**
 * 코스 일정: 출발지 → 장소(방문 순서) → 도착지 (DET-01 ②, MY-03)
 * 장소마다 방문 시각·체류시간·주소·운영시간을 보여주고, 누르면 사진·소개를 펼친다.
 * 사진·소개가 없는 장소는 '카카오맵에서 보기' 링크로 대신한다.
 */
export default function CourseSchedule({ course, onReplace }: CourseScheduleProps) {
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null)

  const { rows, endTime } = buildSchedule(course)

  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-line pl-5">
      <Point label="S" title={`출발 · ${course.origin.name}`} sub={course.startTime} />

      {rows.map(({ place, arrive, leave }) => {
        const open = openPlaceId === place.placeId
        const hasDetail = Boolean(place.imageUrl || place.description)
        return (
          <li key={place.placeId} className="relative">
            <Leg course={course} minutes={place.travelMinutes} transitInfo={place.transitInfo} />
            <span className="absolute top-6 -left-[31px] flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {place.visitOrder}
            </span>
            <div className="rounded-xl border border-line p-3">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => hasDetail && setOpenPlaceId(open ? null : place.placeId)}
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={hasDetail ? open : undefined}
                >
                  <p className="truncate font-bold">{place.name}</p>
                  <p className="text-xs text-neutral-500">
                    {getCategoryLabel(place.category)} › {place.subCategory}
                  </p>
                  <p className="mt-1 text-xs text-neutral-700">
                    {arrive}–{leave} · 체류 {formatMinutes(place.stayMinutes)}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {place.address}
                    {place.openingHours && ` · ${place.openingHours}`}
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

              {!hasDetail && (
                <a
                  href={getKakaoMapLink(place.name, place.lat, place.lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-primary"
                >
                  카카오맵에서 보기 ›
                </a>
              )}

              {open && (
                <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3 text-xs text-neutral-600">
                  <PlaceThumbnail place={place} className="aspect-video w-full" />
                  {place.description && <p>{place.description}</p>}
                </div>
              )}
            </div>
          </li>
        )
      })}

      {course.destination && (
        <li className="relative">
          <Leg course={course} minutes={course.finalTravelMinutes} />
          <PointBody label="E" title={`도착 · ${course.destination.name}`} sub={endTime} />
        </li>
      )}
    </ol>
  )
}

/** 구간 이동: "버스 721 · 15분 · 환승 0회", "도보 8분" */
function Leg({ course, minutes, transitInfo }: { course: Course; minutes: number; transitInfo?: string }) {
  const mode = getLegMode(course, transitInfo)
  const text =
    transitInfo && transitInfo !== mode
      ? `${transitInfo.split(' · ')[0]} · ${formatMinutes(minutes)} · ${transitInfo.split(' · ').slice(1).join(' · ')}`
      : `${mode} ${formatMinutes(minutes)}`
  return <p className="mb-1 text-xs text-neutral-400">↓ {text}</p>
}

function Point({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <li className="relative">
      <PointBody label={label} title={title} sub={sub} />
    </li>
  )
}

function PointBody({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <div className="relative">
      <span className="absolute top-0.5 -left-[31px] flex size-5 items-center justify-center rounded-full bg-neutral-700 text-[11px] font-bold text-white">
        {label}
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-neutral-500">{sub}</p>
    </div>
  )
}
