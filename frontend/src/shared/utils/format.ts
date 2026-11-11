/** 분 → "2시간 50분", "40분", "0분" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`
}

/** "HH:mm" + 분 → "HH:mm" (24시 넘으면 다음 날 시각) */
export function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** 현재 시각을 10분 단위로 올림한 "HH:mm" */
export function nowRoundedTime(): string {
  const now = new Date()
  const minutes = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 10) * 10
  return addMinutesToTime('00:00', minutes)
}
