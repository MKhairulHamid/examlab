import React, { useEffect, useState } from 'react'
import { CheckCircle, Circle, Clock, Trash2, ExternalLink } from 'lucide-react'
import { getAllNotes, updateNote, deleteNote } from '../../services/adminService'

const TYPE_META = {
  bug:         { label: 'Bug',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
  improvement: { label: 'Improve',  color: '#00D4AA', bg: 'rgba(0,212,170,0.15)' },
  question:    { label: 'Question', color: '#ffb86b', bg: 'rgba(255,184,107,0.15)' },
  other:       { label: 'Other',    color: '#a0b4c8', bg: 'rgba(160,180,200,0.15)' },
}

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ff6b6b' },
  medium: { label: 'Medium', color: '#ffb86b' },
  low:    { label: 'Low',    color: '#a0b4c8' },
}

const STATUS_OPTIONS = [
  { value: 'all',         label: 'All' },
  { value: 'open',        label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved',    label: 'Resolved' },
]

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function StatusPill({ status, onChange }) {
  const options = [
    { value: 'open',        Icon: Circle,      label: 'Open',        color: '#ffb86b' },
    { value: 'in_progress', Icon: Clock,       label: 'In Progress', color: '#00D4AA' },
    { value: 'resolved',    Icon: CheckCircle, label: 'Resolved',    color: 'rgba(231,238,246,0.35)' },
  ]
  const cur = options.find(o => o.value === status) || options[0]
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '0.2rem 0.5rem',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 5,
          color: cur.color,
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <cur.Icon size={11} />
        {cur.label}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          zIndex: 10,
          background: '#0d2d4a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6,
          overflow: 'hidden',
          minWidth: 130,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}>
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '0.45rem 0.75rem',
                background: o.value === status ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                color: o.color,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <o.Icon size={12} />
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminNotesManager() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('open')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getAllNotes()
      setNotes(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      const res = await updateNote(id, { status })
      setNotes(prev => prev.map(n => n.id === id ? res.data : n))
    } catch (err) {
      alert('Failed to update: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    try {
      await deleteNote(id)
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  const filtered = notes.filter(n => {
    if (statusFilter !== 'all' && n.status !== statusFilter) return false
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    return true
  })

  // Group by page_path
  const grouped = filtered.reduce((acc, n) => {
    const key = n.page_path
    if (!acc[key]) acc[key] = []
    acc[key].push(n)
    return acc
  }, {})

  const counts = {
    open: notes.filter(n => n.status === 'open').length,
    in_progress: notes.filter(n => n.status === 'in_progress').length,
    resolved: notes.filter(n => n.status === 'resolved').length,
  }

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(231,238,246,0.4)', fontSize: '0.875rem' }}>
      Loading notes…
    </div>
  )

  if (error) return (
    <div style={{ padding: '2rem', color: '#ff6b6b', fontSize: '0.875rem' }}>
      Error: {error}
    </div>
  )

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Open', count: counts.open, color: '#ffb86b' },
          { label: 'In Progress', count: counts.in_progress, color: '#00D4AA' },
          { label: 'Resolved', count: counts.resolved, color: 'rgba(231,238,246,0.35)' },
        ].map(c => (
          <div key={c.label} style={{
            flex: '1 1 100px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color }}>{c.count}</div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(231,238,246,0.45)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.04)', borderRadius: 7, padding: 3 }}>
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              style={{
                padding: '0.3rem 0.7rem',
                borderRadius: 5,
                border: 'none',
                background: statusFilter === o.value ? 'rgba(0,212,170,0.2)' : 'transparent',
                color: statusFilter === o.value ? '#00D4AA' : 'rgba(231,238,246,0.5)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6,
            color: '#e7eef6',
            fontSize: '0.75rem',
            padding: '0.35rem 0.6rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="all">All types</option>
          {Object.entries(TYPE_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <span style={{ fontSize: '0.72rem', color: 'rgba(231,238,246,0.35)', marginLeft: 'auto' }}>
          {filtered.length} note{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grouped by page */}
      {Object.keys(grouped).length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(231,238,246,0.3)', fontSize: '0.875rem' }}>
          No notes match this filter.
        </div>
      ) : (
        Object.entries(grouped)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([pagePath, pageNotes]) => (
            <div key={pagePath} style={{ marginBottom: '1.25rem' }}>
              {/* Page header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(0,212,170,0.06)',
                border: '1px solid rgba(0,212,170,0.15)',
                borderRadius: '8px 8px 0 0',
              }}>
                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#00D4AA', fontFamily: 'monospace' }}>
                  {pagePath}
                </span>
                <a
                  href={pagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'rgba(0,212,170,0.5)', display: 'flex' }}
                >
                  <ExternalLink size={12} />
                </a>
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'rgba(231,238,246,0.35)' }}>
                  {pageNotes.length} note{pageNotes.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Notes for this page */}
              <div style={{
                border: '1px solid rgba(255,255,255,0.07)',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
              }}>
                {pageNotes.map((n, idx) => {
                  const tm = TYPE_META[n.type] || TYPE_META.other
                  const pm = PRIORITY_META[n.priority] || PRIORITY_META.medium
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: '0.75rem 1rem',
                        borderBottom: idx < pageNotes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        background: n.status === 'resolved' ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                        opacity: n.status === 'resolved' ? 0.6 : 1,
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '0.5rem',
                        alignItems: 'start',
                      }}
                    >
                      <div>
                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: tm.color, background: tm.bg, borderRadius: 4, padding: '1px 5px' }}>
                            {tm.label}
                          </span>
                          <span style={{ fontSize: '0.62rem', fontWeight: 600, color: pm.color, background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '1px 5px' }}>
                            {pm.label}
                          </span>
                          <span style={{ fontSize: '0.62rem', color: 'rgba(231,238,246,0.3)', padding: '1px 0' }}>
                            {fmtDate(n.created_at)}
                          </span>
                        </div>
                        {/* Note text */}
                        <div style={{ fontSize: '0.82rem', color: '#e7eef6', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {n.note}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-end' }}>
                        <StatusPill status={n.status} onChange={s => handleStatusChange(n.id, s)} />
                        <button
                          onClick={() => handleDelete(n.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            padding: '0.2rem 0.45rem',
                            background: 'rgba(255,107,107,0.08)',
                            border: '1px solid rgba(255,107,107,0.2)',
                            borderRadius: 4,
                            color: '#ff6b6b',
                            fontSize: '0.68rem',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={10} />
                          Del
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
      )}
    </div>
  )
}
