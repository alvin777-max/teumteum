import { useState } from 'react'

/**
 * 홈 검색창 (HOM-01 ①): 장소·주소 검색. 결과는 아래 시트에 표시, 선택 시 상세(DET-01)
 * TODO(정종일): 장소 검색 API 연동, 결과 시트 목록 → 상세 (팀 결정 항목 7)
 */
export default function HomeSearchBar() {
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(keyword.trim().length > 0)
        }}
      >
        <input
          type="search"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setSubmitted(false)
          }}
          placeholder="🔍 장소, 주소 검색"
          className="h-12 w-full rounded-xl bg-white px-4 text-sm shadow-md outline-none"
        />
      </form>
      {submitted && (
        <div className="rounded-xl bg-white p-4 text-sm text-neutral-500 shadow-md">
          ‘{keyword}’ 검색 결과는 장소 검색 API 연동 후 표시됩니다.
        </div>
      )}
    </div>
  )
}
