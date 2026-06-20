import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../stores/authStore'
import studyProgressService from '../../services/studyProgressService'
import TeachToLearn from './TeachToLearn'

const TEAL = '#00D4AA'
const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

// ─── Interactive widgets ──────────────────────────────────────────────────────

function PrecisionRecallWidget() {
  const COLS = 10, CELL = 40, DOT_R = 13
  const SVG_W = COLS * CELL, SVG_H = COLS * CELL
  const FRAUD_TOTAL = 10, TOTAL = 100
  // 10×10 grid: 10 red (fraud). 8 sit in a tight block (cols 1–2, rows 3–6);
  // 2 are "outliers" hiding among the greens (16 = top, 87 = bottom-right).
  // This makes the precision/recall TRADE-OFF visible — no rectangle can grab
  // all 10 reds without also sweeping in greens:
  //   • tight box on the 8-block      → 100% precision, recall 80%
  //   • box stretched over all 10 reds → 100% recall, precision drops
  //   • you can hit 100% on ONE, never both at once
  const FRAUD_SET = new Set([31, 32, 41, 42, 51, 52, 61, 62, 16, 87])

  // Box starts on an intermediate state (mostly on the cluster) so the user
  // immediately sees mid-range numbers and is invited to push either way.
  const [box, setBox] = useState({ x: CELL, y: CELL * 2, width: CELL * 3, height: CELL * 5 })
  const svgRef = useRef(null)

  const getSvgCoords = (clientX, clientY) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const r = svg.getBoundingClientRect()
    return {
      x: ((clientX - r.left) / r.width)  * SVG_W,
      y: ((clientY - r.top)  / r.height) * SVG_H,
    }
  }

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
  const MIN = CELL  // minimum box dimension

  const startDrag = (type, e) => {
    e.preventDefault()
    e.stopPropagation()
    const client = e.touches ? e.touches[0] : e
    const start  = getSvgCoords(client.clientX, client.clientY)
    const sb     = { ...box }

    const onMove = (ev) => {
      const c   = ev.touches ? ev.touches[0] : ev
      const pos = getSvgCoords(c.clientX, c.clientY)
      const dx  = pos.x - start.x
      const dy  = pos.y - start.y
      let { x, y, width, height } = sb

      if (type === 'move') {
        x = clamp(x + dx, 0, SVG_W - width)
        y = clamp(y + dy, 0, SVG_H - height)
      } else {
        if (type.includes('e')) width  = clamp(width  + dx, MIN, SVG_W - x)
        if (type.includes('s')) height = clamp(height + dy, MIN, SVG_H - y)
        if (type.includes('w')) {
          const nx = clamp(x + dx, 0, x + width - MIN)
          width += x - nx; x = nx
        }
        if (type.includes('n')) {
          const ny = clamp(y + dy, 0, y + height - MIN)
          height += y - ny; y = ny
        }
      }
      setBox({ x, y, width, height })
    }

    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend',  onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend',  onUp)
  }

  // Compute stats — dot center must fall strictly inside the box
  let tp = 0, fp = 0, fn = 0
  for (let i = 0; i < TOTAL; i++) {
    const cx      = (i % COLS) * CELL + CELL / 2
    const cy      = Math.floor(i / COLS) * CELL + CELL / 2
    const inBox   = cx > box.x && cx < box.x + box.width && cy > box.y && cy < box.y + box.height
    const isFraud = FRAUD_SET.has(i)
    if (isFraud  &&  inBox) tp++
    else if (!isFraud &&  inBox) fp++
    else if (isFraud  && !inBox) fn++
  }

  const precision = tp + fp > 0 ? tp / (tp + fp) : 0
  const recall    = tp / FRAUD_TOTAL
  const f1        = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0
  const pct       = v => `${Math.round(v * 100)}%`

  const perfectP = tp > 0 && precision === 1
  const perfectR = recall === 1
  // Live coaching banner reacting to the current box
  const hint = perfectR
    ? { bg: '#eff6ff', bd: '#2563eb', fg: '#1d4ed8', badge: true,
        text: '100% Recall — you caught all 10 fraud cases, but the box also flags innocent people, so precision drops. Shrink it onto the cluster to trade recall for precision.' }
    : perfectP
    ? { bg: '#fef2f2', bd: '#dc2626', fg: '#b91c1c', badge: true,
        text: '100% Precision — everything flagged really is fraud, but a couple of fraud cases slipped out. Stretch the box to reach them for higher recall — and watch precision fall.' }
    : { bg: '#f8fafc', bd: '#cbd5e1', fg: '#475569', badge: false,
        text: 'Precision vs. recall is a trade-off: wrap only red dots to push precision up, or cover all red dots to push recall up. Maxing one costs the other.' }

  // 8 resize handle positions. H = visible handle size, HIT = invisible
  // touch target (fat-finger friendly on mobile).
  const H = 13, HIT = 40
  const handles = [
    { id: 'n',  x: box.x + box.width / 2, y: box.y,                  cur: 'n-resize'  },
    { id: 's',  x: box.x + box.width / 2, y: box.y + box.height,     cur: 's-resize'  },
    { id: 'e',  x: box.x + box.width,     y: box.y + box.height / 2, cur: 'e-resize'  },
    { id: 'w',  x: box.x,                 y: box.y + box.height / 2, cur: 'w-resize'  },
    { id: 'ne', x: box.x + box.width,     y: box.y,                  cur: 'ne-resize' },
    { id: 'nw', x: box.x,                 y: box.y,                  cur: 'nw-resize' },
    { id: 'se', x: box.x + box.width,     y: box.y + box.height,     cur: 'se-resize' },
    { id: 'sw', x: box.x,                 y: box.y + box.height,     cur: 'sw-resize' },
  ]

  return (
    <div style={{
      background: '#fafbfd', border: `2px solid rgba(0,212,170,0.3)`,
      borderRadius: '1rem', padding: '1.25rem', margin: '1.25rem 0',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'white', background: TEAL_DARK,
          padding: '0.2rem 0.6rem', borderRadius: '0.35rem',
        }}>Try it</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>
          Precision &amp; Recall — Interactive
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: '0 0 0.875rem' }}>
        100 transactions: <strong style={{ color: '#16a34a' }}>90 innocent</strong> and{' '}
        <strong style={{ color: '#dc2626' }}>10 actual fraud</strong> — a tight red cluster plus a
        couple hiding among the greens. The red dashed box = what the model predicts as fraud.{' '}
        <strong>Drag to move · drag the handles to resize.</strong> Wrap it tightly on the cluster
        for <strong style={{ color: '#dc2626' }}>100% precision</strong>; stretch it over every red
        dot for <strong style={{ color: '#2563eb' }}>100% recall</strong> — but notice you can't max
        both at once. Everything in between is one move away.
      </p>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
        {[
          { bright: '#16a34a', dim: '#bbf7d0', label: 'Innocent (90)' },
          { bright: '#dc2626', dim: '#fecaca', label: 'Actual fraud (10)' },
        ].map(({ bright, dim, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
            <svg width="30" height="16" style={{ flexShrink: 0 }}>
              <circle cx="8"  cy="8" r="7" fill={bright} />
              <circle cx="22" cy="8" r="7" fill={dim} />
            </svg>
            <span>{label} <span style={{ color: '#94a3b8' }}>(bright = inside box)</span></span>
          </div>
        ))}
      </div>

      {/* SVG dot grid */}
      <div style={{ overflowX: 'auto', marginBottom: '0.875rem' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ display: 'block', width: '100%', maxWidth: SVG_W, userSelect: 'none', touchAction: 'none' }}
        >
          {/* Prediction rectangle */}
          <rect
            x={box.x} y={box.y} width={box.width} height={box.height}
            fill="rgba(220,38,38,0.07)"
            stroke="#dc2626" strokeWidth={2.5} strokeDasharray="9 5"
            rx={3}
            style={{ pointerEvents: 'none' }}
          />

          {/* Dots (pointerEvents off so drag hits the handle rects) */}
          {Array.from({ length: TOTAL }, (_, i) => {
            const cx      = (i % COLS) * CELL + CELL / 2
            const cy      = Math.floor(i / COLS) * CELL + CELL / 2
            const inBox   = cx > box.x && cx < box.x + box.width && cy > box.y && cy < box.y + box.height
            const isFraud = FRAUD_SET.has(i)
            const fill    = isFraud
              ? (inBox ? '#dc2626' : '#fecaca')
              : (inBox ? '#16a34a' : '#bbf7d0')
            return <circle key={i} cx={cx} cy={cy} r={DOT_R} fill={fill} style={{ pointerEvents: 'none' }} />
          })}

          {/* Interior move handle */}
          <rect
            x={box.x + H} y={box.y + H}
            width={Math.max(1, box.width - H * 2)}
            height={Math.max(1, box.height - H * 2)}
            fill="transparent" stroke="none"
            style={{ cursor: 'move' }}
            onMouseDown={e => startDrag('move', e)}
            onTouchStart={e => startDrag('move', e)}
          />

          {/* Resize handles: large invisible touch target + visible knob */}
          {handles.map(h => (
            <g key={h.id} style={{ cursor: h.cur }}
               onMouseDown={e => startDrag(h.id, e)}
               onTouchStart={e => startDrag(h.id, e)}>
              <rect
                x={h.x - HIT / 2} y={h.y - HIT / 2} width={HIT} height={HIT}
                fill="transparent" stroke="none"
              />
              <rect
                x={h.x - H / 2} y={h.y - H / 2} width={H} height={H}
                fill="white" stroke="#dc2626" strokeWidth={2} rx={3}
                style={{ pointerEvents: 'none', filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.25))' }}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Live coaching banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: hint.bg, border: `1.5px solid ${hint.bd}`, borderRadius: '0.6rem',
        padding: '0.55rem 0.75rem', marginBottom: '0.875rem',
      }}>
        {hint.badge && (
          <span style={{
            flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
            background: hint.fg, color: 'white', fontSize: '0.7rem', fontWeight: 800,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>✓</span>
        )}
        <span style={{ fontSize: '0.75rem', lineHeight: 1.5, color: hint.fg, fontWeight: 600 }}>
          {hint.text}
        </span>
      </div>

      {/* Count strip */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {[
          { label: 'True Positives',  count: tp, color: '#dc2626', note: `fraud caught (of ${FRAUD_TOTAL})` },
          { label: 'False Positives', count: fp, color: '#475569', note: 'innocent flagged' },
          { label: 'False Negatives', count: fn, color: '#d97706', note: 'fraud missed' },
        ].map(({ label, count, color, note }) => (
          <div key={label} style={{
            flex: '1 1 80px', textAlign: 'center',
            background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem',
            padding: '0.5rem 0.25rem',
          }}>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.15rem' }}>{label}</div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{note}</div>
          </div>
        ))}
      </div>

      {/* Metric bars */}
      {[
        { label: 'Precision', value: precision, color: '#dc2626', formula: `${tp} ÷ (${tp}+${fp})` },
        { label: 'Recall',    value: recall,    color: '#2563eb', formula: `${tp} ÷ ${FRAUD_TOTAL}` },
        { label: 'F1 Score',  value: f1,        color: TEAL_DARK, formula: 'harmonic mean' },
      ].map(({ label, value, color, formula }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color, width: 72, flexShrink: 0 }}>{label}</span>
          <div style={{ flex: 1, position: 'relative', height: 10, background: '#e2e8f0', borderRadius: 5 }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${value * 100}%`, background: color, borderRadius: 5,
            }} />
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: NAVY, width: 40, textAlign: 'right' }}>
            {label === 'F1 Score' ? f1.toFixed(2) : pct(value)}
          </span>
          <span style={{ fontSize: '0.6875rem', color: '#94a3b8', width: 90, flexShrink: 0 }}>{formula}</span>
        </div>
      ))}
    </div>
  )
}

function InferenceParametersWidget() {
  // Candidate next tokens for a fixed prompt, with preset logits (model scores).
  // The absurd tail ("spaghetti", "purple") shows what high temperature unlocks.
  const PROMPT = 'The weather today is'
  const TOKENS = [
    ['sunny', 3.0], ['warm', 2.4], ['cloudy', 2.1], ['fine', 1.7],
    ['cold', 1.3], ['rainy', 1.0], ['perfect', 0.4], ['spaghetti', -1.5], ['purple', -2.0],
  ]
  const N = TOKENS.length

  const [temp, setTemp]   = useState(0.7)
  const [topK, setTopK]   = useState(N)
  const [topP, setTopP]   = useState(1)
  const [seed, setSeed]   = useState(1)

  // Reshape the distribution: softmax(logit / T) → top-K cut → top-P (nucleus) cut
  const dist = useMemo(() => {
    const T = Math.max(0.05, temp)
    let ex = TOKENS.map(([w, l]) => ({ w, e: Math.exp(l / T) }))
    const Z = ex.reduce((s, o) => s + o.e, 0)
    ex.forEach(o => { o.p = o.e / Z })
    ex.sort((a, b) => b.p - a.p)
    ex.forEach((o, i) => { o.keep = i < topK })       // top-K
    let cum = 0                                         // top-P (nucleus)
    ex.forEach(o => { if (o.keep) { if (cum >= topP) o.keep = false; cum += o.p } })
    const Zk = ex.filter(o => o.keep).reduce((s, o) => s + o.p, 0) || 1
    ex.forEach(o => { o.fp = o.keep ? o.p / Zk : 0 })
    return ex
  }, [temp, topK, topP])

  const eligible = dist.filter(o => o.keep).length
  const maxVal   = Math.max(...dist.map(o => (o.keep ? o.fp : o.p)))

  // Draw 6 sampled completions from the reshaped distribution (seeded, re-rollable)
  const samples = useMemo(() => {
    let s = seed * 2654435761 >>> 0
    const rnd = () => {
      s += 0x6D2B79F5; let t = s
      t = Math.imul(t ^ t >>> 15, t | 1)
      t ^= t + Math.imul(t ^ t >>> 7, t | 61)
      return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
    return Array.from({ length: 6 }, () => {
      let r = rnd(), acc = 0, pick = dist.find(o => o.keep)
      for (const o of dist) { if (!o.keep) continue; acc += o.fp; if (r <= acc) { pick = o; return pick.w } }
      return pick.w
    })
  }, [dist, seed])

  // Coaching banner reacts to the temperature regime + truncation state
  const regime = temp <= 0.3
    ? { bg: '#eff6ff', bd: '#2563eb', fg: '#1d4ed8',
        text: `Low temperature (${temp.toFixed(1)}) — the odds collapse onto the single most likely token. Output is focused, factual and repeatable. This is what you want for extraction, classification, or anything that must be consistent.` }
    : temp <= 0.9
    ? { bg: '#f0fdfa', bd: TEAL_DARK, fg: '#0f766e',
        text: `Balanced temperature (${temp.toFixed(1)}) — likely words dominate but there's room for variety. A safe everyday default for chat and drafting.` }
    : { bg: '#fef2f2', bd: '#dc2626', fg: '#b91c1c',
        text: `High temperature (${temp.toFixed(1)}) — the odds flatten so even absurd tokens like "spaghetti" can be chosen. Great for brainstorming and creative variety, but the hallucination risk climbs.` }

  const sliders = [
    { label: 'Temperature', val: temp, set: setTemp, min: 0.1, max: 2, step: 0.1,
      fmt: v => v.toFixed(1), hint: 'Flattens or sharpens the odds' },
    { label: 'Top-K', val: topK, set: setTopK, min: 1, max: N, step: 1,
      fmt: v => `${v}`, hint: `Keep only the K most likely tokens` },
    { label: 'Top-P', val: topP, set: setTopP, min: 0.1, max: 1, step: 0.05,
      fmt: v => v.toFixed(2), hint: 'Keep the smallest set covering P of the probability' },
  ]

  return (
    <div style={{
      background: '#fafbfd', border: `2px solid rgba(0,212,170,0.3)`,
      borderRadius: '1rem', padding: '1.25rem', margin: '1.25rem 0',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'white', background: TEAL_DARK,
          padding: '0.2rem 0.6rem', borderRadius: '0.35rem',
        }}>Try it</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>
          Inference Parameters — Interactive
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: '0 0 0.875rem' }}>
        The model scores every possible next word. These parameters reshape those odds before
        one is picked. Watch the bars — and the sampled outputs — react.
      </p>

      {/* Prompt */}
      <div style={{
        background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem',
        padding: '0.6rem 0.85rem', marginBottom: '0.875rem', fontSize: '0.9rem', color: NAVY,
      }}>
        <span style={{ fontFamily: 'ui-monospace, monospace' }}>{PROMPT} </span>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontWeight: 800, color: TEAL_DARK,
          borderBottom: `2px solid ${TEAL}`, padding: '0 0.15rem',
        }}>{dist.find(o => o.keep)?.w} ?</span>
      </div>

      {/* Probability bars */}
      <div style={{ marginBottom: '1rem' }}>
        {dist.map(o => {
          const val = o.keep ? o.fp : o.p
          const w   = maxVal > 0 ? (val / maxVal) * 100 : 0
          return (
            <div key={o.w} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{
                width: 74, flexShrink: 0, textAlign: 'right', fontSize: '0.8rem',
                fontFamily: 'ui-monospace, monospace',
                fontWeight: o.keep ? 700 : 400,
                color: o.keep ? NAVY : '#cbd5e1',
                textDecoration: o.keep ? 'none' : 'line-through',
              }}>{o.w}</span>
              <div style={{ flex: 1, position: 'relative', height: 18, background: '#eef2f7', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${w}%`,
                  background: o.keep ? `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})` : '#e2e8f0',
                  borderRadius: 4, transition: 'width 0.18s ease, background 0.18s ease',
                }} />
              </div>
              <span style={{
                width: 42, flexShrink: 0, textAlign: 'right', fontSize: '0.8rem', fontWeight: 800,
                color: o.keep ? TEAL_DARK : '#cbd5e1',
              }}>{Math.round((o.keep ? o.fp : 0) * 100)}%</span>
            </div>
          )
        })}
        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
          {eligible} of {N} tokens eligible · greyed + struck-through = cut by Top-K / Top-P
        </div>
      </div>

      {/* Sliders */}
      {sliders.map(s => (
        <div key={s.label} style={{ marginBottom: '0.7rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY }}>
              {s.label} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: '0.7rem' }}>· {s.hint}</span>
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: TEAL_DARK, fontFamily: 'ui-monospace, monospace' }}>{s.fmt(s.val)}</span>
          </div>
          <input
            type="range" min={s.min} max={s.max} step={s.step} value={s.val}
            onChange={e => s.set(Number(e.target.value))}
            style={{ width: '100%', accentColor: TEAL, cursor: 'pointer', height: 24 }}
          />
        </div>
      ))}

      {/* Coaching banner */}
      <div style={{
        background: regime.bg, border: `1.5px solid ${regime.bd}`, borderRadius: '0.6rem',
        padding: '0.55rem 0.75rem', margin: '0.5rem 0 0.875rem',
        fontSize: '0.75rem', lineHeight: 1.5, color: regime.fg, fontWeight: 600,
      }}>
        {regime.text}
        {(topK < N || topP < 1) && (
          <span> Top-K/Top-P is trimming the tail to <strong>{eligible}</strong> eligible token{eligible === 1 ? '' : 's'}, which caps the randomness no matter how high temperature goes.</span>
        )}
      </div>

      {/* Sampled outputs */}
      <div style={{
        background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.7rem 0.85rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: NAVY, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            6 sampled completions
          </span>
          <button
            onClick={() => setSeed(s => s + 1)}
            style={{
              fontSize: '0.72rem', fontWeight: 700, color: 'white', background: TEAL_DARK,
              border: 'none', borderRadius: '0.4rem', padding: '0.3rem 0.7rem', cursor: 'pointer',
            }}
          >Re-roll</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {samples.map((w, i) => (
            <span key={i} style={{
              fontSize: '0.78rem', fontFamily: 'ui-monospace, monospace',
              background: w === dist[0].w ? '#f0fdfa' : '#fef3f2',
              color: w === dist[0].w ? TEAL_DARK : '#b91c1c',
              border: `1px solid ${w === dist[0].w ? 'rgba(0,168,132,0.3)' : 'rgba(220,38,38,0.25)'}`,
              borderRadius: '0.35rem', padding: '0.2rem 0.55rem',
            }}>{w}</span>
          ))}
        </div>
        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.5rem' }}>
          Low temperature → every sample is the same safe word. High temperature → variety, and the occasional surprise.
        </div>
      </div>
    </div>
  )
}

// Shared chrome for the simpler widgets (card + "Try it" header + intro).
function WidgetShell({ title, intro, children }) {
  return (
    <div style={{
      background: '#fafbfd', border: '2px solid rgba(0,212,170,0.3)',
      borderRadius: '1rem', padding: '1.25rem', margin: '1.25rem 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'white', background: TEAL_DARK,
          padding: '0.2rem 0.6rem', borderRadius: '0.35rem',
        }}>Try it</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: NAVY }}>{title}</span>
      </div>
      {intro && <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.6, margin: '0 0 0.875rem' }}>{intro}</p>}
      {children}
    </div>
  )
}

// ── Session 1: supervised / unsupervised / reinforcement sorter ───────────────
function LearningTypesWidget() {
  const CATS = [
    { id: 'sup', label: 'Supervised',    color: '#2563eb', desc: 'Learns from labeled examples (input → known answer)' },
    { id: 'uns', label: 'Unsupervised',  color: '#7c3aed', desc: 'Finds hidden structure in unlabeled data' },
    { id: 'rl',  label: 'Reinforcement', color: '#16a34a', desc: 'Learns by trial, guided by rewards and penalties' },
  ]
  const ITEMS = [
    { t: "Predict a house's price from thousands of past labeled sales", a: 'sup', why: 'Each example carries a known price label to learn from.' },
    { t: 'Group shoppers into segments with no predefined categories', a: 'uns', why: 'No labels — the model discovers the clusters itself.' },
    { t: 'Teach a warehouse robot to walk by rewarding forward progress', a: 'rl', why: 'Learning is driven by reward signals from its own actions.' },
    { t: 'Flag an email as spam or not-spam from labeled inboxes', a: 'sup', why: 'Trained on examples already labeled spam / not-spam.' },
    { t: 'Spot unusual credit-card activity with no examples of fraud', a: 'uns', why: 'Anomaly detection finds outliers without labels.' },
    { t: 'Train a game agent that improves the more games it wins', a: 'rl', why: 'It optimizes a reward (winning) through repeated play.' },
  ]
  const [picks, setPicks] = useState({})
  const score = ITEMS.reduce((s, it, i) => s + (picks[i] === it.a ? 1 : 0), 0)
  const answered = Object.keys(picks).length

  return (
    <WidgetShell
      title="Three Ways a Machine Learns — Sort It"
      intro="The paradigm is decided by the training signal. Tag each scenario and the card tells you instantly whether you matched the signal to the right method."
    >
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {CATS.map(c => (
          <div key={c.id} style={{ flex: '1 1 150px', fontSize: '0.7rem', color: '#475569', borderLeft: `3px solid ${c.color}`, paddingLeft: '0.5rem' }}>
            <strong style={{ color: c.color }}>{c.label}</strong><br />{c.desc}
          </div>
        ))}
      </div>
      {ITEMS.map((it, i) => {
        const chosen = picks[i]
        const correct = chosen === it.a
        return (
          <div key={i} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.6rem 0.7rem', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.82rem', color: NAVY, marginBottom: '0.5rem', lineHeight: 1.45 }}>{it.t}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATS.map(c => {
                const sel = chosen === c.id
                return (
                  <button key={c.id} onClick={() => setPicks(p => ({ ...p, [i]: c.id }))}
                    style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.34rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer',
                      border: `1.5px solid ${sel ? c.color : '#cbd5e1'}`,
                      background: sel ? c.color : 'white', color: sel ? 'white' : '#475569',
                    }}>{c.label}</button>
                )
              })}
            </div>
            {chosen && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.45, color: correct ? '#15803d' : '#b91c1c' }}>
                {correct ? '✓ Correct — ' : '✗ Not quite — '}{it.why}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY, marginTop: '0.4rem' }}>
        Score: {score} / {ITEMS.length}{answered === ITEMS.length && score === ITEMS.length ? ' — perfect!' : ''}
      </div>
    </WidgetShell>
  )
}

// ── Session 4: tokenizer (text → subword tokens → IDs → cost) ─────────────────
function TokenizerWidget() {
  const [text, setText] = useState('Tokenization turns language into numbers!')
  const tokens = useMemo(() => {
    const out = []
    let wi = 0
    for (const seg of text.split(/\s+/)) {
      if (!seg) continue
      const parts = seg.match(/[A-Za-z]+|[0-9]+|[^\sA-Za-z0-9]/g) || []
      for (const p of parts) {
        if (/^[A-Za-z]+$/.test(p) && p.length > 5) {
          for (let i = 0; i < p.length; i += 4) out.push({ t: p.slice(i, i + 4), wi })
        } else out.push({ t: p, wi })
      }
      wi++
    }
    return out
  }, [text])
  const id = t => { let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 50000 }
  const chars = text.length
  const ratio = tokens.length ? chars / tokens.length : 0
  const costPer10k = tokens.length * 10000 / 1e6 * 0.30
  const TINTS = ['#e0f2fe', '#ede9fe'], TEXTS = ['#0369a1', '#6d28d9']

  return (
    <WidgetShell
      title="Tokenizer — How the Model Reads Text"
      intro="Models can't read words — they break text into subword tokens, each mapped to an integer ID. Token count drives both cost and context limits. Type below and watch it split."
    >
      <textarea value={text} onChange={e => setText(e.target.value)} rows={2}
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.9rem', padding: '0.6rem 0.7rem', border: '1.5px solid #cbd5e1', borderRadius: '0.6rem', resize: 'vertical', fontFamily: 'inherit', marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
        {tokens.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Type something…</span>}
        {tokens.map((tk, i) => (
          <span key={i} style={{
            fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem',
            background: TINTS[tk.wi % 2], color: TEXTS[tk.wi % 2],
            borderRadius: '0.3rem', padding: '0.12rem 0.4rem', whiteSpace: 'pre',
          }}>{tk.t}<sub style={{ fontSize: '0.62em', opacity: 0.65 }}> {id(tk.t)}</sub></span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {[
          { k: 'Tokens', v: tokens.length, c: TEAL_DARK },
          { k: 'Characters', v: chars, c: NAVY },
          { k: 'Chars / token', v: ratio.toFixed(1), c: NAVY },
          { k: 'Cost / 10K calls', v: `$${costPer10k.toFixed(2)}`, c: '#b45309' },
        ].map(s => (
          <div key={s.k} style={{ flex: '1 1 90px', textAlign: 'center', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.5rem 0.25rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.k}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.6rem', lineHeight: 1.5 }}>
        Simplified split (real BPE tokenizers differ), but the lesson holds: long words become several tokens, punctuation counts, and more tokens = more cost. Rule of thumb: ~4 characters ≈ 1 token. Cost shown at $0.30 / 1M tokens.
      </div>
    </WidgetShell>
  )
}

// ── Session 10: RAG vs fine-tuning decision guide ─────────────────────────────
function RagVsFineTuneWidget() {
  const QS = [
    { id: 'facts', q: 'Does the answer depend on private or frequently-changing facts (your docs, policies, catalog, live data)?' },
    { id: 'skill', q: "Do you need the model to learn a new skill, format, or consistent tone it can't currently produce?" },
    { id: 'data',  q: 'Do you already have a large, high-quality labeled dataset to train on?' },
  ]
  const [a, setA] = useState({})
  const { facts, skill, data } = a
  const allAnswered = QS.every(q => a[q.id] !== undefined)

  let rec = null
  if (allAnswered) {
    if (!facts && !skill) rec = { pick: 'Prompt Engineering', color: TEAL_DARK,
      why: 'No new facts and no new behavior needed — start with the cheapest lever. Craft sharper prompts and few-shot examples before spending on anything heavier.', aws: 'Just the base model on Amazon Bedrock.' }
    else if (facts && !skill) rec = { pick: 'RAG', color: '#2563eb',
      why: 'You need fresh or proprietary facts but not new behavior. Retrieve the right documents and inject them into the prompt — no training, always current.', aws: 'Amazon Bedrock Knowledge Bases + a vector store (OpenSearch / Aurora / pgvector).' }
    else if (skill && data && !facts) rec = { pick: 'Fine-Tuning', color: '#7c3aed',
      why: 'You need new behavior and you have the data to teach it. Fine-tune to bake in the skill, format, or tone.', aws: 'Custom models on Amazon Bedrock or Amazon SageMaker.' }
    else if (skill && data && facts) rec = { pick: 'RAG + Fine-Tuning', color: '#be185d',
      why: 'You need both fresh facts (RAG) and new behavior (fine-tuning). Combine them — fine-tune for the skill, retrieve for the facts.', aws: 'Bedrock Knowledge Bases + a custom fine-tuned model.' }
    else rec = { pick: 'Gather Data First — RAG / Prompt for now', color: '#b45309',
      why: "Fine-tuning is the right end-goal for new behavior, but it needs a quality dataset you don't have yet. Ship with RAG or prompt engineering while you collect labeled examples.", aws: 'Bedrock Knowledge Bases now; fine-tune later.' }
  }

  return (
    <WidgetShell
      title="RAG vs Fine-Tuning — Decide It"
      intro="The exam rewards decision rules, not trivia. Answer these three and the guide names the right adaptation approach — and why."
    >
      {QS.map(q => (
        <div key={q.id} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.6rem 0.7rem', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.82rem', color: NAVY, marginBottom: '0.5rem', lineHeight: 1.45 }}>{q.q}</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['Yes', true], ['No', false]].map(([lab, val]) => {
              const sel = a[q.id] === val
              return (
                <button key={lab} onClick={() => setA(p => ({ ...p, [q.id]: val }))}
                  style={{
                    flex: 1, fontSize: '0.78rem', fontWeight: 700, padding: '0.42rem', borderRadius: '0.4rem', cursor: 'pointer',
                    border: `1.5px solid ${sel ? (val ? '#16a34a' : '#dc2626') : '#cbd5e1'}`,
                    background: sel ? (val ? '#16a34a' : '#dc2626') : 'white', color: sel ? 'white' : '#475569',
                  }}>{lab}</button>
              )
            })}
          </div>
        </div>
      ))}
      {rec ? (
        <div style={{ background: 'white', border: `2px solid ${rec.color}`, borderRadius: '0.7rem', padding: '0.85rem', marginTop: '0.4rem' }}>
          <div style={{ fontSize: '0.66rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended approach</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: rec.color, margin: '0.15rem 0 0.4rem' }}>{rec.pick}</div>
          <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.55 }}>{rec.why}</div>
          <div style={{ fontSize: '0.72rem', color: NAVY, marginTop: '0.5rem', fontWeight: 700 }}>On AWS: <span style={{ fontWeight: 400, color: '#475569' }}>{rec.aws}</span></div>
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem' }}>Answer all three to see the recommendation.</div>
      )}
    </WidgetShell>
  )
}

// ── Session 11: ROUGE / BLEU word-overlap scoring ─────────────────────────────
function NgramOverlapWidget() {
  const REFERENCE = 'the cat sat on the warm mat'
  const PRESETS = [
    { label: 'Exact match', text: 'the cat sat on the warm mat' },
    { label: 'Missing words', text: 'the cat sat on the mat' },
    { label: 'Same meaning, new words', text: 'a feline rested upon a cozy rug' },
    { label: 'Unrelated', text: 'markets fell sharply last tuesday' },
  ]
  const [cand, setCand] = useState(PRESETS[1].text)
  const norm = s => (s.toLowerCase().match(/[a-z0-9']+/g) || [])
  const m = useMemo(() => {
    const ref = norm(REFERENCE), c = norm(cand)
    const cnt = arr => { const x = new Map(); arr.forEach(w => x.set(w, (x.get(w) || 0) + 1)); return x }
    const rc = cnt(ref), cc = cnt(c)
    let uni = 0; for (const [w, n] of cc) uni += Math.min(n, rc.get(w) || 0)
    const grams = arr => { const r = []; for (let i = 0; i < arr.length - 1; i++) r.push(arr[i] + ' ' + arr[i + 1]); return r }
    const rb = cnt(grams(ref)), cb = cnt(grams(c))
    let bi = 0; for (const [w, n] of cb) bi += Math.min(n, rb.get(w) || 0)
    const M = ref.length, Nn = c.length
    const dp = Array.from({ length: M + 1 }, () => new Array(Nn + 1).fill(0))
    for (let i = 1; i <= M; i++) for (let j = 1; j <= Nn; j++)
      dp[i][j] = ref[i - 1] === c[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
    const lcs = dp[M][Nn]
    const r1r = ref.length ? uni / ref.length : 0
    const r1p = c.length ? uni / c.length : 0
    const r1 = r1r + r1p ? 2 * r1r * r1p / (r1r + r1p) : 0
    const rL = ref.length ? lcs / ref.length : 0
    const up = c.length ? uni / c.length : 0
    const bp = c.length > 1 ? bi / (c.length - 1) : 0
    const bleu = up && bp ? Math.sqrt(up * bp) : 0
    const avail = new Map(rc)
    const hl = c.map(w => { if ((avail.get(w) || 0) > 0) { avail.set(w, avail.get(w) - 1); return true } return false })
    return { c, r1, rL, bleu, hl }
  }, [cand])

  const bar = (label, v, color) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
      <span style={{ width: 70, flexShrink: 0, fontSize: '0.74rem', fontWeight: 700, color }}>{label}</span>
      <div style={{ flex: 1, height: 10, background: '#e2e8f0', borderRadius: 5, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: color, borderRadius: 5, transition: 'width 0.18s ease' }} />
      </div>
      <span style={{ width: 38, textAlign: 'right', fontSize: '0.78rem', fontWeight: 800, color: NAVY }}>{Math.round(v * 100)}%</span>
    </div>
  )

  return (
    <WidgetShell
      title="ROUGE & BLEU — Word-Overlap Scoring"
      intro="Automated text metrics score a generated answer by how much its words and n-grams overlap a human reference. Edit the candidate — or try a preset — and watch the scores. Notice a perfect paraphrase still scores near zero."
    >
      <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.55rem 0.7rem', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Human reference</span>
        <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', color: NAVY }}>{REFERENCE}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
        {PRESETS.map(p => (
          <button key={p.label} onClick={() => setCand(p.text)}
            style={{ fontSize: '0.68rem', fontWeight: 600, padding: '0.26rem 0.55rem', borderRadius: '0.35rem', cursor: 'pointer',
              border: `1.5px solid ${cand === p.text ? TEAL_DARK : '#cbd5e1'}`, background: cand === p.text ? '#f0fdfa' : 'white', color: cand === p.text ? TEAL_DARK : '#475569' }}>{p.label}</button>
        ))}
      </div>
      <input value={cand} onChange={e => setCand(e.target.value)}
        style={{ width: '100%', boxSizing: 'border-box', fontSize: '0.85rem', padding: '0.5rem 0.6rem', border: '1.5px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '0.6rem', fontFamily: 'ui-monospace, monospace' }} />
      <div style={{ marginBottom: '0.7rem', fontSize: '0.85rem', lineHeight: 1.8 }}>
        {m.c.length ? m.c.map((w, i) => (
          <span key={i} style={{ background: m.hl[i] ? 'rgba(0,168,132,0.18)' : 'transparent', color: m.hl[i] ? TEAL_DARK : '#94a3b8', fontWeight: m.hl[i] ? 700 : 400, borderRadius: '0.25rem', padding: '0.05rem 0.2rem', fontFamily: 'ui-monospace, monospace' }}>{w} </span>
        )) : <span style={{ color: '#94a3b8' }}>Type a candidate…</span>}
        <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '0.25rem' }}>Green = word also in the reference (the only thing these metrics can see).</div>
      </div>
      {bar('ROUGE-1', m.r1, '#2563eb')}
      {bar('ROUGE-L', m.rL, '#7c3aed')}
      {bar('BLEU', m.bleu, '#16a34a')}
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.5 }}>
        ROUGE rewards overlap (recall-leaning, used for summaries); BLEU rewards matching n-grams (precision-leaning, used for translation). Both are blind to meaning — that's why a paraphrase scores low, and why BERTScore and human evaluation exist.
      </div>
    </WidgetShell>
  )
}

// ── Session 13: interpretability vs accuracy trade-off ────────────────────────
function InterpretabilityTradeoffWidget() {
  const MODELS = [
    { name: 'Linear / Logistic Regression', acc: 0.62, interp: 0.97, box: 'Glass box', use: 'Credit scoring and regulated decisions where every factor must be explained.' },
    { name: 'Decision Tree', acc: 0.71, interp: 0.88, box: 'Glass box', use: 'Approval rules a human can read top to bottom.' },
    { name: 'Random Forest', acc: 0.83, interp: 0.52, box: 'Explained box', use: 'Tabular predictions where feature-importance is explanation enough.' },
    { name: 'Gradient Boosting', acc: 0.89, interp: 0.38, box: 'Explained box', use: 'High-accuracy tabular models; explain post-hoc with SHAP / SageMaker Clarify.' },
    { name: 'Deep Neural Network', acc: 0.95, interp: 0.12, box: 'Black box', use: 'Images, audio, and language — top accuracy, hardest to interpret.' },
  ]
  const [i, setI] = useState(2)
  const mdl = MODELS[i]
  const boxColor = mdl.interp >= 0.7 ? '#16a34a' : mdl.interp >= 0.4 ? '#d97706' : '#dc2626'
  const banner = mdl.interp >= 0.7
    ? 'Transparent and audit-friendly — you can justify every prediction — but you leave accuracy on the table.'
    : mdl.interp >= 0.4
    ? 'A middle ground: strong accuracy with explanations available after the fact (feature importance, SHAP).'
    : "Top accuracy, but a black box — you'll need SHAP / Amazon SageMaker Clarify to explain it, and it's risky for regulated decisions."

  return (
    <WidgetShell
      title="Interpretability vs Accuracy — The Trade-off"
      intro="As models get more powerful they get harder to explain. Slide across the model ladder and watch accuracy climb while interpretability falls — the tension the exam loves."
    >
      <input type="range" min={0} max={MODELS.length - 1} step={1} value={i} onChange={e => setI(Number(e.target.value))}
        style={{ width: '100%', accentColor: TEAL, cursor: 'pointer', height: 24, marginBottom: '0.3rem' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
        <span>← Simple / explainable</span><span>Complex / accurate →</span>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 800, color: NAVY }}>{mdl.name}</div>
        <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.64rem', fontWeight: 700, color: 'white', background: boxColor, padding: '0.15rem 0.55rem', borderRadius: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{mdl.box}</span>
      </div>
      {[
        { label: 'Accuracy', v: mdl.acc, c: '#2563eb' },
        { label: 'Interpretability', v: mdl.interp, c: '#16a34a' },
      ].map(b => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
          <span style={{ width: 110, flexShrink: 0, fontSize: '0.75rem', fontWeight: 700, color: b.c }}>{b.label}</span>
          <div style={{ flex: 1, height: 12, background: '#e2e8f0', borderRadius: 6, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${b.v * 100}%`, background: b.c, borderRadius: 6, transition: 'width 0.2s ease' }} />
          </div>
          <span style={{ width: 38, textAlign: 'right', fontSize: '0.8rem', fontWeight: 800, color: NAVY }}>{Math.round(b.v * 100)}%</span>
        </div>
      ))}
      <div style={{ background: '#f8fafc', border: `1.5px solid ${boxColor}`, borderRadius: '0.6rem', padding: '0.55rem 0.75rem', margin: '0.6rem 0', fontSize: '0.75rem', lineHeight: 1.5, color: '#334155', fontWeight: 600 }}>
        {banner}
      </div>
      <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}><strong style={{ color: NAVY }}>Best when:</strong> {mdl.use}</div>
      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.5rem' }}>Figures are illustrative — the real numbers depend on the dataset, but the direction always holds.</div>
    </WidgetShell>
  )
}

