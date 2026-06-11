import React, { useState, useEffect } from 'react'
import { Copy, Check, MessageCircle, X } from 'lucide-react'
import { getPromoCodes, createPromoCode, updatePromoCode } from '../../services/adminService'

const EMPTY_FORM = {
  exam_type_id: '',
  target_group: '',
  duration_days: '7',
  max_uses: '10',
}

// Maps the stored duration_days to a human label used in the UI and share text.
const DURATION_OPTIONS = [
  { value: '1', label: '1 day' },
  { value: '3', label: '3 days' },
  { value: '7', label: '1 week' },
  { value: '30', label: '1 month' },
]

function durationLabel(days) {
  return DURATION_OPTIONS.find(o => Number(o.value) === Number(days))?.label || `${days} days`
}

// ── WhatsApp message templates ─────────────────────────────────────────────────
// Five ready-to-send messages the admin can pick from. Each one leads with a
// concrete benefit of getting certified, then gives the redemption steps. *text*
// renders as bold inside WhatsApp.
const MESSAGE_TEMPLATES = [
  {
    id: 'friendly',
    label: 'Friendly',
    hint: 'Warm, casual — for close friends',
    build: ({ examName, length, code, redeemUrl }) =>
      `Hey! 👋 Got something for you.\n\n` +
      `I grabbed you a *free ${length} pass* to prep for the *${examName}* certification on CloudExamLab — no payment needed.\n\n` +
      `Why it's worth it: a cert is solid proof you know your stuff. It looks great on your CV and LinkedIn and helps you stand out when you're job hunting or going for a raise.\n\n` +
      `How to claim it:\n` +
      `1. Open ${redeemUrl}\n` +
      `2. Sign in (or make a free account)\n` +
      `3. Enter this code: *${code}*\n\n` +
      `That unlocks full practice access for ${length}. Give it a go — you've got this! 💪`,
  },
  {
    id: 'career',
    label: 'Career boost',
    hint: 'Resume, jobs, higher pay',
    build: ({ examName, length, code, redeemUrl }) =>
      `Quick one — this could be great for your career. 📈\n\n` +
      `I'm sharing a *free ${length} pass* to study for the *${examName}* certification on CloudExamLab.\n\n` +
      `Certified people get noticed: it's a recognised credential that proves your skills to employers, opens doors to better roles, and often means higher pay. Recruiters literally filter for it.\n\n` +
      `Claim your pass:\n` +
      `1. Go to ${redeemUrl}\n` +
      `2. Sign in / create a free account\n` +
      `3. Redeem code: *${code}*\n\n` +
      `Full practice access for ${length}. Worth an hour of your week — your future self will thank you.`,
  },
  {
    id: 'ai-era',
    label: 'Future-proof',
    hint: 'AI/cloud skills, stay ahead',
    build: ({ examName, length, code, redeemUrl }) =>
      `The job market's changing fast — don't get left behind. 🚀\n\n` +
      `Here's a *free ${length} pass* to study for the *${examName}* on CloudExamLab.\n\n` +
      `AI and cloud skills are now expected in almost every role. Getting certified is the clearest way to prove you actually understand them — a real edge whether you're staying put or making your next move.\n\n` +
      `To start:\n` +
      `1. Open ${redeemUrl}\n` +
      `2. Sign in (a free account works)\n` +
      `3. Enter code: *${code}*\n\n` +
      `You'll have full practice access for ${length}. Perfect time to get ahead.`,
  },
  {
    id: 'beginner',
    label: 'Beginner-friendly',
    hint: 'No experience needed',
    build: ({ examName, length, code, redeemUrl }) =>
      `Think you're "not technical enough" for a certification? You don't need to be. 🙂\n\n` +
      `I've got a *free ${length} pass* for the *${examName}* on CloudExamLab to share with you.\n\n` +
      `This one's built for beginners — no coding or deep tech background required. It teaches you the fundamentals and gives you a real, recognised credential to show for it. A great first step into cloud and AI.\n\n` +
      `How to redeem:\n` +
      `1. Visit ${redeemUrl}\n` +
      `2. Sign in or create a free account\n` +
      `3. Use this code: *${code}*\n\n` +
      `That's ${length} of full practice access, free. Give it a try!`,
  },
  {
    id: 'short',
    label: 'Short & punchy',
    hint: 'Quick, scannable share',
    build: ({ examName, length, code, redeemUrl }) =>
      `🎁 Free ${length} pass for you — *${examName}* practice on CloudExamLab.\n\n` +
      `A cert = proof of your skills and a real boost to your CV and job prospects.\n\n` +
      `Redeem: open ${redeemUrl}, sign in, enter *${code}*. Full access for ${length}. Enjoy!`,
  },
]

