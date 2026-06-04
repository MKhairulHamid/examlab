import React, { useState, useEffect, useMemo, useRef } from 'react'
import useAuthStore from '../../stores/authStore'
import studyProgressService from '../../services/studyProgressService'

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
      {section.body && section.body.split('\n\n').map((para, i) => (
        <p key={i} style={{ fontSize: '0.9375rem', color: '#374151', lineHeight: 1.7, marginBottom: i < section.body.split('\n\n').length - 1 ? '0.75rem' : (section.bullets ? '0.5rem' : 0) }}>
          {para}
        </p>
      ))}
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
  mastered: { label: 'Mastered',     icon: '✓', color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
  almost:   { label: 'Almost there', icon: '◐', color: '#d97706', bg: 'rgba(245,158,11,0.12)' },
  confused: { label: 'Confused',     icon: '?', color: '#dc2626', bg: 'rgba(239,68,68,0.1)' },
}

// Renders bullets as scannable "concept cards": a "Term — definition" bullet
// becomes a bold term with its definition beneath; plain bullets stay as a
// simple accented line.
function ConceptList({ bullets, bionic }) {
  const txt = (s) => (bionic ? <BionicText text={s} /> : s)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
      {bullets.map((b, i) => {
        const sep = b.indexOf(' — ')
        if (sep === -1) {
          return (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.3rem 0.25rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              <span style={{ color: TEAL, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{txt(b)}</span>
            </div>
          )
        }
        return (
          <div key={i} style={{
            background: '#fafbfd', border: '1px solid #eef2f7', borderLeft: `3px solid ${TEAL}`,
            borderRadius: '0.6rem', padding: '0.65rem 0.85rem',
          }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
              {txt(b.slice(0, sep))}
            </div>
            <div style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.55 }}>
              {txt(b.slice(sep + 3))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// A teaching section as a self-contained, click-to-expand card. Collapsed it
// shows the heading + core statement (or a hint of what's inside); expanded it
// reveals the concept cards / table / callout plus a confidence-scoring row.
function EnhancedSection({ section, index, anchorId, bionic, confidenceVal, onSetConfidence }) {
  const expandable = !!(section.bullets || section.table || section.callout)
  const [open, setOpen] = useState(false)
  const isOpen = expandable ? open : true
  const conf = confidenceVal ? CONFIDENCE[confidenceVal] : null
  const txt = (s) => (bionic ? <BionicText text={s} /> : s)

  const hints = []
  if (section.bullets) hints.push(`${section.bullets.length} concept${section.bullets.length === 1 ? '' : 's'}`)
  if (section.table) hints.push('comparison table')
  if (section.callout) hints.push('exam tip')
  const metaHint = hints.join(' · ')

  return (
    <div id={anchorId} style={{
      marginBottom: '1rem', borderRadius: '0.9rem', background: 'white', overflow: 'hidden',
      scrollMarginTop: '1.5rem',
      border: `1.5px solid ${conf ? conf.color : (isOpen ? 'rgba(0,212,170,0.45)' : '#e8edf3')}`,
      boxShadow: isOpen ? '0 6px 22px rgba(10,37,64,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
    }}>
      <button
        onClick={() => expandable && setOpen(o => !o)}
        aria-expanded={isOpen}
        style={{
          width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
          cursor: expandable ? 'pointer' : 'default',
          padding: '1rem 1.15rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
        }}
      >
        <span style={{
          width: '1.85rem', height: '1.85rem', minWidth: '1.85rem', borderRadius: '0.55rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 800, color: 'white', marginTop: '0.1rem',
          background: conf ? conf.color : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
        }}>
          {conf ? conf.icon : index + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: NAVY, lineHeight: 1.3, margin: 0 }}>
              {txt(section.heading)}
            </h3>
            {conf && (
              <span style={{
                fontSize: '0.625rem', fontWeight: 700, color: conf.color, background: conf.bg,
                padding: '0.1rem 0.45rem', borderRadius: '0.3rem', whiteSpace: 'nowrap',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>{conf.label}</span>
            )}
          </div>
          {section.body && section.body.split('\n\n').map((para, i, arr) => (
            <p key={i} style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: i === 0 ? '0.35rem 0 0' : '0.6rem 0 0', marginBottom: i < arr.length - 1 ? '0.1rem' : 0 }}>
              {txt(para)}
            </p>
          ))}
          {expandable && !isOpen && metaHint && (
            <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', marginTop: section.body ? '0.4rem' : '0.3rem' }}>
              {metaHint}
            </span>
          )}
        </div>

        {expandable && (
          <span style={{
            color: TEAL_DARK, fontSize: '0.9rem', marginTop: '0.35rem', flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s',
          }}>▼</span>
        )}
      </button>

      {isOpen && (
        <div style={{ padding: '0 1.15rem 1.15rem', borderTop: '1px solid #f1f5f9' }}>
          {section.bullets && <ConceptList bullets={section.bullets} bionic={bionic} />}
          {section.table && <ContentTable table={section.table} />}
          {section.callout && <Callout callout={section.callout} />}

          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem',
            marginTop: '1.1rem', paddingTop: '0.85rem', borderTop: '1px dashed #eef2f7',
          }}>
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
      )}
    </div>
  )
}

// Pre-test shown BEFORE content. Getting it wrong is intentional — it primes memory.
// Research: attempting retrieval before study improves retention even on wrong answers.
function PreLearningCheck({ check, bionic }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const isCorrect = revealed && selected === check.correct
  const txt = (s) => (bionic ? <BionicText text={s} /> : s)

  return (
    <div style={{
      background: 'rgba(10,37,64,0.04)', border: `2px solid ${NAVY}`,
      borderRadius: '1rem', padding: '1.35rem 1.5rem', marginBottom: '2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'white', background: NAVY, padding: '0.2rem 0.65rem', borderRadius: '0.35rem',
        }}>
          Before you read
        </span>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Attempt this first — it helps your memory
        </span>
      </div>

      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: NAVY, lineHeight: 1.6, marginBottom: '1rem' }}>
        {txt(check.question)}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        {check.options.map((opt, idx) => {
          const isSel = selected === idx
          const isCorr = check.correct === idx
          let bg = '#fafbfd', border = '1.5px solid #e2e8f0', color = NAVY
          if (revealed) {
            if (isCorr)     { bg = 'rgba(34,197,94,0.09)'; border = '2px solid #22c55e' }
            else if (isSel) { bg = 'rgba(239,68,68,0.09)'; border = '2px solid #ef4444' }
          } else if (isSel) { bg = 'rgba(10,37,64,0.08)'; border = `2px solid ${NAVY}` }
          return (
            <button
              key={idx}
              onClick={() => { if (!revealed) setSelected(idx) }}
              disabled={revealed}
              style={{
                width: '100%', textAlign: 'left', padding: '0.7rem 1rem',
                background: bg, border, borderRadius: '0.6rem', color,
                cursor: revealed ? 'default' : 'pointer', fontSize: '0.875rem',
                fontWeight: isSel ? 600 : 400, transition: 'all 0.15s', lineHeight: 1.5,
              }}
            >
              {revealed && isCorr && '✅ '}{revealed && isSel && !isCorr && '❌ '}{opt}
            </button>
          )
        })}
      </div>

      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          disabled={selected === null}
          style={{
            padding: '0.55rem 1.25rem',
            background: selected !== null ? NAVY : '#e2e8f0',
            color: selected !== null ? 'white' : '#94a3b8',
            border: 'none', borderRadius: '0.6rem', fontWeight: 700,
            fontSize: '0.875rem', cursor: selected !== null ? 'pointer' : 'not-allowed',
          }}
        >
          See answer
        </button>
      ) : (
        <div style={{
          marginTop: '0.5rem', padding: '0.875rem 1.125rem', borderRadius: '0.75rem',
          background: isCorrect ? 'rgba(34,197,94,0.07)' : 'rgba(59,130,246,0.06)',
          border: `1.5px solid ${isCorrect ? '#86efac' : '#93c5fd'}`,
        }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: isCorrect ? '#15803d' : '#1d4ed8', marginBottom: '0.3rem' }}>
            {isCorrect ? 'You already had it — read on to reinforce why.' : 'Good — your brain is now primed.'}
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            {check.note}
          </p>
        </div>
      )}
    </div>
  )
}

