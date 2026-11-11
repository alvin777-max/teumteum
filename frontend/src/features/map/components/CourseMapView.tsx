import EmptyState from '../../../shared/components/EmptyState'
import { useSavedCourseStore } from '../../mypage/store'
import { findMockCourse } from '../../recommend/mock'
import CourseMap from './CourseMap'

interface CourseMapViewProps {
  courseId: string
  /** recommend: 추천 결과(DET-01)에서 진입, saved: 저장한 코스(MY-03)에서 진입 */
  source: 'recommend' | 'saved'
}

/** DET-02 진입 경로에 따라 코스를 찾아 지도에 표시한다 */
export default function CourseMapView({ courseId, source }: CourseMapViewProps) {
  const saved = useSavedCourseStore((s) => s.savedCourses.find((c) => c.course.courseId === courseId))
  const course = source === 'saved' ? saved?.course : findMockCourse(courseId)

  if (!course) return <EmptyState message="코스 정보를 찾을 수 없습니다." />
  return <CourseMap course={course} />
}
