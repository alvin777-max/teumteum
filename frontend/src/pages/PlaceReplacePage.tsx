import { useParams } from 'react-router'
import PlaceReplace from '../features/recommend/components/PlaceReplace'
import AppHeader from '../shared/components/AppHeader'

/** DET-03 장소 교체. /results/:courseId/replace/:placeId */
export default function PlaceReplacePage() {
  const { courseId = '', placeId = '' } = useParams()

  return (
    <>
      <AppHeader title="장소 교체" />
      <PlaceReplace courseId={courseId} placeId={placeId} />
    </>
  )
}
