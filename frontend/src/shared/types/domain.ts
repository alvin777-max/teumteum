// 여러 feature에서 함께 쓰는 도메인 값. 기준: 화면설계서 v1.0, 영문 코드는 AGENTS.md 7장 용어표.
// TODO: 카테고리 영문 코드는 ERD·API 명세 확정 시 백엔드 enum 이름과 맞춘다. (현재 초안)

/** 이동수단 (대중교통·도보·차량, 기본 대중교통) */
export type TransportType = 'TRANSIT' | 'WALK' | 'CAR'

export const TRANSPORT_OPTIONS: { value: TransportType; label: string }[] = [
  { value: 'TRANSIT', label: '대중교통' },
  { value: 'WALK', label: '도보' },
  { value: 'CAR', label: '차량' },
]

export function getTransportLabel(type: TransportType): string {
  return TRANSPORT_OPTIONS.find((t) => t.value === type)?.label ?? type
}

/** 카테고리 선택 방식: 직접 선택(대분류 복수) / 랜덤 추천 */
export type CategoryMode = 'DIRECT' | 'RANDOM'

/** 대분류 8개 */
export type CategoryCode =
  | 'CULTURE'
  | 'CAFE'
  | 'FOOD'
  | 'NATURE'
  | 'ENTERTAINMENT'
  | 'SHOPPING'
  | 'SPORTS'
  | 'TOURISM'

export interface CategoryOption {
  code: CategoryCode
  label: string
  /** 세분류 (화면설계서 v1.0 확정본. 장소 데이터 API 분류와 대조 필요) */
  subCategories: string[]
}

export const CATEGORIES: CategoryOption[] = [
  { code: 'CULTURE', label: '문화생활', subCategories: ['전시', '영화', '공연', '책방'] },
  { code: 'CAFE', label: '카페/디저트', subCategories: ['카페', '베이커리', '디저트'] },
  { code: 'FOOD', label: '음식/맛집', subCategories: ['한식', '양식', '일식', '중식', '분식'] },
  { code: 'NATURE', label: '자연/휴식', subCategories: ['공원', '산책로', '한강'] },
  { code: 'ENTERTAINMENT', label: '오락/체험', subCategories: ['방탈출', '보드게임', '공방', '노래방'] },
  { code: 'SHOPPING', label: '쇼핑/구경', subCategories: ['소품샵', '팝업스토어', '시장', '백화점'] },
  { code: 'SPORTS', label: '스포츠활동', subCategories: ['당구', '볼링', '클라이밍'] },
  { code: 'TOURISM', label: '관광/명소', subCategories: ['랜드마크', '고궁', '전망대'] },
]

export function getCategoryLabel(code: CategoryCode): string {
  return CATEGORIES.find((c) => c.code === code)?.label ?? code
}

/** 이용 시간 슬라이더 단계(분): 0분·30분·1~6시간 (최대 6시간) */
export const TIME_STEPS = [0, 30, 60, 120, 180, 240, 300, 360]

/** 위도·경도 */
export interface LatLng {
  lat: number
  lng: number
}

/** 출발지·도착지처럼 이름이 붙은 위치 */
export interface LocationValue extends LatLng {
  name: string
  address?: string
}

/** 위치 권한 거부 시 기본 위치 (서울시청) */
export const DEFAULT_POSITION: LatLng = { lat: 37.5666, lng: 126.9784 }
