import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { LocationValue } from '../../shared/types/domain'

/** 최근 검색 위치 최대 개수 (CON-02 ③) */
const MAX_RECENT = 5

interface RecentLocationState {
  recent: LocationValue[]
  add: (location: LocationValue) => void
}

/**
 * 최근 검색한 위치. 서버에 위치 이력을 남기지 않도록 이 기기(localStorage)에만 둔다. (요구사항 NFR-011)
 */
export const useRecentLocationStore = create<RecentLocationState>()(
  persist(
    (set) => ({
      recent: [],
      add: (location) =>
        set((state) => ({
          recent: [location, ...state.recent.filter((r) => r.name !== location.name)].slice(0, MAX_RECENT),
        })),
    }),
    { name: 'teumteum-recent-locations', storage: createJSONStorage(() => localStorage) },
  ),
)
