import React, { useState } from 'react'

const TEAL_DARK = '#00A884'
const NAVY = '#0A2540'

// Curated third-party YouTube supplement ("Related video"). Uses the YouTube
// embed API with optional start/end parameters for timeline clips. A disclaimer
// is always shown — we do not host or own this content.
//
// `showHeader` — when false, the parent supplies its own section header
//                (used inside the "Teach It" flow).
export default function VideoPanel({ videos, showHeader = true }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [playing, setPlaying] = useState(false)

  if (!videos || videos.length === 0) return null

  const v = videos[activeIdx]
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    autoplay: playing ? '1' : '0',
  })
  if (v.startSeconds != null) params.set('start', v.startSeconds)
  if (v.endSeconds != null) params.set('end', v.endSeconds)
  const embedSrc = `https://www.youtube.com/embed/${v.videoId}?${params.toString()}`
  const watchUrl = v.startSeconds != null
    ? `https://www.youtube.com/watch?v=${v.videoId}&t=${v.startSeconds}s`
    : `https://www.youtube.com/watch?v=${v.videoId}`

  return (
    <div style={{ margin: showHeader ? '1.75rem 0' : 0 }}>
      {showHeader && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          <h4 style={{
            fontSize: '0.6875rem', fontWeight: 700, color: NAVY,
            textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0,
          }}>
            Watch to reinforce
          </h4>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        </div>
      )}

      {/* Tab row — only shown if multiple videos */}
      {videos.length > 1 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
          {videos.map((vid, i) => (
            <button
              key={vid.videoId}
              onClick={() => { setActiveIdx(i); setPlaying(false) }}
              style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem',
                borderRadius: '0.4rem', cursor: 'pointer',
                background: i === activeIdx ? NAVY : 'white',
                color: i === activeIdx ? 'white' : '#64748b',
                border: `1.5px solid ${i === activeIdx ? NAVY : '#e2e8f0'}`,
              }}
            >
              {vid.title.length > 40 ? vid.title.slice(0, 40) + '…' : vid.title}
            </button>
          ))}
        </div>
      )}

      {/* Video card */}
      <div style={{
        background: 'white', borderRadius: '1rem', overflow: 'hidden',
        border: '1.5px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        {/* Embed */}
        <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#0f0f0f' }}>
          {playing ? (
            <iframe
              key={`${v.videoId}-${v.startSeconds}`}
              src={embedSrc}
              title={v.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <button
              onClick={() => setPlaying(true)}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
              aria-label={`Play ${v.title}`}
            >
              <img
                src={`https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`}
                alt={v.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* Play button overlay */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.25)',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              {/* Timeline badge */}
              {(v.startSeconds != null || v.endSeconds != null) && (
                <div style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  background: 'rgba(0,0,0,0.75)', color: 'white',
                  fontSize: '0.6875rem', fontWeight: 700, padding: '0.25rem 0.6rem',
                  borderRadius: '0.35rem', backdropFilter: 'blur(4px)',
                }}>
                  {v.startSeconds != null
                    ? `${Math.floor(v.startSeconds / 60)}:${String(v.startSeconds % 60).padStart(2, '0')}`
                    : '0:00'}
                  {' → '}
                  {v.endSeconds != null
                    ? `${Math.floor(v.endSeconds / 60)}:${String(v.endSeconds % 60).padStart(2, '0')}`
                    : 'end'}
                </div>
              )}
            </button>
          )}
        </div>

        {/* Metadata */}
        <div style={{ padding: '0.875rem 1.125rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: NAVY, margin: '0 0 0.2rem' }}>
              {v.title}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              {v.channel}
              {(v.startSeconds != null || v.endSeconds != null) && (
                <span style={{ marginLeft: '0.5rem', color: TEAL_DARK, fontWeight: 600 }}>
                  · Relevant clip only
                </span>
              )}
            </p>
          </div>
          {v.relevance && (
            <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.55, margin: '0 0 0.75rem' }}>
              {v.relevance}
            </p>
          )}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.75rem', fontWeight: 600, color: TEAL_DARK,
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            }}
          >
            Open on YouTube
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '0.6rem 1.125rem', borderTop: '1px solid #f1f5f9',
          background: '#fafbfd',
          fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.5,
        }}>
          This is a public YouTube video. CloudExamLab is not affiliated with the channel and does not host or own this content. We link to it as a free supplementary resource to support your learning.
        </div>
      </div>
    </div>
  )
}
