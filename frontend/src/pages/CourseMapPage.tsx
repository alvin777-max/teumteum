import { useParams } from 'react-router'
import CourseMapView from '../features/map/components/CourseMapView'
import AppHeader from '../shared/components/AppHeader'

interface CourseMapPageProps {
  source: 'recommend' | 'saved'
}

/** DET-02 코스 지도 상세. /results/:courseId/map, /mypage/courses/:courseId/map. 뒤로가기로 진입 화면 복귀 */
export default function CourseMapPage({ source }: CourseMapPageProps) {
  const { courseId = '' } = useParams()

  return (
    <>
      <AppHeader title="코스 지도" />
      <CourseMapView courseId={courseId} source={source} />
    </>
  )
}
