import { useRef, useState, type PointerEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Button from '../../../shared/components/Button'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'
import EmptyState from '../../../shared/components/EmptyState'
import { formatMinutes, formatShortDate } from '../../../shared/utils/format'
import { getCourseName } from '../../recommend/types'
import { useSavedCourseStore, type SavedCourse } from '../store'

/** 왼쪽으로 이만큼(px) 이상 밀면 저장 해제 확인 */
const SWIPE_THRESHOLD = 60

/**
 * 저장한 코스 목록 (MY-02): 최신순. 카드를 누르면 MY-03.
 * 저장 해제는 카드의 버튼 또는 왼쪽으로 밀기 → 페이지 안에서 한 번 더 확인
 * TODO(김하윤): 저장한 코스 조회·삭제 API 연동
 */
export default function SavedCourseList() {
  const navigate = useNavigate()
  const { savedCourses, remove } = useSavedCourseStore()
  const [removingId, setRemovingId] = useState<string | null>(null)

  if (savedCourses.length === 0) {
    return (
      <EmptyState
        message="아직 저장한 코스가 없어요"
        action={
          <Button className="w-auto px-6" onClick={() => navigate('/condition')}>
            지금 외출 추천
          </Button>
        }
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-3 p-4">
        {savedCourses.map((saved) => (
          <SavedCourseCard key={saved.course.courseId} saved={saved} onRemove={() => setRemovingId(saved.course.courseId)} />
        ))}
      </ul>

      {removingId && (
        <ConfirmDialog
          message="저장을 해제할까요?"
          confirmLabel="저장 해제"
          onCancel={() => setRemovingId(null)}
          onConfirm={() => {
            remove(removingId)
            setRemovingId(null)
          }}
        />
      )}
    </>
  )
}

/** 저장한 코스 카드: 코스명, 장소 수, 총 소요시간, 저장일 */
function SavedCourseCard({ saved, onRemove }: { saved: SavedCourse; onRemove: () => void }) {
  const { course, savedAt } = saved
  const startX = useRef<number | null>(null)

  const onPointerDown = (e: PointerEvent) => {
    startX.current = e.clientX
  }
  const onPointerUp = (e: PointerEvent) => {
    if (startX.current !== null && startX.current - e.clientX > SWIPE_THRESHOLD) onRemove()
    startX.current = null
  }

  return (
    <li onPointerDown={onPointerDown} onPointerUp={onPointerUp} className="flex items-center gap-2 rounded-2xl border border-line p-4">
      <Link to={`/mypage/courses/${course.courseId}`} className="min-w-0 flex-1" draggable={false}>
        <p className="truncate font-bold">{getCourseName(course)}</p>
        <p className="mt-1 text-xs text-neutral-500">
          {course.places.length}곳 · {formatMinutes(course.totalMinutes)} · {formatShortDate(savedAt)} 저장
        </p>
      </Link>
      <button type="button" onClick={onRemove} className="shrink-0 rounded-lg border border-line px-2 py-1 text-xs text-neutral-500">
        저장 해제
      </button>
    </li>
  )
}
