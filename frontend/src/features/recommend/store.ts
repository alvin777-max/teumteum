import { useMemo, useState } from 'react'
import { create } from 'zustand'
import { mockRecommend, mockSinglePlaceCourse } from './mock'
import type { AlternativePlace, Course } from './types'

/** 추천 결과 보관 시간 (화면설계서 공통 정책: 2시간) */
export const RECOMMEND_TTL_MS = 2 * 60 * 60 * 1000

/** '다시 추천'을 너무 자주 누를 때 막는 간격 */
const RELOAD_COOLDOWN_MS = 2000

interface RecommendState {
  courses: Course[]
  /** 추천받은 시각 (ms). 2시간이 지나면 만료 */
  requestedAt: number
  /** '다시 추천' 횟수 */
  round: number
  /** 새 조건으로 추천 요청 (CON-01 추천받기) */
  request: () => void
  /** 같은 조건으로 새로 추천. 너무 자주 누르면 false */
  reload: () => boolean
  /** 코스의 장소 1곳을 교체하고 총 소요시간을 다시 계산한다 */
  replacePlace: (course: Course, placeId: string, alternative: AlternativePlace) => Course
}

/**
 * 추천 결과 (RES-01·DET-01·DET-02·DET-03 공용)
 * TODO(나혜빈): 추천 API 연동. 지금은 mock 데이터로 다시 추천·교체·만료 흐름만 확인한다
 */
export const useRecommendStore = create<RecommendState>((set, get) => ({
  courses: mockRecommend(0),
  requestedAt: Date.now(),
  round: 0,
  request: () => set({ courses: mockRecommend(0), requestedAt: Date.now(), round: 0 }),
  reload: () => {
    const { requestedAt, round } = get()
    if (Date.now() - requestedAt < RELOAD_COOLDOWN_MS) return false
    const next = round + 1
    set({ courses: mockRecommend(next), requestedAt: Date.now(), round: next })
    return true
  },
  replacePlace: (course, placeId, alternative) => {
    // 교체한 장소만 바꾸고 바뀐 앞뒤 구간의 시간 차이만큼 총 소요시간을 갱신한다
    const { diffMinutes, ...place } = alternative
    const updated: Course = {
      ...course,
      places: course.places.map((p) => (p.placeId === placeId ? { ...place, visitOrder: p.visitOrder } : p)),
      totalMinutes: course.totalMinutes + diffMinutes,
    }
    set((state) => ({
      courses: state.courses.some((c) => c.courseId === course.courseId)
        ? state.courses.map((c) => (c.courseId === course.courseId ? updated : c))
        : [...state.courses, updated],
    }))
    return updated
  },
}))

/** 추천 결과가 2시간이 지나 만료됐는지 */
export function useRecommendExpired(): boolean {
  const requestedAt = useRecommendStore((s) => s.requestedAt)
  // 화면에 들어온 시점 기준으로 판단한다
  const [enteredAt] = useState(() => Date.now())
  return enteredAt - requestedAt > RECOMMEND_TTL_MS
}

/** courseId로 코스를 찾는다. "place-<placeId>"는 장소 1곳짜리 코스 (홈 검색·주변 탐색) */
export function useCourse(courseId: string): Course | undefined {
  const found = useRecommendStore((s) => s.courses.find((c) => c.courseId === courseId))
  // 매 렌더마다 새 객체가 생기지 않도록 고정 (지도가 다시 그려지는 것을 막음)
  const single = useMemo(() => mockSinglePlaceCourse(courseId), [courseId])
  return found ?? single
}
