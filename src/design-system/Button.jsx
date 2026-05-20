import React from 'react'

const variants = {
  primary:  'bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white shadow-sm hover:opacity-90 active:scale-[0.98]',
  secondary:'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
  ghost:    'text-gray-600 hover:bg-gray-100 hover:text-gray-800',
  outline:  'text-[#00D4AA] border border-[#00D4AA]/40 hover:border-[#00D4AA] hover:bg-[#00D4AA]/5',
  dark:     'text-white/75 bg-white/[0.08] border border-white/[0.12] hover:bg-white/[0.14] hover:text-white',
  danger:   'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
}

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5 font-semibold',
  md: 'text-sm px-4 py-2 rounded-lg gap-2 font-semibold',
  lg: 'text-base px-6 py-2.5 rounded-lg gap-2 font-semibold',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] ?? variants.secondary,
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path fill="currentColor" className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
