import React, { useEffect } from 'react'

export function Modal({ isOpen, onClose, maxWidth = 'max-w-md', className = '', children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:items-center sm:pt-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={[
          'relative w-full bg-white rounded-2xl',
          'shadow-[0_25px_60px_rgba(0,0,0,0.22)]',
          'max-h-[90vh] overflow-y-auto',
          'animate-[slideUp_0.2s_ease]',
          maxWidth,
          className,
        ].join(' ')}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ title, description, onClose }) {
  return (
    <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-gray-100">
      <div>
        <h2 className="text-lg font-bold text-[#0A2540] leading-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
