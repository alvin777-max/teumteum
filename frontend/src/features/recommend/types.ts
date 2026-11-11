import type { CategoryCode, LocationValue, TransportType } from '../../shared/types/domain'
import { addMinutesToTime } from '../../shared/utils/format'

// TODO(나혜빈): 추천 API 명세가 나오면 백엔드 DTO 이름·필드와 맞춘다. (현재 초안)

/** 코스 안의 장소 1곳 */
export interface CoursePlace {
  placeId: string
  name: string
  category: CategoryCode
  subCategory: string
  address: string
  openingHours?: string
  imageUrl?: string
  description?: string
  lat: number
  lng: number
  /** 이전 지점(출발지 또는 앞 장소)에서 이동시간(분) */
  travelMinutes: number
  /** 예상 체류시간(분) */
  stayMinutes: number
  /** 방문 순서 (1부터) */
  visitOrder: number
}

/** 추천 코스 (장소 1곳 이상) */
export interface Course {
  courseId: string
  places: CoursePlace[]
  origin: LocationValue
  destination: LocationValue | null
  transportType: TransportType
  /** 출발 시각 "HH:mm" */
  startTime: string
  /** 마지막 장소 → 도착지 이동시간(분). 도착지 없으면 0 */
  finalTravelMinutes: number
  /** 이동 포함 총 소요시간(분) */
  totalMinutes: number
}

/** 코스명: 장소 이름 조합 */
export function getCourseName(course: Course): string {
  return course.places.map((p) => p.name).join(' → ')
}

export interface ScheduleRow {
  place: CoursePlace
  /** 도착 시각 "HH:mm" */
  arrive: string
  /** 떠나는 시각 "HH:mm" */
  leave: string
}

/** 출발 시각부터 장소별 방문 시각을 계산한다. endTime은 마지막 장소(또는 도착지) 도착 시각 */
export function buildSchedule(course: Course): { rows: ScheduleRow[]; endTime: string } {
  const rows: ScheduleRow[] = []
  let clock = course.startTime
  for (const place of course.places) {
    const arrive = addMinutesToTime(clock, place.travelMinutes)
    const leave = addMinutesToTime(arrive, place.stayMinutes)
    rows.push({ place, arrive, leave })
    clock = leave
  }
  return { rows, endTime: addMinutesToTime(clock, course.finalTravelMinutes) }
}

/** 장소 간 이동시간 합계(분) */
export function getTotalTravelMinutes(course: Course): number {
  return course.places.reduce((sum, p) => sum + p.travelMinutes, 0) + course.finalTravelMinutes
}
