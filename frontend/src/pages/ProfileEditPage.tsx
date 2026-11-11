import ProfileEdit from '../features/mypage/components/ProfileEdit'
import AppHeader from '../shared/components/AppHeader'

/** MY-04 회원 정보 수정·탈퇴 */
export default function ProfileEditPage() {
  return (
    <>
      <AppHeader title="회원 정보 수정" />
      <ProfileEdit />
    </>
  )
}