// ── Reusable scenario sorter: match each scenario to the right category ───────
// Used across the SAA-C03 course for "pick the right choice" exam patterns.
function ScenarioSorter({ title, intro, cats, items }) {
  const [picks, setPicks] = useState({})
  const score = items.reduce((s, it, i) => s + (picks[i] === it.a ? 1 : 0), 0)
  const answered = Object.keys(picks).length
  return (
    <WidgetShell title={title} intro={intro}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
        {cats.map(c => (
          <div key={c.id} style={{ flex: '1 1 150px', fontSize: '0.7rem', color: '#475569', borderLeft: `3px solid ${c.color}`, paddingLeft: '0.5rem' }}>
            <strong style={{ color: c.color }}>{c.label}</strong><br />{c.desc}
          </div>
        ))}
      </div>
      {items.map((it, i) => {
        const chosen = picks[i]
        const correct = chosen === it.a
        return (
          <div key={i} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.6rem 0.7rem', marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.82rem', color: NAVY, marginBottom: '0.5rem', lineHeight: 1.45 }}>{it.t}</div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {cats.map(c => {
                const sel = chosen === c.id
                return (
                  <button key={c.id} onClick={() => setPicks(p => ({ ...p, [i]: c.id }))}
                    style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.34rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer',
                      border: `1.5px solid ${sel ? c.color : '#cbd5e1'}`,
                      background: sel ? c.color : 'white', color: sel ? 'white' : '#475569',
                    }}>{c.label}</button>
                )
              })}
            </div>
            {chosen && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.45, color: correct ? '#15803d' : '#b91c1c' }}>
                {correct ? '✓ Correct — ' : '✗ Not quite — '}{it.why}
              </div>
            )}
          </div>
        )
      })}
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: NAVY, marginTop: '0.4rem' }}>
        Score: {score} / {items.length}{answered === items.length && score === items.length ? ' — perfect!' : ''}
      </div>
    </WidgetShell>
  )
}

