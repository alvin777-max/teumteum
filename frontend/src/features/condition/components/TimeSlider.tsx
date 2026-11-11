import { TIME_STEPS } from '../../../shared/types/domain'

interface TimeSliderProps {
  value: number
  onChange: (minutes: number) => void
}

const STEP_LABELS = ['0분', '30분', '1h', '2h', '3h', '4h', '5h', '6h']

/** 이용 시간 슬라이더. 단계: 0분·30분·1~6시간 (0분 = 시간 제한 없음, 화면설계서 CON-01) */
export default function TimeSlider({ value, onChange }: TimeSliderProps) {
  const index = Math.max(0, TIME_STEPS.indexOf(value))

  return (
    <div>
      <input
        type="range"
        min={0}
        max={TIME_STEPS.length - 1}
        step={1}
        value={index}
        onChange={(e) => onChange(TIME_STEPS[Number(e.target.value)])}
        aria-label="이용 시간"
        className="w-full accent-primary"
      />
      <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
        {STEP_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
