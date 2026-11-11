import { useEffect, useState } from 'react'
import { DEFAULT_POSITION, type LatLng } from '../../../shared/types/domain'

interface CurrentPosition {
  position: LatLng
  /** 위치 권한 거부·실패 여부. true면 position은 기본 위치(서울시청) */
  denied: boolean
  loading: boolean
}

/** 현재 위치. 권한 거부 시 서울시청을 기본 위치로 돌려준다. (화면설계서 HOM-01) */
export function useCurrentPosition(): CurrentPosition {
  const [state, setState] = useState<CurrentPosition>(() =>
    'geolocation' in navigator
      ? { position: DEFAULT_POSITION, denied: false, loading: true }
      : { position: DEFAULT_POSITION, denied: true, loading: false },
  )

  useEffect(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({ position: { lat: pos.coords.latitude, lng: pos.coords.longitude }, denied: false, loading: false }),
      () => setState({ position: DEFAULT_POSITION, denied: true, loading: false }),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return state
}
