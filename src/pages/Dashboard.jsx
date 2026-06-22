import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import DashboardHeader from '../components/layout/DashboardHeader'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import streakService from '../services/streakService'
import progressService from '../services/progressService'
import studyProgressService from '../services/studyProgressService'
import certificateService, { buildVerifyPath } from '../services/certificateService'
import CertificateCard from '../components/certificate/CertificateCard'
import { PROGRAMS, getProgram, getProgramBySlug } from '../data/programs'
import { getSessionCourse } from '../utils/sessionCourses'
import supabase from '../services/supabase'
import { Button, Card, Badge, Container, SectionHeader } from '../design-system'
import {
  BookOpen, ClipboardList, CheckCircle2, CalendarDays, BarChart2,
  Flame, LayoutGrid, Award, PlayCircle, ArrowRight, Rocket, GraduationCap, Lock,
} from 'lucide-react'

// Every session-based program slug we ship a course for. Used to detect a
// returning learner who has local study progress but no formal enrollment yet.
const KNOWN_COURSE_SLUGS = ['aif-c01', 'clf-c02', 'saa-c03', 'dva-c02', 'mla-c01', 'sap-c02', 'aip-c01', 'soa-c03', 'dop-c02', 'dea-c01', 'scs-c03']
const DOMAIN_PALETTE = ['#0EA5E9', '#8B5CF6', '#00D4AA', '#F59E0B', '#EF4444', '#6366F1']

const TABS = [
  { id: 'overview',    label: 'Overview',    Icon: LayoutGrid },
  { id: 'study',       label: 'Study',       Icon: BookOpen },
  { id: 'practice',    label: 'Practice',    Icon: ClipboardList },
  { id: 'progress',    label: 'Progress',    Icon: BarChart2 },
  { id: 'credentials', label: 'Credentials', Icon: Award },
]

function Dashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, profile, updateProfile } = useAuthStore()

  const tabParam = searchParams.get('tab')
  const activeTab = TABS.some(t => t.id === tabParam) ? tabParam : 'overview'
  const setActiveTab = (id) => {
    setSearchParams(id === 'overview' ? {} : { tab: id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const { exams, fetchExams } = useExamStore()
  const {
    isSubscribed, fetchSubscription, fetchEnrollments, fetchPromoAccess, hasExamAccess,
    enrolledExamIds, promoAccessExamIds, promoFullAccess,
  } = usePurchaseStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [resumeExam, setResumeExam] = useState(null)
  const [streakStats, setStreakStats] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [examDates, setExamDates] = useState([])
  const [showExamDateModal, setShowExamDateModal] = useState(false)
  const [selectedExamForDate, setSelectedExamForDate] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [studyProgress, setStudyProgress] = useState([]) // [{courseSlug, completedSessions, updatedAt}] from the DB
  const [practiceSets, setPracticeSets] = useState([])   // exam simulations for the focused exam
  const [loadingSets, setLoadingSets] = useState(false)
  const [inProgressBySet, setInProgressBySet] = useState({}) // { [setId]: progressObj | null }
  const autoFocusedRef = useRef(false)

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
      studyProgressService.loadAll(user.id).then(setStudyProgress)
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

  // ── Focused certification (one per user, derived from activity) ────
  // The home centres on a single cert the learner is focused on. We persist
  // that choice on the profile (focused_course_slug) so it follows them across
  // devices, and derive sensible candidates from real server-side activity:
  // enrolled/promo access, study progress, and completed practice attempts.
  const examSlugSet = useMemo(() => new Set(exams.map(e => e.slug)), [exams])

  // Most-recent activity timestamp per course — orders the chooser + picks the
  // auto-default when there's only one.
  const activityBySlug = useMemo(() => {
    const m = {}
    const bump = (slug, ts) => {
      if (!slug) return
      const t = ts ? new Date(ts).getTime() : 0
      if (!m[slug] || t > m[slug]) m[slug] = t
    }
    studyProgress.forEach(sp => { if (sp.completedSessions.length > 0) bump(sp.courseSlug, sp.updatedAt) })
    examResults.forEach(r => bump(r.examSlug, r.completedAt))
    const accessibleIds = [...(enrolledExamIds || []), ...(promoAccessExamIds || [])]
    exams.forEach(e => { if (accessibleIds.includes(e.id) && !(e.slug in m)) m[e.slug] = 0 })
    return m
  }, [studyProgress, examResults, enrolledExamIds, promoAccessExamIds, exams])

  // Certs the learner has actually touched — only those we ship a course for.
  const candidateSlugs = useMemo(() => (
    Object.keys(activityBySlug)
      .filter(s => KNOWN_COURSE_SLUGS.includes(s) && examSlugSet.has(s))
      .sort((a, b) => (activityBySlug[b] || 0) - (activityBySlug[a] || 0))
  ), [activityBySlug, examSlugSet])

  // An explicit, still-valid saved focus always wins.
  const savedFocus = useMemo(() => {
    const slug = profile?.focused_course_slug
    return slug && KNOWN_COURSE_SLUGS.includes(slug) && examSlugSet.has(slug) ? slug : null
  }, [profile?.focused_course_slug, examSlugSet])

  // Resolve the focus: saved choice → most-recent activity → none. Switching is
  // handled entirely from the account menu (DashboardHeader), so the home never
  // forces a chooser — it just defaults to the learner's latest activity.
  const focusedSlug = useMemo(() => {
    if (savedFocus) return savedFocus
    return candidateSlugs[0] || null
  }, [savedFocus, candidateSlugs])

  // No saved focus, no activity at all → genuine first-timer.
  const isFirstTimer = !focusedSlug

  // Persist the auto-adopted focus (most-recent activity) so the choice is
  // durable across devices and the account-menu switcher reflects it.
  useEffect(() => {
    if (!user || !profile || autoFocusedRef.current) return
    if (!savedFocus && candidateSlugs.length >= 1) {
      autoFocusedRef.current = true
      updateProfile({ focused_course_slug: candidateSlugs[0] })
    }
  }, [user, profile, savedFocus, candidateSlugs, updateProfile])

  const featuredExam = useMemo(
    () => (focusedSlug && exams.length ? exams.find(e => e.slug === focusedSlug) || null : null),
    [focusedSlug, exams],
  )

  const featuredProgram = useMemo(
    () => (featuredExam ? getProgramBySlug(featuredExam.slug) : null),
    [featuredExam],
  )

  const featuredCourse = useMemo(
    () => (featuredExam ? getSessionCourse(featuredExam.slug) : null),
    [featuredExam],
  )

  // Completed session IDs for a course — DB first (cross-device), localStorage
  // as an instant-paint fallback before the DB load resolves.
  const completedIdsFor = (slug) => {
    const fromDb = studyProgress.find(sp => sp.courseSlug === slug)
    if (fromDb) return fromDb.completedSessions
    try {
      const raw = localStorage.getItem(`course-progress-${slug}`)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return []
  }

  // ── Featured course progress (program-aware) ──────────────────────
  const courseProgress = useMemo(() => {
    if (!featuredCourse) return null
    const completedIds = completedIdsFor(featuredCourse.slug)

    const sessions = featuredCourse.sessions || []
    const total = sessions.length
    const done = completedIds.length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    const modules = (featuredCourse.modules || []).filter(m => m.id !== 'exam')
    const byDomain = modules.map((m, i) => {
      const domainSessions = sessions.filter(s => s.domain === m.id)
      return {
        id: m.id,
        label: m.label.replace(/^Domain\s*\d+\s*·\s*/, ''),
        weight: m.weight,
        color: DOMAIN_PALETTE[i % DOMAIN_PALETTE.length],
        total: domainSessions.length,
        done: domainSessions.filter(s => completedIds.includes(s.id)).length,
      }
    })

    const nextSession = sessions.find(s => !completedIds.includes(s.id))
    return { total, done, pct, byDomain, nextSession, studySlug: featuredExam?.slug || null, completedIds }
  }, [featuredCourse, featuredExam, studyProgress])

  // Practice attempts for the focused cert only — every tab scopes its numbers
  // to the cert currently in focus (switch it from the account menu).
  const focusedResults = useMemo(
    () => (focusedSlug ? examResults.filter(r => r.examSlug === focusedSlug) : examResults),
    [examResults, focusedSlug],
  )

  // Exam simulations (question sets) for the focused exam — drives the Practice tab.
  useEffect(() => {
    if (!featuredExam) { setPracticeSets([]); return }
    let cancelled = false
    setLoadingSets(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('question_sets')
          .select('id, name, description, set_number, question_count, price_cents, is_free_sample, is_final_exam')
          .eq('exam_type_id', featuredExam.id)
          .eq('is_active', true)
          .order('set_number', { ascending: true })
        if (error) throw error
        if (!cancelled) {
          const sets = data || []
          setPracticeSets(sets)
          // Load in-progress status for each set in parallel
          if (sets.length && user) {
            const entries = await Promise.all(
              sets.map(s =>
                progressService.findInProgressExam(user.id, s.id)
                  .then(p => [s.id, p])
              )
            )
            if (!cancelled) setInProgressBySet(Object.fromEntries(entries))
          }
        }
      } catch {
        if (!cancelled) setPracticeSets([])
      } finally {
        if (!cancelled) setLoadingSets(false)
      }
    })()
    return () => { cancelled = true }
  }, [featuredExam, user])

  // ── Resume: most recent in-progress practice exam ─────────────────
  useEffect(() => {
    if (!user) { setResumeExam(null); return }
    let cancelled = false
    ;(async () => {
      try {
        const all = await progressService.getAllProgress(user.id)
        const active = (all || []).find(p => p.status === 'in_progress')
        if (!active) { if (!cancelled) setResumeExam(null); return }
        const { data } = await supabase
          .from('question_sets')
          .select('name, exam_types(slug, name)')
          .eq('id', active.questionSetId).single()
        if (cancelled || !data?.exam_types?.slug) return
        const answered = Object.keys(active.answers || {}).filter(k => active.answers[k]?.length).length
        setResumeExam({
          slug: data.exam_types.slug,
          setId: active.questionSetId,
          setName: data.name,
          examName: data.exam_types.name,
          answered,
        })
      } catch { if (!cancelled) setResumeExam(null) }
    })()
    return () => { cancelled = true }
  }, [user])

  // ── Quick Stats ───────────────────────────────────────────────────
  const renderQuickStats = () => {
    const passed = focusedResults.filter(r => r.passed).length
    const streak = streakStats?.currentStreak || 0
    const upcoming = examDates.filter(d => (!featuredExam || d.exam_type_id === featuredExam.id) && calculateDaysUntil(d.exam_date) >= 0).length
    const stats = [
      { label: 'Day Streak',       value: streak,                       Icon: Flame,         color: '#f59e0b' },
      { label: 'Sessions Done',    value: courseProgress?.done || 0,    Icon: BookOpen,      color: '#00D4AA' },
      { label: 'Practice Exams',   value: focusedResults.length,        Icon: ClipboardList, color: '#6366f1' },
      { label: 'Passed',           value: passed,                Icon: CheckCircle2,  color: '#10b981' },
      ...(upcoming > 0 ? [{ label: 'Upcoming', value: upcoming, Icon: CalendarDays, color: '#3b82f6' }] : []),
    ]
    return (
      <div className="pt-6">
        <Container>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(104px, 1fr))' }}>
            {stats.map((s, i) => (
              <Card key={i} className="p-3 text-center min-w-0">
                <div className="flex justify-center mb-1.5">
                  <s.Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <p className="text-2xl font-mono font-bold text-[#0A2540] leading-none">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium leading-tight break-words">{s.label}</p>
              </Card>
            ))}
          </div>
        </Container>
      </div>
    )
  }

  // ── Featured course progress panel (program-aware) ────────────────
  const renderCourseProgress = () => {
    if (!featuredCourse || !courseProgress) return renderPickProgram()
    const { done, total, pct, byDomain, nextSession, studySlug } = courseProgress
    const eyebrow = featuredProgram?.code || featuredCourse.code || 'Preparation'
    const title = featuredProgram?.name || featuredCourse.title
    return (
      <section className="py-8">
        <Container>
          <div className="rounded-2xl overflow-hidden border border-[#00D4AA]/20"
               style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>

            {/* Header row */}
            <div className="px-6 pt-6 pb-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08]">
              <div>
                <p className="text-[0.6875rem] font-display font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">{eyebrow} Preparation</p>
                <h2 className="text-lg font-display font-bold text-white mb-0.5">{title}</h2>
                <p className="text-white/50 text-sm">
                  {done === 0
                    ? `${total} study sessions · ${byDomain.length} exam domains`
                    : pct === 100
                    ? 'All sessions complete — ready to take the practice exam!'
                    : `${done} of ${total} sessions complete`}
                </p>
              </div>
              {studySlug && (
                <button
                  onClick={() => navigate(`/exam/${studySlug}/study`)}
                  className="px-4 py-2.5 rounded-xl font-display font-bold text-sm text-white inline-flex items-center gap-2 shrink-0"
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
                  <span className="text-xs font-mono font-bold text-[#00D4AA]">{pct}%</span>
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
              <p className="text-[0.6875rem] font-display font-bold text-white/35 uppercase tracking-[0.07em] mb-4">Exam Domains</p>
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))' }}>
                {byDomain.map((d, i) => {
                  const dPct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0
                  return (
                    <div key={d.id} className="bg-white/[0.04] rounded-xl p-3.5 border border-white/[0.07]">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[0.8rem]"
                             style={{ background: `${d.color}18`, color: d.color }}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.78rem] font-semibold text-white/85 leading-tight truncate">{d.label}</p>
                          <p className="text-[0.65rem] text-white/35 font-medium">{d.weight} of exam · {d.total} sessions</p>
                        </div>
                        <span className="text-[0.7rem] font-mono font-bold shrink-0" style={{ color: d.color }}>
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

  // ── First-timer: path-chooser ─────────────────────────────────────
  // No empty dashboard — the screen's only job is to get the learner to pick
  // a certification and start free.
  const renderPathChooser = () => {
    const progs = PROGRAMS || []
    return (
      <section className="py-8">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20 mb-3 uppercase tracking-widest">
              <Rocket className="w-3.5 h-3.5" /> Get started
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0A2540] mb-2">Pick your certification to start free</h2>
            <p className="text-gray-500 text-sm">
              Choose a path below. Every program opens with free study sessions and sample questions — no commitment to begin.
            </p>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))' }}>
            {progs.map((p) => {
              const exam = exams.find(e => e.slug === p.slug)
              const go = () => navigate(exam ? `/exam/${p.slug}` : `/${p.code}`)
              return (
                <Card key={p.code} interactive className="p-5 flex flex-col" onClick={go}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.color}14` }}>
                      <p.Icon className="w-5 h-5" style={{ color: p.color }} strokeWidth={2.2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.6875rem] font-display font-bold uppercase tracking-wide" style={{ color: p.color }}>{p.level}</p>
                      <h3 className="text-sm font-display font-bold text-[#0A2540] leading-snug">{p.shortName}</h3>
                      <p className="text-[0.65rem] font-mono text-gray-400 mt-0.5">{p.code}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-2 flex-1">{p.tagline}</p>
                  <div className="flex items-center gap-3 mb-4 text-[0.7rem] font-mono text-gray-400">
                    <span>{p.facts?.questions} Qs</span><span>·</span>
                    <span>{p.facts?.time}</span><span>·</span>
                    <span>{p.sessions} sessions</span>
                  </div>
                  <Button variant="primary" size="sm" className="w-full" onClick={(e) => { e.stopPropagation(); go() }}>
                    Start free <ArrowRight className="w-4 h-4" />
                  </Button>
                </Card>
              )
            })}
          </div>
        </Container>
      </section>
    )
  }

  // Compact "choose a program" prompt for the Study tab when no program is featured.
  const renderPickProgram = () => (
    <section className="py-8">
      <Container>
        <Card className="p-10 text-center max-w-lg mx-auto">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 text-gray-200" />
          <p className="text-base font-display font-bold text-[#0A2540]">No program selected yet</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            Pick a certification to unlock its study sessions and track your progress here.
          </p>
          <div className="mt-5">
            <Button variant="primary" size="sm" onClick={() => setActiveTab('overview')}>
              Browse certifications
            </Button>
          </div>
        </Card>
      </Container>
    </section>
  )

  // ── Returning learner: continue + readiness ───────────────────────
  // Reduces time-to-resume to one tap.
  const renderContinue = () => {
    if (!featuredProgram) return null
    const cp = courseProgress
    const bestScore = examResults
      .filter(r => r.examSlug === featuredExam?.slug)
      .reduce((m, r) => Math.max(m, r.percentageScore || 0), 0)

    // Pick the single most useful next action.
    let action
    if (resumeExam) {
      action = {
        kicker: 'Resume practice exam',
        title: resumeExam.setName || resumeExam.examName,
        meta: resumeExam.answered > 0 ? `${resumeExam.answered} answered — pick up where you stopped` : 'Continue your in-progress attempt',
        cta: 'Resume exam',
        onClick: () => navigate(`/exam/${resumeExam.slug}/take?set=${resumeExam.setId}`),
      }
    } else if (cp?.nextSession) {
      action = {
        kicker: cp.done === 0 ? 'Start studying' : 'Continue studying',
        title: `Session ${cp.nextSession.number} — ${cp.nextSession.title}`,
        meta: `${cp.done} of ${cp.total} sessions complete`,
        cta: cp.done === 0 ? 'Start session' : 'Continue',
        onClick: () => navigate(`/exam/${cp.studySlug}/study`),
      }
    } else {
      action = {
        kicker: 'Course complete',
        title: 'Lock in your score with a practice exam',
        meta: 'All study sessions done',
        cta: 'Take a practice exam',
        onClick: () => navigate(`/exam/${featuredExam?.slug}`),
      }
    }

    return (
      <section className="pt-6">
        <Container>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {/* Continue card (primary, spans wider) */}
            <div className="sm:col-span-2 rounded-2xl p-5 sm:p-6 flex items-center gap-5 flex-wrap"
                 style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center shrink-0">
                <PlayCircle className="w-6 h-6 text-[#00D4AA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.6875rem] font-display font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-1">{action.kicker}</p>
                <p className="text-base font-display font-bold text-white leading-snug truncate">{action.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{action.meta}</p>
              </div>
              <button
                onClick={action.onClick}
                className="px-5 py-2.5 rounded-xl font-display font-bold text-sm text-[#0A2540] inline-flex items-center gap-2 shrink-0"
                style={{ background: 'var(--gradient-teal)', boxShadow: '0 4px 14px rgba(0,212,170,0.3)' }}
              >
                {action.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Readiness card */}
            <Card className="p-5 flex flex-col justify-center">
              <p className="text-[0.6875rem] font-display font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">Readiness</p>
              <div className="flex items-center justify-around gap-4">
                <div className="text-center">
                  <p className="text-3xl font-mono font-bold text-[#0A2540] leading-none">{cp?.pct ?? 0}%</p>
                  <p className="text-[0.7rem] text-gray-500 mt-1 font-medium">Study progress</p>
                </div>
                <div className="w-px h-10 bg-gray-100" />
                <div className="text-center">
                  <p className="text-3xl font-mono font-bold leading-none" style={{ color: bestScore >= 70 ? '#10b981' : '#0A2540' }}>{bestScore}%</p>
                  <p className="text-[0.7rem] text-gray-500 mt-1 font-medium">Best practice</p>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    )
  }

  // ── Exam Info (focused exam) ──────────────────────────────────────
  // The "what is this exam" reference lives on the home, next to progress.
  const renderExamInfo = () => {
    if (!featuredExam) return null
    const facts = featuredProgram?.facts
    const stats = [
      { label: 'Questions', value: featuredExam.total_questions || facts?.questions || '—' },
      { label: 'Duration',  value: featuredExam.duration_minutes ? `${featuredExam.duration_minutes} min` : (facts?.time || '—') },
      { label: 'Passing',   value: featuredExam.passing_score ? `${featuredExam.passing_score}${featuredExam.max_score ? `/${featuredExam.max_score}` : ''}` : '—' },
      { label: 'Level',     value: featuredProgram?.level || '—' },
    ]
    return (
      <section className="py-6">
        <Container>
          <Card className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl shrink-0 leading-none">{featuredExam.icon || '📚'}</span>
              <div className="min-w-0">
                <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-wide mb-0.5">
                  {featuredExam.provider}{featuredProgram?.code ? ` · ${featuredProgram.code}` : ''}
                </p>
                <h3 className="text-base font-display font-bold text-[#0A2540] leading-snug">{featuredExam.name}</h3>
              </div>
            </div>
            {featuredExam.description && (
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{featuredExam.description}</p>
            )}
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))' }}>
              {stats.map((s, i) => (
                <div key={i} className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
                  <p className="text-sm font-bold text-[#0A2540] break-words">{s.value}</p>
                  <p className="text-[0.7rem] text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/exam/${featuredExam.slug}`)}>
                View full exam details <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    )
  }

  // ── Exam Countdown ────────────────────────────────────────────────
  const renderExamCountdown = () => {
    const future = [...examDates.filter(d => (!featuredExam || d.exam_type_id === featuredExam.id) && calculateDaysUntil(d.exam_date) >= 0)]
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
        <h3 className="text-base font-bold text-[#0A2540] mb-5">
          Recent Results{featuredProgram ? ` · ${featuredProgram.code}` : ''}
        </h3>
        {focusedResults.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <BarChart2 className="w-10 h-10 mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No exam results yet</p>
            <p className="text-xs text-gray-300 mt-1">Complete a practice exam to see your results here.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 flex-1">
            {focusedResults.slice(0, 5).map((r) => {
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
            {focusedResults.length > 5 && (
              <p className="text-xs text-gray-400 text-center mt-1">+ {focusedResults.length - 5} more results</p>
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
  // Credential for the focused cert leads — shown as a live preview until it's
  // earned — followed by any other earned credentials.
  const renderCredentials = () => {
    const focusedCert = featuredProgram
      ? certificates.find(c => c.programCode === featuredProgram.code)
      : null
    const otherCerts = certificates.filter(c => c.credentialCode !== focusedCert?.credentialCode)

    const bestScore = focusedResults.reduce((m, r) => Math.max(m, r.percentageScore || 0), 0)
    const studyDone = courseProgress?.done || 0
    const studyTotal = courseProgress?.total || 0
    const studyComplete = studyTotal > 0 && studyDone >= studyTotal

    return (
      <section className="py-8 bg-white">
        <Container>
          {/* Focused certification — preview until earned */}
          {featuredProgram && (
            <div className="mb-12">
              <SectionHeader
                label={focusedCert ? 'Earned' : 'In progress'}
                title={`Your ${featuredProgram.code} Credential`}
                className="mb-6"
              />
              <div className="grid gap-6 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' }}>
                <CertificateCard
                  program={featuredProgram}
                  state={focusedCert ? 'earned' : 'in-progress'}
                  name={focusedCert ? focusedCert.recipientName : userName}
                  score={focusedCert?.percentageScore}
                  credentialCode={focusedCert?.credentialCode}
                  issuedAt={focusedCert?.issuedAt}
                />
                {focusedCert ? (
                  <div className="rounded-xl border border-[#00D4AA]/30 bg-[#00D4AA]/[0.06] p-5 sm:p-6">
                    <h3 className="text-[#0A2540] font-bold text-lg mb-1.5">Credential earned 🎉</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Your {featuredProgram.shortName} Readiness credential is live with a public verification link.
                    </p>
                    <Button variant="primary" size="sm" className="gap-2"
                            onClick={() => navigate(buildVerifyPath(focusedCert.programCode, focusedCert.credentialCode))}>
                      View / share credential <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
                    <h3 className="text-[#0A2540] font-bold text-lg mb-1.5">Earn your {featuredProgram.shortName} credential</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Finish the study program and pass a practice exam to unlock a shareable Certificate of Readiness.
                    </p>
                    <div className="flex flex-col gap-2.5 mb-5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: studyComplete ? '#10b981' : '#cbd5e1' }} />
                        <span className={studyComplete ? 'text-gray-700' : 'text-gray-500'}>
                          Complete all study sessions
                        </span>
                        <span className="ml-auto font-mono text-xs text-gray-400">{studyDone}/{studyTotal}</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: bestScore >= 70 ? '#10b981' : '#cbd5e1' }} />
                        <span className={bestScore >= 70 ? 'text-gray-700' : 'text-gray-500'}>
                          Pass a practice exam (70%+)
                        </span>
                        <span className="ml-auto font-mono text-xs text-gray-400">{bestScore}%</span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" className="gap-2"
                            onClick={() => navigate(studyComplete ? `/exam/${featuredExam.slug}` : `/exam/${featuredExam.slug}/study`)}>
                      {studyComplete ? 'Take a practice exam' : 'Continue studying'} <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other earned credentials */}
          {otherCerts.length > 0 && (
            <div>
              <SectionHeader label="Earned" title={featuredProgram ? 'Other Credentials' : 'Your Credentials'} className="mb-6" />
              <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))' }}>
                {otherCerts.map((c) => (
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
            </div>
          )}

          {/* No focus and nothing earned yet */}
          {!featuredProgram && otherCerts.length === 0 && (
            <>
              <SectionHeader label="Earned" title="Your Credentials" className="mb-6" />
              <Card className="p-10 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-base font-bold text-[#0A2540]">No credentials yet</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Pass a practice exam to earn a shareable completion credential. It'll show up here.
                </p>
                <div className="mt-5">
                  <Button variant="primary" size="sm" onClick={() => setActiveTab('overview')}>
                    Pick a certification
                  </Button>
                </div>
              </Card>
            </>
          )}
        </Container>
      </section>
    )
  }

  // ── Practice (exam simulations for the focused exam) ──────────────
  // Scoped to the focused exam only — a list of its timed, exam-style
  // simulations. The "what is this exam" info lives on the Overview tab.
  const renderPractice = () => {
    if (!featuredExam) return renderPickProgram()
    const hasAccess = isSubscribed || hasExamAccess(featuredExam.id)
    return (
      <section className="py-8 bg-white">
        <Container>
          <SectionHeader
            label={featuredProgram?.code || featuredExam.provider}
            title="Exam Simulations"
            className="mb-2"
          />
          <p className="text-gray-500 text-sm mb-6">
            {hasAccess
              ? 'Full access active. Start a timed, exam-style simulation anytime.'
              : 'Try the free sample set. Subscribe to unlock every simulation.'}
          </p>

          {!hasAccess && (
            <div className="mb-6 rounded-xl p-4 flex items-center gap-4 flex-wrap"
                 style={{ background: 'linear-gradient(135deg, #0A2540, #1A3B5C)', border: '1px solid rgba(0,212,170,0.25)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-display font-bold text-sm">Unlock every {featuredProgram?.code || ''} simulation</p>
                <p className="text-white/60 text-xs mt-0.5">Get full access to all practice sets and study sessions. Plans from $8.25/month.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowEnrollmentModal(true)}>
                View Plans
              </Button>
            </div>
          )}

          {loadingSets ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 rounded-full border-2 border-gray-200 border-b-transparent animate-spin" />
            </div>
          ) : practiceSets.length === 0 ? (
            <Card className="p-10 text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-base font-bold text-[#0A2540]">No simulations available yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Exam simulations for {featuredExam.name} are coming soon.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))' }}>
              {practiceSets.map(set => {
                const isFree = set.is_free_sample || set.price_cents === 0
                const locked = !isFree && !hasAccess
                const scheduled = examDates.find(d => d.exam_type_id === featuredExam.id)
                return (
                  <Card key={set.id} className="p-5 flex flex-col" style={{ opacity: locked ? 0.85 : 1 }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-bold text-[#0A2540] leading-snug">{set.name}</h3>
                      {isFree ? (
                        <span className="shrink-0 text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00A884]">Free</span>
                      ) : hasAccess ? (
                        <span className="shrink-0 text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00A884]">Included</span>
                      ) : (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"><Lock className="w-3 h-3" /> Locked</span>
                      )}
                    </div>
                    {set.description && (
                      <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">{set.description}</p>
                    )}
                    <div className="flex items-center gap-3 mb-4 text-xs text-gray-400 flex-wrap">
                      <span className="inline-flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 opacity-60" />{set.question_count || '—'} questions</span>
                      <span>·</span>
                      <span>Set {set.set_number}</span>
                      {set.is_final_exam && (<><span>·</span><span className="text-[#00D4AA] font-semibold">Final exam</span></>)}
                    </div>
                    {(isFree || hasAccess) ? (
                      inProgressBySet[set.id] ? (
                        <div className="flex flex-col gap-2">
                          <Button variant="primary" size="sm" className="w-full gap-1.5"
                                  onClick={() => navigate(`/exam/${featuredExam.slug}/take?set=${set.id}`)}>
                            Continue <ArrowRight className="w-4 h-4" />
                          </Button>
                          <button
                            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 text-center"
                            onClick={() => navigate(`/exam/${featuredExam.slug}/take?set=${set.id}&fresh=1`)}>
                            Start over
                          </button>
                        </div>
                      ) : (
                        <Button variant="primary" size="sm" className="w-full gap-1.5"
                                onClick={() => navigate(`/exam/${featuredExam.slug}/take?set=${set.id}`)}>
                          Start simulation <ArrowRight className="w-4 h-4" />
                        </Button>
                      )
                    ) : (
                      <Button variant="outline" size="sm" className="w-full gap-1.5"
                              onClick={() => setShowEnrollmentModal(true)}>
                        <Lock className="w-4 h-4" /> Subscribe to unlock
                      </Button>
                    )}
                    {scheduled && (
                      <p className="text-[0.7rem] text-blue-500 font-medium text-center mt-2.5">
                        Exam scheduled {new Date(scheduled.exam_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
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
                <span className="inline-block px-3 py-1 rounded-full text-xs font-display font-bold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20 mb-4 uppercase tracking-widest">
                  {featuredProgram ? `${featuredProgram.code} Prep` : 'Get certified'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2 leading-tight">
                  {featuredProgram ? `Welcome back, ${userName}` : `Welcome, ${userName}`}
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-md">
                  {!featuredProgram
                    ? 'Pick a certification below and start studying free — your progress will live right here.'
                    : (courseProgress?.pct ?? 0) === 0
                    ? `Start your ${featuredProgram.code} journey — ${courseProgress?.total ?? ''} study sessions covering every exam domain.`
                    : (courseProgress?.pct ?? 0) === 100
                    ? 'All study sessions complete. Keep practicing to lock in your score!'
                    : `${courseProgress.pct}% through your study sessions — keep the momentum going.`}
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

        {/* Tab navigation — desktop: expanding-pill rail (top, centered) */}
        <div className="hidden sm:block sticky top-14 z-40 bg-white border-b border-gray-200">
          <Container>
            <nav className="flex justify-center gap-2 py-2.5" role="tablist" aria-label="Dashboard sections">
              {TABS.map(({ id, label, Icon }) => {
                const active = activeTab === id
                return (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={active}
                    aria-label={label}
                    title={label}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex items-center justify-center gap-2 px-5 py-2 rounded-full transition-all duration-300 ease-out ${
                      active
                        ? 'bg-[#0A2540] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.6 : 2} />
                    <span className="font-display text-[0.78rem] font-bold tracking-[0.02em]">{label}</span>
                  </button>
                )
              })}
            </nav>
          </Container>
        </div>

        {/* Tab panels — Home adapts to user state (progressive disclosure) */}
        <div className="min-h-[40vh]">
          {activeTab === 'overview' && (
            isFirstTimer ? (
              renderPathChooser()
            ) : (
              <>
                {renderContinue()}
                {renderQuickStats()}
                {renderExamInfo()}
                {renderExamCountdown()}
              </>
            )
          )}
          {activeTab === 'study' && renderCourseProgress()}
          {activeTab === 'practice' && renderPractice()}
          {activeTab === 'progress' && renderProgressRow()}
          {activeTab === 'credentials' && renderCredentials()}
        </div>

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
