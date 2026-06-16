import React from 'react'
import { Award, Lock, ShieldCheck } from 'lucide-react'

/**
 * The single source of truth for how a Proficiency credential looks — used in
 * three states so the preview, the in-progress card, and the earned credential
 * are pixel-identical:
 *   - 'preview'      locked; name = viewer's real name if logged in, else placeholder; score "—"
 *   - 'in-progress'  locked; same look, reflects that it isn't earned yet
 *   - 'earned'       full real data + Credential ID + verify-ready footer
 *
 * Props: program ({ name, code, color }), state, name, score, credentialCode, issuedAt.
 */

function formatDate(value) {
  if (!value) return ''
  try {
    return new Date(value).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function CertificateCard({
  program,
  state = 'preview',
  name,
  score,
  credentialCode,
  issuedAt,
  className = '',
}) {
  const earned = state === 'earned'
  const locked = !earned
  const accent = program?.color || '#00D4AA'

  const displayName =
    name && String(name).trim().length > 0
      ? name
      : 'Your Name Here'

  return (
    <div
      className={[
        'relative rounded-2xl border bg-white overflow-hidden',
        'shadow-[0_10px_40px_rgba(10,37,64,0.12)]',
        earned ? 'border-[#00D4AA]/40' : 'border-gray-200',
        className,
      ].join(' ')}
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, #0A2540, ${accent})` }} />

      {/* Corner status ribbon */}
      <div className="absolute right-4 top-4">
        {earned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00D4AA]/30 bg-[#00D4AA]/10 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-[#007a63]">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-100 px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-wide text-gray-500">
            <Lock className="h-3.5 w-3.5" /> Preview
          </span>
        )}
      </div>

      <div className="px-6 py-7 sm:px-10 sm:py-9">
        {/* Issuer wordmark */}
        <div className="flex items-center gap-2 text-[#0A2540]">
          <Award className="h-5 w-5" style={{ color: accent }} />
          <span className="text-sm font-bold tracking-tight">Cloud Exam Lab</span>
        </div>

        <p className="mt-6 text-xs uppercase tracking-[0.15em] text-gray-400">
          This certifies that
        </p>

        {/* Recipient */}
        <h2
          className={[
            'mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight',
            locked && displayName === 'Your Name Here' ? 'text-gray-300' : 'text-[#0A2540]',
          ].join(' ')}
        >
          {displayName}
        </h2>

        <p className="mt-5 text-sm text-gray-500">
          has completed the full study program and passed the final mock exam, demonstrating
          proficiency in
        </p>

        {/* Program + qualifier */}
        <div className="mt-2">
          <div className="text-lg sm:text-xl font-semibold text-[#0A2540] leading-snug">
            {program?.name}
          </div>
          <div
            className="mt-0.5 text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{ color: accent }}
          >
            Proficiency
          </div>
        </div>

        {/* Score + meta row */}
        <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-t border-gray-100 pt-5">
          <div>
            <div className="text-[0.6875rem] uppercase tracking-wide text-gray-400">Score</div>
            <div className="text-xl font-bold text-[#0A2540]">
              {earned && score != null ? `${score}%` : '—'}
              {earned && (
                <span className="ml-2 text-xs font-semibold text-[#007a63]">
                  Passed (≥70% required)
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[0.6875rem] uppercase tracking-wide text-gray-400">
              {earned ? 'Issued' : 'Issued by'}
            </div>
            <div className="text-sm font-semibold text-[#0A2540]">
              {earned ? formatDate(issuedAt) : 'Cloud Exam Lab'}
            </div>
          </div>
        </div>

        {/* Credential ID — earned only */}
        {earned && credentialCode && (
          <div className="mt-3 text-xs text-gray-500">
            Credential ID <span className="font-mono font-semibold text-gray-700">{credentialCode}</span>
          </div>
        )}

        {/* Disclaimer — always present */}
        <p className="mt-5 text-[0.6875rem] leading-relaxed text-gray-400">
          A practice credential issued by Cloud Exam Lab. Not an official AWS certification; not
          affiliated with or endorsed by Amazon Web Services.
        </p>
      </div>
    </div>
  )
}

export default CertificateCard
