import LoginForm from '../features/auth/components/LoginForm'
import AppHeader from '../shared/components/AppHeader'

/** AUT-01 로그인 */
export default function LoginPage() {
  return (
    <>
      <AppHeader title="로그인" />
      <LoginForm />
    </>
  )
}
