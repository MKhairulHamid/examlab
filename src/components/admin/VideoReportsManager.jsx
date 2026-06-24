import React, { useState, useEffect } from 'react'
import { getCommunityVideoReports, resolveReport } from '../../services/adminService'

const STATUS_TABS = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: 'all', label: 'All' },
]

const REASON_LABELS = {
  inappropriate: 'Inappropriate / offensive',
  wrong_topic: 'Off-topic',
  poor_quality: 'Misleading / incorrect',
  copyright: 'Copyright',
  spam: 'Spam / advertising',
  other: 'Other',
}

function watchUrl(v) {
  if (!v) return '#'
  if (v.provider === 'loom') return `https://www.loom.com/share/${v.video_ref}`
  return `https://www.youtube.com/watch?v=${v.video_ref}`
}

// Admin queue of reports filed against community videos.
export default function VideoReportsManager() {
  const [status, setStatus] = useState('open')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  useEffect(() => { load() }, [status])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getCommunityVideoReports(status)
      setReports(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function resolve(report, newStatus, videoAction) {
    let rejectionReason = null
    if (videoAction === 'rejected') {
      rejectionReason = window.prompt('Reason for rejecting the video (shown to learner, optional):', '') ?? ''
    }
    setBusyId(report.id)
    try {
      await resolveReport(report.id, newStatus, {
        videoId: videoAction ? report.video_id : undefined,
        videoAction,
        rejectionReason,
      })
      if (status === 'all') load()
      else setReports(prev => prev.filter(r => r.id !== report.id))
    } catch (e) {
      alert('Failed: ' + e.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-list-title">Video Reports</div>

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
      {!loading && !error && reports.length === 0 && (
        <p className="admin-note">No {status === 'all' ? '' : status} reports.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {reports.map(r => {
          const v = r.video
          return (
            <div key={r.id} className="admin-card">
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#b91c1c', background: 'rgba(239,68,68,0.12)', padding: '0.15rem 0.5rem', borderRadius: '0.35rem' }}>
                  {REASON_LABELS[r.reason] || r.reason}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(r.created_at).toLocaleString()}</span>
                {v && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>· video is "{v.status}" · ⚑ {v.report_count}</span>}
              </div>

              {r.detail && <p style={{ fontSize: '0.875rem', color: '#1f2937', margin: '0 0 0.5rem', lineHeight: 1.5 }}>"{r.detail}"</p>}

              {v ? (
                <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.75rem' }}>
                  <strong style={{ color: '#0A2540' }}>{v.title}</strong> by {v.submitter_name} · {v.course_slug} / {v.session_id} ·{' '}
                  <a href={watchUrl(v)} target="_blank" rel="noopener noreferrer" style={{ color: '#00A884', fontWeight: 600 }}>Open ↗</a>
                </p>
              ) : (
                <p style={{ fontSize: '0.8125rem', color: '#9ca3af', margin: '0 0 0.75rem' }}>(video was deleted)</p>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {v && (
                  <>
                    <button disabled={busyId === r.id} onClick={() => resolve(r, 'resolved', 'hidden')} className="admin-btn admin-btn--sm admin-btn--secondary">Hide video & resolve</button>
                    <button disabled={busyId === r.id} onClick={() => resolve(r, 'resolved', 'rejected')} className="admin-btn admin-btn--sm admin-btn--secondary">Reject video & resolve</button>
                  </>
                )}
                <button disabled={busyId === r.id} onClick={() => resolve(r, 'dismissed')} className="admin-btn admin-btn--sm admin-btn--ghost">Dismiss (keep video)</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
