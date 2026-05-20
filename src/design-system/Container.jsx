import React from 'react'

export function Container({ children, className = '', ...props }) {
  return (
    <div
      className={`max-w-[75rem] mx-auto px-4 sm:px-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ label, title, description, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-4 flex-wrap ${className}`}>
      <div>
        {label && (
          <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">
            {label}
          </p>
        )}
        <h2 className="text-xl font-bold text-[#0A2540] leading-tight sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed max-w-xl">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
