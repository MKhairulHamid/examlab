import React, { useState, useEffect, useRef } from 'react'
import {
  Clock, Check, Mic, FileCheck, Play, Smartphone, Laptop,
  RefreshCw, BookOpen, Sparkles, ChevronRight, ExternalLink, Award,
  Lock, ShieldCheck, BadgeCheck, Cloud, PlayCircle, ArrowRight,
} from 'lucide-react'
import { CertificateCard } from '../certificate/CertificateCard'

/* ────────────────────────────────────────────────────────────────────────────
 * Live UI demos for the landing page "How It Works" section.
 *
 * Each demo is a small, self-contained recreation of real product UI that
 * autoplay-loops once scrolled into view (IntersectionObserver) and pauses when
 * out of view. All motion is disabled for users with prefers-reduced-motion —
 * the demo simply holds its finished state so the UI still reads.
 * ──────────────────────────────────────────────────────────────────────────── */

const TEAL = '#00D4AA'
const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'
const SUCCESS = '#10b981'
const DANGER = '#dc2626'

// ─── Shared hooks ───────────────────────────────────────────────────────────

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])
  return reduced
}

function useInView(threshold = 0.45) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// Step machine: cycles 0..durations.length-1 while `active`. With reduced motion
// it parks on the final step so the demo reads as "finished".
function useSteps(durations, active, reduced) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (reduced) { setStep(durations.length - 1); return }
    if (!active) return
    let id
    const tick = (i) => {
      setStep(i)
      id = setTimeout(() => tick((i + 1) % durations.length), durations[i])
    }
    tick(0)
    return () => clearTimeout(id)
    // durations is a stable literal per call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced])
  return step
}

// ─── Reusable app-window frame ──────────────────────────────────────────────

function Frame({ label, accent = TEAL, children, style }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '1rem',
        border: '1px solid rgba(10,37,64,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
        overflow: 'hidden',
        width: '100%',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '0.6rem 0.85rem',
          background: '#f8fafc',
          borderBottom: '1px solid rgba(10,37,64,0.07)',
        }}
      >
        <span style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: 99, background: c, opacity: 0.55 }} />
          ))}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.02em',
          color: accent, textTransform: 'uppercase',
        }}>{label}</span>
      </div>
      <div style={{ padding: '1.1rem 1.15rem' }}>{children}</div>
    </div>
  )
}

const fade = (visible, y = 6) => ({
  opacity: visible ? 1 : 0,
  transform: visible ? 'none' : `translateY(${y}px)`,
  transition: 'opacity 0.45s ease, transform 0.45s ease',
})

// ════════════════════════════════════════════════════════════════════════════
// 1. SESSION DEMO  — structured session: pre-learning Q → concept →
//    interactive widget → recall check, progress bar filling throughout.
// ════════════════════════════════════════════════════════════════════════════

