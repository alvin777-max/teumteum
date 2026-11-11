import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import SegmentedControl from '../../../shared/components/SegmentedControl'
import { CATEGORIES, type CategoryMode } from '../../../shared/types/domain'
import { useConditionStore } from '../store'

const MODE_OPTIONS: { value: CategoryMode; label: string }[] = [
  { value: 'DIRECT', label: '직접 선택' },
  { value: 'RANDOM', label: '랜덤 추천' },
]

/**
 * 카테고리 (CON-01 ④): 직접 선택(대분류 복수) 또는 랜덤 추천. 세분류는 여기서 고르지 않는다.
 * TODO: 대분류 복수 선택 상한(예: 최대 3개) 팀 결정 필요
 */
export default function CategorySelector() {
  const { categoryMode, categories, setCategoryMode, toggleCategory } = useConditionStore()

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl options={MODE_OPTIONS} value={categoryMode} onChange={setCategoryMode} />

      {categoryMode === 'DIRECT' ? (
        <>
          <ChipGroup scroll={false}>
            {CATEGORIES.map((c) => (
              <Chip key={c.code} selected={categories.includes(c.code)} onClick={() => toggleCategory(c.code)}>
                {c.label}
              </Chip>
            ))}
          </ChipGroup>
          {categories.length === 0 && (
            <p className="text-xs text-neutral-400">아무것도 고르지 않으면 랜덤으로 추천해요.</p>
          )}
        </>
      ) : (
        <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
          위치·시간·이동수단 조건 안에서 카테고리 구분 없이 추천해요.
        </p>
      )}
    </div>
  )
}
