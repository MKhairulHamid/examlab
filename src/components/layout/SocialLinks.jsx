import React from 'react'

// Brand social accounts. Single source of truth — reused by the landing footer
// and the blog pages so the links stay in sync everywhere.
// Icons are inlined: lucide-react dropped its brand glyphs (LinkedIn/Instagram)
// over trademark concerns, so we ship our own marks.

function LinkedInIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  )
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function ThreadsIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.36-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.74-1.757-.5-.586-1.275-.886-2.303-.892h-.029c-.825 0-1.945.227-2.66 1.29L7.34 7.677c.96-1.425 2.52-2.21 4.4-2.21h.034c3.143.02 5.01 1.96 5.198 5.366.106.044.211.09.315.139 1.473.69 2.55 1.74 3.115 3.036.787 1.804.86 4.743-1.532 7.085C17.198 23.029 14.69 23.99 12.186 24Z" />
    </svg>
  )
}

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/cloud-exam-lab/', Icon: LinkedInIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/cloudexamlab', Icon: InstagramIcon },
  { label: 'Threads', href: 'https://www.threads.com/@cloudexamlab', Icon: ThreadsIcon },
]

/**
 * A horizontal row of brand social links. Used in footers.
 * `className` styles the wrapper; each icon link inherits a hover transition.
 */
export default function SocialLinks({ className = '', iconClassName = '', size = 18 }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {SOCIAL_LINKS.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={`text-white/60 hover:text-white transition-colors ${iconClassName}`}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  )
}
