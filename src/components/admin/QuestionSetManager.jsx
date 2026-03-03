import React, { useState, useEffect, useCallback } from 'react'
import { getQuestionItems, upsertQuestionItems } from '../../services/adminService'

export default function QuestionSetManager({ examTypes, onRequestSetSelect }) {
  const [selectedExamTypeId, setSelectedExamTypeId] = useState('')
  const [selectedSet, setSelectedSet] = useState(null)
  const [questionSets, setQuestionSets] = useState([])
  const [questions, setQuestions] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // JSON import state
  const [importJson, setImportJson] = useState('')
  const [importError, setImportError] = useState(null)
  const [importing, setImporting] = useState(false)
  const [showImport, setShowImport] = useState(false)

  // Copy feedback
  const [copyMsg, setCopyMsg] = useState('')

  useEffect(() => {
    if (!selectedExamTypeId) {
      setQuestionSets([])
      setSelectedSet(null)
      setQuestions([])
      return
    }
    loadSets(selectedExamTypeId)
  }, [selectedExamTypeId])

  async function loadSets(examTypeId) {
    setLoading(true)
    setError(null)
    try {
      const { getQuestionSets } = await import('../../services/adminService')
      const result = await getQuestionSets(examTypeId)
      setQuestionSets(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadQuestions(setId) {
    setLoading(true)
    setError(null)
    setSelected(new Set())
    try {
      const result = await getQuestionItems(setId)
      setQuestions(result.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleSetSelect(qs) {
    setSelectedSet(qs)
    loadQuestions(qs.id)
    setShowImport(false)
    setImportJson('')
    setImportError(null)
    setSuccess(null)
  }

  // ── Selection ─────────────────────────────────────────────────────────────

  function toggleRow(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === questions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(questions.map(q => q.id)))
    }
  }

  // ── Copy to clipboard ─────────────────────────────────────────────────────

  function questionsToExportJson(qs) {
    return qs.map(q => ({
      question_number: q.question_number,
      question_text: q.question_text,
      question_type: q.question_type,
      domain: q.domain || '',
      options: q.options,
      correct_answers: q.correct_answers,
      tags: q.tags || [],
    }))
  }

  async function copyToClipboard(text, label) {
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg(`${label} copied to clipboard!`)
      setTimeout(() => setCopyMsg(''), 3000)
    } catch {
      setCopyMsg('Copy failed — please copy manually.')
    }
  }

  function handleCopyAll() {
    const json = JSON.stringify(questionsToExportJson(questions), null, 2)
    copyToClipboard(json, `All ${questions.length} questions`)
  }

  function handleCopySelected() {
    const selectedQuestions = questions.filter(q => selected.has(q.id))
    if (selectedQuestions.length === 0) {
      setCopyMsg('No questions selected.')
      setTimeout(() => setCopyMsg(''), 2000)
      return
    }
    const json = JSON.stringify(questionsToExportJson(selectedQuestions), null, 2)
    copyToClipboard(json, `${selectedQuestions.length} selected question(s)`)
  }

  // ── Import JSON ───────────────────────────────────────────────────────────

  function validateImportJson(raw) {
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      throw new Error('Invalid JSON — please check the format.')
    }
    if (!Array.isArray(parsed)) throw new Error('JSON must be an array of question objects.')
    if (parsed.length === 0) throw new Error('Array is empty.')

    for (const item of parsed) {
      if (!item.question_number) throw new Error(`Missing question_number in one of the items.`)
      if (!item.question_text) throw new Error(`Missing question_text at question_number ${item.question_number}.`)
      if (!item.question_type) throw new Error(`Missing question_type at question_number ${item.question_number}.`)
      if (!Array.isArray(item.options) || item.options.length === 0) {
        throw new Error(`options must be a non-empty array at question_number ${item.question_number}.`)
      }
      if (!Array.isArray(item.correct_answers) || item.correct_answers.length === 0) {
        throw new Error(`correct_answers must be a non-empty array at question_number ${item.question_number}.`)
      }
    }
    return parsed
  }

  async function handleImport() {
    setImportError(null)
    setSuccess(null)
    setImporting(true)

    try {
      const parsed = validateImportJson(importJson)
      const result = await upsertQuestionItems(selectedSet.id, parsed)
      setSuccess(`Saved ${result.count} questions to "${selectedSet.name}" successfully.`)
      setImportJson('')
      setShowImport(false)
      await loadQuestions(selectedSet.id)
    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  // ── Import selected questions (partial update) ────────────────────────────
  // Merges pasted JSON with non-selected existing questions, then upserts all.

  async function handleImportSelected() {
    setImportError(null)
    setSuccess(null)
    setImporting(true)

    try {
      const parsed = validateImportJson(importJson)

      // Keep existing questions that are NOT selected (not being replaced)
      const kept = questions
        .filter(q => !selected.has(q.id))
        .map(q => ({
          question_number: q.question_number,
          question_text: q.question_text,
          question_type: q.question_type,
          domain: q.domain || '',
          options: q.options,
          correct_answers: q.correct_answers,
          tags: q.tags || [],
        }))

      const merged = [...kept, ...parsed].sort(
        (a, b) => a.question_number - b.question_number
      )

      const result = await upsertQuestionItems(selectedSet.id, merged)
      setSuccess(`Updated ${parsed.length} question(s). Total: ${result.count} in "${selectedSet.name}".`)
      setImportJson('')
      setShowImport(false)
      setSelected(new Set())
      await loadQuestions(selectedSet.id)
    } catch (err) {
      setImportError(err.message)
    } finally {
      setImporting(false)
    }
  }

  const selectedExamType = examTypes.find(et => et.id === selectedExamTypeId)
  const hasSelection = selected.size > 0
  const allSelected = questions.length > 0 && selected.size === questions.length

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Manage Questions</h2>

      {/* Step 1: select exam type */}
      <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-field">
          <label>Exam Type</label>
          <select
            value={selectedExamTypeId}
            onChange={e => {
              setSelectedExamTypeId(e.target.value)
              setSelectedSet(null)
              setQuestions([])
            }}
          >
            <option value="">— choose exam type —</option>
            {examTypes.map(et => (
              <option key={et.id} value={et.id}>{et.name}</option>
            ))}
          </select>
        </div>

        {/* Step 2: select question set */}
        {selectedExamTypeId && (
          <div className="admin-field">
            <label>Question Set</label>
            {loading && !selectedSet ? (
              <p className="admin-loading">Loading sets...</p>
            ) : (
              <select
                value={selectedSet?.id || ''}
                onChange={e => {
                  const qs = questionSets.find(s => s.id === e.target.value)
                  if (qs) handleSetSelect(qs)
                }}
              >
                <option value="">— choose set —</option>
                {questionSets.map(qs => (
                  <option key={qs.id} value={qs.id}>
                    Set {qs.set_number}: {qs.name} ({qs.question_count} questions)
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {!selectedExamTypeId && (
        <p className="admin-note">Select an exam type and question set to manage questions.</p>
      )}

      {selectedSet && (
        <>
          {/* Action toolbar */}
          <div className="admin-toolbar">
            <span className="admin-toolbar-label">
              {selectedExamType?.name} / Set {selectedSet.set_number}: {selectedSet.name}
              {' '}— {questions.length} questions
              {hasSelection && ` (${selected.size} selected)`}
            </span>
            <div className="admin-toolbar-actions">
              <button
                className="admin-btn admin-btn--secondary"
                onClick={handleCopyAll}
                disabled={questions.length === 0}
              >
                Copy All JSON
              </button>
              <button
                className="admin-btn admin-btn--secondary"
                onClick={handleCopySelected}
                disabled={!hasSelection}
              >
                Copy Selected ({selected.size})
              </button>
              <button
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  setShowImport(v => !v)
                  setImportError(null)
                }}
              >
                {showImport ? 'Cancel Import' : 'Import JSON'}
              </button>
            </div>
          </div>

          {copyMsg && <p className="admin-copy-msg">{copyMsg}</p>}

          {/* Import panel */}
          {showImport && (
            <div className="admin-import-panel">
              <h3 className="admin-list-title">Import / Update Questions</h3>
              <p className="admin-note">
                Paste a JSON array of question objects below.{' '}
                {hasSelection
                  ? `"Save Selected" will replace the ${selected.size} selected question(s) with the pasted JSON while keeping the rest.`
                  : '"Save All" will replace ALL questions in this set with the pasted JSON.'}
              </p>
              <textarea
                className="admin-json-textarea"
                value={importJson}
                onChange={e => setImportJson(e.target.value)}
                rows={16}
                placeholder={`[\n  {\n    "question_number": 1,\n    "question_text": "...",\n    "question_type": "Multiple Choice",\n    "domain": "...",\n    "options": [\n      { "text": "Option A", "correct": true },\n      { "text": "Option B", "correct": false }\n    ],\n    "correct_answers": ["Option A"],\n    "tags": []\n  }\n]`}
                spellCheck={false}
              />
              {importError && <p className="admin-error">{importError}</p>}
              <div className="admin-import-actions">
                {hasSelection ? (
                  <>
                    <button
                      className="admin-btn admin-btn--primary"
                      onClick={handleImportSelected}
                      disabled={importing || !importJson.trim()}
                    >
                      {importing ? 'Saving...' : `Save — Replace ${selected.size} Selected`}
                    </button>
                    <button
                      className="admin-btn admin-btn--danger"
                      onClick={handleImport}
                      disabled={importing || !importJson.trim()}
                    >
                      {importing ? 'Saving...' : 'Save — Replace ALL Questions'}
                    </button>
                  </>
                ) : (
                  <button
                    className="admin-btn admin-btn--danger"
                    onClick={handleImport}
                    disabled={importing || !importJson.trim()}
                  >
                    {importing ? 'Saving...' : 'Save — Replace ALL Questions'}
                  </button>
                )}
              </div>
              <p className="admin-note admin-note--warning">
                "Replace ALL" deletes all existing questions and inserts the pasted JSON.
              </p>
            </div>
          )}

          {success && <p className="admin-success">{success}</p>}
          {error && <p className="admin-error">{error}</p>}

          {/* Questions table */}
          {loading ? (
            <p className="admin-loading">Loading questions...</p>
          ) : questions.length === 0 ? (
            <p className="admin-note">No questions yet. Use Import JSON to add them.</p>
          ) : (
            <table className="admin-table admin-table--questions">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      title="Select all"
                    />
                  </th>
                  <th>#</th>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Domain</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(q => (
                  <tr
                    key={q.id}
                    className={selected.has(q.id) ? 'admin-row--selected' : ''}
                    onClick={() => toggleRow(q.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(q.id)}
                        onChange={() => toggleRow(q.id)}
                      />
                    </td>
                    <td>{q.question_number}</td>
                    <td className="admin-cell--question">{q.question_text}</td>
                    <td>
                      <span className={`admin-badge ${q.question_type === 'Multiple Response' ? 'admin-badge--multi' : 'admin-badge--single'}`}>
                        {q.question_type === 'Multiple Response' ? 'Multi' : 'Single'}
                      </span>
                    </td>
                    <td>{q.domain || '—'}</td>
                    <td>{Array.isArray(q.options) ? q.options.length : '?'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  )
}
