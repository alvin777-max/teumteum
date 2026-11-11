import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** 입력란 아래 오류 안내 */
  error?: string
  /** 입력란 아래 일반 안내 */
  hint?: string
}

export default function TextField({ label, error, hint, id, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? props.name
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold">
        {label}
      </label>
      <input
        id={inputId}
        className={`h-12 rounded-xl border px-4 text-sm outline-none focus:border-primary disabled:bg-neutral-100 disabled:text-neutral-400 ${
          error ? 'border-red-400' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : hint && <p className="text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}
