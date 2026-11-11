import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { LocationValue } from '../../../shared/types/domain'
import { useConditionStore } from '../store'

interface LocationSearchProps {
  type: 'origin' | 'destination'
}

/**
 * 위치 설정 (CON-02). 선택하면 조건 선택 화면으로 돌아가 값이 채워진다.
 * TODO(정종일): 검색 자동완성 — 백엔드 장소 검색 API 연동
 * TODO: 최근 검색 최대 5개, 지도에서 직접 선택(중앙 핀)
 */
export default function LocationSearch({ type }: LocationSearchProps) {
  const navigate = useNavigate()
  const setOrigin = useConditionStore((s) => s.setOrigin)
  const setDestination = useConditionStore((s) => s.setDestination)
  const [keyword, setKeyword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const select = (location: LocationValue) => {
    if (type === 'origin') setOrigin(location)
    else setDestination(location)
    navigate(-1)
  }

  const selectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage('이 브라우저는 위치 정보를 지원하지 않습니다.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => select({ name: '현재 위치', lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setMessage('위치 권한이 거부되었습니다. 브라우저 설정에서 허용해 주세요.'),
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="🔍 장소, 주소 검색"
        className="h-12 rounded-xl border border-line px-4 text-sm outline-none focus:border-primary"
      />

      <button type="button" onClick={selectCurrentLocation} className="flex h-12 items-center gap-2 text-sm font-semibold text-primary">
        📍 현재 위치 사용
      </button>
      {message && <p className="text-sm text-red-500">{message}</p>}

      {type === 'destination' && (
        <button type="button" onClick={() => { setDestination(null); navigate(-1) }} className="text-left text-sm text-neutral-500">
          도착지 선택 안 함
        </button>
      )}

      <section>
        <h2 className="mb-2 text-xs font-semibold text-neutral-400">최근 검색</h2>
        <p className="text-sm text-neutral-400">최근 검색한 위치가 없습니다.</p>
      </section>

      {/* TODO: 지도 중앙 핀을 옮겨 위치 지정 */}
      <button type="button" disabled className="h-12 rounded-xl border border-line text-sm font-semibold disabled:text-neutral-400">
        🗺 지도에서 직접 선택 (준비 중)
      </button>
    </div>
  )
}