// ── SAA D1 (Session 3): Security Group vs Network ACL ─────────────────────────
function SgVsNaclWidget() {
  return (
    <ScenarioSorter
      title="Security Group vs Network ACL — Sort It"
      intro="Both are VPC firewalls, but at different layers and with different behavior. Tag each statement with the control it describes — the card confirms instantly."
      cats={[
        { id: 'sg', label: 'Security Group', color: '#2563eb', desc: 'Stateful, allow-only, at the instance / ENI level' },
        { id: 'nacl', label: 'Network ACL', color: '#7c3aed', desc: 'Stateless, allow + deny, at the subnet level' },
      ]}
      items={[
        { t: 'Automatically allows return traffic for any flow you permit', a: 'sg', why: 'Stateful — responses to an allowed request are permitted without a return rule.' },
        { t: 'Explicitly denies a specific range of malicious IP addresses', a: 'nacl', why: 'Only network ACLs support deny rules; security groups are allow-only.' },
        { t: 'Evaluated at the subnet boundary in numbered rule order', a: 'nacl', why: 'NACLs act at the subnet and process rules in order, first match wins.' },
        { t: 'Can reference another security group as its source', a: 'sg', why: 'Security groups can reference each other to control instance-to-instance traffic.' },
        { t: 'Needs an explicit outbound rule to allow response traffic', a: 'nacl', why: 'Stateless — return traffic must be allowed explicitly.' },
        { t: 'Attached directly to an EC2 network interface', a: 'sg', why: 'Security groups operate at the resource (ENI) level.' },
      ]}
    />
  )
}

