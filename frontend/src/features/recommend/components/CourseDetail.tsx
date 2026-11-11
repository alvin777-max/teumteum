import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import type { LoginRedirectState } from '../../../shared/auth/RequireAuth'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import Toast from '../../../shared/components/Toast'
import { useSavedCourseStore } from '../../mypage/store'
import { useCourse, useRecommendExpired } from '../store'
import CourseSchedule from './CourseSchedule'
import CourseSummary from './CourseSummary'
import ExpiredState from './ExpiredState'

/**
 * 추천 결과 상세 (DET-01)
 * TODO(나혜빈): 코스 상세 API 연동 (현재 mock)
 * TODO(김하윤): 코스 저장 API 연동 (현재 useSavedCourseStore 임시 저장)
 */
export default function CourseDetail({ courseId }: { courseId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  const { save, isSaved } = useSavedCourseStore()
  const course = useCourse(courseId)
  const expired = useRecommendExpired()

  const routeState = location.state as { afterLogin?: string; replaceWarning?: boolean } | null
  // 비로그인 저장 → 로그인 → 이 화면으로 돌아오면 저장을 이어서 진행하고 토스트 표시
  const pendingSave = routeState?.afterLogin === 'save'
  const [toast, setToast] = useState(pendingSave)
  const closeToast = useCallback(() => setToast(false), [])
  // 장소 교체(DET-03) 후 이용 시간을 넘었으면 경고
  const [warning, setWarning] = useState(Boolean(routeState?.replaceWarning))
  const closeWarning = useCallback(() => setWarning(false), [])

  useEffect(() => {
    if (pendingSave && isLoggedIn && course) {
      save(course)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [pendingSave, isLoggedIn, course, save, navigate, location.pathname])

  if (!course || expired) return <ExpiredState />

  const saved = isSaved(course.courseId)

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
        <p className="mt-5 text-xs text-neutral-400">이동·체류시간은 예상값이라 실제와 다를 수 있어요</p>
      </section>

      <BottomActionBar>
        <Button variant="secondary" onClick={() => navigate(`/results/${course.courseId}/map`)}>
          지도에서 보기
        </Button>
        <Button onClick={handleSave} disabled={saved}>
          {saved ? '저장됨' : '이 코스 저장'}
        </Button>
      </BottomActionBar>

      {toast && (
        <Toast message="저장됨" action={{ label: '저장한 코스 보기', to: '/mypage/courses' }} onClose={closeToast} />
      )}
      {warning && <Toast message="선택한 시간을 넘어요" onClose={closeWarning} />}
    </>
  )
}
