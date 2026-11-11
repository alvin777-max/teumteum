import { useParams } from 'react-router'
import CourseDetail from '../features/recommend/components/CourseDetail'
import AppHeader from '../shared/components/AppHeader'

/** DET-01 추천 결과 상세. /results/:courseId */
export default function CourseDetailPage() {
  const { courseId = '' } = useParams()

  return (
    <>
      <AppHeader title="코스 상세" />
      <CourseDetail courseId={courseId} />
    </>
  )
}