// ── SAA D2 (Session 8): Disaster Recovery strategy selector ───────────────────
function DrStrategyWidget() {
  return (
    <ScenarioSorter
      title="Pick the DR Strategy"
      intro="Disaster recovery is a spectrum from cheap-and-slow to costly-and-instant. Match each requirement to the strategy that fits its RPO, RTO, and budget."
      cats={[
        { id: 'br', label: 'Backup & Restore', color: '#64748b', desc: 'Cheapest; RPO/RTO in hours' },
        { id: 'pl', label: 'Pilot Light', color: '#0891b2', desc: 'Core data live; rest provisioned on disaster' },
        { id: 'ws', label: 'Warm Standby', color: '#d97706', desc: 'Scaled-down full stack always running' },
        { id: 'aa', label: 'Active-Active', color: '#16a34a', desc: 'Both Regions live; near-zero RPO/RTO' },
      ]}
      items={[
        { t: 'An internal dev tool where a full day of downtime is fine and cost must be minimal', a: 'br', why: 'Relaxed RPO/RTO plus a cost priority points to backup & restore, the cheapest option.' },
        { t: 'Keep only the database replicated and running; launch the rest after a disaster', a: 'pl', why: 'A live core (data) with everything else provisioned on disaster is pilot light.' },
        { t: 'A scaled-down but always-running copy of the full stack, scaled up on failover', a: 'ws', why: 'A smaller live full stack is warm standby — recovery in minutes.' },
        { t: 'A payment system needing near-zero downtime and near-zero data loss across Regions', a: 'aa', why: 'Near-zero RPO/RTO across Regions requires active-active.' },
        { t: 'Recover by provisioning the environment from backups only when it is needed', a: 'br', why: 'Provisioning from backups on demand is backup & restore.' },
        { t: 'A global application already serving live traffic from two Regions at once', a: 'aa', why: 'Multiple Regions serving simultaneously is active-active (multi-site).' },
      ]}
    />
  )
}

// ── SAA D4 (Session 14): S3 storage class chooser ─────────────────────────────
function S3StorageClassWidget() {
  return (
    <ScenarioSorter
      title="Choose the Cheapest S3 Storage Class"
      intro="S3 charges less as you accept slower or rarer access. Match each access pattern to the most cost-effective storage class."
      cats={[
        { id: 'std', label: 'S3 Standard', color: '#2563eb', desc: 'Frequent access; highest storage cost' },
        { id: 'ia', label: 'Standard-IA', color: '#0891b2', desc: 'Infrequent, needs rapid access; retrieval fee' },
        { id: 'oz', label: 'One Zone-IA', color: '#d97706', desc: 'Infrequent + re-creatable; single AZ' },
        { id: 'gda', label: 'Glacier Deep Archive', color: '#7c3aed', desc: 'Rare archive; hours to retrieve; cheapest' },
      ]}
      items={[
        { t: 'Active images on a busy website, served thousands of times per day', a: 'std', why: 'Frequent access with no retrieval fee is S3 Standard.' },
        { t: 'Compliance records kept 7 years, almost never read, hours-to-retrieve acceptable', a: 'gda', why: 'Rare, long-term archival with multi-hour retrieval is Glacier Deep Archive — the cheapest.' },
        { t: 'Monthly reports accessed occasionally but needed instantly when requested', a: 'ia', why: 'Infrequent access that must still be immediate is Standard-IA.' },
        { t: 'Re-creatable thumbnails accessed rarely and safe to regenerate if lost', a: 'oz', why: 'Infrequent and re-creatable suits cheaper single-AZ One Zone-IA.' },
        { t: 'Old backups retained for years that are essentially never accessed', a: 'gda', why: 'Rarely accessed long-term data belongs in Glacier Deep Archive.' },
        { t: 'A new dataset whose objects are read constantly during its first month', a: 'std', why: 'Constant access means S3 Standard (transition later via a lifecycle rule).' },
      ]}
    />
  )
}

