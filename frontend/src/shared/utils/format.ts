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

/** 현재 시각을 30분 단위로 올림한 "HH:mm" (CON-01 시작 시각 기본값) */
export function nowRoundedTime(): string {
  const now = new Date()
  const minutes = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30
  return addMinutesToTime('00:00', minutes)
}

/** 이용 시간 표시. 0분이면 '시간 제한 없음', 아니면 "13:00~16:00" */
export function formatTimeRange(startTime: string, availableMinutes: number): string {
  if (availableMinutes === 0) return '시간 제한 없음'
  return `${startTime}~${addMinutesToTime(startTime, availableMinutes)}`
}

/** "2026-11-11" → "11.11" */
export function formatShortDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${month}.${day}`
}