function promoContext(promo) {
  return {
    examName: promo.exam_types?.name || 'the exam',
    length: durationLabel(promo.duration_days),
    code: promo.code,
    redeemUrl: `${window.location.origin}/redeem`,
  }
}

export default function PromoCodeManager({ examTypes }) {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // WhatsApp share modal state
  const [sharePromo, setSharePromo] = useState(null)
  const [templateId, setTemplateId] = useState(MESSAGE_TEMPLATES[0].id)
  const [messageCopied, setMessageCopied] = useState(false)

  useEffect(() => {
    loadPromos()
  }, [])

  async function loadPromos() {
    setLoading(true)
    try {
      const result = await getPromoCodes()
      setPromos(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.exam_type_id) {
      setError('Please choose the exam this code unlocks.')
      return
    }
    if (!form.target_group.trim()) {
      setError('Please enter a target group — the code is generated from it.')
      return
    }

    setSaving(true)
    try {
      const result = await createPromoCode({
        exam_type_id: form.exam_type_id,
        target_group: form.target_group.trim(),
        duration_days: Number(form.duration_days),
        max_uses: Number(form.max_uses),
      })
      setSuccess(`Code "${result.data.code}" created.`)
      setForm(EMPTY_FORM)
      setPromos(prev => [result.data, ...prev])
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(promo) {
    setError(null)
    try {
      const result = await updatePromoCode(promo.id, !promo.is_active)
      setPromos(prev => prev.map(p => (p.id === promo.id ? result.data : p)))
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleCopyCode(promo) {
    try {
      await navigator.clipboard.writeText(promo.code)
      setCopiedId(promo.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // Clipboard unavailable — ignore silently.
    }
  }

  // ── Share modal ───────────────────────────────────────────────────────────────
  function openShare(promo) {
    setSharePromo(promo)
    setTemplateId(MESSAGE_TEMPLATES[0].id)
    setMessageCopied(false)
  }

  function closeShare() {
    setSharePromo(null)
  }

  const activeTemplate = MESSAGE_TEMPLATES.find(t => t.id === templateId)
  const previewMessage = sharePromo && activeTemplate
    ? activeTemplate.build(promoContext(sharePromo))
    : ''

  function sendWhatsApp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(previewMessage)}`, '_blank', 'noopener,noreferrer')
    closeShare()
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(previewMessage)
      setMessageCopied(true)
      setTimeout(() => setMessageCopied(false), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Promo Codes</h2>
      <p className="admin-note" style={{ marginBottom: '1.5rem' }}>
        Create a shareable code that unlocks one exam for a limited time, capped by a number of users.
        Share it to a WhatsApp group and friends redeem it after signing in.
      </p>

      {/* ── Create form ── */}
      <form onSubmit={handleSubmit} className="admin-form admin-card" style={{ marginBottom: '2rem' }}>
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Exam to unlock *</label>
            <select name="exam_type_id" value={form.exam_type_id} onChange={handleChange} required>
              <option value="">— choose exam —</option>
              {examTypes.map(et => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Target group *</label>
            <input
              name="target_group"
              value={form.target_group}
              onChange={handleChange}
              placeholder="e.g. Uni Friends WA"
              required
            />
          </div>

          <div className="admin-field">
            <label>Access length *</label>
            <select name="duration_days" value={form.duration_days} onChange={handleChange} required>
              {DURATION_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label>Max users *</label>
            <input
              name="max_uses"
              type="number"
              min="1"
              value={form.max_uses}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <p className="admin-note">
          The code is generated automatically from the target group (e.g. <code>UNIFRIENDS-7K2D</code>).
        </p>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Generating...' : 'Generate Code'}
        </button>
      </form>

      {/* ── Existing codes ── */}
      <h3 className="admin-list-title">Existing Codes</h3>
      {loading ? (
        <p className="admin-loading">Loading promo codes...</p>
      ) : promos.length === 0 ? (
        <p className="admin-note">No promo codes yet. Create one above.</p>
      ) : (
        <div className="admin-promo-grid">
          {promos.map(promo => {
            const used = promo.used_count || 0
            const max = promo.max_uses || 0
            const full = used >= max
            const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0
            return (
              <div key={promo.id} className={`admin-promo-card ${!promo.is_active ? 'is-inactive' : ''}`}>
                <div className="admin-promo-top">
                  <div className="admin-promo-codewrap">
                    <button
                      className="admin-promo-code"
                      onClick={() => handleCopyCode(promo)}
                      title="Tap to copy code"
                    >
                      <span>{promo.code}</span>
                      {copiedId === promo.id
                        ? <Check size={15} className="admin-promo-copyicon is-copied" />
                        : <Copy size={15} className="admin-promo-copyicon" />}
                    </button>
                    <div className="admin-promo-exam">{promo.exam_types?.name || '—'}</div>
                  </div>
                  <span className={`admin-pill ${promo.is_active ? 'admin-pill--on' : 'admin-pill--off'}`}>
                    {promo.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="admin-promo-meta">
                  <span className="admin-chip">{promo.target_group}</span>
                  <span className="admin-chip">{durationLabel(promo.duration_days)}</span>
                </div>

                {/* Usage */}
                <div className="admin-promo-usage">
                  <div className="admin-promo-usage-row">
                    <span>Redemptions</span>
                    <span className={full ? 'admin-usage-full' : undefined}>
                      {used} / {max}{full ? ' · full' : ''}
                    </span>
                  </div>
                  <div className="admin-progress">
                    <div
                      className="admin-progress-fill"
                      style={{ width: `${pct}%`, background: full ? '#ef4444' : '#00D4AA' }}
                    />
                  </div>
                </div>

                <div className="admin-promo-actions">
                  <button
                    className="admin-btn admin-btn--whatsapp"
                    onClick={() => openShare(promo)}
                  >
                    <MessageCircle size={15} /> Share on WhatsApp
                  </button>
                  <button
                    className="admin-btn admin-btn--ghost admin-btn--sm"
                    onClick={() => handleToggleActive(promo)}
                  >
                    {promo.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── WhatsApp message picker ── */}
      {sharePromo && (
        <div className="admin-modal-overlay" onClick={closeShare}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-head">
              <div>
                <h3 className="admin-modal-title">Share on WhatsApp</h3>
                <p className="admin-modal-sub">Pick a message for <strong>{sharePromo.code}</strong></p>
              </div>
              <button className="admin-modal-close" onClick={closeShare} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Template chooser */}
              <div className="admin-template-list">
                {MESSAGE_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    className={`admin-template-option ${templateId === t.id ? 'is-selected' : ''}`}
                    onClick={() => setTemplateId(t.id)}
                  >
                    <span className="admin-template-label">{t.label}</span>
                    <span className="admin-template-hint">{t.hint}</span>
                  </button>
                ))}
              </div>

              {/* Live preview */}
              <div className="admin-template-preview">
                <div className="admin-template-preview-label">Preview</div>
                <div className="admin-template-preview-bubble">{previewMessage}</div>
              </div>
            </div>

            <div className="admin-modal-foot">
              <button className="admin-btn admin-btn--ghost" onClick={copyMessage}>
                {messageCopied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy message</>}
              </button>
              <button className="admin-btn admin-btn--whatsapp" onClick={sendWhatsApp}>
                <MessageCircle size={15} /> Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
