import React, { useState, useEffect } from 'react'
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

// Builds the WhatsApp-share message a friend receives along with the code.
function buildShareMessage(promo) {
  const examName = promo.exam_types?.name || 'the exam'
  const redeemUrl = `${window.location.origin}/redeem`
  return (
    `Hi! Here's a free ${durationLabel(promo.duration_days)} pass to practice the ${examName} exam on CloudExamLab.\n\n` +
    `How to use it:\n` +
    `1. Open ${redeemUrl}\n` +
    `2. Sign in (or create a free account)\n` +
    `3. Enter this code: ${promo.code}\n\n` +
    `That unlocks full practice access for ${durationLabel(promo.duration_days)}. Good luck with your prep!`
  )
}

export default function PromoCodeManager({ examTypes }) {
  const [promos, setPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

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

  async function handleCopy(promo) {
    try {
      await navigator.clipboard.writeText(promo.code)
      setCopiedId(promo.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // Clipboard unavailable — ignore silently.
    }
  }

  function handleShareWhatsApp(promo) {
    const text = encodeURIComponent(buildShareMessage(promo))
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Promo Codes</h2>
      <p className="admin-note" style={{ marginBottom: '1.5rem' }}>
        Create a shareable code that unlocks one exam for a limited time, capped by a number of users.
        Share it to a WhatsApp group and friends redeem it after signing in.
      </p>

      <form onSubmit={handleSubmit} className="admin-form" style={{ marginBottom: '2.5rem' }}>
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

      <h3 className="admin-list-title">Existing Codes</h3>
      {loading ? (
        <p className="admin-loading">Loading promo codes...</p>
      ) : promos.length === 0 ? (
        <p className="admin-note">No promo codes yet. Create one above.</p>
      ) : (
        <div className="admin-list">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Exam</th>
                <th>Target Group</th>
                <th>Length</th>
                <th>Uses</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => {
                const full = promo.used_count >= promo.max_uses
                return (
                  <tr key={promo.id}>
                    <td><strong>{promo.code}</strong></td>
                    <td>{promo.exam_types?.name || '—'}</td>
                    <td>{promo.target_group}</td>
                    <td>{durationLabel(promo.duration_days)}</td>
                    <td style={{ color: full ? '#c0392b' : undefined }}>
                      {promo.used_count} / {promo.max_uses}
                    </td>
                    <td>{promo.is_active ? '✓' : '✗'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => handleCopy(promo)}
                      >
                        {copiedId === promo.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        className="admin-btn admin-btn--secondary admin-btn--sm"
                        onClick={() => handleShareWhatsApp(promo)}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        Share on WhatsApp
                      </button>
                      <button
                        className="admin-btn admin-btn--ghost admin-btn--sm"
                        onClick={() => handleToggleActive(promo)}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        {promo.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
