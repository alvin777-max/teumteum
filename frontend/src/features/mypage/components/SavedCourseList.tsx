import { useNavigate } from 'react-router'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import CourseCard from '../../recommend/components/CourseCard'
import { useSavedCourseStore } from '../store'

/**
 * 저장한 코스 목록 (MY-02): 최신순, 누르면 MY-03, 저장 해제는 확인 후
 * TODO(김하윤): 저장한 코스 조회·삭제 API 연동, 왼쪽으로 밀어서 해제
 */
export default function SavedCourseList() {
  const navigate = useNavigate()
  const { savedCourses, remove } = useSavedCourseStore()

  if (savedCourses.length === 0) {
    return (
      <EmptyState
        message="아직 저장한 코스가 없어요"
        action={
          <Button className="w-auto px-6" onClick={() => navigate('/condition')}>
            지금 외출 추천
          </Button>
        }
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3 p-4">
      {savedCourses.map(({ course, savedAt }) => (
        <li key={course.courseId} className="relative">
          <CourseCard course={course} to={`/mypage/courses/${course.courseId}`} footer={`저장일 ${savedAt}`} />
          <button
            type="button"
            onClick={() => confirm('저장을 해제할까요?') && remove(course.courseId)}
            className="absolute right-3 bottom-3 rounded-lg border border-line bg-white px-2 py-1 text-xs text-neutral-500"
          >
            저장 해제
          </button>
        </li>
      ))}
    </ul>
  )
}
