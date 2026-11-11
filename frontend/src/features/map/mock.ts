import type { CategoryCode, LatLng } from '../../shared/types/domain'

export interface NearbyPlace {
  placeId: string
  name: string
  category: CategoryCode
  /** 현재 위치에서 거리(m) */
  distance: number
  /** 현재 위치 기준 위치 차이 (목업 마커 표시용) */
  offset: LatLng
}

/**
 * [임시] 주변 장소 목업. 홈 지도 마커 예시와 주변 탐색 시트에 쓴다. (API 연결 전)
 * TODO: 주변 장소 API 연동 후 삭제
 */
export const MOCK_NEARBY: NearbyPlace[] = [
  { placeId: 'n-1', name: '카페 온도', category: 'CAFE', distance: 320, offset: { lat: 0.0021, lng: 0.0012 } },
  { placeId: 'n-2', name: '골목 분식', category: 'FOOD', distance: 540, offset: { lat: -0.0032, lng: 0.0024 } },
  { placeId: 'n-3', name: '작은 서점', category: 'CULTURE', distance: 780, offset: { lat: 0.0043, lng: -0.0035 } },
  { placeId: 'n-4', name: '동네 공원', category: 'NATURE', distance: 950, offset: { lat: -0.0061, lng: -0.0018 } },
  { placeId: 'n-5', name: '보드게임 카페', category: 'ENTERTAINMENT', distance: 1800, offset: { lat: 0.0102, lng: 0.0091 } },
]
