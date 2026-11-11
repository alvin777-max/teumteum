import type { LocationValue } from '../../shared/types/domain'

/**
 * [임시] 위치 검색 결과 목업 (CON-02). 이름·주소에 검색어가 들어간 곳을 돌려준다.
 * TODO(정종일): 카카오 로컬 키워드 검색(결과가 없고 주소 형태면 주소 검색) API 연동 후 삭제
 */
const MOCK_LOCATIONS: LocationValue[] = [
  { name: '성수역 2호선', address: '서울 성동구 아차산로 지하 100', lat: 37.5446, lng: 127.0559 },
  { name: '서울숲', address: '서울 성동구 뚝섬로 273', lat: 37.5444, lng: 127.0374 },
  { name: '홍대입구역 2호선', address: '서울 마포구 양화로 지하 160', lat: 37.5572, lng: 126.9245 },
  { name: '강남역 2호선', address: '서울 강남구 강남대로 지하 396', lat: 37.4979, lng: 127.0276 },
  { name: '서울시청', address: '서울 중구 세종대로 110', lat: 37.5666, lng: 126.9784 },
  { name: '잠실역 2호선', address: '서울 송파구 올림픽로 지하 265', lat: 37.5133, lng: 127.1001 },
]

export function mockSearchLocations(keyword: string): LocationValue[] {
  const k = keyword.trim()
  if (!k) return []
  return MOCK_LOCATIONS.filter((l) => l.name.includes(k) || l.address?.includes(k))
}
