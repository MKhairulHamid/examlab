import React, { useEffect, useMemo, useState } from 'react'
import { getUsers } from '../../services/adminService'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString()
}

function relativeDays(d) {
  if (!d) return null
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  return fmtDate(d)
}

const labelStyle = { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(231,238,246,0.45)' }
const valueStyle = { fontSize: '0.95rem', fontWeight: 700, color: '#e7eef6' }

function Stat({ label, value, accent }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color: accent || valueStyle.color }}>{value}</div>
    </div>
  )
}

function subBadge(sub) {
  if (!sub) return { text: 'Free', color: 'rgba(231,238,246,0.6)', bg: 'rgba(255,255,255,0.08)' }
  const active = sub.status === 'active' || sub.status === 'trialing'
  return {
    text: `${sub.plan?.name || 'Plan'} · ${sub.status}`,
    color: active ? '#00D4AA' : '#ffb86b',
    bg: active ? 'rgba(0,212,170,0.12)' : 'rgba(255,184,107,0.12)',
  }
}

// Read-only admin directory of users with their account + activity data.
export default function UsersManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getUsers()
      setUsers(res.data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      (u.email || '').toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q)
    )
  }, [users, query])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div className="admin-list-title" style={{ margin: 0 }}>
          Users {!loading && <span style={{ color: 'rgba(231,238,246,0.45)', fontWeight: 500 }}>({users.length})</span>}
        </div>
        <button onClick={load} className="admin-btn admin-btn--sm admin-btn--secondary" disabled={loading}>Refresh</button>
      </div>

      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        style={{
          width: '100%', boxSizing: 'border-box', marginBottom: '1.25rem',
          padding: '0.6rem 0.85rem', borderRadius: '0.6rem',
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
          color: '#e7eef6', fontSize: '0.875rem',
        }}
      />

      {loading && <p className="admin-note">Loading users…</p>}
      {error && <p className="admin-error">{error}</p>}
      {!loading && !error && filtered.length === 0 && <p className="admin-note">No users found.</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(u => {
          const isOpen = expanded === u.id
          const badge = subBadge(u.subscription)
          const last = u.stats.last_active
          return (
            <div key={u.id} className="admin-card" style={{ padding: '1rem 1.25rem' }}>
              {/* Summary row — click to expand */}
              <div
                onClick={() => setExpanded(isOpen ? null : u.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flexWrap: 'wrap' }}
              >
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      {u.full_name || '(no name)'}
                    </span>
                    {u.is_admin && (
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00D4AA', background: 'rgba(0,212,170,0.12)', padding: '0.1rem 0.4rem', borderRadius: '0.3rem' }}>Admin</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(231,238,246,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                  </div>
                </div>

                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: badge.color, background: badge.bg, padding: '0.2rem 0.55rem', borderRadius: '0.4rem', whiteSpace: 'nowrap' }}>
                  {badge.text}
                </span>

                <div style={{ display: 'flex', gap: '1.25rem', textAlign: 'center' }}>
                  <Stat label="Exams" value={u.stats.attempts_completed} />
                  <Stat label="Best" value={u.stats.best_score != null ? `${u.stats.best_score}%` : '—'} accent={u.stats.best_score != null ? '#00D4AA' : undefined} />
                  <Stat label="Streak" value={u.streak?.current_streak ?? 0} />
                  <Stat label="Last seen" value={relativeDays(last) || '—'} />
                </div>

                <span style={{ color: 'rgba(231,238,246,0.4)', fontSize: '0.8rem', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>

                  {/* Account */}
                  <section>
                    <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Account</div>
                    <dl style={{ margin: 0, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.75rem' }}>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>User ID</dt>
                      <dd style={{ margin: 0, color: '#e7eef6', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.72rem' }}>{u.id}</dd>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Joined</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{fmtDate(u.created_at)}</dd>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>AI calls</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{u.stats.ai_calls_total}</dd>
                    </dl>
                  </section>

                  {/* Subscription */}
                  <section>
                    <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Subscription</div>
                    {u.subscription ? (
                      <dl style={{ margin: 0, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.75rem' }}>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Plan</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.subscription.plan?.name || '—'}</dd>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Status</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.subscription.status}</dd>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Renews</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{fmtDate(u.subscription.current_period_end)}</dd>
                      </dl>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(231,238,246,0.45)' }}>Free user — no subscription.</p>
                    )}
                  </section>

                  {/* Exam activity */}
                  <section>
                    <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Exam activity</div>
                    <dl style={{ margin: 0, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.75rem' }}>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Attempts</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{u.stats.attempts_total} ({u.stats.attempts_completed} done)</dd>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Passed</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{u.stats.attempts_passed}</dd>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Avg / Best</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{u.stats.avg_score != null ? `${u.stats.avg_score}%` : '—'} / {u.stats.best_score != null ? `${u.stats.best_score}%` : '—'}</dd>
                      <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Last active</dt>
                      <dd style={{ margin: 0, color: '#e7eef6' }}>{fmtDateTime(u.stats.last_active)}</dd>
                    </dl>
                  </section>

                  {/* Study */}
                  <section>
                    <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Study & streaks</div>
                    {u.streak ? (
                      <dl style={{ margin: 0, fontSize: '0.8rem', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.3rem 0.75rem' }}>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Current</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.streak.current_streak} days</dd>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Longest</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.streak.longest_streak} days</dd>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Study days</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.streak.total_study_days}</dd>
                        <dt style={{ color: 'rgba(231,238,246,0.5)' }}>Daily goal</dt>
                        <dd style={{ margin: 0, color: '#e7eef6' }}>{u.streak.daily_goal_questions} q/day</dd>
                      </dl>
                    ) : (
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(231,238,246,0.45)' }}>No streak data.</p>
                    )}
                    {u.courses.length > 0 && (
                      <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: 'rgba(231,238,246,0.7)' }}>
                        {u.courses.map(c => (
                          <div key={c.course_slug}>{c.course_slug}: <strong style={{ color: '#e7eef6' }}>{c.completed_sessions}</strong> sessions done</div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Enrollments */}
                  {u.enrollments.length > 0 && (
                    <section>
                      <div style={{ ...labelStyle, marginBottom: '0.5rem' }}>Enrollments</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(231,238,246,0.7)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {u.enrollments.map((e, i) => (
                          <div key={i}>{e.exam_type} <span style={{ color: 'rgba(231,238,246,0.4)' }}>· {fmtDate(e.enrolled_at)}</span></div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
