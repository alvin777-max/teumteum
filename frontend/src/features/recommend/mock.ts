import type { AlternativePlace, Course, CoursePlace } from './types'

/**
 * [임시] 추천 API 연동 전까지 화면 확인용 샘플 데이터.
 * TODO(나혜빈): API 연동 후 삭제
 */
const ORIGIN = { name: '성수역 2호선', lat: 37.5446, lng: 127.0559 }

const PLACES: Record<string, CoursePlace> = {
  'p-1': {
    placeId: 'p-1', name: '전시관 A', category: 'CULTURE', subCategory: '전시',
    address: '서울 성동구 ○○로 12', openingHours: '10:00–19:00', description: '작은 기획 전시가 열리는 갤러리',
    lat: 37.5432, lng: 127.0498, travelMinutes: 15, transitInfo: '버스 2413 · 환승 0회', stayMinutes: 90, visitOrder: 1,
  },
  'p-2': {
    placeId: 'p-2', name: '카페 B', category: 'CAFE', subCategory: '카페',
    address: '서울 성동구 ○○길 5', openingHours: '09:00–22:00',
    lat: 37.5441, lng: 127.0472, travelMinutes: 6, transitInfo: '도보', stayMinutes: 60, visitOrder: 2,
  },
  'p-3': {
    placeId: 'p-3', name: '볼링장 C', category: 'SPORTS', subCategory: '볼링',
    address: '서울 성동구 ○○대로 30', openingHours: '12:00–24:00',
    lat: 37.5478, lng: 127.0441, travelMinutes: 10, transitInfo: '버스 141 · 환승 0회', stayMinutes: 90, visitOrder: 3,
  },
  'p-4': {
    placeId: 'p-4', name: '당구장 D', category: 'SPORTS', subCategory: '당구',
    address: '서울 성동구 ○○로 44', openingHours: '11:00–02:00',
    lat: 37.5459, lng: 127.0531, travelMinutes: 15, transitInfo: '버스 721 · 환승 0회', stayMinutes: 90, visitOrder: 1,
  },
  'p-5': {
    placeId: 'p-5', name: '소품샵 E', category: 'SHOPPING', subCategory: '소품샵',
    address: '서울 성동구 ○○길 18', openingHours: '12:00–20:00',
    lat: 37.5425, lng: 127.0563, travelMinutes: 8, transitInfo: '도보', stayMinutes: 40, visitOrder: 2,
  },
  'p-6': {
    placeId: 'p-6', name: '서울숲', category: 'NATURE', subCategory: '공원',
    address: '서울 성동구 뚝섬로 273', openingHours: '상시', description: '한강과 이어지는 넓은 도심 공원',
    lat: 37.5444, lng: 127.0374, travelMinutes: 20, transitInfo: '버스 2014 · 환승 0회', stayMinutes: 60, visitOrder: 1,
  },
  'p-7': {
    placeId: 'p-7', name: '팝업스토어 F', category: 'SHOPPING', subCategory: '팝업스토어',
    address: '서울 성동구 연무장길 10', openingHours: '11:00–21:00',
    lat: 37.5428, lng: 127.0551, travelMinutes: 12, transitInfo: '버스 2413 · 환승 0회', stayMinutes: 40, visitOrder: 2,
  },
  'p-8': {
    placeId: 'p-8', name: '볼링장 G', category: 'SPORTS', subCategory: '볼링',
    address: '서울 성동구 왕십리로 50', openingHours: '10:00–24:00',
    lat: 37.5473, lng: 127.0466, travelMinutes: 18, transitInfo: '지하철 2호선 · 환승 0회', stayMinutes: 90, visitOrder: 1,
  },
}

/** 조합 후보. '다시 추천'을 누르면 3개씩 돌려가며 보여준다 */
const COMBINATIONS: { places: string[]; estimated?: boolean }[] = [
  { places: ['p-4', 'p-5'] },
  { places: ['p-1', 'p-2', 'p-3'] },
  { places: ['p-8'] },
  { places: ['p-6', 'p-2'] },
  { places: ['p-4', 'p-7'], estimated: true },
  { places: ['p-1'] },
]

function buildCourse(courseId: string, placeIds: string[], estimated = false): Course {
  const places = placeIds.map((id, i) => ({ ...PLACES[id], visitOrder: i + 1 }))
  const totalMinutes = places.reduce((sum, p) => sum + p.travelMinutes + p.stayMinutes, 0)
  return {
    courseId,
    places,
    origin: ORIGIN,
    destination: null,
    transportType: 'TRANSIT',
    startTime: '13:00',
    finalTravelMinutes: 0,
    totalMinutes,
    estimated,
  }
}

/** [임시] n번째 '다시 추천' 결과 (코스 3개) */
export function mockRecommend(round: number): Course[] {
  return [0, 1, 2].map((i) => {
    const index = (round * 3 + i) % COMBINATIONS.length
    const combo = COMBINATIONS[index]
    return buildCourse(`mock-${round}-${i}`, combo.places, combo.estimated)
  })
}

/** [임시] 장소 1곳짜리 코스 (홈 검색·주변 탐색에서 장소를 눌렀을 때). courseId = "place-<placeId>" */
export function mockSinglePlaceCourse(courseId: string): Course | undefined {
  const placeId = courseId.replace(/^place-/, '')
  if (!courseId.startsWith('place-') || !PLACES[placeId]) return undefined
  return buildCourse(courseId, [placeId])
}

/** [임시] 장소 교체(DET-03) 후보 5곳: 같은 세분류, 앞뒤 장소와 가까운 순 */
export function mockAlternatives(place: CoursePlace): AlternativePlace[] {
  const diffs = [-3, 3, 5, 8, 12]
  const travel = [12, 18, 20, 22, 25]
  return diffs.map((diffMinutes, i) => ({
    ...place,
    placeId: `${place.placeId}-alt-${i + 1}`,
    name: `${place.subCategory} ${String.fromCharCode(72 + i)}`,
    address: `서울 성동구 ○○로 ${70 + i * 4}`,
    description: undefined,
    imageUrl: undefined,
    lat: place.lat + 0.001 * (i + 1),
    lng: place.lng - 0.001 * (i + 1),
    travelMinutes: travel[i],
    transitInfo: i % 2 === 0 ? '버스 · 환승 0회' : '도보',
    diffMinutes,
  }))
}
