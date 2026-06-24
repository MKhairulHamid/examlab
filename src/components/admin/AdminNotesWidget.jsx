import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Pencil, X, Plus, ChevronDown, Trash2, CheckCircle, Circle, Clock } from 'lucide-react'
import useAuthStore from '../../stores/authStore'
import { pingAdmin, getNotes, createNote, updateNote, deleteNote } from '../../services/adminService'

const TYPE_META = {
  bug:         { label: 'Bug',         color: '#ff6b6b', bg: 'rgba(255,107,107,0.15)' },
  improvement: { label: 'Improve',     color: '#00D4AA', bg: 'rgba(0,212,170,0.15)' },
  question:    { label: 'Question',    color: '#ffb86b', bg: 'rgba(255,184,107,0.15)' },
  other:       { label: 'Other',       color: '#a0b4c8', bg: 'rgba(160,180,200,0.15)' },
}

const PRIORITY_META = {
  high:   { label: 'High',   color: '#ff6b6b' },
  medium: { label: 'Medium', color: '#ffb86b' },
  low:    { label: 'Low',    color: '#a0b4c8' },
}

const STATUS_META = {
  open:        { Icon: Circle,      label: 'Open',        color: '#ffb86b' },
  in_progress: { Icon: Clock,       label: 'In Progress', color: '#00D4AA' },
  resolved:    { Icon: CheckCircle, label: 'Resolved',    color: '#a0b4c8' },
}

function pageTitle(path) {
  if (path === '/') return 'Home'
  const seg = path.split('/').filter(Boolean)
  return seg.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' / ')
}

