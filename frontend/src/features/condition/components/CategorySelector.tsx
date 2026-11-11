import { useCallback, useState } from 'react'
import Chip from '../../../shared/components/Chip'
import ChipGroup from '../../../shared/components/ChipGroup'
import SegmentedControl from '../../../shared/components/SegmentedControl'
import Toast from '../../../shared/components/Toast'
import { CATEGORIES, MAX_CATEGORIES, type CategoryCode, type CategoryMode } from '../../../shared/types/domain'
import { useConditionStore } from '../store'

const MODE_OPTIONS: { value: CategoryMode; label: string }[] = [
  { value: 'DIRECT', label: '직접 선택' },
  { value: 'RANDOM', label: '랜덤 추천' },
]

/**
 * 카테고리 (CON-01 ④): 직접 선택(대분류 최대 3개) 또는 랜덤 추천. 세분류는 여기서 고르지 않는다.
 * 4개째를 누르면 "최대 3개까지 고를 수 있어요" 토스트
 */
export default function CategorySelector() {
  const { categoryMode, categories, setCategoryMode, toggleCategory } = useConditionStore()
  const [toast, setToast] = useState(false)
  const closeToast = useCallback(() => setToast(false), [])

  const handleToggle = (code: CategoryCode) => {
    if (!categories.includes(code) && categories.length >= MAX_CATEGORIES) {
      setToast(true)
      return
    }
    toggleCategory(code)
  }

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl options={MODE_OPTIONS} value={categoryMode} onChange={setCategoryMode} />

      {categoryMode === 'DIRECT' ? (
        <>
          <ChipGroup scroll={false}>
            {CATEGORIES.map((c) => (
              <Chip key={c.code} selected={categories.includes(c.code)} onClick={() => handleToggle(c.code)}>
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
          카테고리 없이 조건에 맞는 곳을 골라드려요
        </p>
      )}

      {toast && <Toast message={`최대 ${MAX_CATEGORIES}개까지 고를 수 있어요`} onClose={closeToast} />}
    </div>
  )
}
