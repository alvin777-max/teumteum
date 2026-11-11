import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '../../../shared/types/domain'
import { loadKakaoMap } from '../api/loadKakaoMap'
import type { KakaoMapInstance, KakaoMapsApi, KakaoOverlay } from '../types'

/** 지도 마커. label이 있으면 S·순번·E 같은 라벨 마커로, 없으면 기본 마커로 그린다 */
export interface MapMarker extends LatLng {
  label?: string
  /** 라벨 마커 색 (출발·도착은 어둡게, 장소는 기본색) */
  tone?: 'primary' | 'dark'
  /** 누르면 뜨는 말풍선 문구 */
  title?: string
}

interface KakaoMapProps {
  center: LatLng
  /** 확대 수준 (작을수록 확대) */
  level?: number
  markers?: MapMarker[]
  /** true면 마커를 순서대로 잇는 경로선을 그린다 (대중교통은 1차 버전에서 직선) */
  polyline?: boolean
  /** true면 처음 그릴 때 마커가 모두 보이게 맞춘다 */
  fitBounds?: boolean
  className?: string
}

// 기본값을 바깥에 둬야 매 렌더마다 새 배열이 생겨 지도 effect가 다시 도는 것을 막는다
const NO_MARKERS: MapMarker[] = []

const TONE_COLOR = {
  primary: '#3b6cf6',
  dark: '#404040',
}

function createLabelElement(marker: MapMarker): HTMLElement {
  const wrap = document.createElement('div')
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer'

  const bubble = document.createElement('div')
  bubble.textContent = marker.title ?? ''
  bubble.style.cssText =
    'display:none;margin-bottom:4px;padding:4px 8px;border-radius:8px;background:#fff;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.2);white-space:nowrap'

  const pin = document.createElement('div')
  pin.textContent = marker.label ?? ''
  pin.style.cssText = `display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;border:2px solid #fff;background:${TONE_COLOR[marker.tone ?? 'primary']};color:#fff;font-size:12px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,.3)`

  if (marker.title) {
    pin.addEventListener('click', () => {
      bubble.style.display = bubble.style.display === 'none' ? 'block' : 'none'
    })
  }
  wrap.append(bubble, pin)
  return wrap
}

function drawOverlays(maps: KakaoMapsApi, map: KakaoMapInstance, markers: MapMarker[], polyline: boolean): KakaoOverlay[] {
  const overlays: KakaoOverlay[] = markers.map((m) => {
    const position = new maps.LatLng(m.lat, m.lng)
    return m.label
      ? new maps.CustomOverlay({ position, content: createLabelElement(m), map, yAnchor: 1 })
      : new maps.Marker({ position, map })
  })
  if (polyline && markers.length > 1) {
    overlays.push(
      new maps.Polyline({
        path: markers.map((m) => new maps.LatLng(m.lat, m.lng)),
        strokeWeight: 4,
        strokeColor: TONE_COLOR.primary,
        strokeOpacity: 0.8,
        map,
      }),
    )
  }
  return overlays
}

/** 카카오 지도. SDK 로드는 loadKakaoMap 한 곳에서만 한다 (AGENTS.md 6장) */
export default function KakaoMap({
  center,
  level = 4,
  markers = NO_MARKERS,
  polyline = false,
  fitBounds = false,
  className = '',
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapsRef = useRef<KakaoMapsApi | null>(null)
  const mapRef = useRef<KakaoMapInstance | null>(null)
  const overlayRefs = useRef<KakaoOverlay[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // 지도는 처음 위치·확대 수준으로 한 번만 만든다. 이후 변경은 아래 effect들이 반영
  const initialRef = useRef({ center, level })

  // 지도 생성: 한 번만
  useEffect(() => {
    let cancelled = false
    loadKakaoMap()
      .then((maps) => {
        if (cancelled || !containerRef.current || mapRef.current) return
        const { center: c, level: l } = initialRef.current
        mapsRef.current = maps
        mapRef.current = new maps.Map(containerRef.current, { center: new maps.LatLng(c.lat, c.lng), level: l })
        setReady(true)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '지도를 불러오지 못했습니다.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 마커·경로선
  useEffect(() => {
    const maps = mapsRef.current
    const map = mapRef.current
    if (!ready || !maps || !map) return
    overlayRefs.current.forEach((o) => o.setMap(null))
    overlayRefs.current = drawOverlays(maps, map, markers, polyline)

    if (fitBounds && markers.length > 1) {
      const bounds = new maps.LatLngBounds()
      markers.forEach((m) => bounds.extend(new maps.LatLng(m.lat, m.lng)))
      map.setBounds(bounds)
    }
  }, [ready, markers, polyline, fitBounds])

  // 중심 이동: 처음 만든 위치와 같으면 건너뛴다 (fitBounds로 맞춘 화면을 덮지 않도록)
  useEffect(() => {
    const maps = mapsRef.current
    const { center: initial } = initialRef.current
    if (!ready || !maps || !mapRef.current) return
    if (initial.lat === center.lat && initial.lng === center.lng) return
    initialRef.current = { ...initialRef.current, center }
    mapRef.current.panTo(new maps.LatLng(center.lat, center.lng))
  }, [ready, center])

  // 확대 수준: 처음 값과 같으면 건너뛴다
  useEffect(() => {
    if (!ready || !mapRef.current || initialRef.current.level === level) return
    initialRef.current = { ...initialRef.current, level }
    mapRef.current.setLevel(level)
  }, [ready, level])

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
