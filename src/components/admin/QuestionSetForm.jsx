import React, { useState, useEffect } from 'react'
import { getQuestionSets, createQuestionSet, updateQuestionSet } from '../../services/adminService'

const EMPTY_FORM = {
  name: '',
  description: '',
  set_number: '',
  price_cents: '0',
  is_free_sample: false,
  sample_question_count: '0',
  is_active: true,
}

export default function QuestionSetForm({ examTypes, onSetCreated, onSetSelect }) {
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('')
  const [questionSets, setQuestionSets] = useState([])
  const [loadingSets, setLoadingSets] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (!selectedExamTypeId) {
      setQuestionSets([])
      return
    }
    loadSets(selectedExamTypeId)
  }, [selectedExamTypeId])

  async function loadSets(examTypeId) {
    setLoadingSets(true)
    try {
      const result = await getQuestionSets(examTypeId)
      setQuestionSets(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingSets(false)
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedExamTypeId) {
      setError('Please select an exam type first.')
      return
    }
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const payload = {
        exam_type_id: selectedExamTypeId,
        name: form.name.trim(),
        description: form.description.trim() || null,
        set_number: parseInt(form.set_number),
        price_cents: parseInt(form.price_cents) || 0,
        is_free_sample: form.is_free_sample,
        sample_question_count: parseInt(form.sample_question_count) || 0,
        is_active: form.is_active,
      }

      const result = await createQuestionSet(payload)
      setSuccess(`Question set "${result.data.name}" created.`)
      setForm(EMPTY_FORM)
      await loadSets(selectedExamTypeId)
      if (onSetCreated) onSetCreated(result.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(set) {
    try {
      await updateQuestionSet(set.id, { is_active: !set.is_active })
      await loadSets(selectedExamTypeId)
    } catch (err) {
      setError(err.message)
    }
  }

  const selectedExamType = examTypes.find(et => et.id === selectedExamTypeId)
  const usedSetNumbers = questionSets.map(s => s.set_number)
  const availableNumbers = [1, 2, 3, 4, 5].filter(n => !usedSetNumbers.includes(n))

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Question Sets</h2>

      <div className="admin-field" style={{ marginBottom: '1.5rem' }}>
        <label>Select Exam Type</label>
        <select
          value={selectedExamTypeId}
          onChange={e => setSelectedExamTypeId(e.target.value)}
        >
          <option value="">— choose exam type —</option>
          {examTypes.map(et => (
            <option key={et.id} value={et.id}>{et.name}</option>
          ))}
        </select>
      </div>

      {selectedExamTypeId && (
        <>
          {loadingSets ? (
            <p className="admin-loading">Loading question sets...</p>
          ) : (
            <>
              {questionSets.length > 0 && (
                <div className="admin-list" style={{ marginBottom: '2rem' }}>
                  <h3 className="admin-list-title">
                    Existing Sets — {selectedExamType?.name}
                  </h3>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Questions</th>
                        <th>Price</th>
                        <th>Free Sample</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionSets.map(qs => (
                        <tr key={qs.id}>
                          <td>{qs.set_number}</td>
                          <td>{qs.name}</td>
                          <td>{qs.question_count}</td>
                          <td>{qs.price_cents ? `$${(qs.price_cents / 100).toFixed(2)}` : 'Free'}</td>
                          <td>{qs.is_free_sample ? '✓' : '—'}</td>
                          <td>{qs.is_active ? '✓' : '✗'}</td>
                          <td>
                            <button
                              className="admin-btn admin-btn--ghost admin-btn--sm"
                              onClick={() => handleToggleActive(qs)}
                            >
                              {qs.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            {onSetSelect && (
                              <button
                                className="admin-btn admin-btn--secondary admin-btn--sm"
                                onClick={() => onSetSelect(qs, selectedExamType)}
                                style={{ marginLeft: '0.5rem' }}
                              >
                                Manage Questions
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <h3 className="admin-list-title">
                Add New Set{selectedExamType ? ` to ${selectedExamType.name}` : ''}
              </h3>

              {availableNumbers.length === 0 ? (
                <p className="admin-note">All 5 set slots are used for this exam type.</p>
              ) : (
                <form onSubmit={handleSubmit} className="admin-form">
                  <div className="admin-form-grid">
                    <div className="admin-field">
                      <label>Set Number * (1–5)</label>
                      <select
                        name="set_number"
                        value={form.set_number}
                        onChange={handleChange}
                        required
                      >
                        <option value="">— select —</option>
                        {availableNumbers.map(n => (
                          <option key={n} value={n}>Set {n}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-field">
                      <label>Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Practice Set 1"
                        required
                      />
                    </div>

                    <div className="admin-field admin-field--full">
                      <label>Description</label>
                      <input
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Price (cents, 0 = free)</label>
                      <input
                        name="price_cents"
                        type="number"
                        min="0"
                        value={form.price_cents}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>

                    <div className="admin-field">
                      <label>Sample Question Count</label>
                      <input
                        name="sample_question_count"
                        type="number"
                        min="0"
                        value={form.sample_question_count}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>

                    <div className="admin-field admin-field--checkbox">
                      <label>
                        <input
                          name="is_free_sample"
                          type="checkbox"
                          checked={form.is_free_sample}
                          onChange={handleChange}
                        />
                        Free Sample Set
                      </label>
                    </div>

                    <div className="admin-field admin-field--checkbox">
                      <label>
                        <input
                          name="is_active"
                          type="checkbox"
                          checked={form.is_active}
                          onChange={handleChange}
                        />
                        Active
                      </label>
                    </div>
                  </div>

                  {error && <p className="admin-error">{error}</p>}
                  {success && <p className="admin-success">{success}</p>}

                  <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Question Set'}
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}

      {!selectedExamTypeId && (
        <p className="admin-note">Select an exam type above to manage its question sets.</p>
      )}
    </div>
  )
}
