import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import type { LocationValue } from '../../../shared/types/domain'
import { mockSearchLocations } from '../mock'
import { useRecentLocationStore } from '../recentLocationStore'
import { useConditionStore } from '../store'

interface LocationSearchProps {
  type: 'origin' | 'destination'
}

/** 입력이 멈추고 이만큼(ms) 뒤 검색 */
const SEARCH_DELAY_MS = 300

/**
 * 위치 설정 (CON-02): 검색(자동완성) · 현재 위치 사용 · 최근 검색 최대 5개 · 지도에서 직접 선택.
 * 선택하면 장소명·주소·좌표를 저장하고 조건 설정(CON-01)으로 돌아간다.
 * TODO(정종일): 검색 API 연동 (현재 mock) / TODO(유지수): 지도 중앙 핀으로 위치 지정
 */
export default function LocationSearch({ type }: LocationSearchProps) {
  const navigate = useNavigate()
  const setOrigin = useConditionStore((s) => s.setOrigin)
  const setDestination = useConditionStore((s) => s.setDestination)
  const { recent, add: addRecent } = useRecentLocationStore()
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<LocationValue[] | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // 입력이 멈추고 0.3초 뒤 검색
  useEffect(() => {
    const timer = setTimeout(() => setResults(keyword.trim() ? mockSearchLocations(keyword) : null), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [keyword])

  const select = (location: LocationValue, remember = true) => {
    if (type === 'origin') setOrigin(location)
    else setDestination(location)
    if (remember) addRecent(location)
    navigate(-1)
  }

  const selectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => select({ name: '현재 위치', lat: pos.coords.latitude, lng: pos.coords.longitude }, false),
      () => setMessage('위치 권한이 거부되었습니다. 장소를 검색해 직접 설정해 주세요.'),
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="🔍 장소, 주소 검색"
        aria-label="장소, 주소 검색"
        autoFocus
        className="h-12 rounded-xl border border-line px-4 text-sm outline-none focus:border-primary"
      />

      {results !== null ? (
        results.length === 0 ? (
          <p className="text-sm text-neutral-400">‘{keyword}’ 검색 결과가 없어요.</p>
        ) : (
          <LocationList locations={results} onSelect={select} />
        )
      ) : (
        <>
          <button type="button" onClick={selectCurrentLocation} className="flex h-12 items-center gap-2 text-sm font-semibold text-primary">
            📍 현재 위치 사용
          </button>
          {message && <p className="text-sm text-red-500">{message}</p>}

          {type === 'destination' && (
            <button
              type="button"
              onClick={() => {
                setDestination(null)
                navigate(-1)
              }}
              className="text-left text-sm text-neutral-500"
            >
              도착지 입력 안 함
            </button>
          )}

          <section>
            <h2 className="mb-2 text-xs font-semibold text-neutral-400">최근 검색</h2>
            {recent.length === 0 ? (
              <p className="text-sm text-neutral-400">최근 검색한 위치가 없습니다.</p>
            ) : (
              <LocationList locations={recent} onSelect={select} />
            )}
          </section>

          <button type="button" disabled className="h-12 rounded-xl border border-line text-sm font-semibold disabled:text-neutral-400">
            🗺 지도에서 직접 선택 (준비 중)
          </button>
        </>
      )}
    </div>
  )
}

function LocationList({ locations, onSelect }: { locations: LocationValue[]; onSelect: (location: LocationValue) => void }) {
  return (
    <ul className="flex flex-col">
      {locations.map((location) => (
        <li key={`${location.name}-${location.lat}`} className="border-b border-line last:border-0">
          <button type="button" onClick={() => onSelect(location)} className="w-full py-3 text-left">
            <p className="text-sm font-semibold">{location.name}</p>
            {location.address && <p className="text-xs text-neutral-500">{location.address}</p>}
          </button>
        </li>
      ))}
    </ul>
  )
}
