import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import EmptyState from '../../../shared/components/EmptyState'
import Toast from '../../../shared/components/Toast'
import { formatShortDate } from '../../../shared/utils/format'
import CourseSchedule from '../../recommend/components/CourseSchedule'
import CourseSummary from '../../recommend/components/CourseSummary'
import { useSavedCourseStore } from '../store'

/**
 * 저장한 코스 상세 (MY-03): DET-01과 같은 구성, 저장 시점 정보로 표시 (장소 교체 없음).
 * '정보 새로고침'을 누를 때만 외부 API를 다시 조회한다.
 * TODO(김하윤): 정보 새로고침 API 연동
 */
export default function SavedCourseDetail({ courseId }: { courseId: string }) {
  const navigate = useNavigate()
  const { savedCourses, remove } = useSavedCourseStore()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [toast, setToast] = useState(false)
  const closeToast = useCallback(() => setToast(false), [])
  const saved = savedCourses.find((s) => s.course.courseId === courseId)

  if (!saved) return <EmptyState message="저장한 코스를 찾을 수 없습니다." />

  return (
    <>
      <CourseSummary course={saved.course} meta={`${formatShortDate(saved.savedAt)} 저장`}>
        <p className="mt-2 text-xs text-neutral-500">
          저장 시점 정보예요 ·{' '}
          <button type="button" onClick={() => setToast(true)} className="text-primary">
            정보 새로고침 ↻
          </button>
        </p>
      </CourseSummary>

      <section className="px-4 py-5">
        <h3 className="mb-4 text-sm font-bold">코스 일정</h3>
        <CourseSchedule course={saved.course} />
      </section>

      <BottomActionBar>
        <Button variant="secondary" onClick={() => setConfirmRemove(true)}>
          저장 해제
        </Button>
        <Button onClick={() => navigate(`/mypage/courses/${courseId}/map`)}>지도에서 보기</Button>
      </BottomActionBar>

      {confirmRemove && (
        <ConfirmDialog
          message="저장을 해제할까요?"
          confirmLabel="저장 해제"
          onCancel={() => setConfirmRemove(false)}
          onConfirm={() => {
            remove(courseId)
            navigate('/mypage/courses', { replace: true })
          }}
        />
      )}
      {toast && <Toast message="정보 새로고침은 API 연동 후 동작합니다" onClose={closeToast} />}
    </>
  )
}
