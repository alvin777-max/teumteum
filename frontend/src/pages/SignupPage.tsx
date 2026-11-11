import SignupForm from '../features/auth/components/SignupForm'
import AppHeader from '../shared/components/AppHeader'

/** AUT-02 회원가입 */
export default function SignupPage() {
  return (
    <>
      <AppHeader title="회원가입" />
      <SignupForm />
    </>
  )
}
