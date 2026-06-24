import React, { useState } from 'react'
import { reportVideo } from '../../services/communityVideoService'

const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate or offensive' },
  { value: 'wrong_topic', label: 'Off-topic / not about this session' },
  { value: 'poor_quality', label: 'Misleading or incorrect content' },
  { value: 'copyright', label: 'Copyright / not their own work' },
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'other', label: 'Something else' },
]

function embedSrcFor(v) {
  if (v.provider === 'loom') {
    return `https://www.loom.com/embed/${v.video_ref}`
  }
  const params = new URLSearchParams({ rel: '0', modestbranding: '1', autoplay: '1' })
  if (v.start_seconds != null) params.set('start', v.start_seconds)
  return `https://www.youtube.com/embed/${v.video_ref}?${params.toString()}`
}

function thumbFor(v) {
  if (v.provider === 'youtube') return `https://img.youtube.com/vi/${v.video_ref}/hqdefault.jpg`
  return null // Loom has no public thumbnail URL — show a branded placeholder
}

// Learner-submitted "teach it" videos for a session. Provider-aware embed
// (YouTube or Loom), submitter attribution, and a Report button per video.
export default function CommunityVideoPanel({ videos, currentUserId }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [reportFor, setReportFor] = useState(null) // video being reported

  if (!videos || videos.length === 0) return null
  const v = videos[activeIdx]
  const thumb = thumbFor(v)

  return (
    <div>
      <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.55, margin: '0 0 1rem' }}>
        Explanations recorded by fellow learners. Teaching a concept is one of the most effective ways to
        lock it in — watch a peer, then try recording your own below.
      </p>

      {/* Tab row — only shown if multiple videos */}
      {videos.length > 1 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          {videos.map((vid, i) => (
            <button
              key={vid.id}
              onClick={() => { setActiveIdx(i); setPlaying(false) }}
              style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem',
                borderRadius: '0.4rem', cursor: 'pointer',
                background: i === activeIdx ? NAVY : 'white',
                color: i === activeIdx ? 'white' : '#6b7280',
                border: `1.5px solid ${i === activeIdx ? NAVY : '#e5e7eb'}`,
              }}
            >
              {vid.submitter_name}
            </button>
          ))}
        </div>
      )}

      {/* Video card */}
      <div style={{
        background: 'white', borderRadius: '1rem', overflow: 'hidden',
        border: '1.5px solid #e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0f0f0f' }}>
          {playing ? (
            <iframe
              key={v.id}
              src={embedSrcFor(v)}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              aria-label={`Play ${v.title}`}
            >
              {thumb ? (
                <img src={thumb} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #625df5, #4b46d4)' }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.05em' }}>Loom</span>
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: '0.875rem 1.125rem' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: NAVY, margin: '0 0 0.2rem' }}>{v.title}</p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
            Taught by {v.submitter_name}
            <span style={{ marginLeft: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, color: v.provider === 'loom' ? '#625df5' : '#cc0000' }}>
              · {v.provider}
            </span>
          </p>
          {v.note && (
            <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.55, margin: '0.6rem 0 0' }}>{v.note}</p>
          )}
        </div>

        {/* Footer: report */}
        <div style={{ padding: '0.6rem 1.125rem', borderTop: '1px solid #f3f4f6', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.6875rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Submitted by a learner and reviewed by our team. CloudExamLab does not host this video.
          </span>
          <button
            onClick={() => setReportFor(v)}
            style={{ flexShrink: 0, fontSize: '0.6875rem', fontWeight: 700, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
          >
            Report
          </button>
        </div>
      </div>

      {reportFor && (
        <ReportModal
          video={reportFor}
          currentUserId={currentUserId}
          onClose={() => setReportFor(null)}
        />
      )}
    </div>
  )
}

function ReportModal({ video, currentUserId, onClose }) {
  const [reason, setReason] = useState('inappropriate')
  const [detail, setDetail] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [errMsg, setErrMsg] = useState('')

  async function submit() {
    setStatus('sending')
    setErrMsg('')
    try {
      await reportVideo({ videoId: video.id, reporterId: currentUserId, reason, detail })
      setStatus('done')
    } catch (e) {
      setErrMsg(e.message)
      setStatus('error')
    }
  }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(10,37,64,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: '1rem', maxWidth: '440px', width: '100%', padding: '1.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
      >
        {status === 'done' ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: NAVY, margin: '0 0 0.5rem' }}>Thanks for the report</p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
              Our team will review this video. If enough learners report it, it is hidden automatically until we re-check it.
            </p>
            <button onClick={onClose} style={primaryBtn}>Done</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '1rem', fontWeight: 800, color: NAVY, margin: '0 0 0.25rem' }}>Report this video</p>
            <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 1rem', lineHeight: 1.55 }}>
              Tell us what's wrong with "{video.title}". Reports are private.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
              {REPORT_REASONS.map(r => (
                <label key={r.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', color: '#1f2937', cursor: 'pointer' }}>
                  <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="Add any detail (optional)"
              rows={3}
              style={{ width: '100%', boxSizing: 'border-box', borderRadius: '0.6rem', border: '1.5px solid #e5e7eb', padding: '0.6rem 0.75rem', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '0.75rem' }}
            />

            {status === 'error' && (
              <p style={{ fontSize: '0.8125rem', color: '#dc2626', margin: '0 0 0.75rem' }}>{errMsg}</p>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={secondaryBtn}>Cancel</button>
              <button onClick={submit} disabled={status === 'sending'} style={{ ...primaryBtn, opacity: status === 'sending' ? 0.6 : 1 }}>
                {status === 'sending' ? 'Sending…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const primaryBtn = {
  padding: '0.55rem 1.25rem', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.875rem',
  cursor: 'pointer', background: NAVY, color: 'white', border: 'none',
}
const secondaryBtn = {
  padding: '0.55rem 1.25rem', borderRadius: '0.6rem', fontWeight: 700, fontSize: '0.875rem',
  cursor: 'pointer', background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb',
}
