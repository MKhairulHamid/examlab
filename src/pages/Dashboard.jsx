import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import DashboardHeader from '../components/layout/DashboardHeader'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import streakService from '../services/streakService'
import certificateService, { buildVerifyPath } from '../services/certificateService'
import CertificateCard from '../components/certificate/CertificateCard'
import { getProgram } from '../data/programs'
import supabase from '../services/supabase'
import { Button, Card, Badge, Container, SectionHeader } from '../design-system'
import {
  BookOpen, ClipboardList, CheckCircle2, CalendarDays, BarChart2,
  Flame, BrainCircuit, Sparkles, Target, ShieldCheck, Lock,
} from 'lucide-react'
import aifC01Course from '../data/aifC01Course'

const DOMAIN_META = [
  { id: 'd1', label: 'Fundamentals of AI & ML',          weight: '20%', color: '#0EA5E9', Icon: BrainCircuit },
  { id: 'd2', label: 'Fundamentals of Generative AI',     weight: '24%', color: '#8B5CF6', Icon: Sparkles },
  { id: 'd3', label: 'Applications of Foundation Models', weight: '28%', color: '#00D4AA', Icon: Target },
  { id: 'd4', label: 'Guidelines for Responsible AI',     weight: '14%', color: '#F59E0B', Icon: ShieldCheck },
  { id: 'd5', label: 'Security, Compliance & Governance', weight: '14%', color: '#EF4444', Icon: Lock },
]

