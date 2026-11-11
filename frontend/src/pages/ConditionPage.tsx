import ConditionForm from '../features/condition/components/ConditionForm'
import AppHeader from '../shared/components/AppHeader'

/** CON-01 외출 조건 설정 */
export default function ConditionPage() {
  return (
    <>
      <AppHeader title="외출 조건 설정" />
      <ConditionForm />
    </>
  )
}
