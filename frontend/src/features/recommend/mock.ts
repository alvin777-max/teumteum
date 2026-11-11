import type { Course, CoursePlace } from './types'

/**
 * [임시] 추천 API 연동 전까지 화면 확인용 샘플 데이터.
 * TODO(나혜빈): API 연동 후 삭제
 */
const ORIGIN = { name: '성수역 2호선', lat: 37.5446, lng: 127.0559 }

export const MOCK_COURSES: Course[] = [
  {
    courseId: 'mock-1',
    origin: ORIGIN,
    destination: null,
    transportType: 'TRANSIT',
    startTime: '14:00',
    finalTravelMinutes: 0,
    totalMinutes: 170,
    places: [
      {
        placeId: 'p-1', name: '전시관 A', category: 'CULTURE', subCategory: '전시',
        address: '서울 성동구 ○○로 12', openingHours: '10:00–19:00', description: '작은 기획 전시가 열리는 갤러리',
        lat: 37.5432, lng: 127.0498, travelMinutes: 15, stayMinutes: 60, visitOrder: 1,
      },
      {
        placeId: 'p-2', name: '카페 B', category: 'CAFE', subCategory: '카페',
        address: '서울 성동구 ○○길 5', openingHours: '09:00–22:00',
        lat: 37.5441, lng: 127.0472, travelMinutes: 6, stayMinutes: 40, visitOrder: 2,
      },
      {
        placeId: 'p-3', name: '볼링장 C', category: 'SPORTS', subCategory: '볼링',
        address: '서울 성동구 ○○대로 30', openingHours: '12:00–24:00',
        lat: 37.5478, lng: 127.0441, travelMinutes: 10, stayMinutes: 40, visitOrder: 3,
      },
    ],
  },
  {
    courseId: 'mock-2',
    origin: ORIGIN,
    destination: null,
    transportType: 'TRANSIT',
    startTime: '14:00',
    finalTravelMinutes: 0,
    totalMinutes: 150,
    places: [
      {
        placeId: 'p-4', name: '당구장 D', category: 'SPORTS', subCategory: '당구',
        address: '서울 성동구 ○○로 44', openingHours: '11:00–02:00',
        lat: 37.5459, lng: 127.0531, travelMinutes: 8, stayMinutes: 60, visitOrder: 1,
      },
      {
        placeId: 'p-5', name: '소품샵 E', category: 'SHOPPING', subCategory: '소품샵',
        address: '서울 성동구 ○○길 18', openingHours: '12:00–20:00',
        lat: 37.5425, lng: 127.0563, travelMinutes: 12, stayMinutes: 70, visitOrder: 2,
      },
    ],
  },
  {
    courseId: 'mock-3',
    origin: ORIGIN,
    destination: null,
    transportType: 'TRANSIT',
    startTime: '14:00',
    finalTravelMinutes: 0,
    totalMinutes: 100,
    places: [
      {
        placeId: 'p-6', name: '서울숲', category: 'NATURE', subCategory: '공원',
        address: '서울 성동구 뚝섬로 273', openingHours: '상시',
        lat: 37.5444, lng: 127.0374, travelMinutes: 20, stayMinutes: 80, visitOrder: 1,
      },
    ],
  },
]

/** [임시] 장소 교체(DET-03) 후보 */
export const MOCK_ALTERNATIVES: (CoursePlace & { diffMinutes: number })[] = [
  {
    placeId: 'alt-1', name: '전시관 F', category: 'CULTURE', subCategory: '전시',
    address: '서울 성동구 ○○로 70', lat: 37.5451, lng: 127.0512,
    travelMinutes: 12, stayMinutes: 50, visitOrder: 1, diffMinutes: -13,
  },
  {
    placeId: 'alt-2', name: '갤러리 G', category: 'CULTURE', subCategory: '전시',
    address: '서울 성동구 ○○길 9', lat: 37.5418, lng: 127.0489,
    travelMinutes: 18, stayMinutes: 60, visitOrder: 1, diffMinutes: 3,
  },
]

export function findMockCourse(courseId: string): Course | undefined {
  return MOCK_COURSES.find((c) => c.courseId === courseId)
}
