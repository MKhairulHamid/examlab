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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: faded ? 0.65 : 1 }}>
      <BrandMark size={size} />
      <span style={{ fontSize: size * 0.72, fontWeight: 800, letterSpacing: '-0.01em', color: 'white' }}>
        Cloud Exam Lab
      </span>
    </span>
  )
}

// A small neural-network / cloud-graph: layered nodes that pulse while signal
// pulses travel along the connections. On-theme motion for AI/cloud material.
const NET = (() => {
  const L0 = [50, 100, 150].map(y => ({ x: 30, y }))
  const L1 = [40, 90, 140, 180].map(y => ({ x: 100, y }))
  const L2 = [75, 125].map(y => ({ x: 170, y }))
  const edges = []
  L0.forEach(a => L1.forEach(b => edges.push([a, b])))
  L1.forEach(a => L2.forEach(b => edges.push([a, b])))
  return { edges, nodes: [...L0, ...L1, ...L2] }
})()

function NetworkMotif({ size = 360, opacity = 0.16, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ opacity, ...style }} aria-hidden="true">
      <g stroke={TEAL} strokeWidth="0.5" opacity="0.45">
        {NET.edges.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>
      {NET.edges.filter((_, i) => i % 2 === 0).map(([a, b], i) => (
        <circle key={i} r="2.2" fill="#7CF5DE">
          <animateMotion dur={`${2.4 + (i % 5) * 0.5}s`} begin={`${(i * 0.35).toFixed(2)}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
        </circle>
      ))}
      {NET.nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r="3" fill={TEAL}>
          <animate attributeName="r" values="2.4;3.8;2.4" dur="3s" begin={`${(i * 0.2).toFixed(2)}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" begin={`${(i * 0.2).toFixed(2)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

// Builds the viewer-facing slide list from existing session data. These slides
// are the on-screen backdrop the learner records over — content only, no
// instructions directed at the presenter.
function buildSlides(session) {
  const slides = []

  slides.push({
    kind: 'title',
    eyebrow: session.module || session.domain || 'Exam prep',
    title: session.title,
    subtitle: session.summary,
  })

  if (session.objectives?.length) {
    slides.push({ kind: 'list', heading: "What you'll learn", items: session.objectives })
  }

  if (session.keyTerms?.length) {
    for (let i = 0; i < session.keyTerms.length; i += 3) {
      slides.push({
        kind: 'terms',
        heading: i === 0 ? 'Key terms' : 'Key terms (cont.)',
        terms: session.keyTerms.slice(i, i + 3),
      })
    }
  }

  if (session.awsServices?.length) {
    slides.push({
      kind: 'terms',
      heading: 'Services in focus',
      terms: session.awsServices.map(s => ({ term: s.name, def: s.purpose })),
    })
  }

  if (session.examTips?.length) {
    slides.push({ kind: 'list', heading: 'Exam tips', items: session.examTips })
  }

  slides.push({ kind: 'outro', title: 'Thanks for watching', subtitle: session.code || session.title })

  return slides
}

export default function SlideDeck({ session, onClose }) {
  const slides = useMemo(() => buildSlides(session), [session])
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)         // direction of last move, for transition
  const containerRef = useRef(null)

  const go = (delta) => setIdx(i => {
    const next = Math.max(0, Math.min(slides.length - 1, i + delta))
    if (next !== i) setDir(delta > 0 ? 1 : -1)
    return next
  })

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1) }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  useEffect(() => {
    const el = containerRef.current
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {})
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) }
  }, [])

  const slide = slides[idx]
  const progress = ((idx + 1) / slides.length) * 100

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

      {/* Top bar — sits OUTSIDE the 16:9 crop frame */}
      <div style={topBar}>
        <BrandLockup size={20} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 0 0 rgba(239,68,68,0.6)', animation: 'sd-rec 1.6s infinite' }} />
            Crop your recorder to the dotted frame · 16:9
          </span>
          <button onClick={onClose} style={chipBtn}>Exit (Esc)</button>
        </div>
      </div>

      {/* Middle region — centers the 16:9 recordable frame */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '0.4rem' }}>
        {/* ── 16:9 CROP FRAME ──────────────────────────────────────────────
            Everything inside this dotted box — content + logo — is captured
            when the learner crops their recorder to the frame. */}
        <div style={cropFrame}>
          {/* Corner brackets for easy alignment */}
          <Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" />

          {/* Ambient on-theme motion, clipped to the frame */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: '0.4rem' }}>
            <span style={orb('-12%', '-10%', '38%', 'rgba(0,212,170,0.16)', 0)} />
            <span style={orb('72%', '58%', '42%', 'rgba(59,130,246,0.14)', 3)} />
            <span style={{ ...gridStyle }} />
            <div style={{ position: 'absolute', top: '-6%', right: '-4%', animationName: 'sd-float', animationDuration: '18s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite' }}>
              <NetworkMotif size={300} opacity={0.15} />
            </div>
          </div>

          {/* Slide progress bar (top edge, inside the frame) */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'rgba(255,255,255,0.08)', borderTopLeftRadius: '0.4rem', borderTopRightRadius: '0.4rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`, transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)' }} />
          </div>

          {/* Slide content — re-keyed so build-in animations replay each slide */}
          <div key={idx} style={{ ...slideStage, animationName: dir >= 0 ? 'sd-stage-next' : 'sd-stage-prev' }}>
            <SlideContent slide={slide} />
          </div>

          {/* Persistent brand watermark — inside the frame, clear of the edge */}
          <div aria-hidden="true" style={{ position: 'absolute', right: '3.5cqw', bottom: '3.5cqw', zIndex: 3 }}>
            <BrandLockup size={16} faded />
          </div>
        </div>
      </div>

      {/* Bottom nav — sits OUTSIDE the 16:9 crop frame */}
      <div style={bottomBar}>
        <button onClick={() => go(-1)} disabled={idx === 0} style={navBtn(idx === 0)}>← Prev</button>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {slides.map((_, i) => (
            <span key={i} style={{ width: i === idx ? '20px' : '8px', height: '8px', borderRadius: '4px', background: i === idx ? TEAL : 'rgba(255,255,255,0.3)', transition: 'all 0.2s' }} />
          ))}
        </div>
        <button onClick={() => go(1)} disabled={idx === slides.length - 1} style={navBtn(idx === slides.length - 1)}>Next →</button>
      </div>
    </div>
  )
}

