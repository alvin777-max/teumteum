import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import Button from '../../../shared/components/Button'
import BottomNav from '../../../shared/layout/BottomNav'
import { useConditionStore } from '../../condition/store'
import { useCurrentPosition } from '../hooks/useCurrentPosition'
import { MOCK_NEARBY } from '../mock'
import HomeSearchBar from './HomeSearchBar'
import KakaoMap from './KakaoMap'
import NearbySheet from './NearbySheet'

interface HomeScreenProps {
  /** true면 주변 장소 탐색 시트(HOM-02)를 연다 */
  nearby?: boolean
}

/** 홈 / 바로 추천 (HOM-01) + 주변 장소 탐색 시트 (HOM-02). 지도·검색창은 고정 */
export default function HomeScreen({ nearby = false }: HomeScreenProps) {
  const navigate = useNavigate()
  const { position, denied } = useCurrentPosition()
  const setOrigin = useConditionStore((s) => s.setOrigin)
  const [radius, setRadius] = useState(1000)

  // 주변 장소 마커 예시 (API 연결 전 목업)
  const markers = useMemo(
    () =>
      MOCK_NEARBY.filter((p) => !nearby || p.distance <= radius).map((p) => ({
        lat: position.lat + p.offset.lat,
        lng: position.lng + p.offset.lng,
      })),
    [position, nearby, radius],
  )

  // 지금 외출 추천: 출발지 기본값은 현재 위치. 권한이 없으면 비운 채 진입해 직접 설정 안내
  const startRecommend = () => {
    setOrigin(denied ? null : { name: '현재 위치', ...position })
    navigate('/condition')
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="relative flex-1">
        <KakaoMap center={position} markers={markers} level={nearby && radius > 1000 ? 6 : 4} className="absolute inset-0" />

        <div className="absolute inset-x-0 top-0 z-10 p-4">
          <HomeSearchBar />
        </div>

        {nearby ? (
          <NearbySheet denied={denied} radius={radius} onRadiusChange={setRadius} />
        ) : (
          <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-4">
            <Button onClick={startRecommend}>지금 외출 추천</Button>
            <Button variant="secondary" onClick={() => navigate('/nearby')}>
              주변 장소 탐색
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
