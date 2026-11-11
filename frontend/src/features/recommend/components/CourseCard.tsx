import { Fragment } from 'react'
import { Link } from 'react-router'
import { formatMinutes } from '../../../shared/utils/format'
import { getLegMode, type Course } from '../types'
import PlaceThumbnail from './PlaceThumbnail'

interface CourseCardProps {
  course: Course
  /** 카드 제목 앞 순번 (예: 추천 1) */
  index: number
  /** 카드를 눌렀을 때 이동할 주소 */
  to: string
}

/** 추천 코스 카드: 썸네일, 장소 수, 총 소요시간, 방문 순서, 장소 간 이동시간 (RES-01 ③) */
export default function CourseCard({ course, index, to }: CourseCardProps) {
  return (
    <Link to={to} className="flex gap-3 rounded-2xl border border-line p-4">
      <PlaceThumbnail place={course.places[0]} />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">
          추천 {index} · {course.places.length}곳 · {formatMinutes(course.totalMinutes)}
          {course.estimated && (
            <span className="ml-1.5 rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-600">예상 시간</span>
          )}
        </p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-sm">
          {course.places.map((place, i) => (
            <Fragment key={place.placeId}>
              {i > 0 && (
                <span className="text-xs text-neutral-400">
                  → {getLegMode(course, place.transitInfo)} {formatMinutes(place.travelMinutes)} →
                </span>
              )}
              <span className="font-medium">{place.name}</span>
            </Fragment>
          ))}
        </p>
      </div>
    </Link>
  )
}
