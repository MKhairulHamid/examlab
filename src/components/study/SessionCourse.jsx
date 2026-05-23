import React, { useState, useEffect, useMemo, useRef } from 'react'

const TEAL = '#00D4AA'
const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

// ─── Small renderers ──────────────────────────────────────────────────────────

function ContentTable({ table }) {
  return (
    <div style={{ overflowX: 'auto', margin: '1rem 0', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            {table.headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left', padding: '0.6rem 1rem',
                background: 'rgba(0,212,170,0.08)', color: NAVY,
                fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase',
                letterSpacing: '0.04em', borderBottom: `2px solid ${TEAL}`,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ background: ri % 2 ? '#f8fafc' : 'white' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '0.55rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#374151', verticalAlign: 'top' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CALLOUT_STYLES = {
  tip:     { bg: 'rgba(0,212,170,0.07)',   border: TEAL,      icon: '💡', label: 'Tip' },
  warning: { bg: 'rgba(239,68,68,0.07)',   border: '#ef4444', icon: '⚠️', label: 'Watch out' },
  note:    { bg: 'rgba(59,130,246,0.07)',  border: '#3b82f6', icon: 'ℹ️', label: 'Note' },
}

function Callout({ callout }) {
  const s = CALLOUT_STYLES[callout.type] || CALLOUT_STYLES.note
  return (
    <div style={{
      background: s.bg, borderLeft: `4px solid ${s.border}`,
      borderRadius: '0 0.6rem 0.6rem 0', padding: '0.875rem 1.125rem', margin: '1rem 0',
    }}>
      <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: NAVY, marginBottom: '0.3rem' }}>
        {s.icon} {s.label}
      </div>
      <div style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>{callout.text}</div>
    </div>
  )
}

function ContentSection({ section }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: NAVY, marginBottom: '0.6rem', lineHeight: 1.3 }}>
        {section.heading}
      </h3>
      {section.body && (
        <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.7, marginBottom: section.bullets ? '0.5rem' : 0 }}>
          {section.body}
        </p>
      )}
      {section.bullets && (
        <ul style={{ paddingLeft: '1.4rem', margin: '0.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {section.bullets.map((b, i) => (
            <li key={i} style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>{b}</li>
          ))}
        </ul>
      )}
      {section.table && <ContentTable table={section.table} />}
      {section.callout && <Callout callout={section.callout} />}
    </div>
  )
}

// ─── Interactive exam question ────────────────────────────────────────────────

