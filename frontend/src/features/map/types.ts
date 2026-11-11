// 카카오 지도 JS SDK 중 우리가 쓰는 부분만 최소한으로 타입 정의한다. 필요한 API가 생기면 여기에 추가.

export interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

export interface KakaoMapInstance {
  setCenter(latlng: KakaoLatLng): void
  relayout(): void
}

export interface KakaoMarker {
  setMap(map: KakaoMapInstance | null): void
}

export interface KakaoMapsApi {
  load(callback: () => void): void
  LatLng: new (lat: number, lng: number) => KakaoLatLng
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMapInstance
  Marker: new (options: { position: KakaoLatLng; map?: KakaoMapInstance }) => KakaoMarker
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsApi }
  }
}
