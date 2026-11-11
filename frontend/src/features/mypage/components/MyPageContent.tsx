import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthStore } from '../../../shared/auth/authStore'
import Button from '../../../shared/components/Button'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import { useSavedCourseStore } from '../store'

/**
 * 마이페이지 (MY-01)
 * - 회원: 닉네임·이메일, 메뉴(저장한 코스 / 회원 정보 수정 / 로그아웃 / 회원 탈퇴)
 * - 비회원: 로그인 안내와 로그인 버튼
 */
export default function MyPageContent() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuthStore()
  const savedCount = useSavedCourseStore((s) => s.savedCourses.length)
  const [confirmLogout, setConfirmLogout] = useState(false)

  if (!isLoggedIn || !user) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-neutral-600">로그인하면 코스를 저장할 수 있어요</p>
        <Button className="w-auto px-8" onClick={() => navigate('/login', { state: { from: '/mypage' } })}>
          로그인
        </Button>
      </div>
    )
  }

  return (
    <>
      <section className="m-4 rounded-2xl bg-neutral-100 p-5">
        <p className="text-lg font-bold">{user.nickname}</p>
        <p className="mt-1 text-sm text-neutral-500">{user.email}</p>
      </section>

      <ul className="border-t border-line">
        <MenuItem to="/mypage/courses" label="저장한 코스" count={savedCount} />
        <MenuItem to="/mypage/edit" label="회원 정보 수정" />
        <li className="border-b border-line">
          <button type="button" onClick={() => setConfirmLogout(true)} className="flex h-14 w-full items-center px-4 text-left text-sm">
            로그아웃
          </button>
        </li>
        <li className="border-b border-line">
          <Link to="/mypage/edit?withdraw=1" className="flex h-14 items-center px-4 text-sm text-neutral-400">
            회원 탈퇴
          </Link>
        </li>
      </ul>

      {confirmLogout && (
        <ConfirmDialog
          message="로그아웃할까요?"
          confirmLabel="로그아웃"
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => {
            logout()
            navigate('/', { replace: true })
          }}
        />
      )}
    </>
  )
}

function MenuItem({ to, label, count }: { to: string; label: string; count?: number }) {
  return (
    <li className="border-b border-line">
      <Link to={to} className="flex h-14 items-center justify-between px-4 text-sm">
        {label}
        <span className="text-neutral-400">
          {count !== undefined && <span className="mr-1">{count}</span>}›
        </span>
      </Link>
    </li>
  )
}
