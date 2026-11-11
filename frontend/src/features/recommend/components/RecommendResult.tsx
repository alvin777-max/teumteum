import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import EmptyState from '../../../shared/components/EmptyState'
import Toast from '../../../shared/components/Toast'
import { CATEGORIES } from '../../../shared/types/domain'
import { isRandomCondition, useConditionStore } from '../../condition/store'
import { useRecommendStore } from '../store'
import ConditionSummary from './ConditionSummary'
import CourseCard from './CourseCard'

const ALL = '전체'

/** 한 번에 보여주는 코스 수 (화면설계서 결정 3: 3개, 정렬 없음) */
const COURSE_COUNT = 3

/**
 * 추천 결과 목록 (RES-01)
 * TODO(나혜빈): 추천 API 연동 (현재 mock). 빈 결과면 백엔드가 반경을 넓혀 다시 찾는다
 */
export default function RecommendResult() {
  const navigate = useNavigate()
  const condition = useConditionStore()
  const { courses, reload } = useRecommendStore()
  const [subCategory, setSubCategory] = useState(ALL)
  const [toast, setToast] = useState<string | null>(null)
  const closeToast = useCallback(() => setToast(null), [])

  // 세분류 필터: 선택한 대분류의 세분류. 랜덤이면 결과 장소들의 세분류
  const subCategories = isRandomCondition(condition)
    ? [...new Set(courses.flatMap((c) => c.places.map((p) => p.subCategory)))]
    : CATEGORIES.filter((c) => condition.categories.includes(c.code)).flatMap((c) => c.subCategories)

  const filtered = courses
    .slice(0, COURSE_COUNT)
    .filter((c) => subCategory === ALL || c.places.some((p) => p.subCategory === subCategory))

  const handleReload = () => {
    if (!reload()) {
      setToast('잠시 후 다시 시도해 주세요')
      return
    }
    setSubCategory(ALL)
  }

  return (
    <>
      <div className="flex flex-col gap-3 px-4 pt-4">
        <ConditionSummary />
        <ChipGroup>
          {[ALL, ...subCategories].map((name) => (
            <Chip key={name} selected={subCategory === name} onClick={() => setSubCategory(name)}>
              {name}
            </Chip>
          ))}
        </ChipGroup>
      </div>

      {filtered.length > 0 ? (
        <ul className="flex flex-col gap-3 p-4">
          {filtered.map((course, i) => (
            <li key={course.courseId}>
              <CourseCard course={course} index={i + 1} to={`/results/${course.courseId}`} />
            </li>
          ))}
          <li className="text-center text-xs text-neutral-400">이동·체류시간은 예상값이라 실제와 다를 수 있어요</li>
        </ul>
      ) : (
        <EmptyState
          message="조건에 맞는 코스가 없어요. 시간을 늘리거나 카테고리를 줄여보세요."
          action={
            <Button variant="secondary" className="w-auto px-6" onClick={() => navigate('/condition')}>
              조건 바꾸기
            </Button>
          }
        />
      )}

      <BottomActionBar>
        <Button variant="secondary" onClick={() => navigate('/condition')}>
          조건 바꾸기
        </Button>
        <Button onClick={handleReload}>다시 추천</Button>
      </BottomActionBar>

      {toast && <Toast message={toast} onClose={closeToast} />}
    </>
  )
}
