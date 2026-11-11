import { getTransportLabel } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { getCourseName, type Course } from '../types'

/** 코스 요약: 코스명, 총 예상 소요시간, 장소 수, 이동수단 (DET-01 ①, MY-03) */
export default function CourseSummary({ course }: { course: Course }) {
  return (
    <section className="border-b border-line px-4 py-5">
      <h2 className="text-lg font-bold">{getCourseName(course)}</h2>
      <p className="mt-2 text-sm text-neutral-600">
        총 {formatMinutes(course.totalMinutes)} · 장소 {course.places.length}곳 · {getTransportLabel(course.transportType)}
      </p>
    </section>
  )
}
