import React, { useState, useEffect, useRef, useMemo } from 'react'

const TEAL = '#00D4AA'
const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

// Cloud Exam Lab "book" mark (matches the dashboard header logo).
function BrandMark({ size = 22, color = TEAL }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}

function BrandLockup({ size = 22, faded = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: faded ? 0.55 : 1 }}>
      <BrandMark size={size} />
      <span style={{ fontSize: size * 0.72, fontWeight: 800, letterSpacing: '-0.01em', color: 'white' }}>
        Cloud Exam Lab
      </span>
    </span>
  )
}

// Builds the viewer-facing slide list from existing session data. These slides
// are the on-screen backdrop the learner records over — content only, no
// instructions directed at the presenter.
function buildSlides(session) {
  const slides = []

  // Intro / title slide
  slides.push({
    kind: 'title',
    eyebrow: session.module || session.domain || 'Exam prep',
    title: session.title,
    subtitle: session.summary,
  })

  // Overview of what the video covers
  if (session.objectives?.length) {
    slides.push({ kind: 'list', heading: "What you'll learn", items: session.objectives })
  }

  // Key terms — chunk into slides of 3 so each is readable on screen
  if (session.keyTerms?.length) {
    for (let i = 0; i < session.keyTerms.length; i += 3) {
      slides.push({
        kind: 'terms',
        heading: i === 0 ? 'Key terms' : 'Key terms (cont.)',
        terms: session.keyTerms.slice(i, i + 3),
      })
    }
  }

  // AWS services, if any
  if (session.awsServices?.length) {
    slides.push({
      kind: 'terms',
      heading: 'Services in focus',
      terms: session.awsServices.map(s => ({ term: s.name, def: s.purpose })),
    })
  }

  // Exam tips
  if (session.examTips?.length) {
    slides.push({ kind: 'list', heading: 'Exam tips', items: session.examTips })
  }

  // Branded outro
  slides.push({
    kind: 'outro',
    title: 'Thanks for watching',
    subtitle: session.code || session.title,
  })

  return slides
}

