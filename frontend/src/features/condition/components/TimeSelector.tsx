import { addMinutesToTime } from '../../../shared/utils/format'
import { useConditionStore } from '../store'
import TimeSlider from './TimeSlider'

/**
 * 시간 (CON-01 ②): 시작 시각 입력 + 슬라이더. 시작 시각을 바꾸면 종료 시각이 자동 계산된다.
 * TODO: 종료 시각 직접 입력과 슬라이더 연동 방식은 팀 결정 필요 (화면설계서 '팀에서 정할 항목' 4)
 */
export default function TimeSelector() {
  const { startTime, availableMinutes, setStartTime, setAvailableMinutes } = useConditionStore()
  const endTime = addMinutesToTime(startTime, availableMinutes)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => e.target.value && setStartTime(e.target.value)}
          aria-label="시작 시각"
          className="h-12 flex-1 rounded-xl border border-line px-3 text-center text-sm outline-none focus:border-primary"
        />
        <span className="text-neutral-400">~</span>
        <div
          aria-label="종료 시각"
          className="flex h-12 flex-1 items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-600"
        >
          {endTime}
        </div>
      </div>
      <TimeSlider value={availableMinutes} onChange={setAvailableMinutes} />
    </div>
  )
}
