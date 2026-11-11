interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** 이동수단 선택 같은 세그먼트 버튼 */
export default function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="flex rounded-xl bg-neutral-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={`h-10 flex-1 rounded-lg text-sm ${
            option.value === value ? 'bg-white font-semibold text-primary shadow-sm' : 'text-neutral-500'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
