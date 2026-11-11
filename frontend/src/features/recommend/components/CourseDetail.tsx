import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import type { LoginRedirectState } from '../../../shared/auth/RequireAuth'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import Toast from '../../../shared/components/Toast'
import { useSavedCourseStore } from '../../mypage/store'
import { findMockCourse } from '../mock'
import CourseSchedule from './CourseSchedule'
import CourseSummary from './CourseSummary'

/**
 * 추천 결과 상세 (DET-01)
 * TODO(나혜빈): 코스 상세 API 연동 (현재 MOCK_COURSES)
 * TODO(김하윤): 코스 저장 API 연동 (현재 useSavedCourseStore 임시 저장)
 */
export default function CourseDetail({ courseId }: { courseId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { save, isSaved } = useSavedCourseStore()
  const course = findMockCourse(courseId)

  // 비로그인 저장 → 로그인 → 이 화면으로 돌아오면 저장을 이어서 진행하고 토스트 표시
  const pendingSave = (location.state as { afterLogin?: string } | null)?.afterLogin === 'save'
  const [toast, setToast] = useState(pendingSave)
  const closeToast = useCallback(() => setToast(false), [])

  useEffect(() => {
    if (pendingSave && isLoggedIn && course) {
      save(course)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [pendingSave, isLoggedIn, course, save, navigate, location.pathname])

  if (!course) return <EmptyState message="코스 정보를 찾을 수 없습니다." />

  const handleSave = () => {
    if (!isLoggedIn) {
      const state: LoginRedirectState = { from: location.pathname, pendingAction: 'save' }
      navigate('/login', { state })
      return
    }
    save(course)
    setToast(true)
  }

  return (
    <>
      <CourseSummary course={course} />

      <section className="px-4 py-5">
        <h3 className="mb-4 text-sm font-bold">코스 일정</h3>
        <CourseSchedule
          course={course}
          onReplace={(place) => navigate(`/results/${course.courseId}/replace/${place.placeId}`)}
        />
      </section>

      <BottomActionBar>
        <Button variant="secondary" onClick={() => navigate(`/results/${course.courseId}/map`)}>
          지도에서 보기
        </Button>
        <Button onClick={handleSave} disabled={isSaved(course.courseId)}>
          {isSaved(course.courseId) ? '저장됨' : '이 코스 저장'}
        </Button>
      </BottomActionBar>

      {toast && (
        <Toast message="저장됨" action={{ label: '저장한 코스 보기', to: '/mypage/courses' }} onClose={closeToast} />
      )}
    </>
  )
}
