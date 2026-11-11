import { Link, Outlet } from 'react-router'

// 모바일 우선: 기본은 모바일 폭, PC에서는 가운데 정렬
export default function Layout() {
  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-white text-neutral-800">
      <header className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="font-bold">
          틈틈
        </Link>
        <Link to="/login" className="text-sm">
          로그인
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
