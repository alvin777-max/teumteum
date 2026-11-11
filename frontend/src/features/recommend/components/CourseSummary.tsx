import type { ReactNode } from 'react'
import { getTransportLabel } from '../../../shared/types/domain'
import { formatMinutes } from '../../../shared/utils/format'
import { getCourseName, type Course } from '../types'

interface CourseSummaryProps {
  course: Course
  /** 이동수단 대신 보여줄 문구 (MY-03: "11.11 저장") */
  meta?: string
  /** 요약 아래 추가 줄 (MY-03: 저장 시점 정보 안내) */
  children?: ReactNode
}

/** 코스 요약: 코스명, 총 예상 소요시간, 장소 수, 이동수단 (DET-01 ①, MY-03 ①) */
export default function CourseSummary({ course, meta, children }: CourseSummaryProps) {
  return (
    <section className="border-b border-line px-4 py-5">
      <h2 className="text-lg font-bold">{getCourseName(course)}</h2>
      <p className="mt-2 text-sm text-neutral-600">
        총 {formatMinutes(course.totalMinutes)} · {course.places.length}곳 · {meta ?? getTransportLabel(course.transportType)}
        {course.estimated && <span className="ml-1.5 text-xs font-semibold text-amber-600">예상 시간</span>}
      </p>
      {children}
    </section>
  )
}
