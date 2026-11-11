// 카카오 지도 JS SDK 중 우리가 쓰는 부분만 최소한으로 타입 정의한다. 필요한 API가 생기면 여기에 추가.

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoLatLngBounds {
  extend(latlng: KakaoLatLng): void
}

export interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void
  panTo(latlng: KakaoLatLng): void
  setLevel(level: number): void
  setBounds(bounds: KakaoLatLngBounds): void
  relayout(): void
}

/** 지도 위에 올리는 것(마커·오버레이·선)의 공통 부분 */
export interface KakaoOverlay {
  setMap(map: KakaoMapInstance | null): void
}

export interface KakaoMapsApi {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  LatLngBounds: new () => KakaoLatLngBounds
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMapInstance }) => KakaoOverlay
  CustomOverlay: new (options: {
    position: KakaoLatLng
    content: HTMLElement | string
    map?: KakaoMapInstance
    yAnchor?: number
  }) => KakaoOverlay
  Polyline: new (options: {
    path: KakaoLatLng[]
    strokeWeight?: number
    strokeColor?: string
    strokeOpacity?: number
    map?: KakaoMapInstance
  }) => KakaoOverlay
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsApi }
  }
}