function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()
  const { isSubscribed, fetchSubscription, fetchEnrollments, fetchPromoAccess, hasExamAccess } = usePurchaseStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [streakStats, setStreakStats] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [examDates, setExamDates] = useState([])
  const [showExamDateModal, setShowExamDateModal] = useState(false)
  const [selectedExamForDate, setSelectedExamForDate] = useState(null)
  const [certificates, setCertificates] = useState([])
  const allExamsRef = useRef(null)

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student'

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchSubscription(user.id)
      fetchEnrollments(user.id)
      fetchPromoAccess(user.id)
      initializeStreak()
      loadExamResults()
      loadExamDates()
      certificateService.listMine().then(setCertificates)
    }
  }, [user])

  const loadExamResults = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`*, question_sets(name, exam_type_id, exam_types(name, slug))`)
        .eq('user_id', user.id).eq('status', 'completed')
        .order('completed_at', { ascending: false }).limit(10)
      if (error) throw error
      setExamResults((data || []).map(r => ({
        id: r.id, userId: r.user_id, questionSetId: r.question_set_id,
        startedAt: r.started_at, completedAt: r.completed_at,
        timeSpent: r.time_spent_seconds, answers: r.answers_json,
        rawScore: r.raw_score, percentageScore: r.percentage_score,
        scaledScore: r.scaled_score, passed: r.passed,
        examName: r.question_sets?.name || 'Exam',
        examSlug: r.question_sets?.exam_types?.slug || '',
        totalQuestions: r.answers_json ? Object.keys(r.answers_json).length : 0,
      })))
    } catch { setExamResults([]) }
  }

  const loadExamDates = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.from('profiles').select('exam_dates_json').eq('id', user.id).single()
      if (error) throw error
      if (data?.exam_dates_json) setExamDates(data.exam_dates_json)
    } catch { /* silent */ }
  }

  const saveExamDate = async (examTypeId, examName, examDate) => {
    if (!user) return
    try {
      const updated = examDates.filter(d => d.exam_type_id !== examTypeId)
      updated.push({ exam_type_id: examTypeId, exam_name: examName, exam_date: examDate, created_at: new Date().toISOString() })
      const { error } = await supabase.from('profiles').update({ exam_dates_json: updated }).eq('id', user.id)
      if (error) throw error
      setExamDates(updated)
    } catch { /* silent */ }
  }

  const removeExamDate = async (examTypeId) => {
    if (!user) return
    try {
      const updated = examDates.filter(d => d.exam_type_id !== examTypeId)
      const { error } = await supabase.from('profiles').update({ exam_dates_json: updated }).eq('id', user.id)
      if (error) throw error
      setExamDates(updated)
    } catch { /* silent */ }
  }

  const calculateDaysUntil = (dateString) => {
    const d = new Date(dateString); const t = new Date()
    t.setHours(0,0,0,0); d.setHours(0,0,0,0)
    return Math.ceil((d - t) / 86400000)
  }

  const initializeStreak = async () => {
    if (user) {
      await streakService.initializeStreak(user.id)
      streakService.startAutoSync(user.id)
      setStreakStats(streakService.getStreakStats())
    }
  }

  useEffect(() => () => streakService.stopAutoSync(), [])

  useEffect(() => {
    const onVisibility = () => { if (!document.hidden && user) { setStreakStats(streakService.getStreakStats()); loadExamResults() } }
    const onFocus = () => { if (user) { setStreakStats(streakService.getStreakStats()); loadExamResults() } }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('focus', onFocus) }
  }, [user])

  // ── AIF-C01 course progress ───────────────────────────────────────
  const aifProgress = useMemo(() => {
    let completedIds = []
    try {
      const raw = localStorage.getItem(`course-progress-${aifC01Course.slug}`)
      if (raw) completedIds = JSON.parse(raw)
    } catch { /* ignore */ }

    const total = aifC01Course.sessions.length
    const done = completedIds.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    const byDomain = DOMAIN_META.map(d => {
      const domainSessions = aifC01Course.sessions.filter(s => s.domain === d.id)
      const domainDone = domainSessions.filter(s => completedIds.includes(s.id)).length
      return { ...d, total: domainSessions.length, done: domainDone }
    })

    const nextSession = aifC01Course.sessions.find(s => !completedIds.includes(s.id))
    const aifExam = exams.find(ex => `${ex.slug || ''} ${ex.name || ''}`.toLowerCase().includes('aif'))

    return { total, done, pct, byDomain, nextSession, studySlug: aifExam?.slug || null, completedIds }
  }, [exams])

  // ── Quick Stats ───────────────────────────────────────────────────
  const renderQuickStats = () => {
    const passed = examResults.filter(r => r.passed).length
    const streak = streakStats?.currentStreak || 0
    const upcoming = examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0).length
    const stats = [
      { label: 'Day Streak',       value: streak,                Icon: Flame,         color: '#f59e0b' },
      { label: 'Sessions Done',    value: aifProgress.done,      Icon: BookOpen,      color: '#00D4AA' },
      { label: 'Practice Exams',   value: examResults.length,    Icon: ClipboardList, color: '#6366f1' },
      { label: 'Passed',           value: passed,                Icon: CheckCircle2,  color: '#10b981' },
      ...(upcoming > 0 ? [{ label: 'Upcoming', value: upcoming, Icon: CalendarDays, color: '#3b82f6' }] : []),
    ]
    return (
      <div className="relative z-10 -mt-8">
        <Container>
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
            {stats.map((s, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="flex justify-center mb-1.5">
                  <s.Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-bold text-[#0A2540] leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    )
  }

  // ── AIF-C01 Progress Panel ────────────────────────────────────────
  const renderAifProgress = () => {
    const { done, total, pct, byDomain, nextSession, studySlug } = aifProgress
    return (
      <section className="py-8">
        <Container>
          <div className="rounded-2xl overflow-hidden border border-[#00D4AA]/20"
               style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

            {/* Header row */}
            <div className="px-6 pt-6 pb-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08]">
              <div>
                <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">AIF-C01 Preparation</p>
                <h2 className="text-lg font-bold text-white mb-0.5">AWS AI Practitioner</h2>
                <p className="text-white/50 text-sm">
                  {done === 0
                    ? '16 study sessions · 5 exam domains · 65 practice questions'
                    : pct === 100
                    ? 'All sessions complete — ready to take the practice exam!'
                    : `${done} of ${total} sessions complete`}
                </p>
              </div>
              {studySlug && (
                <button
                  onClick={() => navigate(`/exam/${studySlug}/study`)}
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-white inline-flex items-center gap-2 shrink-0"
                  style={{ background: done === 0 ? 'var(--gradient-teal)' : pct === 100 ? 'rgba(255,255,255,0.1)' : 'var(--gradient-teal)', border: pct === 100 ? '1px solid rgba(255,255,255,0.2)' : 'none', boxShadow: pct < 100 ? '0 4px 14px rgba(0,212,170,0.3)' : 'none' }}
                >
                  {done === 0 ? 'Start Studying' : pct === 100 ? 'Review Course' : 'Continue →'}
                </button>
              )}
            </div>

            {/* Overall progress bar */}
            {done > 0 && (
              <div className="px-6 py-4 border-b border-white/[0.08]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/60">Overall Progress</span>
                  <span className="text-xs font-bold text-[#00D4AA] tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                       style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00D4AA, #00A884)' }} />
                </div>
                {nextSession && pct < 100 && (
                  <p className="text-xs text-white/35 mt-2">
                    Next: Session {nextSession.number} — {nextSession.title}
                  </p>
                )}
              </div>
            )}

            {/* Domain breakdown */}
            <div className="px-6 py-5">
              <p className="text-[0.6875rem] font-bold text-white/35 uppercase tracking-[0.07em] mb-4">Exam Domains</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                {byDomain.map((d) => {
                  const dPct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0
                  return (
                    <div key={d.id} className="bg-white/[0.04] rounded-xl p-3.5 border border-white/[0.07]">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                             style={{ background: `${d.color}18` }}>
                          <d.Icon size={15} style={{ color: d.color }} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.78rem] font-semibold text-white/85 leading-tight truncate">{d.label}</p>
                          <p className="text-[0.65rem] text-white/35 font-medium">{d.weight} of exam · {d.total} sessions</p>
                        </div>
                        <span className="text-[0.7rem] font-bold tabular-nums shrink-0" style={{ color: d.color }}>
                          {d.done}/{d.total}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                             style={{ width: `${dPct}%`, background: d.color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  // ── Exam Countdown ────────────────────────────────────────────────
  const renderExamCountdown = () => {
    const future = [...examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0)]
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
    if (future.length === 0) return null

    return (
      <section className="py-6">
        <Container>
          <SectionHeader label="Your Exam Schedule" title="Exam Countdown" className="mb-5" />
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
            {future.map((ed) => {
              const days = calculateDaysUntil(ed.exam_date)
              const isToday = days === 0
              const urgent = days > 0 && days <= 7
              const color = isToday ? '#f59e0b' : urgent ? '#ef4444' : '#00D4AA'
              return (
                <Card key={ed.exam_type_id} className="p-5 relative" style={{ borderLeft: `3px solid ${color}` }}>
                  <button
                    onClick={() => removeExamDate(ed.exam_type_id)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 text-xl leading-none transition-colors"
                    title="Remove"
                  >×</button>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
                         style={{ background: `${color}12` }}>
                      <span className="text-xl font-bold leading-none" style={{ color }}>{isToday ? '!' : days}</span>
                      <span className="text-[0.55rem] font-bold mt-0.5" style={{ color }}>{isToday ? 'TODAY' : 'DAYS'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#0A2540] truncate mb-0.5">{ed.exam_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(ed.exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1"
                            onClick={() => { const e = exams.find(x => x.id === ed.exam_type_id); if (e) navigate(`/exam/${e.slug}`) }}>
                      Practice Now
                    </Button>
                    <Button variant="secondary" size="sm"
                            onClick={() => { const e = exams.find(x => x.id === ed.exam_type_id); if (e) { setSelectedExamForDate(e); setShowExamDateModal(true) } }}>
                      Edit
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Container>
      </section>
    )
  }

  // ── Streak + Recent Results ───────────────────────────────────────
  const renderProgressRow = () => {
    const { currentStreak, longestStreak, questionsToday, dailyGoal, studyDates } = streakStats || {}
    const today = new Date().toISOString().split('T')[0]

    const renderStreak = () => {
      if (!streakStats) return (
        <Card className="p-6 h-full flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-b-transparent animate-spin" />
        </Card>
      )
      const sorted = [...(studyDates || [])].sort()
      const firstDate = sorted.length > 0 ? new Date(sorted[0]) : new Date(today)
      const todayDate = new Date(today)
      const daysSinceFirst = Math.floor((todayDate - firstDate) / 86400000)
      const cycleStart = Math.floor(daysSinceFirst / 14) * 14
      const displayDays = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(firstDate); d.setDate(d.getDate() + cycleStart + i)
        return d.toISOString().split('T')[0]
      })
      const pct = Math.min(((questionsToday || 0) / (dailyGoal || 10)) * 100, 100)

      return (
        <Card className="p-6 flex flex-col h-full">
          <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">Your Progress</p>
          <h3 className="text-base font-bold text-[#0A2540] mb-5">Study Streak</h3>
          <div className="text-center mb-5">
            <p className="text-5xl font-bold leading-none" style={{ color: '#f59e0b' }}>{currentStreak}</p>
            <p className="text-sm text-gray-500 mt-1">
              {currentStreak === 1 ? 'day' : 'days'} streak {currentStreak > 0 ? '— keep going!' : '— start today!'}
            </p>
            {longestStreak > 0 && <p className="text-xs text-gray-400 mt-0.5">Best: {longestStreak} days</p>}
          </div>
          <div className="mb-5 flex-1">
            <div className="grid grid-cols-7 gap-1.5 justify-items-center">
              {displayDays.map((date, i) => {
                const studied = (studyDates || []).includes(date)
                const isToday = date === today
                const future = date > today
                return (
                  <div key={i} title={date}
                       className="w-7 h-7 rounded flex items-center justify-center text-[0.6875rem] font-semibold transition-colors"
                       style={{
                         background: future ? '#f9fafb' : studied ? (isToday ? '#00D4AA' : '#10b981') : '#f3f4f6',
                         border: isToday ? '2px solid #00D4AA' : `1px solid ${future ? '#f3f4f6' : '#e5e7eb'}`,
                         color: future ? '#e5e7eb' : studied ? 'white' : '#9ca3af',
                         opacity: future ? 0.4 : 1,
                       }}>
                    {studied ? '✓' : future ? '' : i + 1}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-sm font-semibold text-gray-600">Today</span>
              <span className="text-sm font-bold text-[#00D4AA]">{questionsToday}/{dailyGoal}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300"
                   style={{ width: `${pct}%`, background: questionsToday >= dailyGoal ? '#10b981' : '#00D4AA' }} />
            </div>
            {questionsToday >= dailyGoal && (
              <p className="text-xs font-semibold text-emerald-600 text-center mt-2">Goal completed!</p>
            )}
          </div>
        </Card>
      )
    }

    const renderRecentResults = () => (
      <Card className="p-6 flex flex-col h-full">
        <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">Your Performance</p>
        <h3 className="text-base font-bold text-[#0A2540] mb-5">Recent Results</h3>
        {examResults.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <BarChart2 className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No exam results yet</p>
            <p className="text-xs text-gray-300 mt-1">Complete a practice exam to see your results here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 flex-1">
            {examResults.slice(0, 5).map((r) => {
              const passColor = r.passed ? '#10b981' : '#ef4444'
              return (
                <button key={r.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 text-left w-full transition-colors group"
                        onClick={async () => {
                          if (r.examSlug) { navigate(`/exam/${r.examSlug}/results?resultId=${r.id}&set=${r.questionSetId}`); return }
                          const { data: qs } = await supabase.from('question_sets').select('exam_type_id').eq('id', r.questionSetId).single()
                          if (qs?.exam_type_id) {
                            const exam = exams.find(e => e.id === qs.exam_type_id)
                            if (exam) navigate(`/exam/${exam.slug}/results?resultId=${r.id}&set=${r.questionSetId}`)
                          }
                        }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                       style={{ background: passColor }}>
                    {r.passed ? '✓' : '✗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#0A2540] truncate">{r.examName || 'Exam Result'}</p>
                    <p className="text-xs text-gray-400">{new Date(r.completedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold leading-none" style={{ color: passColor }}>{r.percentageScore}%</p>
                    <p className="text-[0.625rem] text-gray-400">{r.rawScore}/{r.totalQuestions}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-400 shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )
            })}
            {examResults.length > 5 && (
              <p className="text-xs text-gray-400 text-center mt-1">+ {examResults.length - 5} more results</p>
            )}
          </div>
        )}
      </Card>
    )

    return (
      <section className="py-6 bg-gray-50">
        <Container>
          <div className="grid gap-6 items-stretch" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
            {renderStreak()}
            {renderRecentResults()}
          </div>
        </Container>
      </section>
    )
  }

  // ── Your Credentials ──────────────────────────────────────────────
  const renderCredentials = () => {
    if (!certificates || certificates.length === 0) return null
    return (
      <section className="py-8 bg-white">
        <Container>
          <SectionHeader label="Earned" title="Your Credentials" className="mb-6" />
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))' }}>
            {certificates.map((c) => (
              <div key={c.credentialCode}>
                <CertificateCard
                  program={getProgram(c.programCode) || { name: c.programName, code: c.programCode }}
                  state="earned"
                  name={c.recipientName}
                  score={c.percentageScore}
                  credentialCode={c.credentialCode}
                  issuedAt={c.issuedAt}
                />
                <div className="mt-3">
                  <Button variant="primary" size="sm" onClick={() => navigate(buildVerifyPath(c.programCode, c.credentialCode))}>
                    View / share credential
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  // ── Practice Exams ────────────────────────────────────────────────
  const renderAllExams = () => {
    if (exams.length === 0) return null
    return (
      <section ref={allExamsRef} className="py-8 bg-white">
        <Container>
          <SectionHeader label="AIF-C01 Practice" title="Practice Exams" className="mb-2" />
          <p className="text-gray-500 text-sm mb-6">
            {isSubscribed
              ? 'Full access active. Start a timed practice set anytime.'
              : 'Try 10 free questions. Subscribe for full access to all question sets.'}
          </p>

          {!isSubscribed && (
            <div className="mb-6 rounded-xl p-4 flex items-center gap-4 flex-wrap"
                 style={{ background: 'linear-gradient(135deg, #0A2540, #1A3B5C)', border: '1px solid rgba(0,212,170,0.25)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Unlock all 65 AIF-C01 questions</p>
                <p className="text-white/60 text-xs mt-0.5">Get full access to all practice sets and study sessions. Plans from $8.25/month.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowEnrollmentModal(true)}>
                View Plans
              </Button>
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
            {exams.map(exam => {
              const scheduled = examDates.find(d => d.exam_type_id === exam.id)
              return (
                <Card key={exam.id} interactive className="p-5" onClick={() => navigate(`/exam/${exam.slug}`)}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl shrink-0">{exam.icon || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-wide mb-0.5">{exam.provider}</p>
                      <h3 className="text-sm font-bold text-[#0A2540] leading-snug">{exam.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2">
                    {exam.description?.slice(0, 90)}{(exam.description?.length || 0) > 90 ? '…' : ''}
                  </p>
                  <div className="flex items-center gap-3 mb-4 text-xs text-gray-400">
                    <span>{exam.total_questions || '—'} questions</span>
                    <span>·</span>
                    <span>{exam.duration_minutes || '—'} min</span>
                    {scheduled && (
                      <>
                        <span>·</span>
                        <span className="text-blue-500 font-medium">
                          Exam {new Date(scheduled.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1"
                            onClick={e => { e.stopPropagation(); navigate(`/exam/${exam.slug}`) }}>
                      {(isSubscribed || hasExamAccess(exam.id)) ? 'Start Practicing' : 'Try Free'}
                    </Button>
                    <Button variant="outline" size="sm"
                            onClick={e => { e.stopPropagation(); setSelectedExamForDate(exam); setShowExamDateModal(true) }}
                            title={`${scheduled ? 'Update' : 'Set'} exam date`}>
                      <CalendarDays className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Container>
      </section>
    )
  }

  // ── Footer ────────────────────────────────────────────────────────
  const renderFooter = () => (
    <footer className="bg-[#0A2540] py-10 w-full">
      <Container>
        <div className="pt-4 text-center">
          <p className="text-[0.6875rem] text-white/30 leading-relaxed max-w-2xl mx-auto mb-2">
            <strong className="text-white/40">Disclaimer:</strong> Independent practice questions for certification preparation.
            Not affiliated with or endorsed by Amazon Web Services (AWS).
          </p>
          <p className="text-[0.6875rem] text-white/25">© {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )

  // ── Main ──────────────────────────────────────────────────────────
  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-[#0A2540] pt-10 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40"
               style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(0,212,170,0.1) 0%, transparent 70%)' }} />
          <Container className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20 mb-4 uppercase tracking-widest">
                  AIF-C01 Prep
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                  Welcome back, {userName}
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-md">
                  {aifProgress.pct === 0
                    ? 'Start your AIF-C01 journey — 16 study sessions covering every exam domain.'
                    : aifProgress.pct === 100
                    ? 'All study sessions complete. Keep practicing to lock in your score!'
                    : `${aifProgress.pct}% through your study sessions — keep the momentum going.`}
                </p>
              </div>
              {!isSubscribed ? (
                <Button variant="primary" size="lg" className="shrink-0 shadow-teal"
                        onClick={() => setShowEnrollmentModal(true)}>
                  Unlock Full Access
                </Button>
              ) : (
                <div className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Full Access Active
                </div>
              )}
            </div>
          </Container>
        </section>

        {renderQuickStats()}
        {renderAifProgress()}
        {renderExamCountdown()}
        {renderProgressRow()}
        {renderCredentials()}
        {renderAllExams()}

      </div>

      {renderFooter()}

      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => setShowEnrollmentModal(false)}
      />

      {showExamDateModal && selectedExamForDate && (
        <div className="modal-overlay" onClick={() => setShowExamDateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowExamDateModal(false)}>×</button>
            <div className="modal-header">
              <h2 className="modal-title">Set Exam Date</h2>
              <p className="modal-description">When are you planning to take {selectedExamForDate.name}?</p>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                const fd = new FormData(e.target)
                const d = fd.get('examDate')
                if (d) { saveExamDate(selectedExamForDate.id, selectedExamForDate.name, d); setShowExamDateModal(false); setSelectedExamForDate(null) }
              }}
              className="mt-4"
            >
              <div className="form-group">
                <label className="form-label" htmlFor="examDate">Exam Date</label>
                <input
                  type="date" id="examDate" name="examDate" className="form-input"
                  defaultValue={examDates.find(d => d.exam_type_id === selectedExamForDate.id)?.exam_date || ''}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="flex gap-3 mt-5">
                <button type="button" className="form-button"
                        style={{ background: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                        onClick={() => { setShowExamDateModal(false); setSelectedExamForDate(null) }}>
                  Cancel
                </button>
                <button type="submit" className="form-button">Save Date</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard
