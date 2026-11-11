import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import type { LoginRedirectState } from '../../../shared/auth/RequireAuth'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import TextField from '../../../shared/components/TextField'

const TERMS = [
  { key: 'service', label: '[필수] 이용약관 동의' },
  { key: 'privacy', label: '[필수] 개인정보 수집·이용 동의' },
] as const
type TermKey = (typeof TERMS)[number]['key']

/**
 * 회원가입 (AUT-02): 이메일(중복 확인)·비밀번호(8자 이상)·확인·닉네임, 약관 동의
 * TODO(김용현): 이메일 중복 확인·회원가입 API 연동 (현재 가입 후 임시 로그인)
 */
export default function SignupForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = location.state as LoginRedirectState | null
  const setLogin = useAuthStore((s) => s.setLogin)

  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '' })
  const [agreed, setAgreed] = useState<Record<TermKey, boolean>>({ service: false, privacy: false })

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }))

  // 항목별 실시간 검증 (입력을 시작한 항목만 안내)
  const errors = {
    email: form.email && !/^\S+@\S+\.\S+$/.test(form.email) ? '이메일 형식을 확인해 주세요.' : undefined,
    password: form.password && form.password.length < 8 ? '비밀번호는 8자 이상이어야 해요.' : undefined,
    passwordConfirm: form.passwordConfirm && form.password !== form.passwordConfirm ? '비밀번호가 일치하지 않아요.' : undefined,
    nickname: undefined,
  }
  const filled = Object.values(form).every((v) => v.length > 0)
  const valid = filled && Object.values(errors).every((e) => !e)
  const allAgreed = TERMS.every((t) => agreed[t.key])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid || !allAgreed) return
    // [임시] 가입 후 자동 로그인 → 원래 흐름으로 복귀
    setLogin('mock-token', { email: form.email, nickname: form.nickname })
    if (redirect?.pendingAction === 'save') {
      navigate(redirect.from, { replace: true, state: { afterLogin: 'save' } })
    } else {
      navigate(redirect?.from ?? '/', { replace: true })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
      <div className="flex flex-col gap-4 px-4 py-5">
        <TextField label="이메일" name="email" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} error={errors.email} hint="중복 확인은 API 연동 후 동작합니다" />
        <TextField label="비밀번호" name="password" type="password" value={form.password} onChange={(e) => set('password')(e.target.value)} error={errors.password} hint="8자 이상" />
        <TextField label="비밀번호 확인" name="passwordConfirm" type="password" value={form.passwordConfirm} onChange={(e) => set('passwordConfirm')(e.target.value)} error={errors.passwordConfirm} />
        <TextField label="닉네임" name="nickname" value={form.nickname} onChange={(e) => set('nickname')(e.target.value)} />

        <fieldset className="mt-2 flex flex-col gap-2 rounded-xl border border-line p-4 text-sm">
          <label className="flex items-center gap-2 font-semibold">
            <input
              type="checkbox"
              checked={allAgreed}
              onChange={(e) => setAgreed({ service: e.target.checked, privacy: e.target.checked })}
              className="accent-primary"
            />
            전체 동의
          </label>
          {TERMS.map((t) => (
            <label key={t.key} className="flex items-center gap-2 text-neutral-600">
              <input
                type="checkbox"
                checked={agreed[t.key]}
                onChange={(e) => setAgreed((a) => ({ ...a, [t.key]: e.target.checked }))}
                className="accent-primary"
              />
              {t.label}
            </label>
          ))}
        </fieldset>
      </div>

      <BottomActionBar>
        <Button type="submit" disabled={!valid || !allAgreed}>
          가입하기
        </Button>
      </BottomActionBar>
    </form>
  )
}
