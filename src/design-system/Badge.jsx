import React from 'react'

const colors = {
  green:  'bg-emerald-50  text-emerald-700  border-emerald-200',
  blue:   'bg-blue-50     text-blue-700     border-blue-200',
  amber:  'bg-amber-50    text-amber-700    border-amber-200',
  red:    'bg-red-50      text-red-700      border-red-200',
  gray:   'bg-gray-100    text-gray-600     border-gray-200',
  teal:   'bg-[#00D4AA]/10 text-[#007a63]   border-[#00D4AA]/25',
  navy:   'bg-[#0A2540]/8  text-[#0A2540]   border-[#0A2540]/15',
  purple: 'bg-purple-50   text-purple-700   border-purple-200',
}

export function Badge({ color = 'gray', className = '', children }) {
  return (
    <span className={[
      'inline-flex items-center px-2 py-0.5 rounded-full border',
      'text-[0.6875rem] font-semibold uppercase tracking-wide leading-none',
      colors[color] ?? colors.gray,
      className,
    ].join(' ')}>
      {children}
    </span>
  )
}
