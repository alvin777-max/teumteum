import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import CourseSchedule from '../../recommend/components/CourseSchedule'
import CourseSummary from '../../recommend/components/CourseSummary'
import { useSavedCourseStore } from '../store'

/** 저장한 코스 상세 (MY-03): DET-01과 같은 구성(저장 시점 일정), 장소 교체 없음 */
export default function SavedCourseDetail({ courseId }: { courseId: string }) {
  const navigate = useNavigate()
  const { savedCourses, remove } = useSavedCourseStore()
  const saved = savedCourses.find((s) => s.course.courseId === courseId)

  if (!saved) return <EmptyState message="저장한 코스를 찾을 수 없습니다." />

  const handleRemove = () => {
    if (!confirm('저장을 해제할까요?')) return
    remove(courseId)
    navigate('/mypage/courses', { replace: true })
  }

  return (
    <>
      <CourseSummary course={saved.course} />
      <section className="px-4 py-5">
        <h3 className="mb-4 text-sm font-bold">코스 일정</h3>
        <CourseSchedule course={saved.course} />
      </section>

      <BottomActionBar>
        <Button variant="secondary" onClick={handleRemove}>
          저장 해제
        </Button>
        <Button onClick={() => navigate(`/mypage/courses/${courseId}/map`)}>지도에서 보기</Button>
      </BottomActionBar>
    </>
  )
}
