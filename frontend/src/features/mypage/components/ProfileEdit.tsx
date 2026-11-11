import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import Button from '../../../shared/components/Button'
import TextField from '../../../shared/components/TextField'
import { useSavedCourseStore } from '../store'

/**
 * 회원 정보 수정·탈퇴 (MY-04)
 * TODO(김하윤): 회원 정보 조회·수정·탈퇴 API 연동 (현재 화면 상태만 변경)
 */
export default function ProfileEdit() {
  const navigate = useNavigate()
  const { user, updateUser, logout } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAgreed, setWithdrawAgreed] = useState(false)

  const passwordError = newPassword && newPassword.length < 8 ? '비밀번호는 8자 이상이어야 해요.' : undefined

  const handleSave = () => {
    updateUser({ nickname })
    navigate('/mypage', { replace: true })
  }

  const handleWithdraw = () => {
    useSavedCourseStore.setState({ savedCourses: [] })
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <TextField label="이메일" name="email" value={user?.email ?? ''} disabled hint="이메일은 수정할 수 없어요" />
      <TextField label="닉네임" name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
      <TextField
        label="새 비밀번호"
        name="newPassword"
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={passwordError}
        hint="바꾸지 않으려면 비워두세요"
      />
      <Button onClick={handleSave} disabled={nickname.trim().length === 0 || Boolean(passwordError)}>
        저장
      </Button>

      <section className="mt-6 border-t border-line pt-5">
        {!withdrawOpen ? (
          <button type="button" onClick={() => setWithdrawOpen(true)} className="text-sm text-neutral-400 underline">
            회원 탈퇴
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl bg-neutral-100 p-4 text-sm">
            <p className="font-bold">정말 탈퇴할까요?</p>
            <p className="text-neutral-600">탈퇴하면 저장한 코스가 모두 삭제되고 되돌릴 수 없어요.</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={withdrawAgreed} onChange={(e) => setWithdrawAgreed(e.target.checked)} className="accent-primary" />
              안내를 확인했고 탈퇴에 동의합니다
            </label>
            <Button variant="secondary" disabled={!withdrawAgreed} onClick={handleWithdraw}>
              탈퇴하기
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
