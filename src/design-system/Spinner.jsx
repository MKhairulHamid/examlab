import React from 'react'

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-2', lg: 'h-12 w-12 border-[3px]' }

export function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      className={[
        'rounded-full animate-spin border-transparent border-b-current',
        sizes[size] ?? sizes.md,
        className,
      ].join(' ')}
    />
  )
}

export function PageSpinner({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4"
         style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)' }}>
      <Spinner size="lg" className="text-[#00D4AA]" />
      {label && <p className="text-white/60 text-sm font-medium">{label}</p>}
    </div>
  )
}
