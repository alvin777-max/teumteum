import { Outlet } from 'react-router'

// 모바일 우선: 기본은 모바일 폭(최대 480px), PC에서는 가운데 정렬.
// 하단 탭바 없이 화면마다 AppHeader를 둔다. (화면설계서 v0.2)
export default function Layout() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-120 flex-col bg-white">
      <Outlet />
    </div>
  )
}
