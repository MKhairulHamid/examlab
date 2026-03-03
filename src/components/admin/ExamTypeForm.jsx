import React, { useState } from 'react'
import { createExamType } from '../../services/adminService'

const EMPTY_FORM = {
  name: '',
  slug: '',
  provider: '',
  description: '',
  icon: '',
  total_questions: '',
  duration_minutes: '',
  passing_score: '',
  max_score: '1000',
  display_order: '0',
  is_active: true,
}

export default function ExamTypeForm({ examTypes, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function autoSlug(e) {
    if (form.slug) return
    const slug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    setForm(prev => ({ ...prev, slug }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        provider: form.provider.trim(),
        description: form.description.trim() || null,
        icon: form.icon.trim() || null,
        total_questions: form.total_questions ? parseInt(form.total_questions) : null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        passing_score: form.passing_score ? parseInt(form.passing_score) : null,
        max_score: form.max_score ? parseInt(form.max_score) : 1000,
        display_order: form.display_order ? parseInt(form.display_order) : 0,
        is_active: form.is_active,
      }

      const result = await createExamType(payload)
      setSuccess(`Exam type "${result.data.name}" created successfully.`)
      setForm(EMPTY_FORM)
      if (onCreated) onCreated(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Add Exam Type</h2>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-grid">
          <div className="admin-field">
            <label>Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={autoSlug}
              placeholder="AWS Developer Associate"
              required
            />
          </div>

          <div className="admin-field">
            <label>Slug *</label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              placeholder="aws-developer-associate"
              required
            />
          </div>

          <div className="admin-field">
            <label>Provider *</label>
            <input
              name="provider"
              value={form.provider}
              onChange={handleChange}
              placeholder="AWS"
              required
            />
          </div>

          <div className="admin-field">
            <label>Icon (emoji or URL)</label>
            <input
              name="icon"
              value={form.icon}
              onChange={handleChange}
              placeholder="☁️"
            />
          </div>

          <div className="admin-field admin-field--full">
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Brief description of this certification exam"
            />
          </div>

          <div className="admin-field">
            <label>Total Questions</label>
            <input
              name="total_questions"
              type="number"
              min="1"
              value={form.total_questions}
              onChange={handleChange}
              placeholder="65"
            />
          </div>

          <div className="admin-field">
            <label>Duration (minutes)</label>
            <input
              name="duration_minutes"
              type="number"
              min="1"
              value={form.duration_minutes}
              onChange={handleChange}
              placeholder="130"
            />
          </div>

          <div className="admin-field">
            <label>Passing Score</label>
            <input
              name="passing_score"
              type="number"
              min="0"
              value={form.passing_score}
              onChange={handleChange}
              placeholder="720"
            />
          </div>

          <div className="admin-field">
            <label>Max Score</label>
            <input
              name="max_score"
              type="number"
              min="1"
              value={form.max_score}
              onChange={handleChange}
              placeholder="1000"
            />
          </div>

          <div className="admin-field">
            <label>Display Order</label>
            <input
              name="display_order"
              type="number"
              min="0"
              value={form.display_order}
              onChange={handleChange}
              placeholder="0"
            />
          </div>

          <div className="admin-field admin-field--checkbox">
            <label>
              <input
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={handleChange}
              />
              Active (visible to users)
            </label>
          </div>
        </div>

        {error && <p className="admin-error">{error}</p>}
        {success && <p className="admin-success">{success}</p>}

        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Creating...' : 'Create Exam Type'}
        </button>
      </form>

      {examTypes && examTypes.length > 0 && (
        <div className="admin-list">
          <h3 className="admin-list-title">Existing Exam Types</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Provider</th>
                <th>Questions</th>
                <th>Active</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {examTypes.map(et => (
                <tr key={et.id}>
                  <td>{et.name}</td>
                  <td><code>{et.slug}</code></td>
                  <td>{et.provider}</td>
                  <td>{et.total_questions ?? '—'}</td>
                  <td>{et.is_active ? '✓' : '✗'}</td>
                  <td>{et.display_order}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