// Inline active-recall "speed bump" — the following sections stay locked until
// the learner answers this correctly.
function SpeedBump({ quiz, cleared, onClear, bionic }) {
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)
  const isCorrect = checked && selected === quiz.correct
  const txt = (s) => (bionic ? <BionicText text={s} /> : s)

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
        Quick recall checkpoint
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
            fontSize: '0.9rem', fontWeight: 700, marginBottom: quiz.elaborativePrompt && isCorrect ? '0.75rem' : '0.5rem',
            color: isCorrect ? '#15803d' : '#991b1b',
          }}>
            {isCorrect ? `Correct! ${quiz.explainCorrect || ''}` : 'Not quite — give it another try.'}
          </p>
          {isCorrect && quiz.elaborativePrompt && (
            <div style={{
              background: 'rgba(0,212,170,0.06)', border: `1.5px solid rgba(0,212,170,0.3)`,
              borderRadius: '0.75rem', padding: '0.875rem 1.125rem', marginBottom: '0.875rem',
            }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL_DARK, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                Think deeper
              </div>
              <p style={{ fontSize: '0.875rem', color: NAVY, lineHeight: 1.65, margin: 0, fontStyle: 'italic' }}>
                {txt(quiz.elaborativePrompt)}
              </p>
            </div>
          )}
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

// YouTube video supplement — shown after exam tips, before the sample question.
// Uses the YouTube embed API with optional start/end parameters for timeline clips.
// Only public videos. A disclaimer is always shown.
function VideoPanel({ videos }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  if (!videos || videos.length === 0) return null

  const v = videos[activeIdx]
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    autoplay: playing ? '1' : '0',
  })
  if (v.startSeconds != null) params.set('start', v.startSeconds)
  if (v.endSeconds != null) params.set('end', v.endSeconds)
  const embedSrc = `https://www.youtube.com/embed/${v.videoId}?${params.toString()}`
  const watchUrl = v.startSeconds != null
    ? `https://www.youtube.com/watch?v=${v.videoId}&t=${v.startSeconds}s`
    : `https://www.youtube.com/watch?v=${v.videoId}`

  return (
    <div style={{ margin: '1.75rem 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <h4 style={{
          fontSize: '0.6875rem', fontWeight: 700, color: NAVY,
          textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
        }}>
          Watch to reinforce
        </h4>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
      </div>

      {/* Tab row — only shown if multiple videos */}
      {videos.length > 1 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          {videos.map((vid, i) => (
            <button
              key={vid.videoId}
              onClick={() => { setActiveIdx(i); setPlaying(false) }}
              style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem',
                borderRadius: '0.4rem', cursor: 'pointer',
                background: i === activeIdx ? NAVY : 'white',
                color: i === activeIdx ? 'white' : '#64748b',
                border: `1.5px solid ${i === activeIdx ? NAVY : '#e2e8f0'}`,
              }}
            >
              {vid.title.length > 40 ? vid.title.slice(0, 40) + '…' : vid.title}
            </button>
          ))}
        </div>
      )}

      {/* Video card */}
      <div style={{
        background: 'white', borderRadius: '1rem', overflow: 'hidden',
        border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        {/* Embed */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0f0f0f' }}>
          {playing ? (
            <iframe
              key={`${v.videoId}-${v.startSeconds}`}
              src={embedSrc}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
              aria-label={`Play ${v.title}`}
            >
              <img
                src={`https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`}
                alt={v.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Play button overlay */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Timeline badge */}
              {(v.startSeconds != null || v.endSeconds != null) && (
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: 'rgba(0,0,0,0.75)', color: 'white',
                  fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.6rem',
                  borderRadius: '0.35rem', backdropFilter: 'blur(4px)',
                }}>
                  {v.startSeconds != null
                    ? `${Math.floor(v.startSeconds / 60)}:${String(v.startSeconds % 60).padStart(2, '0')}`
                    : '0:00'}
                  {' → '}
                  {v.endSeconds != null
                    ? `${Math.floor(v.endSeconds / 60)}:${String(v.endSeconds % 60).padStart(2, '0')}`
                    : 'end'}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: '0.875rem 1.125rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: NAVY, margin: '0 0 0.2rem' }}>
              {v.title}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              {v.channel}
              {(v.startSeconds != null || v.endSeconds != null) && (
                <span style={{ marginLeft: '0.5rem', color: TEAL_DARK, fontWeight: 600 }}>
                  · Relevant clip only
                </span>
              )}
            </p>
          </div>
          {v.relevance && (
            <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
              {v.relevance}
            </p>
          )}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem', fontWeight: 600, color: TEAL_DARK,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            Open on YouTube
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '0.6rem 1.125rem', borderTop: '1px solid #f1f5f9',
          background: '#fafbfd',
          fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.5,
        }}>
          This is a public YouTube video. CloudExamLab is not affiliated with the channel and does not host or own this content. We link to it as a free supplementary resource to support your learning.
        </div>
      </div>
    </div>
  )
}

// Assembles the enhanced lesson: pre-learning check, enhanced sections + speed bumps,
// gating any section that follows an uncleared speed bump.
function LessonBody({ session, bionic, confidence, onSetConfidence }) {
  const quizzes = session.microQuizzes || []
  const [cleared, setCleared] = useState([])
  const elems = []

  if (session.preLearningCheck) {
    elems.push(
      <PreLearningCheck
        key="pre-check"
        check={session.preLearningCheck}
        bionic={bionic}
      />
    )
  }

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
        index={i}
        anchorId={`sec-${session.id}-${i}`}
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

// Overview of every section the learner has tagged, grouped by confidence so
// they can jump back to whatever they're confused about or still learning.
function ReviewPanel({ course, confidence, onJump, onClose }) {
  const items = []
  course.sessions.forEach(s => {
    (s.sections || []).forEach((sec, idx) => {
      const level = confidence[`${s.id}::${idx}`]
      if (level) items.push({ sessionId: s.id, sessionNumber: s.number, idx, heading: sec.heading, level })
    })
  })

  // Confused first (most urgent), then Almost there, then Mastered.
  const order = ['confused', 'almost', 'mastered']
  const groups = order
    .map(key => ({ key, meta: CONFIDENCE[key], list: items.filter(i => i.level === key) }))
    .filter(g => g.meta)

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,37,64,0.55)', zIndex: 400, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '4vh 1rem' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#f8fafc', borderRadius: '1.1rem', width: '100%', maxWidth: '620px', maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid #eef2f7', padding: '1.1rem 1.35rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: NAVY, margin: 0 }}>Review your confidence map</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Tap any section to jump back and study it again.
            </p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', width: '2rem', height: '2rem', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: '1.1rem 1.35rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', padding: '2rem 1rem', lineHeight: 1.6 }}>
              Nothing tagged yet. As you read, use <strong>How well do you know this?</strong> on each section to build your review list.
            </div>
          )}
          {groups.map(g => (
            <div key={g.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <span style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.4rem', background: g.meta.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>{g.meta.icon}</span>
                <span style={{ fontWeight: 700, color: NAVY, fontSize: '0.9375rem' }}>{g.meta.label}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: g.meta.color, background: g.meta.bg, padding: '0.1rem 0.5rem', borderRadius: '0.3rem' }}>{g.list.length}</span>
              </div>
              {g.list.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0 2rem' }}>None.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {g.list.map(it => (
                    <button
                      key={`${it.sessionId}-${it.idx}`}
                      onClick={() => onJump(it.sessionId, it.idx)}
                      style={{ width: '100%', textAlign: 'left', background: 'white', border: `1px solid #eef2f7`, borderLeft: `3px solid ${g.meta.color}`, borderRadius: '0.6rem', padding: '0.65rem 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}
                    >
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Session {it.sessionNumber}</span>
                        <span style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: NAVY, lineHeight: 1.35 }}>{it.heading}</span>
                      </span>
                      <span style={{ color: g.meta.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

function SessionCourse({ course, onBack, hasAccess = true, onSubscribe }) {
  const { user } = useAuthStore()
  const userId = user?.id
  const storageKey = `course-progress-${course.slug}`
  const bionicKey = 'study-bionic'
  const confidenceKey = `study-confidence-${course.slug}`
  const [completedIds, setCompletedIds] = useState([])
  const [activeId, setActiveId] = useState(course.sessions[0]?.id)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [bionic, setBionic] = useState(false)
  const [confidence, setConfidence] = useState({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const contentRef = useRef(null)
  // Refs mirror the latest progress so DB writes always upsert both fields.
  const completedRef = useRef([])
  const confidenceRef = useRef({})

  // Normalize any legacy 'review' tag to the renamed 'almost'.
  const normalizeConfidence = (obj) => {
    if (!obj || typeof obj !== 'object') return {}
    const out = {}
    for (const [k, v] of Object.entries(obj)) out[k] = v === 'review' ? 'almost' : v
    return out
  }

  const persistToDb = (completed, conf) => {
    if (!userId) return
    studyProgressService.save(userId, course.slug, { completedSessions: completed, confidence: conf })
  }

  // Free preview: the first module's sessions are open; the rest require a subscription.
  const freeModuleId = course.modules[0]?.id
  const isLocked = (session) => !hasAccess && session && session.domain !== freeModuleId

  // 1) Hydrate instantly from the local cache for a snappy first paint.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) { const a = JSON.parse(saved); setCompletedIds(a); completedRef.current = a }
    } catch { /* ignore */ }
    try { setBionic(localStorage.getItem(bionicKey) === '1') } catch { /* ignore */ }
    try {
      const c = localStorage.getItem(confidenceKey)
      if (c) { const o = normalizeConfidence(JSON.parse(c)); setConfidence(o); confidenceRef.current = o }
    } catch { /* ignore */ }
  }, [storageKey, confidenceKey])

  // 2) Once we know the user, the DB is authoritative (cross-device sync).
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    studyProgressService.load(userId, course.slug).then(data => {
      if (cancelled || !data) return
      const completed = Array.isArray(data.completedSessions) ? data.completedSessions : []
      const conf = normalizeConfidence(data.confidence)
      setCompletedIds(completed); completedRef.current = completed
      setConfidence(conf); confidenceRef.current = conf
      try { localStorage.setItem(storageKey, JSON.stringify(completed)) } catch { /* ignore */ }
      try { localStorage.setItem(confidenceKey, JSON.stringify(conf)) } catch { /* ignore */ }
    })
    return () => { cancelled = true }
  }, [userId, course.slug, storageKey, confidenceKey])

  const toggleComplete = (id) => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      completedRef.current = next
      persistToDb(next, confidenceRef.current)
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
      confidenceRef.current = next
      persistToDb(completedRef.current, next)
      return next
    })
  }

  const activeSession = course.sessions.find(s => s.id === activeId)
  const enhanced = true
  const reviewAttention = useMemo(
    () => Object.values(confidence).filter(v => v === 'confused' || v === 'almost').length,
    [confidence]
  )
  const activeIdx = course.sessions.findIndex(s => s.id === activeId)
  const prevSession = activeIdx > 0 ? course.sessions[activeIdx - 1] : null
  const nextSession = activeIdx < course.sessions.length - 1 ? course.sessions[activeIdx + 1] : null
  const isCompleted = completedIds.includes(activeId)

  const total = course.sessions.length
  const done = completedIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Scroll to top whenever the active session changes — use effect so it fires
  // after the new content has rendered, not on a fragile timeout.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeId])

  const selectSession = (id) => {
    setActiveId(id)
    setMobileSidebarOpen(false)
  }

  const handleNext = () => {
    if (!isCompleted) toggleComplete(activeId)
    if (nextSession) selectSession(nextSession.id)
  }

  // From the Review panel: open the right session and scroll to the section.
  const jumpToSection = (sessionId, sectionIdx) => {
    setReviewOpen(false)
    const switching = sessionId !== activeId
    if (switching) { setActiveId(sessionId); setMobileSidebarOpen(false) }
    setTimeout(() => {
      const el = document.getElementById(`sec-${sessionId}-${sectionIdx}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      else contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, switching ? 220 : 60)
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
        padding: '0 1rem', gap: '0.625rem',
        position: 'sticky', top: 0, zIndex: 200, flexShrink: 0,
      }}>
        {/* Left: back + mobile sessions toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.8125rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            ← Back
          </button>
          {/* Mobile-only sessions toggle */}
          <button
            onClick={() => setMobileSidebarOpen(o => !o)}
            className="mobile-sidebar-toggle"
            title="Browse sessions"
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', cursor: 'pointer', borderRadius: '0.5rem',
              width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}
          >
            ☰
          </button>
        </div>

        {/* Centre: course code + session position + title */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
              {course.code}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.6875rem' }}>·</span>
            <span style={{ color: TEAL, fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
              {activeSession ? `${activeSession.number} / ${total}` : ''}
            </span>
          </div>
          <div style={{
            color: 'white', fontSize: '0.875rem', fontWeight: 700,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.25,
          }}>
            {activeSession?.title}
          </div>
        </div>

        {/* Right: confidence review + progress bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={() => setReviewOpen(true)}
            title="See your confidence map — sections you tagged as confused or almost there"
            style={{
              flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: reviewAttention > 0 ? 'rgba(220,38,38,0.25)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${reviewAttention > 0 ? 'rgba(220,38,38,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: 'rgba(255,255,255,0.9)', cursor: 'pointer', fontWeight: 600,
              fontSize: '0.8125rem', padding: '0.35rem 0.7rem', borderRadius: '0.5rem',
            }}
          >
            {/* bookmark icon */}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
            <span className="review-label">Review</span>
            {reviewAttention > 0 && (
              <span style={{
                minWidth: '1.1rem', height: '1.1rem', padding: '0 0.25rem', borderRadius: '999px',
                background: '#ef4444', color: 'white', fontSize: '0.625rem', fontWeight: 800,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>{reviewAttention}</span>
            )}
          </button>

          {/* Progress pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            background: 'rgba(255,255,255,0.08)', borderRadius: '0.5rem',
            padding: '0.3rem 0.65rem', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ width: '36px', height: '4px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: TEAL, transition: 'width 0.4s ease' }} />
            </div>
            <span style={{ color: TEAL, fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
          </div>
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

              {/* Video supplement */}
              <VideoPanel videos={activeSession.videos} />

              {/* Self-explanation prompt + practice question */}
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
                  {activeSession.selfExplanationPrompt && (
                    <div style={{
                      background: 'rgba(59,130,246,0.05)', border: '1.5px solid rgba(59,130,246,0.2)',
                      borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.25rem',
                    }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                        Explain it first
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: 1.65, margin: 0 }}>
                        {activeSession.selfExplanationPrompt}
                      </p>
                    </div>
                  )}
                  <SampleQuestion sample={activeSession.sample} />
                </div>
              )}

              {/* ── Session footer ─────────────────────────────────────────── */}
              <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>

                {/* Mark complete — clearly a progress checkpoint, not a quiz action */}
                <div style={{
                  background: isCompleted ? 'rgba(34,197,94,0.06)' : '#fafbfd',
                  border: `1.5px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : '#e2e8f0'}`,
                  borderRadius: '0.875rem', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap',
                }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY, margin: '0 0 0.2rem' }}>
                      {isCompleted ? 'Session marked as complete' : 'Done reading this session?'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                      {isCompleted
                        ? 'Your progress is saved. You can unmark it any time.'
                        : 'Mark it complete to track your progress through the course.'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleComplete(activeId)}
                    style={{
                      padding: '0.6rem 1.25rem', borderRadius: '0.6rem', fontWeight: 700,
                      fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
                      flexShrink: 0, whiteSpace: 'nowrap',
                      background: isCompleted ? 'white' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                      color: isCompleted ? '#64748b' : 'white',
                      border: isCompleted ? '1.5px solid #e2e8f0' : 'none',
                      boxShadow: isCompleted ? 'none' : '0 3px 12px rgba(0,212,170,0.3)',
                    }}
                  >
                    {isCompleted ? '✓ Completed — undo' : 'Mark as complete'}
                  </button>
                </div>

                {/* Prev / Next session navigation — clearly labelled */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* Prev */}
                  {prevSession ? (
                    <button
                      onClick={() => selectSession(prevSession.id)}
                      style={{
                        padding: '0.875rem 1rem', borderRadius: '0.75rem', fontWeight: 600,
                        background: 'white', color: NAVY,
                        border: '1.5px solid #e2e8f0',
                        cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        ← Previous session
                      </div>
                      <div style={{ fontSize: '0.875rem', color: NAVY, lineHeight: 1.35 }}>
                        {prevSession.title}
                      </div>
                    </button>
                  ) : (
                    <div /> /* empty cell to keep grid alignment */
                  )}

                  {/* Next */}
                  {nextSession ? (
                    <button
                      onClick={handleNext}
                      style={{
                        padding: '0.875rem 1rem', borderRadius: '0.75rem', fontWeight: 600,
                        background: NAVY, color: 'white',
                        border: 'none',
                        cursor: 'pointer', textAlign: 'right', transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: TEAL, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        Next session →
                      </div>
                      <div style={{ fontSize: '0.875rem', lineHeight: 1.35 }}>
                        {nextSession.title}
                      </div>
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
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

      {reviewOpen && (
        <ReviewPanel
          course={course}
          confidence={confidence}
          onJump={jumpToSection}
          onClose={() => setReviewOpen(false)}
        />
      )}

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .course-sidebar { display: none !important; }
          .mobile-sidebar-toggle { display: flex !important; }
          .review-label { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar-toggle { display: none !important; }
          .review-label { display: inline; }
        }
      `}</style>
    </div>
  )
}

export default SessionCourse
