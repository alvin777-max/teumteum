import { useState } from 'react'
import { useNavigate } from 'react-router'
import BottomActionBar from '../../../shared/components/BottomActionBar'
import Button from '../../../shared/components/Button'
import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import EmptyState from '../../../shared/components/EmptyState'
import { CATEGORIES } from '../../../shared/types/domain'
import { isRandomCondition, useConditionStore } from '../../condition/store'
import { MOCK_COURSES } from '../mock'
import CourseCard from './CourseCard'
import ConditionSummary from './ConditionSummary'

const ALL = '전체'

const SORT_OPTIONS = [
  { value: 'RECOMMEND', label: '추천순' },
  { value: 'SHORT', label: '짧은 시간순' },
  { value: 'LESS_WALK', label: '걷기 적은 순' },
] as const
type SortType = (typeof SORT_OPTIONS)[number]['value']

/**
 * 추천 결과 목록 (RES-01)
 * TODO(나혜빈): 추천 API 연동 (현재 MOCK_COURSES), '다시 추천' 시 다른 조합 요청, 추천 개수(1~3개) 팀 결정
 */
export default function RecommendResult() {
  const navigate = useNavigate()
  const condition = useConditionStore()
  const [subCategory, setSubCategory] = useState(ALL)
  const [sort, setSort] = useState<SortType>('RECOMMEND')

  const courses = MOCK_COURSES

  // 세분류 필터: 선택한 대분류의 세분류. 랜덤이면 결과 장소들의 세분류
  const subCategories = isRandomCondition(condition)
    ? [...new Set(courses.flatMap((c) => c.places.map((p) => p.subCategory)))]
    : CATEGORIES.filter((c) => condition.categories.includes(c.code)).flatMap((c) => c.subCategories)

  const filtered = courses
    .filter((c) => subCategory === ALL || c.places.some((p) => p.subCategory === subCategory))
    .toSorted((a, b) => (sort === 'SHORT' ? a.totalMinutes - b.totalMinutes : 0))

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
        {/* 정렬: UI 고려 단계 (팀 결정 필요) */}
        <div className="flex gap-3 text-xs">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setSort(o.value)}
              className={sort === o.value ? 'font-bold text-neutral-800' : 'text-neutral-400'}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <ul className="flex flex-col gap-3 p-4">
          {filtered.map((course) => (
            <li key={course.courseId}>
              <CourseCard course={course} to={`/results/${course.courseId}`} />
            </li>
          ))}
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
        <Button onClick={() => setSubCategory(ALL)}>다시 추천</Button>
      </BottomActionBar>
    </>
  )
}
