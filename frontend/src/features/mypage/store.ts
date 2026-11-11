import { create } from 'zustand'
import type { Course } from '../recommend/types'

export interface SavedCourse {
  course: Course
  /** 저장일 "YYYY-MM-DD" */
  savedAt: string
}

interface SavedCourseState {
  savedCourses: SavedCourse[]
  save: (course: Course) => void
  remove: (courseId: string) => void
  isSaved: (courseId: string) => boolean
}

/**
 * [임시] 저장한 코스. 코스 저장 API 연동 전까지 화면 흐름 확인용으로 메모리에만 둔다.
 * TODO(김하윤): 코스 저장·조회·삭제 API 연동 후 이 store 대신 API 사용
 */
export const useSavedCourseStore = create<SavedCourseState>((set, get) => ({
  savedCourses: [],
  save: (course) => {
    if (get().isSaved(course.courseId)) return
    const savedAt = new Date().toISOString().slice(0, 10)
    // 최신순
    set((state) => ({ savedCourses: [{ course, savedAt }, ...state.savedCourses] }))
  },
  remove: (courseId) =>
    set((state) => ({ savedCourses: state.savedCourses.filter((s) => s.course.courseId !== courseId) })),
  isSaved: (courseId) => get().savedCourses.some((s) => s.course.courseId === courseId),
}))