export default function AdminNotesWidget() {
  const { user, profile } = useAuthStore()
  const location = useLocation()

  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const [form, setForm] = useState({ note: '', type: 'bug', priority: 'medium' })

  const drawerRef = useRef(null)
  const path = location.pathname

  // Check admin once per session — only ping the admin API for users
  // whose profile is flagged as admin, so regular users never hit the
  // endpoint (which would 403 and log a console error).
  useEffect(() => {
    if (!user || !profile?.is_admin) {
      setIsAdmin(false)
      return
    }
    pingAdmin().then(setIsAdmin)
  }, [user, profile?.is_admin])

  // Load notes whenever drawer opens or path changes while open
  useEffect(() => {
    if (open && isAdmin) loadNotes()
  }, [open, path, isAdmin])

  // Close drawer when navigating
  useEffect(() => {
    setOpen(false)
    setAdding(false)
    setExpandedId(null)
  }, [path])

  // Click-outside to close
  useEffect(() => {
    if (!open) return
    function handle(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        const btn = document.getElementById('admin-notes-fab')
        if (btn && btn.contains(e.target)) return
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  async function loadNotes() {
    setLoading(true)
    try {
      const res = await getNotes(path)
      setNotes(res.data || [])
    } catch {
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd() {
    if (!form.note.trim()) return
    setSaving(true)
    try {
      const res = await createNote({
        page_path: path,
        page_title: pageTitle(path),
        note: form.note.trim(),
        type: form.type,
        priority: form.priority,
      })
      setNotes(prev => [res.data, ...prev])
      setForm({ note: '', type: 'bug', priority: 'medium' })
      setAdding(false)
    } catch (err) {
      alert('Failed to save note: ' + err.message)
    } finally {
      setSaving(false)
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
      if (expandedId === id) setExpandedId(null)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  if (!isAdmin) return null

  const openNotes = notes.filter(n => n.status !== 'resolved')
  const hasNotes = notes.length > 0

  return (
    <>
      {/* FAB */}
      <button
        id="admin-notes-fab"
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9000,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: open ? '#00D4AA' : '#0A2540',
          border: '2px solid #00D4AA',
          color: open ? '#0A2540' : '#00D4AA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,212,170,0.35)',
          transition: 'all 0.15s ease',
        }}
        title="Admin notes"
      >
        {open ? <X size={18} strokeWidth={2.5} /> : <Pencil size={17} strokeWidth={2.5} />}
        {!open && openNotes.length > 0 && (
          <span style={{
            position: 'absolute',
            top: -6,
            right: -6,
            background: '#ff6b6b',
            color: '#fff',
            borderRadius: '50%',
            width: 18,
            height: 18,
            fontSize: '0.65rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {openNotes.length > 9 ? '9+' : openNotes.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div
          ref={drawerRef}
          style={{
            position: 'fixed',
            bottom: '5rem',
            right: '1.5rem',
            zIndex: 8999,
            width: 340,
            maxHeight: 'calc(100vh - 7rem)',
            background: '#0d2d4a',
            border: '1px solid rgba(0,212,170,0.25)',
            borderRadius: 12,
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00D4AA', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Admin Notes
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(231,238,246,0.55)', marginTop: 2 }}>{path}</div>
            </div>
            <button
              onClick={() => { setAdding(true); setExpandedId(null) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '0.3rem 0.6rem',
                background: 'rgba(0,212,170,0.15)',
                border: '1px solid rgba(0,212,170,0.35)',
                borderRadius: 6,
                color: '#00D4AA',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Add
            </button>
          </div>

          {/* Add form */}
          {adding && (
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,212,170,0.05)' }}>
              <textarea
                autoFocus
                placeholder="Describe the issue or improvement..."
                value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                rows={3}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  color: '#e5e7eb',
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={selectStyle}
                >
                  {Object.entries(TYPE_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <select
                  value={form.priority}
                  onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                  style={selectStyle}
                >
                  {Object.entries(PRIORITY_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={handleAdd} disabled={saving || !form.note.trim()} style={primaryBtnStyle}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setAdding(false); setForm({ note: '', type: 'bug', priority: 'medium' }) }} style={ghostBtnStyle}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notes list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(231,238,246,0.4)', fontSize: '0.8rem' }}>
                Loading…
              </div>
            )}
            {!loading && notes.length === 0 && !adding && (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'rgba(231,238,246,0.35)', fontSize: '0.8rem' }}>
                No notes for this page yet.
                <br />
                <span style={{ fontSize: '0.75rem' }}>Click <strong>+ Add</strong> to create one.</span>
              </div>
            )}
            {!loading && notes.map(n => {
              const tm = TYPE_META[n.type] || TYPE_META.other
              const pm = PRIORITY_META[n.priority] || PRIORITY_META.medium
              const sm = STATUS_META[n.status] || STATUS_META.open
              const isExpanded = expandedId === n.id
              return (
                <div
                  key={n.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    opacity: n.status === 'resolved' ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div
                    style={{ padding: '0.65rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
                    onClick={() => setExpandedId(isExpanded ? null : n.id)}
                  >
                    {/* Type badge */}
                    <span style={{
                      flexShrink: 0,
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: tm.color,
                      background: tm.bg,
                      borderRadius: 4,
                      padding: '2px 5px',
                      marginTop: 1,
                    }}>
                      {tm.label}
                    </span>

                    {/* Note text */}
                    <span style={{
                      flex: 1,
                      fontSize: '0.8rem',
                      color: '#e5e7eb',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: isExpanded ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: isExpanded ? 'visible' : 'hidden',
                    }}>
                      {n.note}
                    </span>

                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      style={{ flexShrink: 0, color: 'rgba(231,238,246,0.3)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', marginTop: 3 }}
                    />
                  </div>

                  {isExpanded && (
                    <div style={{ padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <sm.Icon size={12} style={{ color: sm.color }} />
                        <span style={{ fontSize: '0.7rem', color: sm.color }}>{sm.label}</span>
                        <span style={{ fontSize: '0.7rem', color: pm.color }}>· {pm.label} priority</span>
                        <span style={{ fontSize: '0.7rem', color: 'rgba(231,238,246,0.3)' }}>
                          · {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {n.status !== 'in_progress' && (
                          <button onClick={() => handleStatusChange(n.id, 'in_progress')} style={microBtnStyle('#ffb86b')}>
                            In Progress
                          </button>
                        )}
                        {n.status !== 'resolved' && (
                          <button onClick={() => handleStatusChange(n.id, 'resolved')} style={microBtnStyle('#00D4AA')}>
                            Resolve
                          </button>
                        )}
                        {n.status === 'resolved' && (
                          <button onClick={() => handleStatusChange(n.id, 'open')} style={microBtnStyle('#ffb86b')}>
                            Reopen
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          style={{ ...microBtnStyle('#ff6b6b'), marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}
                        >
                          <Trash2 size={11} />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer */}
          {hasNotes && (
            <div style={{ padding: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: 'rgba(231,238,246,0.35)', display: 'flex', justifyContent: 'space-between' }}>
              <span>{notes.length} note{notes.length !== 1 ? 's' : ''} on this page</span>
              <a href="/admin" style={{ color: '#00D4AA', textDecoration: 'none' }}>View all →</a>
            </div>
          )}
        </div>
      )}
    </>
  )
}

const selectStyle = {
  flex: 1,
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 5,
  color: '#e5e7eb',
  fontSize: '0.75rem',
  padding: '0.3rem 0.4rem',
  cursor: 'pointer',
  outline: 'none',
}

const primaryBtnStyle = {
  flex: 1,
  padding: '0.35rem 0.75rem',
  background: '#00D4AA',
  border: 'none',
  borderRadius: 6,
  color: '#0A2540',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
}

const ghostBtnStyle = {
  padding: '0.35rem 0.75rem',
  background: 'transparent',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  color: 'rgba(231,238,246,0.6)',
  fontSize: '0.75rem',
  cursor: 'pointer',
}

function microBtnStyle(color) {
  return {
    padding: '0.2rem 0.5rem',
    background: `${color}18`,
    border: `1px solid ${color}40`,
    borderRadius: 4,
    color,
    fontSize: '0.7rem',
    fontWeight: 600,
    cursor: 'pointer',
  }
}