export function SessionDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView()
  const step = useSteps([2200, 2400, 2600, 2600], inView, reduced)
  const pct = ((step + 1) / 4) * 100

  const stages = ['Pre-learning', 'Concept', 'Try it', 'Recall check']

  return (
    <div ref={ref}>
      <Frame label="Study Session">
        {/* header + progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <BookOpen size={15} color={TEAL_DARK} />
          <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem' }}>S3 Storage Classes</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>Session 4 of 15</span>
        </div>
        <div style={{ height: 6, borderRadius: 99, background: '#eef2f7', overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
        </div>
        <div style={{ display: 'flex', gap: 5, marginBottom: 14 }}>
          {stages.map((s, i) => (
            <span key={s} style={{
              flex: 1, textAlign: 'center', fontSize: '0.625rem', fontWeight: 700,
              padding: '3px 0', borderRadius: 6,
              color: i <= step ? TEAL_DARK : '#94a3b8',
              background: i === step ? 'rgba(0,212,170,0.1)' : 'transparent',
              transition: 'all 0.4s ease',
            }}>{s}</span>
          ))}
        </div>

        {/* stage body — fixed height so the card doesn't jump */}
        <div style={{ minHeight: 132, position: 'relative' }}>
          {/* Pre-learning question */}
          <div style={{ ...fade(step === 0), position: step === 0 ? 'static' : 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#6366F1', marginBottom: 6 }}>BEFORE YOU LEARN</div>
            <p style={{ fontSize: '0.8125rem', color: NAVY, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.5 }}>
              Which storage class is cheapest for data you rarely access but need in milliseconds?
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {['Standard', 'Standard-IA', 'Glacier'].map((o, i) => (
                <span key={o} style={{
                  fontSize: '0.75rem', padding: '5px 11px', borderRadius: 8,
                  border: `1.5px solid ${i === 1 ? TEAL : '#e2e8f0'}`,
                  background: i === 1 ? 'rgba(0,212,170,0.08)' : '#fff',
                  color: i === 1 ? TEAL_DARK : '#64748b', fontWeight: 600,
                }}>{o}</span>
              ))}
            </div>
          </div>

          {/* Concept */}
          <div style={{ ...fade(step === 1), position: step === 1 ? 'static' : 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK, marginBottom: 6 }}>THE WHY BEFORE THE WHAT</div>
            <p style={{ fontSize: '0.8125rem', color: '#475569', margin: '0 0 10px', lineHeight: 1.6 }}>
              Each class trades <b style={{ color: NAVY }}>retrieval speed</b> against <b style={{ color: NAVY }}>storage cost</b>. Standard-IA keeps instant access but charges a retrieval fee — ideal for backups.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Durability 11 9s', 'Instant retrieval', '↓ 40% cost'].map((c) => (
                <span key={c} style={{ fontSize: '0.6875rem', padding: '4px 9px', borderRadius: 7, background: '#f1f5f9', color: '#475569', fontWeight: 600 }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Interactive widget moment */}
          <div style={{ ...fade(step === 2), position: step === 2 ? 'static' : 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#8B5CF6', marginBottom: 8 }}>INTERACTIVE · DRAG THE ACCESS FREQUENCY</div>
            <CostSlider active={step === 2 && !reduced} />
          </div>

          {/* Recall check */}
          <div style={{ ...fade(step === 3), position: step === 3 ? 'static' : 'absolute', inset: 0, pointerEvents: 'none' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: SUCCESS, marginBottom: 6 }}>LOCK IT IN</div>
            <p style={{ fontSize: '0.8125rem', color: NAVY, fontWeight: 600, margin: '0 0 10px', lineHeight: 1.5 }}>
              Archive accessed once a year, retrieval in hours is fine — which class?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 11px', borderRadius: 9, border: `1.5px solid ${SUCCESS}`, background: 'rgba(16,185,129,0.08)' }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, background: SUCCESS, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#fff" strokeWidth={3} />
              </span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#047857' }}>Glacier Deep Archive — correct!</span>
            </div>
          </div>
        </div>
      </Frame>
    </div>
  )
}

// little auto-animating slider used inside the session demo
function CostSlider({ active }) {
  const [t, setT] = useState(0.7)
  useEffect(() => {
    if (!active) return
    let dir = -1, v = 0.7, raf
    const loop = () => {
      v += dir * 0.012
      if (v <= 0.12) { v = 0.12; dir = 1 }
      if (v >= 0.92) { v = 0.92; dir = -1 }
      setT(v)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [active])
  const cost = Math.round(23 - t * 19) // higher access → pricier class fits
  const rec = t > 0.6 ? 'S3 Standard' : t > 0.3 ? 'Standard-IA' : 'Glacier'
  return (
    <div>
      <div style={{ position: 'relative', height: 8, borderRadius: 99, background: 'linear-gradient(90deg,#c7d2fe,#a78bfa)', margin: '14px 4px 12px' }}>
        <span style={{
          position: 'absolute', top: '50%', left: `${t * 100}%`,
          width: 18, height: 18, borderRadius: 99, background: '#fff',
          border: '3px solid #8B5CF6', transform: 'translate(-50%,-50%)',
          boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
        <span style={{ color: '#64748b' }}>Best fit: <b style={{ color: '#7c3aed' }}>{rec}</b></span>
        <span style={{ color: '#64748b' }}>~${cost}<span style={{ color: '#94a3b8' }}>/TB·mo</span></span>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 2. TEACH DEMO — explain → watch others → record → proof saved
// ════════════════════════════════════════════════════════════════════════════

export function TeachDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView()
  const step = useSteps([2400, 2200, 2800, 2400], inView, reduced)
  const steps = ['Explain', 'Watch', 'Record', 'Proof']

  return (
    <div ref={ref}>
      <Frame label="Teach to Learn" accent="#8B5CF6">
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {steps.map((s, i) => (
            <span key={s} style={{
              flex: 1, textAlign: 'center', fontSize: '0.625rem', fontWeight: 700,
              padding: '4px 0', borderRadius: 7,
              color: i === step ? '#fff' : i < step ? '#7c3aed' : '#94a3b8',
              background: i === step ? '#8B5CF6' : i < step ? 'rgba(139,92,246,0.1)' : '#f1f5f9',
              transition: 'all 0.4s ease',
            }}>{s}</span>
          ))}
        </div>

        <div style={{ minHeight: 120, position: 'relative' }}>
          {/* Explain — typing */}
          <div style={{ ...fade(step === 0), position: step === 0 ? 'static' : 'absolute', inset: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>EXPLAIN IT IN YOUR OWN WORDS</div>
            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: '0.8125rem', color: NAVY, lineHeight: 1.55, minHeight: 64 }}>
              A VPC is your own private slice of the AWS network — subnets split it into public and private zones
              {step === 0 && <span className="demo-caret" style={{ borderLeft: '2px solid #8B5CF6', marginLeft: 1 }} />}
            </div>
          </div>

          {/* Watch others */}
          <div style={{ ...fade(step === 1), position: step === 1 ? 'static' : 'absolute', inset: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7c3aed', marginBottom: 8 }}>SEE HOW OTHERS EXPLAIN IT</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['#0EA5E9', 'Maya R.'], ['#F59E0B', 'Devon K.'], ['#00D4AA', 'Priya S.']].map(([c, n]) => (
                <div key={n} style={{ flex: 1, borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ height: 46, background: `linear-gradient(135deg, ${c}33, ${c}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: 24, height: 24, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                      <Play size={11} color={c} fill={c} />
                    </span>
                  </div>
                  <div style={{ padding: '4px 7px', fontSize: '0.625rem', fontWeight: 600, color: '#64748b' }}>{n}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Record */}
          <div style={{ ...fade(step === 2), position: step === 2 ? 'static' : 'absolute', inset: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#7c3aed', marginBottom: 12 }}>RECORD YOURSELF TEACHING IT</div>
            <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto 12px' }}>
              {step === 2 && !reduced && <span className="demo-ping" style={{ position: 'absolute', inset: 0, borderRadius: 99, background: 'rgba(220,38,38,0.35)' }} />}
              <span style={{ position: 'absolute', inset: 0, borderRadius: 99, background: DANGER, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={22} color="#fff" />
              </span>
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', justifyContent: 'center', height: 26 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <span key={i} className={step === 2 ? 'demo-wave-bar' : undefined} style={{
                  width: 4, height: 22, borderRadius: 99, background: '#8B5CF6',
                  animationDelay: `${i * 0.09}s`,
                  transform: step === 2 ? undefined : 'scaleY(0.35)',
                }} />
              ))}
            </div>
          </div>

          {/* Proof saved */}
          <div style={{ ...fade(step === 3), position: step === 3 ? 'static' : 'absolute', inset: 0 }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: SUCCESS, marginBottom: 8 }}>SAVED TO YOUR PORTFOLIO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 11, border: '1.5px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.06)' }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <FileCheck size={18} color={SUCCESS} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: NAVY }}>VPC Fundamentals · 2:14</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Proof of understanding · shareable</div>
              </div>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: SUCCESS, background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: 99 }}>PUBLIC</span>
            </div>
          </div>
        </div>
      </Frame>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 3. EXAM DEMO — pick answer → locks green → explanation slides in, timer ticks
// ════════════════════════════════════════════════════════════════════════════

const EXAM_OPTIONS = [
  'Attach an Internet Gateway and add a 0.0.0.0/0 route',
  'Use a NAT Gateway in the private subnet',
  'Enable a VPC endpoint for the subnet',
  'Add a security group allowing all inbound traffic',
]

export function ExamDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView()
  // 0 idle · 1 hover/select · 2 locked+graded · 3 explanation
  const step = useSteps([1500, 1400, 1800, 3200], inView, reduced)
  const correct = 0
  const [time, setTime] = useState(88)

  useEffect(() => {
    if (!inView || reduced) { setTime(88); return }
    const id = setInterval(() => setTime((t) => (t <= 0 ? 88 : t - 1)), 1000)
    return () => clearInterval(id)
  }, [inView, reduced])
  const mm = String(Math.floor(time / 60)).padStart(1, '0')
  const ss = String(time % 60).padStart(2, '0')

  return (
    <div ref={ref}>
      <Frame label="Practice Exam" accent={TEAL}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8' }}>Question 12 of 65</span>
          <span style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', fontWeight: 700, color: time < 20 ? DANGER : NAVY,
            background: time < 20 ? 'rgba(220,38,38,0.08)' : '#f1f5f9', padding: '3px 9px', borderRadius: 99,
            fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s',
          }}>
            <Clock size={13} /> {mm}:{ss}
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: NAVY, margin: '0 0 12px', lineHeight: 1.5 }}>
          An EC2 instance in a public subnet can&apos;t reach the internet. What enables outbound access?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {EXAM_OPTIONS.map((opt, i) => {
            const selected = step >= 1 && i === correct
            const graded = step >= 2 && i === correct
            const border = graded ? SUCCESS : selected ? TEAL : '#e2e8f0'
            const bg = graded ? 'rgba(16,185,129,0.08)' : selected ? 'rgba(0,212,170,0.06)' : '#fff'
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 11px', borderRadius: 9,
                border: `1.5px solid ${border}`, background: bg,
                transition: 'all 0.35s ease',
              }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 99, flexShrink: 0,
                  border: `2px solid ${graded ? SUCCESS : selected ? TEAL : '#cbd5e1'}`,
                  background: graded ? SUCCESS : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.35s ease',
                }}>
                  {graded && <Check size={11} color="#fff" strokeWidth={3} />}
                </span>
                <span style={{ fontSize: '0.75rem', color: graded ? '#047857' : '#475569', fontWeight: graded ? 700 : 500, lineHeight: 1.4 }}>{opt}</span>
              </div>
            )
          })}
        </div>

        {/* explanation panel */}
        <div style={{
          overflow: 'hidden',
          maxHeight: step >= 3 ? 130 : 0,
          opacity: step >= 3 ? 1 : 0,
          transition: 'max-height 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, margin 0.4s',
          marginTop: step >= 3 ? 11 : 0,
        }}>
          <div style={{ padding: '10px 12px', borderRadius: 10, background: '#f0fdf9', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
              <Sparkles size={13} color={TEAL_DARK} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK }}>WHY THIS IS RIGHT</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#475569', margin: '0 0 7px', lineHeight: 1.55 }}>
              A public subnet needs an <b>Internet Gateway</b> plus a default route to it. A NAT Gateway is for private subnets.
            </p>
            <a style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK, textDecoration: 'none' }}>
              Official AWS docs <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </Frame>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 4. READINESS DEMO — attempt scores climbing past pass line + domain bars,
//    weakest domain flagged.
// ════════════════════════════════════════════════════════════════════════════

const ATTEMPTS = [58, 72, 88]
const DOMAINS = [
  { name: 'Design Resilient Architectures', pct: 92, color: '#0EA5E9' },
  { name: 'High-Performing Architectures', pct: 84, color: '#8B5CF6' },
  { name: 'Secure Architectures', pct: 61, color: '#F59E0B', weak: true },
  { name: 'Cost-Optimized Architectures', pct: 79, color: '#00D4AA' },
]

export function ReadinessDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView(0.35)
  // step 0..2 reveal attempts one by one, step 3 fill domain bars
  const step = useSteps([1300, 1300, 1600, 3200], inView, reduced)
  const shownAttempts = reduced ? 3 : Math.min(step + 1, 3)
  const fillDomains = reduced || step >= 3

  return (
    <div ref={ref}>
      <Frame label="Exam Readiness" accent={TEAL}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
          {/* big readiness number */}
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: NAVY, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {ATTEMPTS[shownAttempts - 1]}<span style={{ fontSize: '1rem', color: '#94a3b8' }}>%</span>
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: SUCCESS, marginTop: 2 }}>
              {shownAttempts >= 2 ? '▲ on track to pass' : 'building up…'}
            </div>
          </div>
          {/* attempt bars vs pass line */}
          <div style={{ flex: 1, position: 'relative', height: 64, display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 4 }}>
            {/* pass line at 72% */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: `${0.72 * 60}px`, borderTop: '1.5px dashed #cbd5e1' }}>
              <span style={{ position: 'absolute', right: 0, top: -14, fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8' }}>PASS</span>
            </div>
            {ATTEMPTS.map((a, i) => {
              const shown = i < shownAttempts
              const passes = a >= 72
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                  <div style={{
                    width: '100%', maxWidth: 26, borderRadius: '5px 5px 0 0',
                    height: shown ? `${(a / 100) * 60}px` : 0,
                    background: passes ? `linear-gradient(${TEAL}, ${TEAL_DARK})` : '#cbd5e1',
                    transition: 'height 0.7s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                  <span style={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 600, marginTop: 3 }}>#{i + 1}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* domain readiness bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
          {DOMAINS.map((d) => (
            <div key={d.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 600 }}>{d.name}</span>
                {d.weak
                  ? <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#b45309', background: 'rgba(217,119,6,0.12)', padding: '1px 7px', borderRadius: 99 }}>REVIEW THIS</span>
                  : <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>{d.pct}%</span>}
              </div>
              <div style={{ height: 5, borderRadius: 99, background: '#eef2f7', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: fillDomains ? `${d.pct}%` : 0,
                  background: d.weak ? '#F59E0B' : d.color,
                  transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </Frame>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// 5. SYNC DEMO — progress saved on one device, picked up on another.
//    "Learn in a spare few minutes, continue right where you left off."
// ════════════════════════════════════════════════════════════════════════════

export function SyncDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView(0.35)
  // 0 laptop progressing · 1 syncing · 2 phone resumes
  const step = useSteps([2400, 1500, 2800], inView, reduced)
  const laptopPct = step >= 1 ? 62 : 28
  const phoneActive = step >= 2 || reduced

  return (
    <div ref={ref}>
      <Frame label="Synced across devices" accent={TEAL}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* laptop */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ borderRadius: 10, border: '1.5px solid #e2e8f0', overflow: 'hidden', background: '#fff' }}>
              <div style={{ padding: '9px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <Laptop size={13} color={NAVY} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: NAVY }}>At your desk</span>
                </div>
                <div style={{ fontSize: '0.5625rem', color: '#94a3b8', textAlign: 'left', marginBottom: 4 }}>Session 7 · IAM Policies</div>
                <div style={{ height: 5, borderRadius: 99, background: '#eef2f7', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${laptopPct}%`, background: `linear-gradient(90deg,${TEAL},${TEAL_DARK})`, borderRadius: 99, transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 600 }}>{laptopPct}% · paused</span>
          </div>

          {/* sync conduit */}
          <div style={{ width: 44, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 99,
              background: step === 1 ? 'rgba(0,212,170,0.15)' : '#f1f5f9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.4s',
            }}>
              <RefreshCw size={14} color={step === 1 ? TEAL_DARK : '#94a3b8'} style={{
                animation: step === 1 && !reduced ? 'spin 1s linear infinite' : 'none',
              }} />
            </span>
            <div style={{ position: 'relative', width: '100%', height: 2, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
              {step === 1 && !reduced && <span className="demo-travel" style={{ position: 'absolute', top: -1, width: 10, height: 4, borderRadius: 99, background: TEAL }} />}
            </div>
            <span style={{ fontSize: '0.5rem', color: TEAL_DARK, fontWeight: 700, height: 10 }}>{step === 1 ? 'syncing' : ''}</span>
          </div>

          {/* phone */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              borderRadius: 12, border: `1.5px solid ${phoneActive ? TEAL : '#e2e8f0'}`,
              overflow: 'hidden', background: '#fff',
              boxShadow: phoneActive ? '0 6px 18px rgba(0,212,170,0.18)' : 'none',
              transition: 'all 0.5s ease',
            }}>
              <div style={{ padding: '9px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                  <Smartphone size={13} color={NAVY} />
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: NAVY }}>On the go</span>
                </div>
                {phoneActive ? (
                  <div style={{ ...fade(true) }}>
                    <div style={{ fontSize: '0.5625rem', color: TEAL_DARK, textAlign: 'left', marginBottom: 4, fontWeight: 700 }}>▸ Continue Session 7</div>
                    <div style={{ height: 5, borderRadius: 99, background: '#eef2f7', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '62%', background: `linear-gradient(90deg,${TEAL},${TEAL_DARK})`, borderRadius: 99 }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.5625rem', color: '#cbd5e1', textAlign: 'left', padding: '6px 0' }}>waiting…</div>
                )}
              </div>
            </div>
            <span style={{ fontSize: '0.5625rem', color: phoneActive ? TEAL_DARK : '#94a3b8', fontWeight: 600 }}>
              {phoneActive ? 'resumed · 62%' : 'idle'}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.6875rem', color: '#64748b', textAlign: 'center', margin: '12px 0 0', lineHeight: 1.4 }}>
          <Award size={11} color={TEAL_DARK} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
          A few free minutes on the train — pick up exactly where you stopped.
        </p>
      </Frame>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// FULL FLOW SHOWCASE — one continuous journey playing inside a realistic
// laptop + phone frame, like a screen recording of the actual app.
// ════════════════════════════════════════════════════════════════════════════

const JOURNEY = [
  { key: 'home',  label: 'Your hub',  path: '/dashboard' },
  { key: 'learn', label: 'Learn',     path: '/exam/saa-c03/study' },
  { key: 'teach', label: 'Teach',     path: '/exam/saa-c03/study' },
  { key: 'exam',  label: 'Practice',  path: '/exam/saa-c03/take' },
  { key: 'pass',  label: 'Pass',      path: '/exam/saa-c03/results' },
  { key: 'cert',  label: 'Certified', path: '/verify/saa-c03' },
]

// Real SAA-C03 program data (src/data/programs.js) — the cert reuses the live
// CertificateCard so it is pixel-identical to the app.
const SAA_PROGRAM = { name: 'AWS Certified Solutions Architect – Associate', code: 'SAA-C03', color: '#6366F1' }
const INDIGO = '#6366F1'   // SAA program accent
const BLUE = '#3b82f6'     // exam "selected option" colour (blue-500), matches the live exam
const DOMAINS_SAA = [
  { n: 'Design Secure Architectures',          w: '30%', c: '#0EA5E9', done: 5, total: 5 },
  { n: 'Design Resilient Architectures',       w: '26%', c: '#8B5CF6', done: 2, total: 4 },
  { n: 'Design High-Performing Architectures', w: '24%', c: '#00D4AA', done: 0, total: 4 },
  { n: 'Design Cost-Optimized Architectures',  w: '20%', c: '#F59E0B', done: 0, total: 3 },
]

// little circular progress ring used on the dashboard screen
function Ring({ pct, size = 54, stroke = 6, label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TEAL_DARK} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <span style={{ fontSize: size * 0.28, fontWeight: 800, color: NAVY, lineHeight: 1 }}>{pct}<span style={{ fontSize: size * 0.16 }}>%</span></span>
        {label && <span style={{ fontSize: size * 0.13, color: '#94a3b8', fontWeight: 600 }}>{label}</span>}
      </div>
    </div>
  )
}

// browser chrome wrapper for laptop screens
function Browser({ path, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 9px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
        <span style={{ display: 'flex', gap: 4 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 7, height: 7, borderRadius: 99, background: c, opacity: 0.6 }} />)}
        </span>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 99, padding: '2px 12px', maxWidth: '78%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            <Lock size={9} color="#94a3b8" /> cloudexamlab.com{path}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

const pill = (text, bg, color) => (
  <span style={{ fontSize: '0.625rem', fontWeight: 700, color, background: bg, padding: '3px 9px', borderRadius: 99 }}>{text}</span>
)

// ─── Laptop app screens (index matches JOURNEY) ─────────────────────────────
// ─── Laptop app screens (faithful to the live app; index matches JOURNEY) ────
// Emoji in the real app (⏱️ timer, 🎉 results) are swapped for lucide icons to
// honour the landing-page no-emoji rule; everything else mirrors the source.
function LaptopScreen({ i }) {
  switch (i) {
    case 0: return ( // Dashboard — the dark "featured course" hub card
      <div style={{ padding: '14px 16px', height: '100%', background: '#f7f8fa', overflow: 'hidden' }}>
        <div style={{ borderRadius: 16, border: '1px solid rgba(0,212,170,0.2)', background: 'linear-gradient(135deg,#0A2540 0%,#1A3B5C 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px 10px', display: 'flex', justifyContent: 'space-between', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.58rem', fontWeight: 700, color: TEAL, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>SAA-C03 Preparation</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: 2, lineHeight: 1.25 }}>AWS Certified Solutions Architect – Associate</div>
              <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.5)' }}>7 of 16 sessions complete</div>
            </div>
            <span style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap', fontSize: '0.64rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#00D4AA,#00A884)', padding: '7px 12px', borderRadius: 10, boxShadow: '0 4px 14px rgba(0,212,170,0.3)' }}>Continue →</span>
          </div>
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Overall Progress</span>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: TEAL, fontFamily: 'monospace' }}>44%</span>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '44%', background: 'linear-gradient(90deg,#00D4AA,#00A884)', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Next: Session 8 — Designing for High Availability</div>
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 9 }}>Exam Domains</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {DOMAINS_SAA.map((d, idx) => {
                const pct = d.total > 0 ? Math.round(d.done / d.total * 100) : 0
                return (
                  <div key={d.n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '9px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                      <span style={{ width: 18, height: 18, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.6rem', background: `${d.c}28`, color: d.c, flexShrink: 0 }}>{idx + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.n}</div>
                        <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)' }}>{d.w} of exam · {d.total} sessions</div>
                      </div>
                      <span style={{ fontSize: '0.55rem', fontFamily: 'monospace', fontWeight: 700, color: d.c, flexShrink: 0 }}>{d.done}/{d.total}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: d.c, borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
    case 1: return ( // Learn — session reading view
      <div style={{ padding: '16px 20px', height: '100%', background: '#fff', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 11, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fff', background: NAVY, padding: '3px 9px', borderRadius: 6 }}>Session 8</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: TEAL_DARK, background: 'rgba(0,212,170,0.12)', padding: '3px 9px', borderRadius: 6 }}>30 min</span>
          <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#b45309', background: 'rgba(245,158,11,0.12)', padding: '3px 9px', borderRadius: 6 }}>26% of exam</span>
        </div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 8 }}>Designing for High Availability</div>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, margin: '0 0 14px' }}>Spread workloads across Availability Zones so a single failure never takes the system down — the core of resilient AWS architecture.</p>
        <div style={{ height: 2, background: 'linear-gradient(90deg, rgba(0,212,170,0.4), transparent)', marginBottom: 14 }} />
        <div style={{ background: 'rgba(0,212,170,0.06)', border: '1.5px solid rgba(0,212,170,0.25)', borderRadius: 14, padding: '12px 15px' }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>What you'll learn</div>
          <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['Why Multi-AZ deployments survive zone failures', 'How Elastic Load Balancing distributes across AZs', 'When to add Auto Scaling for fault tolerance'].map((o, k) => (
              <li key={k} style={{ fontSize: '0.72rem', color: '#1f2937', lineHeight: 1.5 }}>{o}</li>
            ))}
          </ul>
        </div>
      </div>
    )
    case 2: return ( // Teach — Teach it to learn it
      <div style={{ padding: '14px 18px', height: '100%', background: '#fff', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: NAVY }}>Teach it to learn it</div>
          <div style={{ fontSize: '0.66rem', color: '#4b5563', lineHeight: 1.5, marginTop: 3 }}>Explain it, watch how others explain it, then record your own.</div>
        </div>
        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1.5px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '10px 13px', marginBottom: 11 }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>1 · Explain it first</div>
          <p style={{ fontSize: '0.72rem', color: '#1f2937', lineHeight: 1.55, margin: 0 }}>In your own words, why does spreading across Availability Zones improve availability?</p>
        </div>
        <div style={{ marginBottom: 11 }}>
          <div style={{ fontSize: '0.58rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>2 · Watch</div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[['#0EA5E9', 'Maya R.'], ['#F59E0B', 'Devon K.'], ['#00D4AA', 'Priya S.']].map(([c, n]) => (
              <div key={n} style={{ flex: 1, borderRadius: 9, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <div style={{ height: 34, background: `linear-gradient(135deg,${c}33,${c}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ width: 18, height: 18, borderRadius: 99, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={9} color={c} fill={c} /></span>
                </div>
                <div style={{ padding: '3px 6px', fontSize: '0.52rem', fontWeight: 600, color: '#64748b' }}>{n}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,168,132,0.04))', border: '1.5px solid rgba(0,212,170,0.3)', borderRadius: 14, padding: '11px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.58rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.05em' }}>3 · Teach it &amp; share</span>
            <span style={{ fontSize: '0.55rem', fontWeight: 800, color: '#059669', background: 'rgba(16,185,129,0.12)', padding: '2px 7px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Live</span>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#00D4AA,#00A884)', padding: '7px 13px', borderRadius: 9 }}><Play size={11} fill="#fff" /> Open slides to present</span>
        </div>
      </div>
    )
    case 3: return ( // Exam — live practice exam (blue selection, no inline grading)
      <div style={{ padding: '12px 14px', height: '100%', background: 'linear-gradient(135deg,#0A2540 0%,#1A3B5C 100%)', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 9 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', marginBottom: 5 }}>Solutions Architect — Practice Exam 2</div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.66rem', fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 8 }}><Clock size={11} /> Time Remaining: 1:18:42</span>
        </div>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 9 }}>
          <div style={{ height: '100%', width: '78%', background: TEAL, borderRadius: 99 }} />
        </div>
        <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.8)', marginBottom: 9 }}>Questions: 12/65</div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '13px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.16)' }}>
          <span style={{ display: 'inline-block', background: NAVY, color: '#fff', padding: '3px 10px', borderRadius: 99, fontSize: '0.6rem', fontWeight: 600, marginBottom: 9 }}>Question 12 • Multiple Choice — select one</span>
          <p style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1f2937', lineHeight: 1.5, margin: '0 0 10px' }}>A company needs its web tier to stay available if one Availability Zone fails. Which approach best meets this?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[['Deploy instances across multiple AZs behind an ALB', true], ['Run a larger instance in a single Availability Zone', false], ['Attach an Elastic IP to one instance', false], ['Schedule manual failover with a script', false]].map(([opt, sel], k) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, border: `2px solid ${sel ? BLUE : '#e5e7eb'}`, background: sel ? '#eff6ff' : '#f9fafb' }}>
                <span style={{ width: 17, height: 17, borderRadius: 99, flexShrink: 0, border: `2px solid ${sel ? BLUE : '#9ca3af'}`, background: sel ? BLUE : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.6rem' }}>{sel ? '✓' : ''}</span>
                <span style={{ fontSize: '0.7rem', color: '#1f2937', lineHeight: 1.4 }}>{opt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
    case 4: return ( // Results — pass screen
      <div style={{ padding: '12px 14px', height: '100%', background: 'linear-gradient(135deg,#0A2540 0%,#1A3B5C 100%)', overflow: 'hidden' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 16, padding: '16px', textAlign: 'center' }}>
          <div style={{ marginBottom: 8 }}><BadgeCheck size={34} color={SUCCESS} /></div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>Exam Results</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: SUCCESS, marginBottom: 14 }}>Congratulations! You passed!</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            {[['Score', '88%', SUCCESS, '57 / 65 correct'], ['Time Spent', '1:42:18', TEAL, 'Jun 24, 2026'], ['Status', 'PASSED', SUCCESS, 'Scaled: 824']].map(([lab, val, col, sub]) => (
              <div key={lab} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '11px 8px' }}>
                <div style={{ fontSize: '0.56rem', color: 'rgba(255,255,255,0.7)', marginBottom: 5 }}>{lab}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: col, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
    default: return ( // Certificate — reuse the real CertificateCard for exact fidelity
      <div style={{ padding: '14px 18px', height: '100%', background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ width: '100%', maxWidth: '94%' }}>
          <CertificateCard program={SAA_PROGRAM} state="earned" name="Sam Carter" score={88} credentialCode="CXL-SAA-7F3A2C" issuedAt="2026-06-24" />
        </div>
      </div>
    )
  }
}

// ─── Phone app screens (same screens, mobile-narrow — the app is responsive) ──
function PhoneScreen({ i }) {
  const Bar = ({ color = TEAL_DARK }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 9px 6px', borderBottom: '1px solid #f1f5f9' }}>
      <Cloud size={11} color={color} /><span style={{ fontSize: '0.5rem', fontWeight: 800, color: NAVY }}>CloudExamLab</span>
    </div>
  )
  const body = { padding: '8px 9px' }
  const screens = [
    <div key="h" style={{ height: '100%', background: '#f7f8fa' }}><Bar />
      <div style={body}>
        <div style={{ borderRadius: 11, background: 'linear-gradient(135deg,#0A2540,#1A3B5C)', padding: '9px 10px', border: '1px solid rgba(0,212,170,0.2)' }}>
          <div style={{ fontSize: '0.44rem', fontWeight: 700, color: TEAL, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>SAA-C03 Preparation</div>
          <div style={{ fontSize: '0.52rem', fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 5 }}>Solutions Architect – Associate</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
            <span style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.6)' }}>Overall Progress</span>
            <span style={{ fontSize: '0.42rem', color: TEAL, fontFamily: 'monospace', fontWeight: 700 }}>44%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 7 }}><div style={{ height: '100%', width: '44%', background: 'linear-gradient(90deg,#00D4AA,#00A884)' }} /></div>
          <div style={{ fontSize: '0.44rem', textAlign: 'center', color: '#fff', fontWeight: 700, background: 'linear-gradient(135deg,#00D4AA,#00A884)', padding: '5px', borderRadius: 6 }}>Continue →</div>
        </div>
      </div>
    </div>,
    <div key="l" style={{ height: '100%', background: '#fff' }}><Bar />
      <div style={body}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          <span style={{ fontSize: '0.42rem', fontWeight: 700, color: '#fff', background: NAVY, padding: '2px 5px', borderRadius: 4 }}>Session 8</span>
          <span style={{ fontSize: '0.42rem', fontWeight: 700, color: TEAL_DARK, background: 'rgba(0,212,170,0.12)', padding: '2px 5px', borderRadius: 4 }}>30 min</span>
        </div>
        <div style={{ fontSize: '0.6rem', fontWeight: 800, color: NAVY, lineHeight: 1.2, marginBottom: 6 }}>Designing for High Availability</div>
        <div style={{ background: 'rgba(0,212,170,0.06)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 8, padding: '7px 8px' }}>
          <div style={{ fontSize: '0.42rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', marginBottom: 4 }}>What you'll learn</div>
          <div style={{ fontSize: '0.45rem', color: '#1f2937', lineHeight: 1.6 }}>• Multi-AZ survives zone failures<br />• ELB spreads load across AZs</div>
        </div>
      </div>
    </div>,
    <div key="t" style={{ height: '100%', background: '#fff' }}><Bar color="#8B5CF6" />
      <div style={body}>
        <div style={{ fontSize: '0.55rem', fontWeight: 800, color: NAVY, textAlign: 'center', marginBottom: 7 }}>Teach it to learn it</div>
        <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 7, padding: '6px 7px', marginBottom: 7 }}>
          <div style={{ fontSize: '0.4rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: 3 }}>1 · Explain it first</div>
          <div style={{ fontSize: '0.44rem', color: '#1f2937', lineHeight: 1.4 }}>Why do multiple AZs improve availability?</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg,rgba(0,212,170,0.08),rgba(0,168,132,0.04))', border: '1px solid rgba(0,212,170,0.3)', borderRadius: 8, padding: '6px 7px' }}>
          <div style={{ fontSize: '0.4rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', marginBottom: 4 }}>3 · Teach it &amp; share</div>
          <div style={{ fontSize: '0.42rem', textAlign: 'center', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#00D4AA,#00A884)', padding: '4px', borderRadius: 5 }}>Open slides to present</div>
        </div>
      </div>
    </div>,
    <div key="e" style={{ height: '100%', background: 'linear-gradient(135deg,#0A2540,#1A3B5C)', padding: '7px 7px' }}>
      <div style={{ fontSize: '0.42rem', color: '#fff', textAlign: 'center', marginBottom: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}><Clock size={8} /> Time Remaining 1:18:42</div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 99, marginBottom: 6, overflow: 'hidden' }}><div style={{ height: '100%', width: '78%', background: TEAL }} /></div>
      <div style={{ background: '#fff', borderRadius: 8, padding: '7px 7px' }}>
        <span style={{ display: 'inline-block', background: NAVY, color: '#fff', fontSize: '0.38rem', fontWeight: 600, padding: '2px 5px', borderRadius: 99, marginBottom: 5 }}>Question 12</span>
        <div style={{ fontSize: '0.45rem', fontWeight: 600, color: '#1f2937', lineHeight: 1.35, marginBottom: 6 }}>Stay available if one AZ fails — best approach?</div>
        {[['Across AZs behind an ALB', true], ['Bigger instance, one AZ', false], ['Elastic IP on one host', false]].map(([o, sel], k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 5px', marginBottom: 3, borderRadius: 5, border: `1.5px solid ${sel ? BLUE : '#e5e7eb'}`, background: sel ? '#eff6ff' : '#f9fafb' }}>
            <span style={{ width: 9, height: 9, borderRadius: 99, flexShrink: 0, border: `1.5px solid ${sel ? BLUE : '#9ca3af'}`, background: sel ? BLUE : 'transparent' }} />
            <span style={{ fontSize: '0.42rem', color: '#1f2937' }}>{o}</span>
          </div>
        ))}
      </div>
    </div>,
    <div key="p" style={{ height: '100%', background: 'linear-gradient(135deg,#0A2540,#1A3B5C)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
      <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '12px 9px', textAlign: 'center', width: '100%' }}>
        <BadgeCheck size={22} color={SUCCESS} />
        <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#fff', margin: '4px 0 2px' }}>Exam Results</div>
        <div style={{ fontSize: '0.42rem', color: SUCCESS, fontWeight: 600, marginBottom: 8 }}>You passed!</div>
        <div style={{ fontSize: '1rem', fontWeight: 800, color: SUCCESS, lineHeight: 1 }}>88%</div>
        <div style={{ fontSize: '0.42rem', color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>PASSED · Scaled 824</div>
      </div>
    </div>,
    <div key="c" style={{ height: '100%', background: '#f7f8fa', display: 'flex', alignItems: 'center', padding: '8px' }}>
      <div style={{ width: '100%' }}><CertificateCard program={SAA_PROGRAM} state="earned" name="Sam Carter" score={88} credentialCode="CXL-SAA-7F3A2C" issuedAt="2026-06-24" /></div>
    </div>,
  ]
  return screens[i]
}

// Active screen fades IN on top (z 2); the outgoing screen holds fully opaque
// underneath, then snaps away after the fade — so only one screen is ever
// visible, never a translucent blend of two.
const flowLayer = (active) => ({
  opacity: active ? 1 : 0,
  zIndex: active ? 2 : 1,
  background: '#fff',
  transition: active ? 'opacity 0.5s ease' : 'opacity 0s linear 0.5s',
  pointerEvents: 'none',
})

export function FullFlowDemo() {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView(0.3)
  const step = useSteps([3200, 3400, 3000, 3200, 3000, 3400], inView, reduced)

  return (
    <div ref={ref}>
      <div className="flow-stage">
        {/* Laptop */}
        <div className="laptop-bezel">
          <div className="laptop-screen">
            {JOURNEY.map((s, i) => (
              <div key={s.key} className="flow-screen-layer" style={flowLayer(step === i)}>
                <Browser path={s.path}><LaptopScreen i={i} /></Browser>
              </div>
            ))}
          </div>
          <div className="laptop-base" />
        </div>

        {/* Phone */}
        <div className="flow-phone">
          <div className="flow-phone-notch" />
          <div className="flow-phone-screen">
            {JOURNEY.map((s, i) => (
              <div key={s.key} className="flow-screen-layer" style={flowLayer(step === i)}>
                <PhoneScreen i={i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 30 }}>
        {JOURNEY.map((s, i) => (
          <span key={s.key} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.6875rem', fontWeight: 700,
            color: step === i ? '#fff' : 'rgba(255,255,255,0.4)',
            background: step === i ? 'rgba(0,212,170,0.18)' : 'transparent',
            border: `1px solid ${step === i ? 'rgba(0,212,170,0.4)' : 'rgba(255,255,255,0.12)'}`,
            padding: '5px 12px', borderRadius: 99, transition: 'all 0.4s ease',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: step >= i ? TEAL : 'rgba(255,255,255,0.25)' }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