// ── DVA D1 (Session 3): DynamoDB capacity (RCU/WCU) calculator ─────────────────
function DdbCapacityWidget() {
  const [size, setSize] = useState(6)        // item size in KB
  const [reads, setReads] = useState(100)    // reads per second
  const [writes, setWrites] = useState(50)   // writes per second
  const [mode, setMode] = useState('eventual') // read consistency

  const readBlocks = Math.ceil(size / 4)     // reads round up to 4 KB
  const writeBlocks = Math.ceil(size)        // writes round up to 1 KB
  const baseR = reads * readBlocks
  const rcu = mode === 'strong' ? baseR
    : mode === 'transactional' ? baseR * 2
    : Math.ceil(baseR / 2)                    // eventual = half of strong
  const wcu = writes * writeBlocks

  const MODES = [
    { id: 'eventual', label: 'Eventually consistent' },
    { id: 'strong', label: 'Strongly consistent' },
    { id: 'transactional', label: 'Transactional' },
  ]
  const slider = (label, val, set, min, max, step, unit) => (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: NAVY, marginBottom: '0.2rem' }}>
        <span>{label}</span><span style={{ color: TEAL_DARK }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: TEAL_DARK }} />
    </div>
  )

  return (
    <WidgetShell
      title="DynamoDB Capacity Calculator — RCU / WCU"
      intro="Capacity is the throughput currency of DynamoDB, and the exam tests the rounding rules directly. Drag the dials and watch the units recompute — note how reads round up to 4 KB, writes to 1 KB, and eventual consistency costs half of strong."
    >
      {slider('Item size', size, setSize, 1, 16, 1, ' KB')}
      {slider('Reads per second', reads, setReads, 0, 500, 10, '')}
      {slider('Writes per second', writes, setWrites, 0, 500, 10, '')}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.2rem 0 0.9rem' }}>
        {MODES.map(m => {
          const sel = mode === m.id
          return (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '0.34rem 0.65rem', borderRadius: '0.4rem', cursor: 'pointer',
                border: `1.5px solid ${sel ? TEAL_DARK : '#cbd5e1'}`,
                background: sel ? TEAL_DARK : 'white', color: sel ? 'white' : '#475569',
              }}>{m.label}</button>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {[
          { k: 'Read units / item', v: readBlocks, c: NAVY },
          { k: 'RCU / sec', v: rcu, c: TEAL_DARK },
          { k: 'WCU / sec', v: wcu, c: '#b45309' },
        ].map(s => (
          <div key={s.k} style={{ flex: '1 1 90px', textAlign: 'center', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.5rem 0.25rem' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.k}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.74rem', fontWeight: 600, lineHeight: 1.5, color: '#475569', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.6rem 0.7rem' }}>
        A {size} KB item rounds up to {readBlocks * 4} KB for reads ({readBlocks} block{readBlocks > 1 ? 's' : ''} of 4 KB) and {writeBlocks} KB for writes.{' '}
        {mode === 'eventual' && `Eventually consistent reads cost half of strong — ${rcu} RCU instead of ${baseR}.`}
        {mode === 'strong' && `Strongly consistent reads cost a full unit per 4 KB block — ${rcu} RCU (eventual would be ${Math.ceil(baseR / 2)}).`}
        {mode === 'transactional' && `Transactional reads double the cost — ${rcu} RCU. Transactional writes would likewise double WCU.`}
      </div>
    </WidgetShell>
  )
}

// ── DVA D1 (Session 2): Lambda concurrency — reserved vs provisioned ───────────
function LambdaConcurrencyWidget() {
  const [rps, setRps] = useState(200)        // requests per second
  const [dur, setDur] = useState(250)        // avg duration in ms
  const [provisioned, setProvisioned] = useState(20)
  const [reserved, setReserved] = useState(120)

  const concurrency = Math.ceil(rps * dur / 1000)  // Little's Law
  const throttled = Math.max(0, concurrency - reserved)
  const served = concurrency - throttled
  const cold = Math.max(0, served - provisioned)
  const coldPct = served ? Math.round(cold / served * 100) : 0

  const slider = (label, val, set, min, max, step, unit) => (
    <div style={{ marginBottom: '0.7rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: NAVY, marginBottom: '0.2rem' }}>
        <span>{label}</span><span style={{ color: TEAL_DARK }}>{val}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: '100%', accentColor: TEAL_DARK }} />
    </div>
  )

  return (
    <WidgetShell
      title="Lambda Concurrency — Reserved vs Provisioned"
      intro="Concurrency is how many invocations run at the same instant (requests/sec × duration). Provisioned concurrency keeps environments warm to kill cold starts; reserved concurrency caps the maximum and throttles the rest. Drag the dials to see each one act."
    >
      {slider('Requests per second', rps, setRps, 0, 1000, 10, '')}
      {slider('Average duration', dur, setDur, 50, 2000, 50, ' ms')}
      {slider('Provisioned concurrency (warm)', provisioned, setProvisioned, 0, 300, 5, '')}
      {slider('Reserved concurrency (cap)', reserved, setReserved, 0, 300, 5, '')}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        {[
          { k: 'Required concurrency', v: concurrency, c: NAVY },
          { k: 'Cold starts', v: `${cold} (${coldPct}%)`, c: cold ? '#b45309' : '#15803d' },
          { k: 'Throttled', v: throttled, c: throttled ? '#b91c1c' : '#15803d' },
        ].map(s => (
          <div key={s.k} style={{ flex: '1 1 100px', textAlign: 'center', background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '0.6rem', padding: '0.5rem 0.25rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.k}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '0.75rem', fontSize: '0.74rem', fontWeight: 600, lineHeight: 1.5, color: '#475569', background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.6rem 0.7rem' }}>
        At {rps} req/s × {dur} ms you need {concurrency} concurrent environments.{' '}
        {throttled > 0
          ? `Reserved concurrency is capped at ${reserved}, so ${throttled} invocation${throttled > 1 ? 's are' : ' is'} throttled — raise the cap or it will reject requests.`
          : `The reserved cap of ${reserved} is high enough — nothing is throttled.`}{' '}
        {cold > 0
          ? `Only ${provisioned} are pre-warmed, so ${cold} (${coldPct}%) pay a cold start. Raise provisioned concurrency to eliminate them.`
          : `Provisioned concurrency covers all served invocations — zero cold starts.`}
      </div>
    </WidgetShell>
  )
}

// ── DVA D3 (Session 12): deployment strategy selector ─────────────────────────
function DeployStrategyWidget() {
  return (
    <ScenarioSorter
      title="Pick the Deployment Strategy"
      intro="Each release strategy trades speed, risk, and cost differently. Match each requirement to the strategy that fits — the card confirms instantly."
      cats={[
        { id: 'aao', label: 'All-at-once', color: '#64748b', desc: 'Fastest, cheapest; brief downtime and full blast radius' },
        { id: 'rolling', label: 'Rolling', color: '#0891b2', desc: 'Replace in batches; no extra fleet, slower rollback' },
        { id: 'canary', label: 'Canary', color: '#d97706', desc: 'Shift a small % first, then the rest; limits blast radius' },
        { id: 'bg', label: 'Blue/Green', color: '#16a34a', desc: 'Full parallel environment; instant switch and rollback' },
      ]}
      items={[
        { t: 'A payment service that needs instant rollback if the new version misbehaves', a: 'bg', why: 'A parallel green environment lets you switch back to blue instantly — the fastest rollback.' },
        { t: 'Shift 10% of traffic to the new Lambda version, watch metrics, then send the rest', a: 'canary', why: 'Routing a small slice first and then completing is the canary pattern.' },
        { t: 'A non-critical internal tool where a few seconds of downtime is acceptable and cost matters', a: 'aao', why: 'All-at-once is cheapest and simplest when brief downtime and full blast radius are tolerable.' },
        { t: 'Update instances a batch at a time using the existing fleet, with no duplicate environment', a: 'rolling', why: 'Replacing in batches on the same fleet with no extra capacity is a rolling deployment.' },
        { t: 'Eliminate downtime by running two identical environments and flipping the router', a: 'bg', why: 'Two full environments with a router cut-over is blue/green.' },
        { t: 'Catch a bad release while it affects only a small fraction of users', a: 'canary', why: 'Exposing a small percentage first limits the blast radius — the canary goal.' },
      ]}
    />
  )
}

// ── MLA D3 (Session 9): SageMaker endpoint / inference option selector ─────────
function EndpointSelectorWidget() {
  return (
    <ScenarioSorter
      title="Pick the SageMaker Inference Option"
      intro="SageMaker offers four ways to serve a model, each tuned to a different traffic and payload pattern. Match each requirement to the right option — the card confirms instantly."
      cats={[
        { id: 'rt', label: 'Real-time endpoint', color: '#2563eb', desc: 'Persistent, low-latency, steady traffic' },
        { id: 'sl', label: 'Serverless', color: '#0891b2', desc: 'Auto-scales (incl. to zero); spiky/idle traffic, cold-start tolerant' },
        { id: 'as', label: 'Asynchronous', color: '#d97706', desc: 'Queued; large payloads and long-running inference' },
        { id: 'bt', label: 'Batch transform', color: '#7c3aed', desc: 'Offline scoring of a whole dataset; no persistent endpoint' },
      ]}
      items={[
        { t: 'A web app needs predictions in a few milliseconds, 24/7, with steady traffic', a: 'rt', why: 'Persistent low-latency serving with steady demand is a real-time endpoint.' },
        { t: 'Traffic is sporadic with long idle gaps; pay only when used and tolerate occasional cold starts', a: 'sl', why: 'Intermittent traffic with pay-per-use and cold-start tolerance fits a serverless endpoint.' },
        { t: 'Each request carries a 500 MB payload and takes several minutes to process', a: 'as', why: 'Large payloads and long processing are queued on an asynchronous endpoint.' },
        { t: 'Score an entire 50 GB dataset overnight, then tear everything down', a: 'bt', why: 'Offline scoring of a full dataset with no always-on endpoint is batch transform.' },
        { t: 'Queue long-running inference requests and return results when they finish', a: 'as', why: 'Decoupled, queued, long-running inference is the asynchronous endpoint pattern.' },
        { t: 'A strict low-latency fraud check on every transaction in real time', a: 'rt', why: 'Per-request strict low latency in real time is a real-time endpoint.' },
      ]}
    />
  )
}

// ── SAP D1 (Session 1): VPC connectivity primitive selector ───────────────────
function ConnectivitySelectorWidget() {
  return (
    <ScenarioSorter
      title="Pick the Connectivity Primitive"
      intro="Peering, Transit Gateway, PrivateLink, and hybrid links each solve a different connectivity problem at scale. Match each requirement to the right primitive — the card confirms instantly."
      cats={[
        { id: 'peer', label: 'VPC Peering', color: '#2563eb', desc: 'One-to-one, non-transitive; a few VPCs' },
        { id: 'tgw', label: 'Transit Gateway', color: '#7c3aed', desc: 'Hub for many VPCs/accounts + hybrid; transitive' },
        { id: 'pl', label: 'PrivateLink', color: '#0891b2', desc: 'Share ONE service; no broad network access' },
        { id: 'hybrid', label: 'Direct Connect / VPN', color: '#d97706', desc: 'On-premises to AWS connectivity' },
      ]}
      items={[
        { t: 'Two VPCs need full IP connectivity and you want the simplest, lowest-cost option', a: 'peer', why: 'A single one-to-one link between two VPCs is exactly VPC peering — cheapest when transitive routing is not needed.' },
        { t: 'Dozens of VPCs across many accounts plus a VPN must all interconnect with transitive routing through one hub', a: 'tgw', why: 'A central hub providing transitive routing across many VPCs and hybrid links is Transit Gateway.' },
        { t: 'Expose a single internal API to many consumer VPCs without granting access to the rest of the VPC', a: 'pl', why: 'Sharing one service with no broader network connectivity is PrivateLink (interface endpoint).' },
        { t: 'Connect an on-premises data center to AWS over a dedicated, private, consistent-bandwidth link', a: 'hybrid', why: 'A dedicated private link to on-premises is Direct Connect (a VPN is the internet-based alternative).' },
        { t: 'A shared-services hub must route between all spoke VPCs and the on-premises connection centrally', a: 'tgw', why: 'Centralized routing among many spokes and hybrid links is the Transit Gateway hub pattern.' },
        { t: 'Provide encrypted on-premises connectivity within minutes over the public internet', a: 'hybrid', why: 'Quick encrypted connectivity over the internet is a Site-to-Site VPN (the hybrid category).' },
      ]}
    />
  )
}

// ── SAP D2 (Session 9) / D4 (Session 17): application integration selector ─────
function IntegrationSelectorWidget() {
  return (
    <ScenarioSorter
      title="Choose the Integration Service"
      intro="Decoupling keeps a failure local — but SQS, SNS, EventBridge, and Step Functions each fit a different interaction. Match each need to the right primitive."
      cats={[
        { id: 'sqs', label: 'Amazon SQS', color: '#2563eb', desc: 'Buffer / durable queue; pull; one consumer group' },
        { id: 'sns', label: 'Amazon SNS', color: '#7c3aed', desc: 'Pub/sub fan-out; push to many subscribers' },
        { id: 'eb', label: 'EventBridge', color: '#0891b2', desc: 'Event bus; route by content rules; SaaS/AWS events' },
        { id: 'sfn', label: 'Step Functions', color: '#d97706', desc: 'Stateful multi-step workflow orchestration' },
      ]}
      items={[
        { t: 'Buffer unpredictable bursts of work so a slower consumer fleet never loses messages', a: 'sqs', why: 'Durable buffering for one consumer group at its own pace is Amazon SQS.' },
        { t: 'One order event must notify inventory, billing, and email services in parallel', a: 'sns', why: 'Fan-out of a single event to many independent subscribers is Amazon SNS.' },
        { t: 'Route events to different targets based on their content, integrating a SaaS provider', a: 'eb', why: 'Content-based routing and SaaS/AWS event integration is Amazon EventBridge.' },
        { t: 'Coordinate a multi-step approval workflow with branching, retries, and saved state', a: 'sfn', why: 'Stateful orchestration with branching and retries is AWS Step Functions.' },
        { t: 'Smooth a write spike so downstream processing is not overwhelmed, with a dead-letter queue for failures', a: 'sqs', why: 'Buffering with a DLQ for repeated failures is the SQS pattern.' },
        { t: 'Trigger many independent microservices the instant a single domain event is published', a: 'sns', why: 'Immediate parallel notification of many subscribers from one publish is SNS fan-out.' },
      ]}
    />
  )
}

// ── AIP D1 (Session 2): foundation-model challenge → right move ───────────────
function ModelSelectorWidget() {
  return (
    <ScenarioSorter
      title="Match the FM Challenge to the Right Move"
      intro="Selecting and operating foundation models is a set of distinct decisions. Tag each requirement with the technique that solves it — the card confirms instantly."
      cats={[
        { id: 'abstraction', label: 'Switching abstraction', color: '#2563eb', desc: 'Lambda + AppConfig — change models without code changes' },
        { id: 'xregion', label: 'Cross-Region Inference', color: '#16a34a', desc: 'Resilience and availability across Regions' },
        { id: 'lora', label: 'LoRA customization', color: '#7c3aed', desc: 'Cheap, reversible adaptation + Model Registry' },
        { id: 'cascade', label: 'Right-size / cascade', color: '#d97706', desc: 'Smaller models for cost on simple queries' },
      ]}
      items={[
        { t: 'A/B test a cheaper model and switch providers with no application redeploy', a: 'abstraction', why: 'An abstraction layer (Lambda + AppConfig) makes model choice a config change, not a deploy.' },
        { t: 'Keep serving when the primary model is throttled or unavailable in the Region', a: 'xregion', why: 'Bedrock Cross-Region Inference routes around regional unavailability and throttling.' },
        { t: 'Teach the model your house style cheaply, with instant rollback if it underperforms', a: 'lora', why: 'Parameter-efficient LoRA is cheap and easy to swap; the Model Registry versions and reverts it.' },
        { t: 'Cut cost on a flood of simple queries without hurting hard ones', a: 'cascade', why: 'Right-size / cascade sends simple queries to a small cheap model and escalates only complex ones.' },
        { t: 'Promote a new fine-tuned version only after approval, and revert on a bad deploy', a: 'lora', why: 'SageMaker Model Registry gates promotion and supports rollback to the last approved version.' },
        { t: 'Automatically route around a model that has limited regional availability', a: 'xregion', why: 'Cross-Region Inference handles models with limited regional availability.' },
      ]}
    />
  )
}

// ── AIP D1 (Session 4): pick the vector store ─────────────────────────────────
function VectorStoreSelectorWidget() {
  return (
    <ScenarioSorter
      title="Pick the Vector Store"
      intro="AWS offers a spectrum from fully managed RAG to self-built. Match each requirement to the best-fit store — the card confirms instantly."
      cats={[
        { id: 'kb', label: 'Bedrock Knowledge Bases', color: '#16a34a', desc: 'Managed end-to-end RAG, minimal ops' },
        { id: 'os', label: 'OpenSearch Service', color: '#2563eb', desc: 'Hybrid keyword+vector at scale, sharding' },
        { id: 'aurora', label: 'Aurora pgvector', color: '#d97706', desc: 'Vectors beside relational data' },
        { id: 'dynamo', label: 'DynamoDB', color: '#7c3aed', desc: 'Serverless KV scale + Streams' },
      ]}
      items={[
        { t: 'Fastest managed RAG — ingestion, embedding, retrieval, citations — with minimal operations', a: 'kb', why: 'Bedrock Knowledge Bases manages the whole RAG vector pipeline.' },
        { t: 'Hybrid keyword + semantic search across millions of vectors with sharding', a: 'os', why: 'OpenSearch provides native hybrid search and horizontal sharding at scale.' },
        { t: 'Store embeddings alongside existing transactional relational data', a: 'aurora', why: 'Aurora with the pgvector extension keeps vectors next to relational data.' },
        { t: 'Serverless key-value scale for embeddings and metadata at very high request rates', a: 'dynamo', why: 'DynamoDB gives serverless KV scale for embeddings/metadata.' },
        { t: 'Re-sync the managed store automatically as source S3 documents change, no DB to run', a: 'kb', why: 'Knowledge Bases re-syncs from the source with no database to operate.' },
        { t: 'Use change streams to trigger incremental re-embedding at massive scale', a: 'dynamo', why: 'DynamoDB Streams enable event-driven incremental re-embedding.' },
      ]}
    />
  )
}

// ── AIP D1 (Session 5): retrieval symptom → fix ───────────────────────────────
function HybridSearchWidget() {
  return (
    <ScenarioSorter
      title="Match the Retrieval Symptom to the Fix"
      intro="RAG relevance problems each have a specific lever. Tag each symptom with the fix — the card confirms instantly."
      cats={[
        { id: 'hybrid', label: 'Hybrid search', color: '#2563eb', desc: 'Keyword + vector — exact terms AND meaning' },
        { id: 'rerank', label: 'Reranking', color: '#16a34a', desc: 'Reorder top-K by true relevance' },
        { id: 'chunk', label: 'Chunking', color: '#d97706', desc: 'Split size / structure' },
        { id: 'query', label: 'Query transformation', color: '#7c3aed', desc: 'Expand / decompose / rewrite' },
      ]}
      items={[
        { t: 'Pasted error codes that appear verbatim in the docs are not retrieved', a: 'hybrid', why: 'Pure vectors miss exact tokens; hybrid adds lexical keyword matching.' },
        { t: 'Retrieved passages are on-topic but the single best one ranks below weaker ones', a: 'rerank', why: 'A reranker reorders the top-K so the best passage reaches the model first.' },
        { t: 'Long documents get cut off mid-section and context is diluted', a: 'chunk', why: 'Chunk size/structure controls how documents are split and retrieved.' },
        { t: 'Conversational, multi-part questions retrieve poorly as written', a: 'query', why: 'Query transformation/decomposition rewrites questions into retrieval-friendly form.' },
        { t: 'Exact product part numbers are missed even though they exist in the corpus', a: 'hybrid', why: 'Exact identifiers need lexical matching alongside semantic similarity.' },
        { t: 'After broad retrieval you must surface the most relevant 3 of 50 candidates first', a: 'rerank', why: 'Two-stage retrieve-then-rerank surfaces the best candidates precisely.' },
      ]}
    />
  )
}

// ── AIP D1 (Session 6): prompt need → governance mechanism ────────────────────
function PromptGovernanceWidget() {
  return (
    <ScenarioSorter
      title="Match the Prompt Need to the Mechanism"
      intro="Prompts are production assets. Tag each need with the AWS mechanism that addresses it — the card confirms instantly."
      cats={[
        { id: 'guardrails', label: 'Bedrock Guardrails', color: '#dc2626', desc: 'Platform safety policy, prompt-independent' },
        { id: 'mgmt', label: 'Prompt Management', color: '#2563eb', desc: 'Versioned templates + approval workflow' },
        { id: 'flows', label: 'Prompt Flows', color: '#7c3aed', desc: 'Multi-step / branching composition' },
        { id: 'regression', label: 'Regression testing', color: '#16a34a', desc: 'Quality gate before promotion' },
      ]}
      items={[
        { t: 'Guarantee the assistant never returns PII or discusses competitors, regardless of prompt', a: 'guardrails', why: 'Guardrails enforce policy at the platform level, independent of the prompt.' },
        { t: 'Stop hardcoding prompts in code; version them with an approval workflow', a: 'mgmt', why: 'Bedrock Prompt Management provides versioned, parameterized templates with approvals.' },
        { t: 'Catch that a prompt change or model upgrade regressed output before production', a: 'regression', why: 'An automated regression suite gates promotion and detects quality drops.' },
        { t: 'Compose a multi-step task with conditional branching on the model response', a: 'flows', why: 'Bedrock Prompt Flows compose sequential chains and conditional branching.' },
        { t: 'Centralize parameterized templates so every app uses the approved version', a: 'mgmt', why: 'Prompt Management is the central, governed source of truth for templates.' },
        { t: 'Enforce denied topics even if a user tries to override the system prompt', a: 'guardrails', why: 'Platform Guardrails hold against prompt injection and overrides.' },
      ]}
    />
  )
}

// ── AIP D2 (Session 7): agent risk → safeguard ────────────────────────────────
function AgentLoopWidget() {
  return (
    <ScenarioSorter
      title="Bound the Agent — Match the Risk to the Safeguard"
      intro="Autonomy is powerful and dangerous. Tag each agent risk with the control that bounds it — the card confirms instantly."
      cats={[
        { id: 'stop', label: 'Stopping condition', color: '#2563eb', desc: 'Cap reasoning/tool steps' },
        { id: 'timeout', label: 'Timeout', color: '#0891b2', desc: 'Per-call / per-step deadline' },
        { id: 'iam', label: 'IAM boundary', color: '#7c3aed', desc: 'Least-privilege tool/resource scope' },
        { id: 'breaker', label: 'Circuit breaker', color: '#d97706', desc: 'Stop hammering a failing tool' },
        { id: 'human', label: 'Human-in-the-loop', color: '#16a34a', desc: 'Approval before high-impact actions' },
      ]}
      items={[
        { t: 'The agent sometimes loops indefinitely and never finishes', a: 'stop', why: 'A stopping condition (max steps) guarantees the loop terminates.' },
        { t: 'A hung tool call stalls the whole agent', a: 'timeout', why: 'Per-call timeouts stop a hung tool from stalling the loop.' },
        { t: 'A confused agent could reach resources beyond its intended tools', a: 'iam', why: 'A least-privilege IAM role limits exactly what the agent can reach.' },
        { t: 'A repeatedly failing tool keeps getting hammered with retries', a: 'breaker', why: 'A circuit breaker stops calling a failing tool and fails over or escalates.' },
        { t: 'Issuing a refund above a threshold must be confirmed before it executes', a: 'human', why: 'A human-in-the-loop approval gate guards high-impact actions.' },
        { t: 'Cap the number of reason-act cycles so the loop always ends', a: 'stop', why: 'Bounding the step count is the stopping condition.' },
      ]}
    />
  )
}

// ── AIP D3 (Session 12): control → defense-in-depth layer ─────────────────────
function SafetyLayersWidget() {
  return (
    <ScenarioSorter
      title="Place Each Control in the Defense-in-Depth Stack"
      intro="Robust GenAI safety layers independent controls. Tag each control with the layer it belongs to — the card confirms instantly."
      cats={[
        { id: 'pre', label: 'Pre-processing (input)', color: '#2563eb', desc: 'Screen/sanitize before the model' },
        { id: 'model', label: 'Model guardrails', color: '#dc2626', desc: 'Bedrock Guardrails on prompt + response' },
        { id: 'post', label: 'Post-processing (output)', color: '#16a34a', desc: 'Validate output before returning' },
        { id: 'api', label: 'API-layer filter', color: '#7c3aed', desc: 'Final gate at API Gateway' },
      ]}
      items={[
        { t: 'Screen and sanitize user input before it reaches the model', a: 'pre', why: 'Pre-processing (e.g. Comprehend, filters) is the first layer, before the model.' },
        { t: 'Block denied topics and toxic content on both prompt and response at the platform', a: 'model', why: 'Bedrock Guardrails enforce content/topic policy at the model layer.' },
        { t: 'Validate the model output structure and content before returning it', a: 'post', why: 'Post-processing (Lambda) validates output as a later layer.' },
        { t: 'Apply a final response filter at the API boundary', a: 'api', why: 'API Gateway response filtering is the last gate.' },
        { t: 'Detect and redact PII in the incoming text before the prompt is built', a: 'pre', why: 'PII detection/redaction on input is a pre-processing control.' },
        { t: 'Enforce JSON Schema and fact-check the generated answer after generation', a: 'post', why: 'Structured-output enforcement and fact-checking happen in post-processing.' },
      ]}
    />
  )
}

// ── SOA D1 (Sessions 1-2): build the automated-remediation chain ──────────────
function AlarmRoutingWidget() {
  return (
    <ScenarioSorter
      title="Build the Remediation Chain — Detect, Route, Act, Notify"
      intro="Event-driven remediation is four jobs done by four kinds of service. Tag each statement with the stage of the chain it performs — the card confirms instantly."
      cats={[
        { id: 'detect', label: 'Detect', color: '#2563eb', desc: 'CloudWatch alarm / Config / GuardDuty' },
        { id: 'route', label: 'Route', color: '#7c3aed', desc: 'EventBridge rule matches + forwards' },
        { id: 'act', label: 'Act', color: '#dc2626', desc: 'SSM Automation runbook / Lambda' },
        { id: 'notify', label: 'Notify', color: '#16a34a', desc: 'SNS / User Notifications to humans' },
      ]}
      items={[
        { t: 'A CloudWatch alarm enters ALARM when CPU stays above 90% for 10 minutes', a: 'detect', why: 'A CloudWatch alarm is the detection stage — it observes a metric crossing a threshold.' },
        { t: 'A rule matches the event JSON and forwards it to the right target', a: 'route', why: 'EventBridge rules match an event pattern and route the event to one or more targets.' },
        { t: 'A predefined runbook removes the offending security-group rule with no custom code', a: 'act', why: 'An SSM Automation runbook performs the remediation action — the act stage.' },
        { t: 'An email and a chat message tell the on-call engineer what happened', a: 'notify', why: 'SNS (or AWS User Notifications) fans out the alert to people — the notify stage.' },
        { t: 'AWS Config flags a resource as non-compliant', a: 'detect', why: 'Config evaluates configuration compliance — another detection source that can start the chain.' },
        { t: 'Custom code runs arbitrary logic that no managed runbook can express', a: 'act', why: 'Lambda is the act stage when the fix needs custom logic beyond a runbook.' },
      ]}
    />
  )
}

// ── SOA D2 (Session 5): choose the EC2 Auto Scaling policy ─────────────────────
function ScalingPolicyWidget() {
  return (
    <ScenarioSorter
      title="Pick the Auto Scaling Policy"
      intro="Each scaling policy answers a different question about WHEN to scale. Match each requirement to the policy that fits it best — the card confirms instantly."
      cats={[
        { id: 'target', label: 'Target tracking', color: '#2563eb', desc: 'Hold one metric at a target value' },
        { id: 'step', label: 'Step scaling', color: '#d97706', desc: 'Bigger breach → bigger adjustment' },
        { id: 'sched', label: 'Scheduled', color: '#16a34a', desc: 'Known time-based demand' },
        { id: 'pred', label: 'Predictive', color: '#7c3aed', desc: 'ML forecast pre-scales recurring load' },
      ]}
      items={[
        { t: 'Keep average CPU across the group near 50%, adjusting automatically', a: 'target', why: 'One metric, one desired value → target tracking, the simplest common choice.' },
        { t: 'Add capacity every weekday at 8:45 a.m. before the office logs in', a: 'sched', why: 'Demand tied to known clock times → scheduled scaling.' },
        { t: 'React more aggressively the further CPU climbs above the threshold', a: 'step', why: 'Different responses to different breach sizes → step scaling.' },
        { t: 'Pre-provision capacity using a forecast of the recurring daily traffic curve', a: 'pred', why: 'ML-forecast-driven pre-scaling of recurring patterns → predictive scaling.' },
        { t: 'Maintain a set request count per target without tuning step thresholds', a: 'target', why: 'Holding a single metric at a target (e.g. ALBRequestCountPerTarget) → target tracking.' },
        { t: 'Scale up for a marketing event at a date and time you already know', a: 'sched', why: 'A one-off but known time window → scheduled scaling.' },
      ]}
    />
  )
}

// ── SOA D2 (Session 7): match the recovery tool to the failure mode ───────────
function BackupStrategyWidget() {
  return (
    <ScenarioSorter
      title="Match the Recovery Tool to the Problem"
      intro="Different failures need different recovery tools — the right answer depends on what broke. Tag each scenario with the tool that fixes it — the card confirms instantly."
      cats={[
        { id: 'pitr', label: 'Point-in-time restore', color: '#2563eb', desc: 'Recover a DB to a precise second' },
        { id: 'ver', label: 'S3 versioning', color: '#16a34a', desc: 'Undo object overwrite / delete' },
        { id: 'backup', label: 'AWS Backup', color: '#d97706', desc: 'Central, multi-service, scheduled' },
        { id: 'vault', label: 'Vault Lock', color: '#7c3aed', desc: 'Immutable WORM retention' },
      ]}
      items={[
        { t: 'A bad migration corrupted the database at 02:14; restore to 02:13 with minimal loss', a: 'pitr', why: 'Recovering an RDS database to an exact second uses point-in-time restore.' },
        { t: 'A user accidentally overwrote an important object in S3 and needs the prior copy', a: 'ver', why: 'S3 versioning keeps prior versions so an accidental overwrite or delete can be undone.' },
        { t: 'Schedule and enforce backups for EC2, RDS, DynamoDB, and EFS from one place', a: 'backup', why: 'Centralized, multi-service, policy-driven backups are exactly what AWS Backup provides.' },
        { t: 'Guarantee backups cannot be deleted early, even by an admin, for compliance', a: 'vault', why: 'Backup Vault Lock enforces immutable WORM retention against early deletion.' },
        { t: 'Apply one retention plan automatically to every resource carrying a given tag', a: 'backup', why: 'Tag-based assignment of a backup plan is an AWS Backup capability.' },
        { t: 'Protect against ransomware deleting your backups before recovery', a: 'vault', why: 'Immutable Vault Lock retention stops backups being destroyed — ransomware protection.' },
      ]}
    />
  )
}

// ── SOA D5 (Session 14): find the broken VPC layer ────────────────────────────
function VpcTroubleshooterWidget() {
  return (
    <ScenarioSorter
      title="Find the Broken Network Layer"
      intro="When VPC traffic fails, the fault lives in one specific layer. Tag each symptom with the component most likely responsible — the card confirms instantly."
      cats={[
        { id: 'sg', label: 'Security Group', color: '#2563eb', desc: 'Stateful, allow-only, instance level' },
        { id: 'nacl', label: 'Network ACL', color: '#7c3aed', desc: 'Stateless, allow+deny, subnet level' },
        { id: 'route', label: 'Route Table', color: '#d97706', desc: 'Where a subnet sends traffic' },
        { id: 'nat', label: 'NAT Gateway', color: '#16a34a', desc: 'Private subnet outbound to internet' },
      ]}
      items={[
        { t: 'A private-subnet instance cannot reach the internet for OS updates, though everything else works', a: 'nat', why: 'Outbound internet from a private subnet flows through a NAT gateway — a missing/misplaced NAT is the cause.' },
        { t: 'A specific malicious IP range must be explicitly blocked at the subnet edge', a: 'nacl', why: 'Only network ACLs support deny rules at the subnet boundary.' },
        { t: 'Outbound requests succeed but replies are dropped on a stateless layer', a: 'nacl', why: 'NACLs are stateless — return traffic on ephemeral ports must be allowed explicitly.' },
        { t: 'An instance has no route to the internet gateway in its public subnet', a: 'route', why: 'A missing 0.0.0.0/0 → IGW entry is a route table problem.' },
        { t: 'One EC2 instance cannot accept traffic on port 443 though the subnet allows it', a: 'sg', why: 'Per-instance port allow/deny is governed by the security group attached to its ENI.' },
        { t: 'Traffic meant for an on-premises CIDR is going to the internet instead', a: 'route', why: 'Wrong next hop for a destination CIDR is a route table misconfiguration.' },
      ]}
    />
  )
}

const INTERACTIVE_WIDGETS = {
  'model-selector': ModelSelectorWidget,
  'vector-store-selector': VectorStoreSelectorWidget,
  'hybrid-search': HybridSearchWidget,
  'prompt-governance': PromptGovernanceWidget,
  'agent-loop': AgentLoopWidget,
  'safety-layers': SafetyLayersWidget,
  'connectivity-selector': ConnectivitySelectorWidget,
  'integration-selector': IntegrationSelectorWidget,
  'precision-recall': PrecisionRecallWidget,
  'endpoint-selector': EndpointSelectorWidget,
  'inference-parameters': InferenceParametersWidget,
  'learning-types': LearningTypesWidget,
  'tokenizer': TokenizerWidget,
  'rag-vs-finetune': RagVsFineTuneWidget,
  'ngram-overlap': NgramOverlapWidget,
  'interpretability-tradeoff': InterpretabilityTradeoffWidget,
  'sg-vs-nacl': SgVsNaclWidget,
  'dr-strategy': DrStrategyWidget,
  's3-storage-class': S3StorageClassWidget,
  'ddb-capacity': DdbCapacityWidget,
  'lambda-concurrency': LambdaConcurrencyWidget,
  'deploy-strategy': DeployStrategyWidget,
  'alarm-routing': AlarmRoutingWidget,
  'scaling-policy': ScalingPolicyWidget,
  'backup-strategy': BackupStrategyWidget,
  'vpc-troubleshooter': VpcTroubleshooterWidget,
}

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

// Renders bullets as scannable "concept cards": a "Term — definition" bullet
// becomes a bold term with its definition beneath; plain bullets stay as a
// simple accented line.
function ConceptList({ bullets }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
      {bullets.map((b, i) => {
        const sep = b.indexOf(' — ')
        if (sep === -1) {
          return (
            <div key={i} style={{ display: 'flex', gap: '0.6rem', padding: '0.3rem 0.25rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
              <span style={{ color: TEAL, fontWeight: 700, flexShrink: 0 }}>•</span>
              <span>{b}</span>
            </div>
          )
        }
        return (
          <div key={i} style={{
            background: '#fafbfd', border: '1px solid #eef2f7', borderLeft: `3px solid ${TEAL}`,
            borderRadius: '0.6rem', padding: '0.65rem 0.85rem',
          }}>
            <div style={{ fontWeight: 700, color: NAVY, fontSize: '0.875rem', marginBottom: '0.2rem' }}>
              {b.slice(0, sep)}
            </div>
            <div style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.55 }}>
              {b.slice(sep + 3)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// A teaching section as a self-contained, click-to-collapse card.
// All sections start open and can be minimised — body-only sections collapse to
// just their heading; sections with bullets/table/callout also hide that content.
function EnhancedSection({ section, index, anchorId }) {
  const hasExtra = !!(section.bullets || section.table || section.callout)
  const [open, setOpen] = useState(true)   // always start expanded

  const hints = []
  if (section.bullets) hints.push(`${section.bullets.length} concept${section.bullets.length === 1 ? '' : 's'}`)
  if (section.table) hints.push('comparison table')
  if (section.callout) hints.push('exam tip')
  const metaHint = hints.join(' · ')

  // First paragraph of body — shown as a teaser when collapsed
  const firstPara = section.body ? section.body.split('\n\n')[0] : null

  return (
    <div id={anchorId} style={{
      marginBottom: '1rem', borderRadius: '0.9rem', background: 'white', overflow: 'hidden',
      scrollMarginTop: '4rem',
      border: `1.5px solid ${open ? 'rgba(0,212,170,0.45)' : '#e8edf3'}`,
      boxShadow: open ? '0 6px 22px rgba(10,37,64,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      {/* Header row — always visible, click to toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', background: 'transparent', border: 'none',
          cursor: 'pointer',
          padding: '1rem 1.15rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
        }}
      >
        <span style={{
          width: '1.85rem', height: '1.85rem', minWidth: '1.85rem', borderRadius: '0.55rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8125rem', fontWeight: 800, color: 'white', marginTop: '0.1rem',
          background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
        }}>
          {index + 1}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: NAVY, lineHeight: 1.3, margin: 0 }}>
            {section.heading}
          </h3>
          {/* When collapsed: show first paragraph as a teaser + content hint */}
          {!open && (
            <>
              {firstPara && (
                <p style={{
                  fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5,
                  margin: '0.3rem 0 0',
                  overflow: 'hidden', display: '-webkit-box',
                  WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                }}>
                  {firstPara}
                </p>
              )}
              {metaHint && (
                <span style={{ display: 'inline-block', fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', marginTop: '0.25rem' }}>
                  {metaHint}
                </span>
              )}
            </>
          )}
        </div>

        <span style={{
          color: TEAL_DARK, fontSize: '0.9rem', marginTop: '0.35rem', flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s',
        }}>▼</span>
      </button>

      {/* Body — hidden when collapsed */}
      {open && (
        <div style={{ padding: '0 1.15rem 1.15rem', borderTop: '1px solid #f1f5f9' }}>
          {section.body && section.body.split('\n\n').map((para, i, arr) => (
            <p key={i} style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: i === 0 ? '0.75rem 0 0' : '0.6rem 0 0', marginBottom: i < arr.length - 1 ? '0.1rem' : 0 }}>
              {para}
            </p>
          ))}
          {hasExtra && (
            <div style={{ marginTop: section.body ? '0.75rem' : 0 }}>
              {section.bullets && <ConceptList bullets={section.bullets} />}
              {section.table && <ContentTable table={section.table} />}
              {section.callout && <Callout callout={section.callout} />}
            </div>
          )}
          {section.interactive && INTERACTIVE_WIDGETS[section.interactive] && (
            React.createElement(INTERACTIVE_WIDGETS[section.interactive])
          )}
        </div>
      )}
    </div>
  )
}

// Pre-test shown BEFORE content. Getting it wrong is intentional — it primes memory.
// Research: attempting retrieval before study improves retention even on wrong answers.
function PreLearningCheck({ check }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const isCorrect = revealed && selected === check.correct

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
        {check.question}
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
function SpeedBump({ quiz, cleared, onClear }) {
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
        Quick recall checkpoint
      </div>
      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: NAVY, lineHeight: 1.6, marginBottom: '1rem' }}>
        {quiz.question}
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
                {quiz.elaborativePrompt}
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

// A section that's still gated: shows only its title behind a lock. Tapping it
// scrolls back to the checkpoint that's blocking it.
function LockedSection({ heading, onJump }) {
  return (
    <button
      onClick={onJump}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', textAlign: 'left',
        background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '0.85rem',
        padding: '0.85rem 1rem', margin: '0.5rem 0', cursor: 'pointer',
      }}
    >
      <span style={{
        flexShrink: 0, width: 30, height: 30, borderRadius: '50%', background: '#e2e8f0',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b"
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8', lineHeight: 1.4 }}>
        {heading}
      </span>
      <span style={{ flexShrink: 0, fontSize: '0.7rem', fontWeight: 700, color: TEAL_DARK, whiteSpace: 'nowrap' }}>
        Checkpoint ↑
      </span>
    </button>
  )
}

// Assembles the enhanced lesson: pre-learning check, enhanced sections + speed bumps,
// gating any section that follows an uncleared speed bump.
// `cleared`  — array of afterSection indices already cleared (from persisted state)
// `onClear`  — callback(afterSection) to persist a newly cleared checkpoint
function LessonBody({ session, cleared, onClear }) {
  const quizzes = session.microQuizzes || []
  const elems = []

  if (session.preLearningCheck) {
    elems.push(
      <PreLearningCheck key="pre-check" check={session.preLearningCheck} />
    )
  }

  for (let i = 0; i < session.sections.length; i++) {
    const blocking = quizzes.find(q => q.afterSection < i && !cleared.includes(q.afterSection))
    if (blocking) {
      // Still locked: render only the title behind a lock that jumps to the
      // gating checkpoint. The lesson stays visible as an outline, not hidden.
      elems.push(
        <LockedSection
          key={`locked-${i}`}
          heading={session.sections[i].heading}
          onJump={() => {
            const el = document.getElementById(`checkpoint-${session.id}-${blocking.afterSection}`)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      )
      continue
    }
    elems.push(
      <EnhancedSection
        key={`${session.id}::${i}`}
        section={session.sections[i]}
        index={i}
        anchorId={`sec-${session.id}-${i}`}
      />
    )
    const here = quizzes.find(q => q.afterSection === i)
    if (here) {
      elems.push(
        <div key={`quiz-${i}`} id={`checkpoint-${session.id}-${i}`}>
          <SpeedBump
            quiz={here}
            cleared={cleared.includes(here.afterSection)}
            onClear={() => {
              onClear(here.afterSection)
              // Scroll to the newly unlocked section after re-render
              setTimeout(() => {
                const nextEl = document.getElementById(`sec-${session.id}-${i + 1}`)
                if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }, 80)
            }}
          />
        </div>
      )
    }
  }
  return <>{elems}</>
}

// ─── Main component ───────────────────────────────────────────────────────────

function SessionCourse({ course, onBack, hasAccess = true, onSubscribe }) {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuthStore()
  const userId = user?.id
  const submitterName = profile?.full_name || user?.email?.split('@')[0] || 'Anonymous learner'
  const storageKey        = `course-progress-${course.slug}`
  const checkpointsKey    = `course-checkpoints-${course.slug}`
  const [completedIds, setCompletedIds] = useState([])
  // clearedCheckpoints: { [sessionId]: number[] } — which afterSection indices are cleared
  const [clearedCheckpoints, setClearedCheckpoints] = useState({})
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  // Lazy-initialise to the first incomplete session from localStorage so that
  // "Continue" from the dashboard lands on the right session immediately,
  // even before the async DB load completes.
  const [activeId, setActiveId] = useState(() => {
    try {
      const saved = localStorage.getItem(`course-progress-${course.slug}`)
      if (saved) {
        const ids = JSON.parse(saved)
        const resume = course.sessions.find(s => !ids.includes(s.id))
        return resume?.id ?? course.sessions[0]?.id
      }
    } catch { /* ignore */ }
    return course.sessions[0]?.id
  })

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const contentRef = useRef(null)
  const completedRef       = useRef([])
  const checkpointsRef     = useRef({})
  // Track whether the user manually picked a session so a cross-device DB
  // load doesn't override an intentional navigation.
  const userNavigatedRef   = useRef(false)

  const persistToDb = (completed, checkpoints) => {
    if (!userId) return
    studyProgressService.save(userId, course.slug, {
      completedSessions:   completed,
      clearedCheckpoints:  checkpoints,
    })
  }

  // Free preview: the first module's sessions are open; the rest require a subscription.
  const freeModuleId = course.modules[0]?.id
  const isLocked = (session) => !hasAccess && session && session.domain !== freeModuleId

  // 1) Hydrate instantly from localStorage for a snappy first paint.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) { const a = JSON.parse(saved); setCompletedIds(a); completedRef.current = a }
    } catch { /* ignore */ }
    try {
      const saved = localStorage.getItem(checkpointsKey)
      if (saved) { const c = JSON.parse(saved); setClearedCheckpoints(c); checkpointsRef.current = c }
    } catch { /* ignore */ }
  }, [storageKey, checkpointsKey])

  // 2) Once we know the user, the DB is authoritative (cross-device sync).
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    studyProgressService.load(userId, course.slug).then(data => {
      if (cancelled || !data) return
      const completed    = Array.isArray(data.completedSessions) ? data.completedSessions : []
      const checkpoints  = data.clearedCheckpoints && typeof data.clearedCheckpoints === 'object'
        ? data.clearedCheckpoints : {}
      setCompletedIds(completed);        completedRef.current    = completed
      setClearedCheckpoints(checkpoints); checkpointsRef.current  = checkpoints
      try { localStorage.setItem(storageKey,     JSON.stringify(completed))   } catch { /* ignore */ }
      try { localStorage.setItem(checkpointsKey, JSON.stringify(checkpoints)) } catch { /* ignore */ }

      // If the user hasn't manually navigated, jump to first incomplete session
      // (handles cross-device resume where localStorage was empty/stale).
      if (!userNavigatedRef.current) {
        const resume = course.sessions.find(s => !completed.includes(s.id))
        if (resume) setActiveId(resume.id)
      }
    })
    return () => { cancelled = true }
  }, [userId, course.slug, storageKey, checkpointsKey])

  useEffect(() => {
    if (!userMenuOpen) return
    const onClick = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setUserMenuOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey) }
  }, [userMenuOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const toggleComplete = (id) => {
    setCompletedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch { /* ignore */ }
      completedRef.current = next
      persistToDb(next, checkpointsRef.current)
      return next
    })
  }

  // Called by LessonBody when a speed-bump checkpoint is cleared.
  const markCheckpointCleared = (sessionId, afterSection) => {
    setClearedCheckpoints(prev => {
      const existing = prev[sessionId] || []
      if (existing.includes(afterSection)) return prev   // already saved
      const next = { ...prev, [sessionId]: [...existing, afterSection] }
      try { localStorage.setItem(checkpointsKey, JSON.stringify(next)) } catch { /* ignore */ }
      checkpointsRef.current = next
      persistToDb(completedRef.current, next)
      return next
    })
  }

  const activeSession = course.sessions.find(s => s.id === activeId)
  const activeIdx = course.sessions.findIndex(s => s.id === activeId)
  const prevSession = activeIdx > 0 ? course.sessions[activeIdx - 1] : null
  const nextSession = activeIdx < course.sessions.length - 1 ? course.sessions[activeIdx + 1] : null
  const isCompleted = completedIds.includes(activeId)

  const total = course.sessions.length
  const done = completedIds.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  // Instant scroll to top whenever the active session changes.
  // Must be 'instant' (not 'smooth') — smooth races with the new content
  // rendering and can leave the user mid-page on the new session.
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    window.scrollTo(0, 0)
  }, [activeId])

  const selectSession = (id) => {
    userNavigatedRef.current = true
    setActiveId(id)
    setMobileSidebarOpen(false)
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
    <div style={{ height: '100dvh', overflow: 'hidden', background: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
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

        {/* Right: progress pill + user menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
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

          {/* User avatar + dropdown */}
          <div style={{ position: 'relative' }} ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: TEAL, color: NAVY, border: 'none',
                fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </button>

            {userMenuOpen && (
              <div
                role="menu"
                style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  width: '200px', background: 'white', borderRadius: '0.75rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)', border: '1px solid #e2e8f0',
                  overflow: 'hidden', zIndex: 300,
                }}
              >
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile?.full_name || user?.email?.split('@')[0] || 'Student'}
                  </p>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.6875rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
                <button
                  role="menuitem"
                  onClick={() => { setUserMenuOpen(false); navigate('/dashboard') }}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.625rem 1rem',
                    background: 'none', border: 'none', fontSize: '0.875rem',
                    color: '#374151', cursor: 'pointer', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  ⬡ Dashboard
                </button>
                <div style={{ height: '1px', background: '#f1f5f9' }} />
                <button
                  role="menuitem"
                  onClick={handleLogout}
                  style={{
                    width: '100%', textAlign: 'left', padding: '0.625rem 1rem',
                    background: 'none', border: 'none', fontSize: '0.875rem',
                    color: '#ef4444', cursor: 'pointer', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  → Log out
                </button>
              </div>
            )}
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
              <LessonBody
                key={activeSession.id}
                session={activeSession}
                cleared={clearedCheckpoints[activeSession.id] || []}
                onClear={(afterSection) => markCheckpointCleared(activeSession.id, afterSection)}
              />

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

              {/* Teach it to learn it — merged Explain + Watch + community videos */}
              <TeachToLearn
                session={activeSession}
                courseSlug={course.slug}
                examCode={course.code}
                officialVideos={activeSession.videos}
                userId={userId}
                submitterName={submitterName}
              />

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

      {/* Responsive styles */}
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