// ── Slide body renderers ────────────────────────────────────────────────────
function SlideContent({ slide }) {
  if (slide.kind === 'title') {
    return (
      <>
        <div style={{ ...anim(0), fontSize: 'clamp(0.7rem, 1.8cqw, 1.25rem)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEAL, marginBottom: '1.4cqh' }}>
          {slide.eyebrow}
        </div>
        <div style={{ ...anim(0.08), height: '0.7cqh', minHeight: '4px', width: '7cqw', background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: '3px', marginBottom: '2.2cqh', transformOrigin: 'left', animationName: 'sd-grow' }} />
        <h1 style={{ ...anim(0.16), fontSize: 'clamp(1.4rem, 6cqw, 4.5rem)', fontWeight: 800, lineHeight: 1.08, margin: '0 0 2cqh' }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ ...anim(0.3), fontSize: 'clamp(0.85rem, 2.6cqw, 1.8rem)', lineHeight: 1.5, color: 'rgba(255,255,255,0.82)', margin: 0, maxWidth: '85%' }}>
            {slide.subtitle}
          </p>
        )}
      </>
    )
  }

  if (slide.kind === 'list') {
    return (
      <>
        <Heading>{slide.heading}</Heading>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.6cqh', listStyle: 'none', padding: 0, margin: 0 }}>
          {slide.items.map((it, i) => (
            <li key={i} style={{ ...anim(0.16 + i * 0.11), display: 'flex', gap: '1.6cqw', alignItems: 'center' }}>
              <span style={{ flexShrink: 0, width: '4.4cqw', height: '4.4cqw', minWidth: '26px', minHeight: '26px', borderRadius: '50%', background: 'rgba(0,212,170,0.16)', border: `1.5px solid ${TEAL}`, color: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 'clamp(0.7rem, 2cqw, 1.3rem)' }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 'clamp(0.85rem, 2.7cqw, 1.7rem)', lineHeight: 1.35, color: 'rgba(255,255,255,0.92)' }}>{it}</span>
            </li>
          ))}
        </ul>
      </>
    )
  }

  if (slide.kind === 'terms') {
    return (
      <>
        <Heading>{slide.heading}</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.4cqh' }}>
          {slide.terms.map((t, i) => (
            <div key={i} style={{ ...anim(0.16 + i * 0.13), display: 'flex', gap: '1.6cqw', alignItems: 'stretch' }}>
              <span style={{ flexShrink: 0, width: '0.5cqw', minWidth: '3px', borderRadius: '3px', background: `linear-gradient(${TEAL}, ${TEAL_DARK})`, transformOrigin: 'top', animationName: 'sd-grow-y', animationDuration: '0.6s', animationDelay: `${0.2 + i * 0.13}s`, animationFillMode: 'both' }} />
              <div>
                <div style={{ fontSize: 'clamp(1rem, 3.2cqw, 2rem)', fontWeight: 800, color: TEAL, marginBottom: '0.6cqh' }}>{t.term}</div>
                <div style={{ fontSize: 'clamp(0.8rem, 2.4cqw, 1.5rem)', lineHeight: 1.4, color: 'rgba(255,255,255,0.85)' }}>{t.def}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  if (slide.kind === 'outro') {
    return (
      <div style={{ textAlign: 'center', width: '100%' }}>
        <div style={{ ...anim(0), display: 'flex', justifyContent: 'center', marginBottom: '2cqh' }}>
          <span style={{ display: 'inline-flex', animationName: 'sd-pulse', animationDuration: '2.4s', animationIterationCount: 'infinite' }}>
            <BrandMark size={56} />
          </span>
        </div>
        <h1 style={{ ...anim(0.12), fontSize: 'clamp(1.4rem, 6cqw, 4rem)', fontWeight: 800, margin: '0 0 1.4cqh' }}>{slide.title}</h1>
        <p style={{ ...anim(0.24), fontSize: 'clamp(0.85rem, 2.6cqw, 1.6rem)', color: 'rgba(255,255,255,0.82)', margin: '0 0 2.4cqh' }}>{slide.subtitle}</p>
        <div style={{ ...anim(0.36), display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1.4rem', borderRadius: '999px', background: 'rgba(0,212,170,0.14)', border: `1.5px solid ${TEAL}` }}>
          <BrandMark size={20} />
          <span style={{ fontSize: 'clamp(0.85rem, 2.4cqw, 1.25rem)', fontWeight: 800 }}>Cloud Exam Lab</span>
        </div>
      </div>
    )
  }
  return null
}

function Heading({ children }) {
  return (
    <h2 style={{ ...anim(0), fontSize: 'clamp(1.2rem, 4.4cqw, 2.75rem)', fontWeight: 800, margin: '0 0 3cqh', color: 'white', position: 'relative', display: 'inline-block' }}>
      {children}
      <span style={{ position: 'absolute', left: 0, bottom: '-1cqh', height: '0.5cqh', minHeight: '3px', width: '100%', background: `linear-gradient(90deg, ${TEAL}, transparent)`, transformOrigin: 'left', animationName: 'sd-grow', animationDuration: '0.7s', animationDelay: '0.15s', animationFillMode: 'both' }} />
    </h2>
  )
}

function Corner({ pos }) {
  const base = { position: 'absolute', width: '2.2cqw', height: '2.2cqw', minWidth: '14px', minHeight: '14px', borderColor: 'rgba(0,212,170,0.7)', zIndex: 4 }
  const map = {
    tl: { top: '-2px', left: '-2px', borderLeft: '2px solid', borderTop: '2px solid', borderTopLeftRadius: '4px' },
    tr: { top: '-2px', right: '-2px', borderRight: '2px solid', borderTop: '2px solid', borderTopRightRadius: '4px' },
    bl: { bottom: '-2px', left: '-2px', borderLeft: '2px solid', borderBottom: '2px solid', borderBottomLeftRadius: '4px' },
    br: { bottom: '-2px', right: '-2px', borderRight: '2px solid', borderBottom: '2px solid', borderBottomRightRadius: '4px' },
  }
  return <span aria-hidden="true" style={{ ...base, ...map[pos], borderColor: 'rgba(0,212,170,0.7)' }} />
}

// ── Style helpers ───────────────────────────────────────────────────────────
function anim(delay) {
  return {
    opacity: 0,
    animationName: 'sd-fade-up', animationDuration: '0.6s',
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    animationDelay: `${delay}s`, animationFillMode: 'forwards',
  }
}

function orb(left, top, size, color, delaySec) {
  return {
    position: 'absolute', left, top, width: size, aspectRatio: '1', borderRadius: '50%',
    background: color, filter: 'blur(48px)',
    animationName: 'sd-float', animationDuration: '14s', animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite', animationDelay: `${delaySec}s`,
  }
}

const topBar = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.85rem 1.4rem', flexShrink: 0, position: 'relative', zIndex: 2,
}
const bottomBar = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.85rem 1.4rem', flexShrink: 0, position: 'relative', zIndex: 2,
}
const cropFrame = {
  position: 'relative',
  aspectRatio: '16 / 9',
  // Fit the 16:9 box to whichever dimension is the binding constraint so it
  // never overflows on portrait/narrow screens; width derives from the ratio.
  height: 'min(100%, calc((100vw - 0.8rem) * 0.5625))',
  width: 'auto',
  maxWidth: '100%',
  maxHeight: '100%',
  containerType: 'size',
  border: '2px dashed rgba(255,255,255,0.45)',
  borderRadius: '0.5rem',
  boxShadow: '0 0 0 100vmax rgba(6,24,43,0.35)',
}
const slideStage = {
  position: 'absolute', inset: 0, zIndex: 2,
  display: 'flex', flexDirection: 'column', justifyContent: 'center',
  padding: 'clamp(1rem, 6cqw, 5rem)',
  animationDuration: '0.5s', animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)', animationFillMode: 'both',
}
const chipBtn = {
  fontSize: '0.8125rem', fontWeight: 700, color: 'white',
  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '0.5rem', padding: '0.4rem 0.9rem', cursor: 'pointer',
}

const gridStyle = {
  position: 'absolute', inset: 0,
  backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
  backgroundSize: '6% 10.5%',
  maskImage: 'radial-gradient(120% 80% at 50% 40%, black, transparent 78%)',
  WebkitMaskImage: 'radial-gradient(120% 80% at 50% 40%, black, transparent 78%)',
  animationName: 'sd-drift', animationDuration: '24s', animationTimingFunction: 'linear', animationIterationCount: 'infinite',
}

const KEYFRAMES = `
@keyframes sd-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sd-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes sd-grow-y { from { transform: scaleY(0); } to { transform: scaleY(1); } }
@keyframes sd-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
@keyframes sd-float { 0%,100% { transform: translate(0,0); } 50% { transform: translate(22px,-18px); } }
@keyframes sd-drift { from { background-position: 0 0; } to { background-position: 6% 10.5%; } }
@keyframes sd-rec { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.55); } 70% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
@keyframes sd-stage-next { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: translateX(0); } }
@keyframes sd-stage-prev { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  [style*="sd-fade-up"], [style*="sd-grow"], [style*="sd-grow-y"], [style*="sd-pulse"], [style*="sd-float"], [style*="sd-drift"], [style*="sd-stage"] { animation: none !important; opacity: 1 !important; transform: none !important; }
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
