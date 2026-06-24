import React, { useState, useEffect } from 'react'
import { getCommunityVideos, reviewCommunityVideo } from '../../services/adminService'

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'all', label: 'All' },
]

function watchUrl(v) {
  if (v.provider === 'loom') return `https://www.loom.com/share/${v.video_ref}`
  return `https://www.youtube.com/watch?v=${v.video_ref}`
}

function embedSrc(v) {
  if (v.provider === 'loom') return `https://www.loom.com/embed/${v.video_ref}`
  const params = new URLSearchParams({ rel: '0', modestbranding: '1' })
  if (v.start_seconds != null) params.set('start', v.start_seconds)
  return `https://www.youtube.com/embed/${v.video_ref}?${params.toString()}`
}

// Admin pre-moderation queue for learner-submitted "Teach It" videos.
export default function CommunityVideoReview() {
  const [status, setStatus] = useState('pending')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { load() }, [status])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getCommunityVideos(status)
      setVideos(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function act(video, newStatus) {
    let reason = null
    if (newStatus === 'rejected') {
      reason = window.prompt('Reason for rejecting (shown to the learner, optional):', '') ?? ''
    }
    setBusyId(video.id)
    try {
      await reviewCommunityVideo(video.id, newStatus, reason)
      // Drop it from the current filtered list (unless viewing "all").
      if (status === 'all') {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, status: newStatus, rejection_reason: reason } : v))
      } else {
        setVideos(prev => prev.filter(v => v.id !== video.id))
      }
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-list-title">Community Videos</div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0 0 1.25rem' }}>
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`admin-btn admin-btn--sm ${status === t.value ? 'admin-btn--primary' : 'admin-btn--secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="admin-note">Loading…</p>}
      {error && <p className="admin-error">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <p className="admin-note">No {status === 'all' ? '' : status} videos.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {videos.map(v => (
          <div key={v.id} className="admin-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
            <div style={{ position: 'relative', paddingBottom: '0', aspectRatio: '16/9', background: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <iframe
                src={embedSrc(v)}
                title={v.title}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: v.provider === 'loom' ? '#625df5' : '#cc0000' }}>{v.provider}</span>
                <StatusBadge status={v.status} />
                {v.report_count > 0 && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#b91c1c' }}>⚑ {v.report_count} report{v.report_count > 1 ? 's' : ''}</span>
                )}
              </div>

              <p style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 0.25rem', color: '#0A2540' }}>{v.title}</p>
              <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                {v.submitter_name} · {v.course_slug} / {v.session_id} · {new Date(v.created_at).toLocaleDateString()}
              </p>
              {v.note && <p style={{ fontSize: '0.8125rem', color: '#4b5563', margin: '0 0 0.5rem', lineHeight: 1.5 }}>{v.note}</p>}
              <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#00A884', fontWeight: 600 }}>Open original ↗</a>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.9rem' }}>
                {v.status !== 'approved' && (
                  <button disabled={busyId === v.id} onClick={() => act(v, 'approved')} className="admin-btn admin-btn--sm admin-btn--primary">Approve</button>
                )}
                {v.status !== 'rejected' && (
                  <button disabled={busyId === v.id} onClick={() => act(v, 'rejected')} className="admin-btn admin-btn--sm admin-btn--secondary">Reject</button>
                )}
                {v.status === 'approved' && (
                  <button disabled={busyId === v.id} onClick={() => act(v, 'hidden')} className="admin-btn admin-btn--sm admin-btn--ghost">Hide</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    pending: { c: '#b45309', b: 'rgba(245,158,11,0.15)' },
    approved: { c: '#059669', b: 'rgba(16,185,129,0.15)' },
    rejected: { c: '#b91c1c', b: 'rgba(239,68,68,0.15)' },
    hidden: { c: '#4b5563', b: 'rgba(100,116,139,0.15)' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: s.c, background: s.b, padding: '0.15rem 0.5rem', borderRadius: '0.35rem' }}>
      {status}
    </span>
  )
}
