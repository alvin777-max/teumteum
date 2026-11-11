import RecommendResult from '../features/recommend/components/RecommendResult'
import AppHeader from '../shared/components/AppHeader'

/** RES-01 추천 결과 목록 */
export default function ResultPage() {
  return (
    <>
      <AppHeader title="추천 결과" />
      <RecommendResult />
    </>
  )
}