function SampleQuestion({ sample }) {
  const isMulti = Array.isArray(sample.correct)
  const correctSet = useMemo(() => new Set(isMulti ? sample.correct : [sample.correct]), [sample, isMulti])
  const [selected, setSelected] = useState([])
  const [revealed, setRevealed] = useState(false)

  const toggle = (idx) => {
    if (revealed) return
    setSelected(prev =>
      isMulti
        ? prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        : [idx]
    )
  }

  const isCorrectOverall = revealed && selected.length === correctSet.size && selected.every(i => correctSet.has(i))

  return (
    <div style={{
      background: 'white', border: `2px solid ${NAVY}`, borderRadius: '1rem',
      padding: '1.5rem', boxShadow: '0 4px 20px rgba(10,37,64,0.08)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'white', background: NAVY,
          padding: '0.25rem 0.7rem', borderRadius: '0.4rem',
        }}>Exam Sample</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          {isMulti ? `Select ${correctSet.size} answers` : 'Single best answer'}
        </span>
      </div>

      <p style={{ fontSize: '1rem', fontWeight: 600, color: NAVY, lineHeight: 1.65, marginBottom: '1.25rem' }}>
        {sample.stem}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
        {sample.options.map((opt, idx) => {
          const isSel = selected.includes(idx)
          const isCorr = correctSet.has(idx)
          let bg = '#fafbfd', border = '1.5px solid #e2e8f0', color = NAVY
          if (revealed) {
            if (isCorr)        { bg = 'rgba(34,197,94,0.09)';  border = '2px solid #22c55e' }
            else if (isSel)    { bg = 'rgba(239,68,68,0.09)';  border = '2px solid #ef4444' }
          } else if (isSel)    { bg = 'rgba(0,212,170,0.1)';   border = `2px solid ${TEAL}` }

          return (
            <div key={idx}>
              <button
                onClick={() => toggle(idx)}
                disabled={revealed}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.875rem 1.125rem',
                  background: bg, border, borderRadius: '0.6rem', color,
                  cursor: revealed ? 'default' : 'pointer', fontSize: '0.9375rem',
                  fontWeight: isSel ? 600 : 400, transition: 'all 0.15s', lineHeight: 1.5,
                }}
              >
                {revealed && isCorr && '✅ '}{revealed && isSel && !isCorr && '❌ '}{opt}
              </button>
              {revealed && sample.explanation?.perOption?.[idx] && (
                <p style={{
                  fontSize: '0.8125rem', color: isCorr ? '#15803d' : '#6b7280',
                  margin: '0.3rem 0 0', paddingLeft: '0.75rem', lineHeight: 1.5,
                }}>
                  {sample.explanation.perOption[idx]}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          disabled={selected.length === 0}
          style={{
            padding: '0.7rem 1.5rem',
            background: selected.length ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : '#e2e8f0',
            color: selected.length ? 'white' : '#94a3b8',
            border: 'none', borderRadius: '0.6rem', fontWeight: 700,
            fontSize: '0.9375rem', cursor: selected.length ? 'pointer' : 'not-allowed',
          }}
        >
          Check Answer
        </button>
      ) : (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: '0.75rem',
          background: isCorrectOverall ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
          border: `2px solid ${isCorrectOverall ? '#22c55e' : '#ef4444'}`,
        }}>
          <p style={{ fontWeight: 700, color: isCorrectOverall ? '#15803d' : '#991b1b', marginBottom: '0.4rem' }}>
            {isCorrectOverall ? '🎉 Correct!' : '❌ Not quite — review the explanation below'}
          </p>
          <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65, marginBottom: '0.5rem' }}>
            {sample.explanation.summary}
          </p>
          {sample.explanation.link && (
            <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, margin: 0 }}>
              📎 {sample.explanation.link}
            </p>
          )}
          <button
            onClick={() => { setRevealed(false); setSelected([]) }}
            style={{
              marginTop: '0.875rem', padding: '0.4rem 1rem',
              background: 'white', color: NAVY, border: '1.5px solid #e2e8f0',
              borderRadius: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            ↺ Try again
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sidebar session item ─────────────────────────────────────────────────────

function SidebarItem({ session, isActive, isDone, isLocked, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '0.6rem 1rem 0.6rem 0.875rem',
        background: isActive ? 'rgba(0,212,170,0.1)' : 'transparent',
        border: 'none',
        borderLeft: `3px solid ${isActive ? TEAL : 'transparent'}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        transition: 'background 0.15s',
      }}
    >
      <span style={{
        width: '1.5rem', height: '1.5rem', minWidth: '1.5rem', borderRadius: '50%',
        background: isDone
          ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`
          : isActive ? NAVY : '#e2e8f0',
        color: isDone || isActive ? 'white' : '#94a3b8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.625rem', fontWeight: 700, flexShrink: 0,
      }}>
        {isLocked ? '🔒' : isDone ? '✓' : session.number}
      </span>
      <span style={{
        flex: 1, minWidth: 0,
        fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500,
        color: isLocked ? '#94a3b8' : isActive ? NAVY : isDone ? '#475569' : '#374151',
        lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {session.title}
      </span>
    </button>
  )
}

// ─── Locked session paywall ───────────────────────────────────────────────────

function LockedSession({ onSubscribe, freeModuleLabel }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,168,132,0.06))`,
      border: `2px solid rgba(0,212,170,0.3)`, borderRadius: '1.25rem',
      padding: 'clamp(1.75rem, 5vw, 3rem)', textAlign: 'center', marginTop: '0.5rem',
    }}>
      <div style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>🔒</div>
      <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 800, color: NAVY, marginBottom: '0.6rem' }}>
        This session is part of the full course
      </h3>
      <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, maxWidth: '460px', margin: '0 auto 1.5rem' }}>
        {freeModuleLabel
          ? <>You're on the free preview — <strong>{freeModuleLabel}</strong> is open to everyone. Subscribe to unlock every remaining session, with full lessons, exam tips, and practice questions.</>
          : <>You're on the free preview. Subscribe to unlock every remaining session, with full lessons, exam tips, and practice questions.</>}
      </p>
      <button
        onClick={onSubscribe}
        style={{
          padding: '0.875rem 2.25rem',
          background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
          color: 'white', border: 'none', borderRadius: '0.75rem',
          fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(0,212,170,0.35)',
        }}
      >
        Subscribe to Unlock →
      </button>
    </div>
  )
}

// ─── Enhanced reading features (currently scoped to d1-s1) ─────────────────────

// Bolds the leading ~40% of each word to create skim anchors ("bionic reading").
function BionicText({ text }) {
  if (typeof text !== 'string') return text
  return text.split(/(\s+)/).map((tok, i) => {
    if (!tok.trim()) return tok
    const n = Math.max(1, Math.round(tok.length * 0.4))
    return (
      <span key={i}>
        <b style={{ fontWeight: 700, color: 'inherit' }}>{tok.slice(0, n)}</b>{tok.slice(n)}
      </span>
    )
  })
}

const CONFIDENCE = {
  mastered: { label: 'Mastered', icon: '✓', color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
  review:   { label: 'Review',   icon: '↻', color: '#d97706', bg: 'rgba(245,158,11,0.12)' },
  confused: { label: 'Confused', icon: '?', color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
}

const discloseBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: TEAL_DARK, fontWeight: 700, fontSize: '0.8125rem',
  padding: '0.25rem 0', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
}

// A teaching section with progressive disclosure (deep content collapsed by
// default) and a confidence-scoring control row.
function EnhancedSection({ section, bionic, confidenceVal, onSetConfidence }) {
  const hasDeep = !!(section.bullets || section.table || section.callout)
  const [open, setOpen] = useState(false)
  const conf = confidenceVal ? CONFIDENCE[confidenceVal] : null
  const txt = (s) => (bionic ? <BionicText text={s} /> : s)

  return (
    <div style={{
      marginBottom: '1.5rem', paddingLeft: '1rem',
      borderLeft: `4px solid ${conf ? conf.color : '#e2e8f0'}`,
      transition: 'border-color 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: NAVY, marginBottom: '0.6rem', lineHeight: 1.3 }}>
          {txt(section.heading)}
        </h3>
        {conf && (
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, color: conf.color, background: conf.bg,
            padding: '0.15rem 0.5rem', borderRadius: '0.3rem', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{conf.icon} {conf.label}</span>
        )}
      </div>

      {section.body && (
        <p style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.7, margin: hasDeep ? '0 0 0.5rem' : 0 }}>
          {txt(section.body)}
        </p>
      )}

      {hasDeep && !open && (
        <button onClick={() => setOpen(true)} style={discloseBtnStyle}>↓ Show details</button>
      )}

      {hasDeep && open && (
        <div>
          {section.bullets && (
            <ul style={{ paddingLeft: '1.4rem', margin: '0.25rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {section.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.65 }}>{txt(b)}</li>
              ))}
            </ul>
          )}
          {section.table && <ContentTable table={section.table} />}
          {section.callout && <Callout callout={section.callout} />}
          <button onClick={() => setOpen(false)} style={discloseBtnStyle}>↑ Hide details</button>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginTop: '0.85rem' }}>
        <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600, marginRight: '0.15rem' }}>
          How well do you know this?
        </span>
        {Object.entries(CONFIDENCE).map(([key, c]) => {
          const active = confidenceVal === key
          return (
            <button
              key={key}
              onClick={() => onSetConfidence(key)}
              style={{
                fontSize: '0.6875rem', fontWeight: 700, cursor: 'pointer',
                padding: '0.25rem 0.6rem', borderRadius: '0.4rem',
                border: `1.5px solid ${active ? c.color : '#e2e8f0'}`,
                background: active ? c.bg : 'white',
                color: active ? c.color : '#64748b', transition: 'all 0.15s',
              }}
            >{c.icon} {c.label}</button>
          )
        })}
      </div>
    </div>
  )
}

// Inline active-recall "speed bump" — the following sections stay locked until
// the learner answers this correctly.
function SpeedBump({ quiz, cleared, onClear, bionic }) {
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const isCorrect = checked && selected === quiz.correct

  if (cleared) {
    return (
      <div style={{
        background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.4)',
        borderRadius: '0.75rem', padding: '0.75rem 1.125rem', margin: '0.5rem 0 1.5rem',
        fontSize: '0.875rem', fontWeight: 700, color: '#15803d',
      }}>
        ✓ Checkpoint cleared — nicely done.
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(0,212,170,0.05)', border: `2px dashed ${TEAL}`,
      borderRadius: '1rem', padding: '1.25rem 1.5rem', margin: '0.5rem 0 1.5rem',
    }}>
      <div style={{
        fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: TEAL_DARK, marginBottom: '0.6rem',
      }}>
        🚦 Speed bump · quick recall
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: NAVY, lineHeight: 1.6, marginBottom: '1rem' }}>
        {bionic ? <BionicText text={quiz.question} /> : quiz.question}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {quiz.options.map((opt, idx) => {
          const isSel = selected === idx
          const isCorr = quiz.correct === idx
          let bg = '#fafbfd', border = '1.5px solid #e2e8f0', color = NAVY
          if (checked) {
            if (isCorr)     { bg = 'rgba(34,197,94,0.09)'; border = '2px solid #22c55e' }
            else if (isSel) { bg = 'rgba(239,68,68,0.09)'; border = '2px solid #ef4444' }
          } else if (isSel) { bg = 'rgba(0,212,170,0.1)';  border = `2px solid ${TEAL}` }
          return (
            <button
              key={idx}
              onClick={() => { if (!checked) setSelected(idx) }}
              disabled={checked}
              style={{
                width: '100%', textAlign: 'left', padding: '0.75rem 1rem',
                background: bg, border, borderRadius: '0.6rem', color,
                cursor: checked ? 'default' : 'pointer', fontSize: '0.9rem',
                fontWeight: isSel ? 600 : 400, transition: 'all 0.15s', lineHeight: 1.5,
              }}
            >
              {checked && isCorr && '✅ '}{checked && isSel && !isCorr && '❌ '}{opt}
            </button>
          )
        })}
      </div>

      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          disabled={selected === null}
          style={{
            padding: '0.6rem 1.35rem',
            background: selected !== null ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : '#e2e8f0',
            color: selected !== null ? 'white' : '#94a3b8',
            border: 'none', borderRadius: '0.6rem', fontWeight: 700,
            fontSize: '0.875rem', cursor: selected !== null ? 'pointer' : 'not-allowed',
          }}
        >
          Check
        </button>
      ) : (
        <div>
          <p style={{
            fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem',
            color: isCorrect ? '#15803d' : '#991b1b',
          }}>
            {isCorrect ? `🎉 Correct! ${quiz.explainCorrect || ''}` : '❌ Not quite — give it another try.'}
          </p>
          {isCorrect ? (
            <button
              onClick={onClear}
              style={{
                padding: '0.6rem 1.35rem', background: NAVY, color: 'white',
                border: 'none', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={() => { setChecked(false); setSelected(null) }}
              style={{
                padding: '0.5rem 1.1rem', background: 'white', color: NAVY,
                border: '1.5px solid #e2e8f0', borderRadius: '0.5rem',
                fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              ↺ Try again
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function LockedNotice() {
  return (
    <div style={{
      background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '1rem',
      padding: '1.5rem', textAlign: 'center', color: '#64748b',
      fontSize: '0.9rem', fontWeight: 600,
    }}>
      🔒 The rest of this session unlocks once you clear the speed bump above.
    </div>
  )
}

// Assembles the enhanced lesson: enhanced sections + speed bumps, gating any
// section that follows an uncleared speed bump.
function LessonBody({ session, bionic, confidence, onSetConfidence }) {
  const quizzes = session.microQuizzes || []
  const [cleared, setCleared] = useState([])
  const elems = []

  for (let i = 0; i < session.sections.length; i++) {
    const blocking = quizzes.find(q => q.afterSection < i && !cleared.includes(q.afterSection))
    if (blocking) {
      elems.push(<LockedNotice key="locked" />)
      break
    }
    const secKey = `${session.id}::${i}`
    elems.push(
      <EnhancedSection
        key={secKey}
        section={session.sections[i]}
        bionic={bionic}
        confidenceVal={confidence[secKey]}
        onSetConfidence={(lvl) => onSetConfidence(secKey, lvl)}
      />
    )
    const here = quizzes.find(q => q.afterSection === i)
    if (here) {
      elems.push(
        <SpeedBump
          key={`quiz-${i}`}
          quiz={here}
          bionic={bionic}
          cleared={cleared.includes(i)}
          onClear={() => setCleared(c => (c.includes(i) ? c : [...c, i]))}
        />
      )
    }
  }
  return <>{elems}</>
}

// ─── Main component ───────────────────────────────────────────────────────────

function SessionCourse({ course, onBack, hasAccess = true, onSubscribe }) {
  const storageKey = `course-progress-${course.slug}`
  const bionicKey = 'study-bionic'
  const confidenceKey = `study-confidence-${course.slug}`
  const [completedIds, setCompletedIds] = useState([])
  const [activeId, setActiveId] = useState(course.sessions[0]?.id)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [bionic, setBionic] = useState(false)
  const [confidence, setConfidence] = useState({})
  const contentRef = useRef(null)

  // Free preview: the first module's sessions are open; the rest require a subscription.
  const freeModuleId = course.modules[0]?.id
  const isLocked = (session) => !hasAccess && session && session.domain !== freeModuleId

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setCompletedIds(JSON.parse(saved))
    } catch { /* ignore */ }
    try { setBionic(localStorage.getItem(bionicKey) === '1') } catch { /* ignore */ }
    try {
      const c = localStorage.getItem(confidenceKey)
      if (c) setConfidence(JSON.parse(c))
    } catch { /* ignore */ }
  }, [storageKey, confidenceKey])

  const toggleComplete = (id) => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const toggleBionic = () => {
    setBionic(prev => {
      const next = !prev
      try { localStorage.setItem(bionicKey, next ? '1' : '0') } catch { /* ignore */ }
      return next
    })
  }

  const setConfidenceFor = (secKey, level) => {
    setConfidence(prev => {
      const next = { ...prev }
      if (next[secKey] === level) delete next[secKey]
      else next[secKey] = level
      try { localStorage.setItem(confidenceKey, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const activeSession = course.sessions.find(s => s.id === activeId)
  const enhanced = activeSession?.id === 'd1-s1'
  const activeIdx = course.sessions.findIndex(s => s.id === activeId)
  const prevSession = activeIdx > 0 ? course.sessions[activeIdx - 1] : null
  const nextSession = activeIdx < course.sessions.length - 1 ? course.sessions[activeIdx + 1] : null
  const isCompleted = completedIds.includes(activeId)

  const total = course.sessions.length
  const done = completedIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const selectSession = (id) => {
    setActiveId(id)
    setMobileSidebarOpen(false)
    setTimeout(() => {
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  const handleNext = () => {
    if (!isCompleted) toggleComplete(activeId)
    if (nextSession) selectSession(nextSession.id)
  }

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Progress summary */}
      <div style={{ padding: '1rem 1.125rem', borderBottom: '1px solid #f1f5f9', background: '#fafbfd', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Your Progress
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL_DARK }}>
            {done}/{total}
          </span>
        </div>
        <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.3rem', textAlign: 'right' }}>
          {pct}% complete
        </div>
      </div>

      {/* Session list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0.5rem 0' }}>
        {course.modules.map(mod => {
          const modSessions = course.sessions.filter(s => s.domain === mod.id)
          if (!modSessions.length) return null
          const modDone = modSessions.filter(s => completedIds.includes(s.id)).length
          return (
            <div key={mod.id} style={{ marginBottom: '0.25rem' }}>
              <div style={{
                padding: '0.75rem 1.125rem 0.35rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '0.6625rem', fontWeight: 700, color: '#94a3b8',
                  textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3,
                  flex: 1, minWidth: 0, paddingRight: '0.5rem',
                }}>
                  {mod.label}
                </span>
                {mod.weight !== '—' && (
                  <span style={{
                    fontSize: '0.625rem', fontWeight: 700, color: TEAL_DARK,
                    background: 'rgba(0,212,170,0.12)', padding: '0.15rem 0.45rem',
                    borderRadius: '0.3rem', flexShrink: 0,
                  }}>
                    {mod.weight}
                  </span>
                )}
              </div>
              {modSessions.map(session => (
                <SidebarItem
                  key={session.id}
                  session={session}
                  isActive={session.id === activeId}
                  isDone={completedIds.includes(session.id)}
                  isLocked={isLocked(session)}
                  onClick={() => selectSession(session.id)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top navbar ─────────────────────────────────────────────────────── */}
      <nav style={{
        background: NAVY, borderBottom: `3px solid ${TEAL}`,
        height: '56px', display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', gap: '1rem',
        position: 'sticky', top: 0, zIndex: 200, flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontWeight: 600,
            fontSize: '0.8125rem', padding: '0.35rem 0.875rem', borderRadius: '0.5rem',
            flexShrink: 0,
          }}
        >
          ← Back
        </button>

        {/* Mobile sidebar toggle */}
        <button
          onClick={() => setMobileSidebarOpen(o => !o)}
          style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
            color: 'white', cursor: 'pointer', fontSize: '0.8125rem',
            padding: '0.35rem 0.875rem', borderRadius: '0.5rem', flexShrink: 0,
            alignItems: 'center', gap: '0.375rem',
          }}
          className="mobile-sidebar-toggle"
        >
          ☰ Sessions
        </button>

        <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {course.code}
          </div>
          <div style={{ color: 'white', fontSize: '0.875rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeSession?.title}
          </div>
        </div>

        <div style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.5rem',
          color: TEAL, fontWeight: 700, fontSize: '0.875rem',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            {done}/{total}
          </span>
          <span>{pct}%</span>
        </div>
      </nav>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Desktop sidebar */}
        <aside style={{
          width: '272px', minWidth: '272px',
          background: 'white', borderRight: '1px solid #e2e8f0',
          overflowY: 'auto',
        }} className="course-sidebar">
          {Sidebar}
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              onClick={() => setMobileSidebarOpen(false)}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                zIndex: 150,
              }}
            />
            <div style={{
              position: 'fixed', top: '56px', left: 0, bottom: 0,
              width: '288px', background: 'white', zIndex: 160,
              overflowY: 'auto', borderRight: '1px solid #e2e8f0',
            }}>
              {Sidebar}
            </div>
          </>
        )}

        {/* ── Content area ──────────────────────────────────────────────────── */}
        <main
          ref={contentRef}
          style={{
            flex: 1, overflowY: 'auto',
            padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 4vw, 2rem)',
          }}
        >
          {activeSession && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>

              {/* Session header */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', color: 'white', background: NAVY,
                    padding: '0.25rem 0.65rem', borderRadius: '0.35rem',
                  }}>
                    Session {activeSession.number}
                  </span>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK,
                    background: 'rgba(0,212,170,0.12)', padding: '0.25rem 0.65rem', borderRadius: '0.35rem',
                  }}>
                    {activeSession.duration} min
                  </span>
                  {activeSession.task && (
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, color: '#64748b',
                      background: '#f1f5f9', padding: '0.25rem 0.65rem', borderRadius: '0.35rem',
                    }}>
                      {activeSession.task}
                    </span>
                  )}
                  {activeSession.weight && activeSession.weight !== '—' && (
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, color: '#b45309',
                      background: 'rgba(245,158,11,0.12)', padding: '0.25rem 0.65rem', borderRadius: '0.35rem',
                    }}>
                      {activeSession.weight} of exam
                    </span>
                  )}
                </div>

                <h1 style={{
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800,
                  color: NAVY, lineHeight: 1.2, marginBottom: '0.875rem',
                }}>
                  {activeSession.title}
                </h1>

                <p style={{ fontSize: '1.0625rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>
                  {activeSession.summary}
                </p>
              </div>

              {/* Divider */}
              <div style={{ height: '2px', background: 'linear-gradient(90deg, rgba(0,212,170,0.4), transparent)', marginBottom: '2rem' }} />

              {/* Objectives */}
              <div style={{
                background: 'rgba(0,212,170,0.06)', border: '1.5px solid rgba(0,212,170,0.25)',
                borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '2rem',
              }}>
                <h4 style={{
                  fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem',
                }}>
                  What you'll learn
                </h4>
                <ul style={{ paddingLeft: '1.3rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  {activeSession.objectives.map((o, i) => (
                    <li key={i} style={{ fontSize: '0.9375rem', color: '#1e293b', lineHeight: 1.6 }}>{o}</li>
                  ))}
                </ul>
              </div>

              {isLocked(activeSession) ? (
                <LockedSession onSubscribe={onSubscribe} freeModuleLabel={course.modules[0]?.label} />
              ) : (
              <>
              {/* Teaching sections */}
              {enhanced ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    gap: '0.6rem', marginBottom: '1.5rem',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
                      Bionic reading
                    </span>
                    <button
                      onClick={toggleBionic}
                      aria-pressed={bionic}
                      style={{
                        width: '44px', height: '24px', borderRadius: '999px', border: 'none',
                        cursor: 'pointer', padding: 0, position: 'relative',
                        background: bionic ? `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})` : '#cbd5e1',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px', left: bionic ? '22px' : '2px',
                        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>
                  <LessonBody
                    key={activeSession.id}
                    session={activeSession}
                    bionic={bionic}
                    confidence={confidence}
                    onSetConfidence={setConfidenceFor}
                  />
                </>
              ) : (
                activeSession.sections.map((sec, i) => (
                  <ContentSection key={i} section={sec} />
                ))
              )}

              {/* Key terms */}
              {activeSession.keyTerms?.length > 0 && (
                <div style={{
                  background: '#f8fafc', border: '1.5px solid #e2e8f0',
                  borderRadius: '1rem', padding: '1.25rem 1.5rem', margin: '1.75rem 0',
                }}>
                  <h4 style={{
                    fontSize: '0.6875rem', fontWeight: 700, color: NAVY,
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem',
                  }}>
                    Key Terms
                  </h4>
                  <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {activeSession.keyTerms.map((t, i) => (
                      <div key={i}>
                        <dt style={{ display: 'inline', fontWeight: 700, color: NAVY, fontSize: '0.9375rem' }}>{t.term}</dt>
                        <dd style={{ display: 'inline', color: '#475569', fontSize: '0.9375rem' }}> — {t.def}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* AWS services */}
              {activeSession.awsServices?.length > 0 && (
                <div style={{
                  background: 'rgba(255,153,0,0.05)', border: '1.5px solid rgba(255,153,0,0.2)',
                  borderRadius: '1rem', padding: '1.25rem 1.5rem', margin: '1.75rem 0',
                }}>
                  <h4 style={{
                    fontSize: '0.6875rem', fontWeight: 700, color: '#92400e',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem',
                  }}>
                    AWS Services to Know
                  </h4>
                  <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {activeSession.awsServices.map((s, i) => (
                      <div key={i}>
                        <dt style={{ display: 'inline', fontWeight: 700, color: NAVY, fontSize: '0.9375rem' }}>{s.name}</dt>
                        <dd style={{ display: 'inline', color: '#475569', fontSize: '0.9375rem' }}> — {s.purpose}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Exam tips */}
              {activeSession.examTips?.length > 0 && (
                <div style={{
                  background: 'rgba(59,130,246,0.05)', border: '1.5px solid rgba(59,130,246,0.2)',
                  borderRadius: '1rem', padding: '1.25rem 1.5rem', margin: '1.75rem 0',
                }}>
                  <h4 style={{
                    fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.875rem',
                  }}>
                    Exam Tips
                  </h4>
                  <ul style={{ paddingLeft: '1.3rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {activeSession.examTips.map((t, i) => (
                      <li key={i} style={{ fontSize: '0.9375rem', color: '#1e293b', lineHeight: 1.6 }}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Practice question */}
              {activeSession.sample && (
                <div style={{ margin: '2.5rem 0 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <h4 style={{
                      fontSize: '0.6875rem', fontWeight: 700, color: NAVY,
                      textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
                    }}>
                      Practice Question
                    </h4>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>
                  <SampleQuestion sample={activeSession.sample} />
                </div>
              )}

              {/* ── Session navigation ──────────────────────────────────────── */}
              <div style={{
                display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between',
                marginTop: '3rem', paddingTop: '1.5rem',
                borderTop: '2px solid #e2e8f0',
              }}>
                {/* Prev */}
                <button
                  onClick={() => prevSession && selectSession(prevSession.id)}
                  disabled={!prevSession}
                  style={{
                    padding: '0.65rem 1.125rem', borderRadius: '0.6rem', fontWeight: 600,
                    fontSize: '0.875rem',
                    background: prevSession ? 'white' : '#f8fafc',
                    color: prevSession ? NAVY : '#cbd5e1',
                    border: `1.5px solid ${prevSession ? '#e2e8f0' : '#f1f5f9'}`,
                    cursor: prevSession ? 'pointer' : 'default',
                  }}
                >
                  ← Prev
                </button>

                {/* Mark complete */}
                <button
                  onClick={() => toggleComplete(activeId)}
                  style={{
                    padding: '0.7rem 1.5rem', borderRadius: '0.6rem', fontWeight: 700,
                    fontSize: '0.9375rem', cursor: 'pointer', transition: 'all 0.2s', flex: 1,
                    maxWidth: '240px',
                    background: isCompleted
                      ? 'white'
                      : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: isCompleted ? TEAL_DARK : 'white',
                    border: isCompleted ? `2px solid ${TEAL}` : 'none',
                    boxShadow: isCompleted ? 'none' : '0 4px 16px rgba(0,212,170,0.35)',
                  }}
                >
                  {isCompleted ? '✓ Completed' : 'Mark Complete'}
                </button>

                {/* Next */}
                <button
                  onClick={handleNext}
                  disabled={!nextSession}
                  style={{
                    padding: '0.65rem 1.125rem', borderRadius: '0.6rem', fontWeight: 600,
                    fontSize: '0.875rem',
                    background: nextSession ? NAVY : '#f8fafc',
                    color: nextSession ? 'white' : '#cbd5e1',
                    border: 'none',
                    cursor: nextSession ? 'pointer' : 'default',
                  }}
                >
                  Next →
                </button>
              </div>

              {/* End-of-course card */}
              {!nextSession && (
                <div style={{
                  marginTop: '2rem', textAlign: 'center', padding: '2rem',
                  background: `linear-gradient(135deg, rgba(0,212,170,0.12), rgba(0,168,132,0.08))`,
                  border: `2px solid rgba(0,212,170,0.3)`, borderRadius: '1.25rem',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: NAVY, marginBottom: '0.5rem' }}>
                    Course complete!
                  </h3>
                  <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.6 }}>
                    You've covered all {total} sessions. Head to the exam section to test your knowledge with real practice questions.
                  </p>
                  <button
                    onClick={onBack}
                    style={{
                      marginTop: '1.25rem', padding: '0.75rem 2rem',
                      background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                      color: 'white', border: 'none', borderRadius: '0.75rem',
                      fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(0,212,170,0.4)',
                    }}
                  >
                    Take Practice Exam →
                  </button>
                </div>
              )}
              </>
              )}

            </div>
          )}
        </main>
      </div>

      {/* Responsive styles injected as a style tag */}
      <style>{`
        @media (max-width: 768px) {
          .course-sidebar { display: none !important; }
          .mobile-sidebar-toggle { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar-toggle { display: none !important; }
        }
      `}</style>
    </div>
  )
}

export default SessionCourse
