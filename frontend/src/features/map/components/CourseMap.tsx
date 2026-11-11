import { useMemo, useState } from 'react'
import type { LatLng } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { getTotalTravelMinutes, type Course } from '../../recommend/types'
import KakaoMap from './KakaoMap'

/**
 * 코스 지도 상세 (DET-02): 출발지(S), 방문 순번 마커, 도착지(E), 이동 경로선
 * TODO(유지수): S·순번·E 라벨 마커(CustomOverlay), 이동 경로선(Polyline). 지금은 기본 마커만 표시
 */
export default function CourseMap({ course }: { course: Course }) {
  const markers = useMemo<LatLng[]>(
    () => [course.origin, ...course.places, ...(course.destination ? [course.destination] : [])].map(({ lat, lng }) => ({ lat, lng })),
    [course],
  )
  const [center, setCenter] = useState<LatLng>(markers[0])

  return (
    <>
      <KakaoMap center={center} level={5} markers={markers} className="min-h-80 flex-1" />

      <section className="border-t border-line px-4 py-4">
        <p className="mb-3 text-sm">
          <span className="font-bold">총 {formatMinutes(course.totalMinutes)}</span>
          <span className="ml-2 text-neutral-500">이동 {formatMinutes(getTotalTravelMinutes(course))}</span>
        </p>
        <ol className="flex flex-col gap-1">
          <MapRow label="S" name={course.origin.name} onClick={() => setCenter(course.origin)} />
          {course.places.map((p) => (
            <MapRow
              key={p.placeId}
              label={String(p.visitOrder)}
              name={p.name}
              sub={`이동 ${formatMinutes(p.travelMinutes)} · 체류 ${formatMinutes(p.stayMinutes)}`}
              onClick={() => setCenter(p)}
            />
          ))}
          {course.destination && (
            <MapRow label="E" name={course.destination.name} onClick={() => course.destination && setCenter(course.destination)} />
          )}
        </ol>
      </section>
    </>
  )
}

function MapRow({ label, name, sub, onClick }: { label: string; name: string; sub?: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left active:bg-neutral-100">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {label}
        </span>
        <span className="flex-1 truncate text-sm">{name}</span>
        {sub && <span className="shrink-0 text-xs text-neutral-400">{sub}</span>}
      </button>
    </li>
  )
}
