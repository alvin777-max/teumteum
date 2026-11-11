import { useNavigate } from 'react-router'
import Button from '../../../shared/components/Button'
import EmptyState from '../../../shared/components/EmptyState'
import { useRecommendStore } from '../store'

/** 추천 결과가 2시간이 지났거나 없을 때 (화면설계서 공통 정책: 추천 만료) → 같은 조건으로 다시 추천 */
export default function ExpiredState() {
  const navigate = useNavigate()
  const reload = useRecommendStore((s) => s.reload)

  return (
    <EmptyState
      message="추천이 만료되었습니다. 같은 조건으로 다시 추천해 드릴게요."
      action={
        <Button
          className="w-auto px-6"
          onClick={() => {
            reload()
            navigate('/results', { replace: true })
          }}
        >
          다시 추천
        </Button>
      }
    />
  )
}
