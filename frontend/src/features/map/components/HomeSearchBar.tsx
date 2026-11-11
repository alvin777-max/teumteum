import { useState } from 'react'
import { Link } from 'react-router'
import { getCategoryLabel } from '../../../shared/types/domain'
import { MOCK_NEARBY } from '../mock'

/**
 * 홈 검색창 (HOM-01 ①): 장소·주소 검색. 결과 목록을 아래 시트에 먼저 보여주고, 누르면 장소 상세(DET-01)
 * TODO(정종일): 카카오 로컬 키워드·주소 검색 API 연동 (현재 목업에서 이름으로 찾음)
 */
export default function HomeSearchBar() {
  const [keyword, setKeyword] = useState('')
  const [submitted, setSubmitted] = useState('')

  const results = submitted ? MOCK_NEARBY.filter((p) => p.name.includes(submitted) || p.address.includes(submitted)) : []

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(keyword.trim())
        }}
      >
        <input
          type="search"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            if (!e.target.value) setSubmitted('')
          }}
          placeholder="🔍 장소, 주소 검색"
          aria-label="장소, 주소 검색"
          className="h-12 w-full rounded-xl bg-white px-4 text-sm shadow-md outline-none"
        />
      </form>

      {submitted && (
        <div className="max-h-72 overflow-y-auto rounded-xl bg-white shadow-md">
          {results.length === 0 ? (
            <p className="p-4 text-sm text-neutral-500">‘{submitted}’ 검색 결과가 없어요.</p>
          ) : (
            <ul>
              {results.map((place) => (
                <li key={place.placeId} className="border-b border-line last:border-0">
                  <Link to={`/results/place-${place.placeId}`} className="block px-4 py-3">
                    <p className="text-sm font-semibold">{place.name}</p>
                    <p className="text-xs text-neutral-500">
                      {getCategoryLabel(place.category)} · {place.address}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
