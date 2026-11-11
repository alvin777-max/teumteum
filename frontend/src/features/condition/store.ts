import { create } from 'zustand'
import type { CategoryCode, CategoryMode, LocationValue, TransportType } from '../../shared/types/domain'
import { nowRoundedTime } from '../../shared/utils/format'

/**
 * 외출 조건 (CON-01).
 * 결과 화면에서 '조건 바꾸기'로 돌아와도 입력값이 유지되도록 전역 상태로 둔다.
 * 새로고침·앱 재실행 시에는 초기화된다.
 */
interface ConditionState {
  origin: LocationValue | null
  destination: LocationValue | null
  /** 시작 시각 "HH:mm" */
  startTime: string
  /** 이용 가능 시간(분). 종료 시각 = 시작 시각 + 이 값 */
  availableMinutes: number
  transportType: TransportType
  categoryMode: CategoryMode
  /** 직접 선택한 대분류. 비어 있으면 랜덤으로 진행 */
  categories: CategoryCode[]

  setOrigin: (origin: LocationValue | null) => void
  setDestination: (destination: LocationValue | null) => void
  setStartTime: (startTime: string) => void
  setAvailableMinutes: (minutes: number) => void
  setTransportType: (transportType: TransportType) => void
  setCategoryMode: (mode: CategoryMode) => void
  toggleCategory: (category: CategoryCode) => void
  reset: () => void
}

const initialState = () => ({
  origin: null,
  destination: null,
  startTime: nowRoundedTime(),
  availableMinutes: 120,
  transportType: 'TRANSIT' as TransportType,
  categoryMode: 'DIRECT' as CategoryMode,
  categories: [] as CategoryCode[],
})

export const useConditionStore = create<ConditionState>((set) => ({
  ...initialState(),
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setStartTime: (startTime) => set({ startTime }),
  setAvailableMinutes: (availableMinutes) => set({ availableMinutes }),
  setTransportType: (transportType) => set({ transportType }),
  setCategoryMode: (categoryMode) => set({ categoryMode }),
  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),
  reset: () => set(initialState()),
}))

/** 실제로 랜덤 추천인지 (랜덤 선택 또는 직접 선택에서 아무것도 안 고름) */
export function isRandomCondition(state: Pick<ConditionState, 'categoryMode' | 'categories'>): boolean {
  return state.categoryMode === 'RANDOM' || state.categories.length === 0
}