export default function SlideDeck({ session, onClose }) {
  const slides = useMemo(() => buildSlides(session), [session])
  const [idx, setIdx] = useState(0)
  const containerRef = useRef(null)

  const go = (delta) => setIdx(i => Math.max(0, Math.min(slides.length - 1, i + delta)))

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1) }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  // Try native fullscreen so screen recording captures only the deck.
  useEffect(() => {
    const el = containerRef.current
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {})
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    }
  }, [])

  const slide = slides[idx]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: `radial-gradient(120% 120% at 80% 0%, #0e2f4f 0%, ${NAVY} 45%, #06182b 100%)`,
        color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}
    >
      <style>{KEYFRAMES}</style>

      {/* Animated ambient background — subtle, material-agnostic motion */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <span style={orb('-10%', '-8%', 460, 'rgba(0,212,170,0.18)', 0)} />
        <span style={orb('70%', '55%', 520, 'rgba(59,130,246,0.16)', 3)} />
        <span style={orb('35%', '80%', 360, 'rgba(0,212,170,0.10)', 6)} />
        <span style={{ ...gridStyle }} />
      </div>

      {/* Top bar — branded */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.6rem', flexShrink: 0, position: 'relative', zIndex: 2,
      }}>
        <BrandLockup size={22} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>
            {idx + 1} / {slides.length}
          </span>
          <button
            onClick={onClose}
            style={{
              fontSize: '0.8125rem', fontWeight: 700, color: 'white',
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer',
            }}
          >
            Exit (Esc)
          </button>
        </div>
      </div>

      {/* Slide body — re-keyed by idx so entrance animations replay each slide */}
      <div
        key={idx}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(1.5rem, 6vw, 5rem)', maxWidth: '1100px', margin: '0 auto', width: '100%',
          position: 'relative', zIndex: 2,
        }}
      >
        {slide.kind === 'title' && (
          <>
            <div style={{ ...anim(0), fontSize: 'clamp(0.75rem, 1.6vw, 1rem)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, marginBottom: '1.1rem' }}>
              {slide.eyebrow}
            </div>
            <div style={{ ...anim(0.08), height: '5px', width: '64px', background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: '3px', marginBottom: '1.5rem', transformOrigin: 'left', animationName: 'sd-grow' }} />
            <h1 style={{ ...anim(0.15), fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1.5rem' }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ ...anim(0.28), fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', lineHeight: 1.5, color: 'rgba(255,255,255,0.82)', margin: 0 }}>
                {slide.subtitle}
              </p>
            )}
          </>
        )}

        {slide.kind === 'list' && (
          <>
            <h2 style={{ ...anim(0), fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', fontWeight: 800, margin: '0 0 2rem', color: 'white' }}>
              {slide.heading}
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {slide.items.map((it, i) => (
                <li key={i} style={{ ...anim(0.12 + i * 0.1), display: 'flex', gap: '1rem', alignItems: 'flex-start', fontSize: 'clamp(1rem, 2.2vw, 1.6rem)', lineHeight: 1.4 }}>
                  <span style={{ color: TEAL, fontWeight: 800, flexShrink: 0 }}>›</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{it}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {slide.kind === 'terms' && (
          <>
            <h2 style={{ ...anim(0), fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', fontWeight: 800, margin: '0 0 2rem', color: 'white' }}>
              {slide.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {slide.terms.map((t, i) => (
                <div key={i} style={anim(0.12 + i * 0.12)}>
                  <div style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.75rem)', fontWeight: 800, color: TEAL, marginBottom: '0.4rem' }}>
                    {t.term}
                  </div>
                  <div style={{ fontSize: 'clamp(0.95rem, 1.9vw, 1.4rem)', lineHeight: 1.45, color: 'rgba(255,255,255,0.85)' }}>
                    {t.def}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {slide.kind === 'outro' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...anim(0), display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <span style={{ display: 'inline-flex', animationName: 'sd-pulse', animationDuration: '2.4s', animationIterationCount: 'infinite' }}>
                <BrandMark size={64} />
              </span>
            </div>
            <h1 style={{ ...anim(0.12), fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, margin: '0 0 1rem' }}>
              {slide.title}
            </h1>
            <p style={{ ...anim(0.24), fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', color: 'rgba(255,255,255,0.82)', margin: '0 0 1.75rem' }}>
              {slide.subtitle}
            </p>
            <div style={{ ...anim(0.36), display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1.4rem', borderRadius: '999px', background: 'rgba(0,212,170,0.14)', border: `1.5px solid ${TEAL}` }}>
              <BrandMark size={22} />
              <span style={{ fontSize: 'clamp(0.95rem, 2vw, 1.25rem)', fontWeight: 800 }}>Cloud Exam Lab</span>
            </div>
          </div>
        )}
      </div>

      {/* Persistent brand watermark — kept inside the content column and lifted
          above the nav bar so a recording crop that hides the on-screen buttons
          still captures the logo. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: '6rem', zIndex: 2, pointerEvents: 'none', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1100px', padding: '0 clamp(1.5rem, 6vw, 5rem)', boxSizing: 'border-box', display: 'flex', justifyContent: 'flex-end' }}>
          <BrandLockup size={18} faded />
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.6rem', flexShrink: 0, position: 'relative', zIndex: 2,
      }}>
        <button onClick={() => go(-1)} disabled={idx === 0} style={navBtn(idx === 0)}>← Prev</button>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {slides.map((_, i) => (
            <span key={i} style={{
              width: i === idx ? '20px' : '8px', height: '8px', borderRadius: '4px',
              background: i === idx ? TEAL : 'rgba(255,255,255,0.3)', transition: 'all 0.2s',
            }} />
          ))}
        </div>
        <button onClick={() => go(1)} disabled={idx === slides.length - 1} style={navBtn(idx === slides.length - 1)}>Next →</button>
      </div>
    </div>
  )
}

// Entrance helper: each element fades/slides up with a stagger delay.
function anim(delay) {
  return {
    opacity: 0,
    animationName: 'sd-fade-up',
    animationDuration: '0.6s',
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    animationDelay: `${delay}s`,
    animationFillMode: 'forwards',
  }
}

function orb(left, top, size, color, delaySec) {
  return {
    position: 'absolute', left, top, width: size, height: size, borderRadius: '50%',
    background: color, filter: 'blur(60px)',
    animationName: 'sd-float', animationDuration: '14s', animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite', animationDelay: `${delaySec}s`,
  }
}

const gridStyle = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
  backgroundSize: '48px 48px',
  maskImage: 'radial-gradient(120% 80% at 50% 40%, black, transparent 75%)',
  WebkitMaskImage: 'radial-gradient(120% 80% at 50% 40%, black, transparent 75%)',
  animationName: 'sd-drift', animationDuration: '22s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
}

const KEYFRAMES = `
@keyframes sd-fade-up { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sd-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes sd-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes sd-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-26px); } }
@keyframes sd-drift { from { background-position: 0 0; } to { background-position: 48px 48px; } }
@media (prefers-reduced-motion: reduce) {
  [style*="sd-fade-up"], [style*="sd-grow"], [style*="sd-pulse"], [style*="sd-float"], [style*="sd-drift"] { animation: none !important; opacity: 1 !important; transform: none !important; }
}
`

function navBtn(disabled) {
  return {
    fontSize: '0.9375rem', fontWeight: 700, color: 'white',
    background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '0.5rem',
    padding: '0.55rem 1.25rem', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  }
}
