import { useParams } from 'react-router'
import SavedCourseDetail from '../features/mypage/components/SavedCourseDetail'
import AppHeader from '../shared/components/AppHeader'

/** MY-03 저장한 코스 상세. /mypage/courses/:courseId */
export default function SavedCourseDetailPage() {
  const { courseId = '' } = useParams()

  return (
    <>
      <AppHeader title="저장한 코스" />
      <SavedCourseDetail courseId={courseId} />
    </>
  )
}
