import { Link } from 'react-router'
import LoginForm from '../features/auth/components/LoginForm'
import AppHeader from '../shared/components/AppHeader'

/** AUT-01 로그인. ✕ 를 누르면 홈으로 */
export default function LoginPage() {
  return (
    <>
      <AppHeader
        title="로그인"
        showBack={false}
        right={
          <Link to="/" aria-label="닫기" className="flex size-10 items-center justify-center text-xl">
            ✕
          </Link>
        }
      />
      <LoginForm />
    </>
  )
}
