import SavedCourseList from '../features/mypage/components/SavedCourseList'
import AppHeader from '../shared/components/AppHeader'

/** MY-02 저장한 코스 목록 */
export default function SavedCourseListPage() {
  return (
    <>
      <AppHeader title="저장한 코스" />
      <SavedCourseList />
    </>
  )
}
