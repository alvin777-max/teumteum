import { getCategoryIcon } from '../../../shared/types/domain'
import type { CoursePlace } from '../types'

/** 장소 사진. 없으면 카테고리 기본 이미지 (RES-01 ③) */
export default function PlaceThumbnail({ place, className = 'size-14' }: { place: CoursePlace; className?: string }) {
  if (place.imageUrl) return <img src={place.imageUrl} alt="" className={`shrink-0 rounded-lg object-cover ${className}`} />
  return (
    <div aria-hidden className={`flex shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-2xl ${className}`}>
      {getCategoryIcon(place.category)}
    </div>
  )
}
