import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '../../../shared/types/domain'
import { loadKakaoMap } from '../api/loadKakaoMap'
import type { KakaoMapInstance, KakaoMarker } from '../types'

interface KakaoMapProps {
  center: LatLng
  /** 확대 수준 (작을수록 확대) */
  level?: number
  /** 지도에 표시할 마커 위치. 순번 마커·경로선은 추후 추가 */
  markers?: LatLng[]
  className?: string
}

// 기본값을 바깥에 둬야 매 렌더마다 새 배열이 생겨 지도 effect가 다시 도는 것을 막는다
const NO_MARKERS: LatLng[] = []

export default function KakaoMap({ center, level = 4, markers = NO_MARKERS, className = '' }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const markerRefs = useRef<KakaoMarker[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadKakaoMap()
      .then((maps) => {
        if (cancelled || !containerRef.current) return
        const latlng = new maps.LatLng(center.lat, center.lng)
        if (mapRef.current) {
          mapRef.current.setCenter(latlng)
        } else {
          mapRef.current = new maps.Map(containerRef.current, { center: latlng, level })
        }

        markerRefs.current.forEach((marker) => marker.setMap(null))
        markerRefs.current = markers.map(
          (m) => new maps.Marker({ position: new maps.LatLng(m.lat, m.lng), map: mapRef.current ?? undefined }),
        )
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '지도를 불러오지 못했습니다.')
      })

    return () => {
      cancelled = true
    }
  }, [center.lat, center.lng, level, markers])

  return (
    <div className={`relative bg-neutral-200 ${className}`}>
      <div ref={containerRef} className="size-full" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-neutral-500">
          {error}
        </div>
      )}
    </div>
  )
}
