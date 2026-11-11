import MyPageContent from '../features/mypage/components/MyPageContent'
import AppHeader from '../shared/components/AppHeader'

/** MY-01 마이페이지 */
export default function MyPage() {
  return (
    <>
      <AppHeader title="마이페이지" />
      <MyPageContent />
    </>
  )
}
