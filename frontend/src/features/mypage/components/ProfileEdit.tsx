import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import Button from '../../../shared/components/Button'
import TextField from '../../../shared/components/TextField'
import { useSavedCourseStore } from '../store'

/**
 * 회원 정보 수정·탈퇴 (MY-04)
 * - 이메일(수정 불가), 닉네임, 비밀번호 변경(새 비밀번호 + 확인). 저장하면 마이페이지로
 * - 회원 탈퇴: 안내(저장한 코스 즉시 삭제) → 의사 확인(비밀번호 입력 또는 체크) → 홈으로
 * - MY-01 '회원 탈퇴' 메뉴로 들어오면(?withdraw=1) 탈퇴 영역을 펼친 채로 시작
 * TODO(김하윤): 회원 정보 조회·수정·탈퇴 API 연동 (현재 화면 상태만 변경)
 */
export default function ProfileEdit() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, updateUser, logout } = useAuthStore()
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [withdrawOpen, setWithdrawOpen] = useState(searchParams.get('withdraw') === '1')
  const [withdrawPassword, setWithdrawPassword] = useState('')
  const [withdrawAgreed, setWithdrawAgreed] = useState(false)

  const passwordError = newPassword && newPassword.length < 8 ? '비밀번호는 8자 이상이어야 해요.' : undefined
  const confirmError =
    newPasswordConfirm && newPassword !== newPasswordConfirm ? '비밀번호가 일치하지 않아요.' : undefined
  const canSave =
    nickname.trim().length > 0 && !passwordError && !confirmError && (newPassword === '' || newPasswordConfirm !== '')

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
        autoComplete="new-password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        error={passwordError}
        hint="바꾸지 않으려면 비워두세요"
      />
      <TextField
        label="새 비밀번호 확인"
        name="newPasswordConfirm"
        type="password"
        autoComplete="new-password"
        value={newPasswordConfirm}
        onChange={(e) => setNewPasswordConfirm(e.target.value)}
        error={confirmError}
      />
      <Button onClick={handleSave} disabled={!canSave}>
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
            <p className="text-neutral-600">탈퇴하면 저장한 코스가 즉시 삭제되고 되돌릴 수 없어요.</p>
            <TextField
              label="비밀번호 확인"
              name="withdrawPassword"
              type="password"
              autoComplete="current-password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              hint="비밀번호를 입력하거나 아래에 체크해 주세요"
            />
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={withdrawAgreed} onChange={(e) => setWithdrawAgreed(e.target.checked)} className="accent-primary" />
              안내를 확인했고 탈퇴에 동의합니다
            </label>
            <Button variant="secondary" disabled={!withdrawAgreed && withdrawPassword.length === 0} onClick={handleWithdraw}>
              탈퇴하기
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
