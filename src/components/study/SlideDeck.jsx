import React, { useState, useEffect, useRef, useMemo } from 'react'

const TEAL = '#00D4AA'
const NAVY = '#0A2540'

// Builds a presentable slide list from existing session data. The learner
// full-screens this and screen-records themselves teaching each slide.
function buildSlides(session) {
  const slides = []

  // Title slide
  slides.push({
    kind: 'title',
    eyebrow: session.module || session.domain || 'Study session',
    title: session.title,
    subtitle: session.summary,
  })

  // Learning objectives — one overview slide
  if (session.objectives?.length) {
    slides.push({
      kind: 'list',
      heading: 'What I will explain',
      items: session.objectives,
    })
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
      heading: 'Services to mention',
      terms: session.awsServices.map(s => ({ term: s.name, def: s.purpose })),
    })
  }

  // Exam tips
  if (session.examTips?.length) {
    slides.push({
      kind: 'list',
      heading: 'Exam tips to call out',
      items: session.examTips,
    })
  }

  // Closing slide
  slides.push({
    kind: 'title',
    eyebrow: 'Wrap up',
    title: 'Recap in one sentence',
    subtitle: session.selfExplanationPrompt
      ? 'Finish by answering: ' + session.selfExplanationPrompt
      : 'Summarise the single most important idea in your own words.',
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
        background: `linear-gradient(160deg, ${NAVY} 0%, #06182b 100%)`,
        color: 'white', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem', flexShrink: 0,
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: TEAL }}>
          Recording slides · {idx + 1} / {slides.length}
        </div>
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

      {/* Slide body */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(1.5rem, 6vw, 5rem)', maxWidth: '1100px', margin: '0 auto', width: '100%',
      }}>
        {slide.kind === 'title' && (
          <>
            <div style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1rem)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, marginBottom: '1.25rem' }}>
              {slide.eyebrow}
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 1.5rem' }}>
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.5rem)', lineHeight: 1.5, color: 'rgba(255,255,255,0.82)', margin: 0 }}>
                {slide.subtitle}
              </p>
            )}
          </>
        )}

        {slide.kind === 'list' && (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', fontWeight: 800, margin: '0 0 2rem', color: 'white' }}>
              {slide.heading}
            </h2>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {slide.items.map((it, i) => (
                <li key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', fontSize: 'clamp(1rem, 2.2vw, 1.6rem)', lineHeight: 1.4 }}>
                  <span style={{ color: TEAL, fontWeight: 800, flexShrink: 0 }}>›</span>
                  <span style={{ color: 'rgba(255,255,255,0.9)' }}>{it}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        {slide.kind === 'terms' && (
          <>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)', fontWeight: 800, margin: '0 0 2rem', color: 'white' }}>
              {slide.heading}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {slide.terms.map((t, i) => (
                <div key={i}>
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
      </div>

      {/* Bottom nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.5rem', flexShrink: 0,
      }}>
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          style={navBtn(idx === 0)}
        >
          ← Prev
        </button>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {slides.map((_, i) => (
            <span key={i} style={{
              width: i === idx ? '20px' : '8px', height: '8px', borderRadius: '4px',
              background: i === idx ? TEAL : 'rgba(255,255,255,0.3)', transition: 'all 0.2s',
            }} />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          disabled={idx === slides.length - 1}
          style={navBtn(idx === slides.length - 1)}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function navBtn(disabled) {
  return {
    fontSize: '0.9375rem', fontWeight: 700, color: 'white',
    background: disabled ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.14)',
    border: '1px solid rgba(255,255,255,0.25)', borderRadius: '0.5rem',
    padding: '0.55rem 1.25rem', cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.4 : 1,
  }
}
