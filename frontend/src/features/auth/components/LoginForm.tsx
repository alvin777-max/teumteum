import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import type { LoginRedirectState } from '../../../shared/auth/RequireAuth'
import Button from '../../../shared/components/Button'
import TextField from '../../../shared/components/TextField'

/**
 * 로그인 (AUT-01): 이메일·비밀번호. 로그인 후 진입 전 화면으로 복귀
 * - 코스 저장 중이었으면 저장 완료 후 DET-01, 하단바 로그인이면 홈, 마이페이지였으면 MY-01
 * TODO(김용현): 로그인 API 연동 (현재 입력값으로 임시 로그인), 비밀번호 찾기
 */
export default function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = location.state as LoginRedirectState | null
  const setLogin = useAuthStore((s) => s.setLogin)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<{ email?: string; password?: string }>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: typeof error = {}
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = '이메일 형식을 확인해 주세요.'
    if (password.length === 0) next.password = '비밀번호를 입력해 주세요.'
    setError(next)
    if (Object.keys(next).length > 0) return

    // [임시] API 연동 전: 입력한 이메일로 로그인 처리
    setLogin('mock-token', { email, nickname: email.split('@')[0] })

    if (redirect?.pendingAction === 'save') {
      navigate(redirect.from, { replace: true, state: { afterLogin: 'save' } })
    } else {
      navigate(redirect?.from ?? '/', { replace: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-6 py-8" noValidate>
      <div className="mb-4 text-center">
        <p className="text-3xl font-extrabold text-primary">틈틈</p>
        <p className="mt-2 text-sm text-neutral-500">
          {redirect?.pendingAction === 'save' ? '코스를 저장하려면 로그인이 필요해요' : '로그인하고 코스를 저장해 보세요'}
        </p>
      </div>

      <TextField label="이메일" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error.email} />
      <TextField label="비밀번호" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={error.password} />

      <Button type="submit" className="mt-2">
        로그인
      </Button>

      <div className="flex justify-center gap-4 text-sm text-neutral-500">
        <Link to="/signup" state={redirect}>
          회원가입
        </Link>
        <span className="text-line">|</span>
        <button type="button" onClick={() => alert('가입한 이메일로 재설정 링크를 보내는 기능은 준비 중입니다.')}>
          비밀번호 찾기
        </button>
      </div>

      <button type="button" onClick={() => navigate(-1)} className="mt-auto text-sm text-neutral-400 underline">
        로그인 없이 돌아가기
      </button>
    </form>
  )
}
