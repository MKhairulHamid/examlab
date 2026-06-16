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
 * Rendered as a landscape A4 sheet (√2 ≈ 1.414 ratio) so it reads instantly as
 * a real certificate. All sizing is in container-query units (cqw) so the whole
 * document scales proportionally to whatever width it's dropped into.
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
  const namePlaceholder = locked && displayName === 'Your Name Here'

  return (
    <div
      className={[
        'relative w-full overflow-hidden rounded-xl bg-white',
        'shadow-[0_18px_50px_rgba(10,37,64,0.18)]',
        'aspect-[1.414/1]',
        className,
      ].join(' ')}
      style={{ containerType: 'inline-size' }}
    >
      {/* Decorative double frame */}
      <div
        className="pointer-events-none absolute rounded-lg inset-[2.6cqw] border-[0.45cqw]"
        style={{ borderColor: accent }}
      />
      <div
        className="pointer-events-none absolute rounded-md inset-[3.6cqw] border-[0.12cqw]"
        style={{ borderColor: 'rgba(10,37,64,0.25)' }}
      />

      {/* Subtle corner accents */}
      {['left-[2.6cqw] top-[2.6cqw] border-l-[0.9cqw] border-t-[0.9cqw] rounded-tl-lg',
        'right-[2.6cqw] top-[2.6cqw] border-r-[0.9cqw] border-t-[0.9cqw] rounded-tr-lg',
        'left-[2.6cqw] bottom-[2.6cqw] border-l-[0.9cqw] border-b-[0.9cqw] rounded-bl-lg',
        'right-[2.6cqw] bottom-[2.6cqw] border-r-[0.9cqw] border-b-[0.9cqw] rounded-br-lg',
      ].map((c) => (
        <div
          key={c}
          className={`pointer-events-none absolute h-[5cqw] w-[5cqw] ${c}`}
          style={{ borderColor: accent }}
        />
      ))}

      {/* Status ribbon */}
      <div className="absolute right-[5cqw] top-[5cqw] z-10">
        {earned ? (
          <span
            className="inline-flex items-center gap-[1cqw] rounded-full px-[2.2cqw] py-[0.9cqw] text-[1.6cqw] font-bold uppercase tracking-wide"
            style={{ color: '#007a63', background: 'rgba(0,212,170,0.12)', border: '0.12cqw solid rgba(0,212,170,0.35)' }}
          >
            <ShieldCheck className="h-[2.2cqw] w-[2.2cqw]" /> Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-[1cqw] rounded-full border-[0.12cqw] border-gray-300 bg-gray-100 px-[2.2cqw] py-[0.9cqw] text-[1.6cqw] font-bold uppercase tracking-wide text-gray-500">
            <Lock className="h-[2.2cqw] w-[2.2cqw]" /> Preview
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-between px-[9cqw] py-[7cqw] text-center">
        {/* Issuer wordmark */}
        <div className="flex items-center gap-[1.4cqw] text-[#0A2540]">
          <Award className="h-[3cqw] w-[3cqw]" style={{ color: accent }} />
          <span className="text-[2.1cqw] font-bold uppercase tracking-[0.22em]">Cloud Exam Lab</span>
        </div>

        {/* Title + recipient block */}
        <div className="flex flex-col items-center">
          <h2 className="font-serif text-[4.6cqw] font-bold leading-none tracking-tight text-[#0A2540]">
            Certificate of Readiness
          </h2>
          <div className="mt-[2cqw] h-[0.25cqw] w-[14cqw] rounded-full" style={{ background: accent }} />

          <p className="mt-[3cqw] text-[1.8cqw] uppercase tracking-[0.18em] text-gray-400">
            This is proudly presented to
          </p>
          <p
            className={[
              'mt-[1.2cqw] font-serif text-[6.4cqw] font-bold leading-none tracking-tight',
              namePlaceholder ? 'text-gray-300' : 'text-[#0A2540]',
            ].join(' ')}
          >
            {displayName}
          </p>

          <p className="mt-[2.6cqw] max-w-[78cqw] text-[1.85cqw] leading-relaxed text-gray-500">
            has completed the full study program and passed the final mock exam, demonstrating
            proficiency in
          </p>
          <p className="mt-[1cqw] text-[3cqw] font-semibold leading-tight text-[#0A2540]">
            {program?.name}
          </p>
        </div>

        {/* Footer: issued · seal · score */}
        <div className="w-full">
          <div className="flex items-end justify-between gap-[3cqw]">
            <div className="min-w-[22cqw] text-center">
              <div className="text-[2.6cqw] font-semibold text-[#0A2540] border-b-[0.12cqw] border-gray-300 pb-[0.6cqw]">
                {earned ? formatDate(issuedAt) : 'Cloud Exam Lab'}
              </div>
              <div className="mt-[0.8cqw] text-[1.4cqw] uppercase tracking-[0.15em] text-gray-400">
                {earned ? 'Date Issued' : 'Issued By'}
              </div>
            </div>

            {/* Seal */}
            <div className="relative flex flex-col items-center">
              <div
                className="flex h-[11cqw] w-[11cqw] items-center justify-center rounded-full"
                style={{ background: `linear-gradient(135deg, #0A2540, ${accent})`, boxShadow: '0 0.6cqw 1.6cqw rgba(10,37,64,0.25)' }}
              >
                <div className="flex h-[8.6cqw] w-[8.6cqw] items-center justify-center rounded-full border-[0.2cqw] border-white/70">
                  <Award className="h-[4.6cqw] w-[4.6cqw] text-white" />
                </div>
              </div>
            </div>

            <div className="min-w-[22cqw] text-center">
              <div className="text-[2.6cqw] font-bold text-[#0A2540] border-b-[0.12cqw] border-gray-300 pb-[0.6cqw]">
                {earned && score != null ? `${score}%` : '—'}
              </div>
              <div className="mt-[0.8cqw] text-[1.4cqw] uppercase tracking-[0.15em] text-gray-400">
                {earned ? 'Exam Score' : 'Final Score'}
              </div>
            </div>
          </div>

          {/* Credential ID — earned only */}
          {earned && credentialCode && (
            <div className="mt-[2cqw] text-[1.5cqw] text-gray-500">
              Credential ID{' '}
              <span className="font-mono font-semibold text-gray-700">{credentialCode}</span>
            </div>
          )}

          {/* Disclaimer — always present */}
          <p className="mx-auto mt-[2cqw] max-w-[82cqw] text-[1.35cqw] leading-relaxed text-gray-400">
            A practice credential issued by Cloud Exam Lab. Not an official AWS certification; not
            affiliated with or endorsed by Amazon Web Services.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CertificateCard
