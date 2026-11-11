import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

const VARIANT_CLASS = {
  primary: 'bg-primary text-white active:bg-primary-dark',
  secondary: 'border border-line bg-white text-neutral-800 active:bg-neutral-100',
}

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-12 w-full rounded-xl text-[15px] font-semibold disabled:border-0 disabled:bg-neutral-200 disabled:text-neutral-400 ${VARIANT_CLASS[variant]} ${className}`}
      {...props}
    />
  )
}
