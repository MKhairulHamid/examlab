import React, { useState } from 'react'
import { Check, Copy, X } from 'lucide-react'
import {
  COLORS, NEUTRALS, SEMANTIC, GRADIENTS, TYPOGRAPHY, BRAND, TAGLINES, VOICE,
} from '../../data/brand'
import {
  logoHorizontalSvg, logoStackedSvg, logoIconSvg,
} from './brand/logo'

/** Inline SVG preview from a generated SVG string. */
function SvgPreview({ svg, height = 120, pad = true }) {
  return (
    <div
      className="brand-svg-preview"
      style={{ '--preview-h': `${height}px`, padding: pad ? '1rem' : 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function Swatch({ hex, name, role }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard?.writeText(hex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button className="brand-swatch" onClick={copy} title={`Copy ${hex}`}>
      <span className="brand-swatch-chip" style={{ background: hex }} />
      <span className="brand-swatch-info">
        <span className="brand-swatch-name">{name}</span>
        <span className="brand-swatch-hex">
          {hex}
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </span>
        {role && <span className="brand-swatch-role">{role}</span>}
      </span>
    </button>
  )
}

export default function BrandGuidelinesManager() {
  return (
    <div className="admin-section brand-guidelines">
      <h2 className="admin-section-title">Brand Guidelines</h2>
      <p className="admin-note">
        The single source of truth for the {BRAND.name} identity. Everything on the
        Brand Assets tab is generated from these exact values, so downloaded assets
        always stay on-brand.
      </p>

      {/* Logo */}
      <section className="brand-block">
        <h3 className="admin-list-title">Logo</h3>
        <div className="brand-grid">
          <div className="admin-card brand-logo-card">
            <SvgPreview svg={logoHorizontalSvg({ width: 900, height: 240, onDark: true })} height={130} pad={false} />
            <span className="brand-cap">Horizontal · on dark</span>
          </div>
          <div className="admin-card brand-logo-card">
            <SvgPreview svg={logoHorizontalSvg({ width: 900, height: 240, onDark: false })} height={130} pad={false} />
            <span className="brand-cap">Horizontal · on light</span>
          </div>
          <div className="admin-card brand-logo-card">
            <SvgPreview svg={logoStackedSvg({ width: 600, height: 520, onDark: true })} height={170} pad={false} />
            <span className="brand-cap">Stacked</span>
          </div>
          <div className="admin-card brand-logo-card">
            <SvgPreview svg={logoIconSvg({ size: 400, background: COLORS.navy.hex })} height={130} pad={false} />
            <span className="brand-cap">Icon mark</span>
          </div>
        </div>
        <div className="brand-rules">
          <div className="brand-rule brand-rule--do">
            <span className="brand-rule-head"><Check size={15} /> Do</span>
            <ul>
              <li>Keep clear space around the mark equal to the height of the cloud icon.</li>
              <li>Use the teal-gradient square on navy or white backgrounds.</li>
              <li>Use the icon-only mark where space is tight (avatars, favicons).</li>
            </ul>
          </div>
          <div className="brand-rule brand-rule--dont">
            <span className="brand-rule-head"><X size={15} /> Don't</span>
            <ul>
              <li>Recolor the gradient or place the mark on a busy photo.</li>
              <li>Stretch, rotate, or add drop shadows to the lockup.</li>
              <li>Re-typeset the wordmark in a different font.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Color */}
      <section className="brand-block">
        <h3 className="admin-list-title">Color palette · click any swatch to copy</h3>
        <div className="brand-swatch-grid">
          {Object.values(COLORS).map(c => (
            <Swatch key={c.hex} hex={c.hex} name={c.name} role={c.role} />
          ))}
        </div>

        <h4 className="brand-subhead">Gradients</h4>
        <div className="brand-grad-grid">
          {Object.values(GRADIENTS).map(g => (
            <div key={g.name} className="brand-grad">
              <span className="brand-grad-chip" style={{ background: g.css }} />
              <span className="brand-grad-name">{g.name}</span>
              <code className="brand-grad-css">{g.css}</code>
            </div>
          ))}
        </div>

        <h4 className="brand-subhead">Neutrals &amp; semantic</h4>
        <div className="brand-mini-grid">
          {Object.entries(NEUTRALS).map(([k, hex]) => (
            <Swatch key={hex} hex={hex} name={k} />
          ))}
          {Object.values(SEMANTIC).map(s => (
            <Swatch key={s.hex} hex={s.hex} name={s.name} />
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="brand-block">
        <h3 className="admin-list-title">Typography</h3>
        <div className="admin-card">
          <p className="admin-note" style={{ margin: 0 }}>Font stack</p>
          <code className="brand-fontstack">{TYPOGRAPHY.fontStack}</code>
          <div className="brand-weights">
            {TYPOGRAPHY.weights.map(w => (
              <div key={w.weight} className="brand-weight">
                <span style={{ fontWeight: w.weight, fontSize: '1.5rem', color: '#fff' }}>Aa</span>
                <span className="brand-weight-meta">{w.weight} · {w.label}</span>
                <span className="brand-weight-use">{w.use}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voice & messaging */}
      <section className="brand-block">
        <h3 className="admin-list-title">Voice &amp; tone</h3>
        <div className="brand-grid">
          {VOICE.principles.map(p => (
            <div key={p.title} className="admin-card">
              <strong style={{ color: COLORS.teal.hex }}>{p.title}</strong>
              <p className="admin-note" style={{ marginBottom: 0 }}>{p.body}</p>
            </div>
          ))}
        </div>
        <div className="brand-rules" style={{ marginTop: '1rem' }}>
          <div className="brand-rule brand-rule--do">
            <span className="brand-rule-head"><Check size={15} /> Do</span>
            <ul>{VOICE.rules.filter(r => r.do).map((r, i) => <li key={i}>{r.text}</li>)}</ul>
          </div>
          <div className="brand-rule brand-rule--dont">
            <span className="brand-rule-head"><X size={15} /> Don't</span>
            <ul>{VOICE.rules.filter(r => !r.do).map((r, i) => <li key={i}>{r.text}</li>)}</ul>
          </div>
        </div>
      </section>

      {/* Messaging */}
      <section className="brand-block">
        <h3 className="admin-list-title">Taglines &amp; messaging</h3>
        <div className="brand-taglines">
          {Object.entries(TAGLINES).map(([k, v]) => (
            <div key={k} className="brand-tagline">
              <span className="brand-tagline-key">{k}</span>
              <span className="brand-tagline-val">{v}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
