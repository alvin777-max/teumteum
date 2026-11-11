import { addMinutesToTime } from '../../../shared/utils/format'
import { useConditionStore } from '../store'
import TimeSlider from './TimeSlider'

/** 시작 시각 선택지: 30분 단위 */
const START_TIMES = Array.from({ length: 48 }, (_, i) => addMinutesToTime('00:00', i * 30))

/**
 * 시간 (CON-01 ②): 시작 시각(기본 지금, 30분 단위) + 이용 시간 슬라이더.
 * 종료 시각은 시작 + 이용 시간으로 자동 계산되어 표시만 된다. 0분 = 시간 제한 없음 (종료 시각 표시 안 함)
 */
export default function TimeSelector() {
  const { startTime, availableMinutes, setStartTime, setAvailableMinutes } = useConditionStore()
  const noLimit = availableMinutes === 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <select
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          aria-label="시작 시각"
          className="h-12 flex-1 rounded-xl border border-line bg-white px-3 text-center text-sm outline-none focus:border-primary"
        >
          {START_TIMES.map((t) => (
            <option key={t} value={t}>
              시작 {t}
            </option>
          ))}
        </select>
        <span className="text-neutral-400">→</span>
        <div
          aria-label="종료 시각"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-600"
        >
          {noLimit ? '제한 없음' : `${addMinutesToTime(startTime, availableMinutes)} 종료`}
        </div>
      </div>
      <TimeSlider value={availableMinutes} onChange={setAvailableMinutes} />
    </div>
  )
}
