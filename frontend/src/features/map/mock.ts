import type { CategoryCode, LatLng } from '../../shared/types/domain'

export interface NearbyPlace {
  placeId: string
  name: string
  category: CategoryCode
  address: string
  /** 현재 위치에서 거리(m) */
  distance: number
  /** 현재 위치 기준 위치 차이 (목업 마커 표시용) */
  offset: LatLng
}

/**
 * [임시] 주변 장소·홈 검색 목업. placeId는 recommend/mock 의 장소와 같아서
 * 누르면 장소 1곳짜리 상세(/results/place-<placeId>)로 이어진다. (API 연결 전)
 * TODO(정종일): 카카오 로컬 검색·주변 장소 API 연동 후 삭제
 */
export const MOCK_NEARBY: NearbyPlace[] = [
  { placeId: 'p-2', name: '카페 B', category: 'CAFE', address: '서울 성동구 ○○길 5', distance: 320, offset: { lat: 0.0021, lng: 0.0012 } },
  { placeId: 'p-5', name: '소품샵 E', category: 'SHOPPING', address: '서울 성동구 ○○길 18', distance: 540, offset: { lat: -0.0032, lng: 0.0024 } },
  { placeId: 'p-1', name: '전시관 A', category: 'CULTURE', address: '서울 성동구 ○○로 12', distance: 780, offset: { lat: 0.0043, lng: -0.0035 } },
  { placeId: 'p-6', name: '서울숲', category: 'NATURE', address: '서울 성동구 뚝섬로 273', distance: 950, offset: { lat: -0.0061, lng: -0.0018 } },
  { placeId: 'p-4', name: '당구장 D', category: 'SPORTS', address: '서울 성동구 ○○로 44', distance: 1800, offset: { lat: 0.0102, lng: 0.0091 } },
]

/** 거리 → "320m", "1.8km" */
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`
}

/** 도보 시간(분). 분당 67m 기준 */
export function walkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / 67))
}
