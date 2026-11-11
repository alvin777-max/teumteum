import { Link } from 'react-router'
import { formatMinutes } from '../../../shared/utils/format'
import { getTotalTravelMinutes, type Course } from '../types'

interface CourseCardProps {
  course: Course
  /** 카드를 눌렀을 때 이동할 주소 */
  to: string
  /** 카드 아래 추가 정보 (예: 저장일) */
  footer?: string
}

/** 코스 카드: 장소 수, 총 소요시간, 방문 순서, 장소 간 이동시간 (RES-01 ④, MY-02) */
export default function CourseCard({ course, to, footer }: CourseCardProps) {
  return (
    <Link to={to} className="block rounded-2xl border border-line p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold">장소 {course.places.length}곳</span>
        <span className="font-semibold text-primary">총 {formatMinutes(course.totalMinutes)}</span>
      </div>

      <ol className="mt-3 flex flex-col gap-1">
        {course.places.map((place) => (
          <li key={place.placeId} className="flex items-baseline gap-2 text-sm">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {place.visitOrder}
            </span>
            <span className="truncate">{place.name}</span>
            <span className="shrink-0 text-xs text-neutral-400">
              {place.subCategory} · 이동 {formatMinutes(place.travelMinutes)}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-3 text-xs text-neutral-500">
        이동 합계 {formatMinutes(getTotalTravelMinutes(course))}
        {footer && ` · ${footer}`}
      </p>
    </Link>
  )
}
