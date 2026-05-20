import React from 'react'

const variants = {
  default:     'bg-white border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
  flat:        'bg-white border border-gray-200',
  tinted:      'bg-gray-50 border border-gray-200',
  dark:        'bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm',
  'dark-solid':'bg-[#0f2f4d] border border-white/[0.10]',
}

export function Card({ variant = 'default', interactive = false, className = '', children, ...props }) {
  return (
    <div
      className={[
        'rounded-xl overflow-hidden',
        variants[variant] ?? variants.default,
        interactive
          ? 'cursor-pointer transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:-translate-y-0.5'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
