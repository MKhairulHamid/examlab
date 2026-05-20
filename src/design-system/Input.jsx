import React from 'react'

export function Label({ htmlFor, children, className = '' }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-semibold text-gray-700 mb-1.5 ${className}`}
    >
      {children}
    </label>
  )
}

export function Input({ className = '', error = false, ...props }) {
  return (
    <input
      className={[
        'w-full px-4 py-2.5 text-sm rounded-lg',
        'border-2 bg-white text-gray-900 placeholder-gray-400',
        'transition-colors duration-150',
        'focus:outline-none focus:ring-[3px]',
        error
          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
          : 'border-gray-200 focus:border-[#00D4AA] focus:ring-[#00D4AA]/10',
        'disabled:bg-gray-50 disabled:cursor-not-allowed',
        className,
      ].join(' ')}
      {...props}
    />
  )
}
