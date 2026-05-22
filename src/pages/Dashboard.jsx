import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import usePurchaseStore from '../stores/purchaseStore'
import DashboardHeader from '../components/layout/DashboardHeader'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import streakService from '../services/streakService'
import progressService from '../services/progressService'
import supabase from '../services/supabase'
import CloudCertificationJourneyModal, { PATHS, computeTimeline } from '../components/journey/CloudCertificationJourneyModal'
import { Button, Card, Badge, Container, SectionHeader } from '../design-system'
import { BookOpen, ClipboardList, CheckCircle2, CalendarDays, BarChart2, Flame, ChevronRight, Sparkles } from 'lucide-react'
import aifC01Course from '../data/aifC01Course'

const SESSION_COURSE_REGISTRY = [
  { course: aifC01Course, studySlugFragment: 'aif' },
]

const CERT_EXAM_KEYWORDS = {
  'CLF-C02':   ['clf', 'cloud-practitioner', 'cloud practitioner'],
  'AIF-C01':   ['aif', 'ai-practitioner', 'ai practitioner'],
  'SAA-C03':   ['saa', 'solutions-architect-associate', 'solutions architect'],
  'DVA-C02':   ['dva', 'developer'],
  'CloudOps':  ['cloudops', 'sysops', 'soa'],
  'DEA-C01':   ['dea', 'data-engineer', 'data engineer'],
  'MLA-C01':   ['mla', 'machine-learning', 'ml-engineer', 'ml engineer'],
  'SAP-C02':   ['sap', 'solutions-architect-professional'],
  'DOP-C02':   ['dop', 'devops'],
  'GenAI-Pro': ['genai', 'generative'],
  'SCS-C02':   ['scs', 'security'],
  'ANS-C01':   ['ans', 'networking', 'advanced-networking'],
}

function findExamForCert(certCode, exams) {
  const keywords = CERT_EXAM_KEYWORDS[certCode] || [certCode.toLowerCase()]
  return exams.find(ex => {
    const haystack = `${ex.slug || ''} ${ex.name || ''}`.toLowerCase()
    return keywords.some(k => haystack.includes(k))
  }) || null
}

const LEVEL_BADGE = {
  Foundational: 'green',
  Associate:    'blue',
  Professional: 'purple',
  Specialty:    'amber',
}

const EXAM_LEVEL_ORDER = ['Foundational', 'Associate', 'Professional', 'Specialty']

function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()
  const { isSubscribed, fetchSubscription, enrolledExamIds, fetchEnrollments } = usePurchaseStore()
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false)
  const [streakStats, setStreakStats] = useState(null)
  const [examResults, setExamResults] = useState([])
  const [examDates, setExamDates] = useState([])
  const [showExamDateModal, setShowExamDateModal] = useState(false)
  const [selectedExamForDate, setSelectedExamForDate] = useState(null)
  const [pathAnswers, setPathAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cloudexamlab_path_answers')) } catch { return null }
  })
  const [showJourney, setShowJourney] = useState(false)
  const [activePath, setActivePath] = useState(null)
  const allExamsRef = useRef(null)

  const refreshPathAnswers = () => {
    try { setPathAnswers(JSON.parse(localStorage.getItem('cloudexamlab_path_answers'))) } catch { setPathAnswers(null) }
  }

  const journeyComplete = !!(pathAnswers && pathAnswers.role && pathAnswers.completed)

  useEffect(() => {
    fetchExams()
    if (user) {
      fetchSubscription(user.id)
      fetchEnrollments(user.id)
      initializeStreak()
      loadExamResults()
      loadExamDates()
    }
  }, [user])

  useEffect(() => {
    if (!user || journeyComplete) return
    if (sessionStorage.getItem('cloudexamlab_journey_prompted')) return
    sessionStorage.setItem('cloudexamlab_journey_prompted', '1')
    setShowJourney(true)
  }, [user, journeyComplete])

  const startFreeOnPath = (ans) => {
    setShowJourney(false)
    refreshPathAnswers()
    const path = PATHS[ans?.role]
    if (!path) { allExamsRef.current?.scrollIntoView({ behavior: 'smooth' }); return }
    const certs = ans?.skipFoundation && path.certs.length > 1 && path.certs[0].level === 'Foundational'
      ? path.certs.slice(1) : path.certs
    const exam = findExamForCert(certs[0].code, exams)
    if (exam) navigate(`/exam/${exam.slug}`)
    else allExamsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Student'

  const initializeStreak = async () => {
    if (user) {
      await streakService.initializeStreak(user.id)
      streakService.startAutoSync(user.id)
      updateStreakStats()
    }
  }
  const updateStreakStats = () => setStreakStats(streakService.getStreakStats())

  useEffect(() => () => streakService.stopAutoSync(), [])

  useEffect(() => {
    const onVisibility = () => { if (!document.hidden && user) { updateStreakStats(); loadExamResults() } }
    const onFocus = () => { if (user) { updateStreakStats(); loadExamResults() } }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)
    return () => { document.removeEventListener('visibilitychange', onVisibility); window.removeEventListener('focus', onFocus) }
  }, [user])

  // ─── Course Progress ──────────────────────────────────────────────
  const courseProgress = useMemo(() => {
    return SESSION_COURSE_REGISTRY.map(({ course, studySlugFragment }) => {
      let completedIds = []
      try {
        const raw = localStorage.getItem(`course-progress-${course.slug}`)
        if (raw) completedIds = JSON.parse(raw)
      } catch { /* ignore */ }
      const total = course.sessions.length
      const done = completedIds.length
      if (done === 0) return null
      const pct = Math.round((done / total) * 100)
      const nextSession = course.sessions.find(s => !completedIds.includes(s.id))
      const studyExam = exams.find(ex => {
        const h = `${ex.slug || ''} ${ex.name || ''}`.toLowerCase()
        return h.includes(studySlugFragment)
      })
      return { course, done, total, pct, nextSession, studySlug: studyExam?.slug || null }
    }).filter(Boolean)
  }, [exams])

  // ─── Quick Stats ─────────────────────────────────────────────────
  const renderQuickStats = () => {
    const passed = examResults.filter(r => r.passed).length
    const streak = streakStats?.currentStreak || 0
    const upcoming = examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0).length
    const stats = [
      { label: 'Day Streak',  value: streak,             Icon: Flame,         color: '#f59e0b' },
      { label: 'Exams Taken', value: examResults.length, Icon: ClipboardList, color: '#6366f1' },
      { label: 'Passed',      value: passed,             Icon: CheckCircle2,  color: '#10b981' },
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

  // ─── Continue Learning ────────────────────────────────────────────
  const renderContinueLearning = () => {
    if (courseProgress.length === 0) return null
    return (
      <section className="py-6">
        <Container>
          <div className="flex flex-col gap-3">
            {courseProgress.map(({ course, done, total, pct, nextSession, studySlug }) => (
              <div
                key={course.slug}
                style={{
                  background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
                  borderRadius: '1rem', padding: '1.25rem 1.5rem',
                  display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap',
                  border: '1px solid rgba(0,212,170,0.2)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }}
              >
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '0.875rem', flexShrink: 0,
                  background: 'rgba(0,212,170,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>📖</div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#00D4AA', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Continue Learning
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      {pct === 100 ? 'Completed' : `${pct}% complete`}
                    </span>
                  </div>
                  <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                    {course.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, maxWidth: '200px', height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #00D4AA, #00A884)', transition: 'width 0.4s ease' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, flexShrink: 0 }}>
                      {done}/{total} sessions
                    </span>
                  </div>
                  {nextSession && pct < 100 && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.3rem' }}>
                      Next: Session {nextSession.number} — {nextSession.title}
                    </p>
                  )}
                </div>
                {studySlug && (
                  <button
                    onClick={() => navigate(`/exam/${studySlug}/study`)}
                    style={{
                      padding: '0.65rem 1.375rem', borderRadius: '0.625rem', fontWeight: 700,
                      fontSize: '0.875rem', cursor: 'pointer', flexShrink: 0,
                      background: pct === 100 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00D4AA, #00A884)',
                      color: 'white',
                      border: pct === 100 ? '1px solid rgba(255,255,255,0.2)' : 'none',
                      boxShadow: pct < 100 ? '0 4px 14px rgba(0,212,170,0.4)' : 'none',
                    }}
                  >
                    {pct === 100 ? 'Review Course' : 'Continue →'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>
    )
  }

  // ─── Certification Paths ──────────────────────────────────────────
  const renderCertificationPaths = () => {
    const pathList = Object.values(PATHS)

    return (
      <section className="py-12 bg-white">
        <Container>
          <SectionHeader
            label="Career Roadmaps"
            title="Certification Paths"
            className="mb-2"
            action={
              <Button variant="primary" size="sm" onClick={() => setShowJourney(true)}>
                {journeyComplete ? 'Retake Quiz' : 'Find My Path →'}
              </Button>
            }
          />
          <p className="text-gray-500 text-sm mb-6 max-w-xl">
            Not sure where to start? Each path is a structured roadmap from your current role to a target cloud career — with recommended certs and timeline.
          </p>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))' }}>
            {pathList.map((path) => {
              const isActive = activePath === path.key
              const isMyPath = journeyComplete && pathAnswers?.role === path.key
              return (
                <div
                  key={path.key}
                  onClick={() => setActivePath(isActive ? null : path.key)}
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${isMyPath ? path.color : isActive ? path.color + '60' : '#e5e7eb'}`,
                    background: isActive ? `${path.color}08` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    overflow: 'hidden',
                  }}
                  className="hover:shadow-md"
                >
                  {/* Card Header */}
                  <div className="p-4 flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${path.color}14` }}
                    >
                      {path.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-sm font-bold text-[#0A2540]">{path.name}</h3>
                        {isMyPath && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase tracking-wide"
                            style={{ background: `${path.color}18`, color: path.color }}
                          >
                            My Path
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{path.targetRole}</p>
                    </div>
                    <ChevronRight
                      className="w-4 h-4 shrink-0 mt-0.5 transition-transform"
                      style={{ color: path.color, transform: isActive ? 'rotate(90deg)' : 'none' }}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="px-4 pb-3 flex items-center gap-4 border-t border-gray-50">
                    <div className="pt-3">
                      <p className="text-sm font-bold text-[#0A2540]">{path.avgSalary}</p>
                      <p className="text-[0.6875rem] text-gray-400">avg salary</p>
                    </div>
                    <div className="pt-3">
                      <p className="text-sm font-bold text-[#0A2540]">{path.certs.length} certs</p>
                      <p className="text-[0.6875rem] text-gray-400">to target role</p>
                    </div>
                  </div>

                  {/* Expanded cert list */}
                  {isActive && (
                    <div className="px-4 pb-4 border-t" style={{ borderColor: `${path.color}20` }}>
                      <p className="text-xs text-gray-400 pt-3 pb-2 font-semibold uppercase tracking-wide">Certification Steps</p>
                      <div className="flex flex-col gap-2 mb-4">
                        {path.certs.map((cert, idx) => {
                          const exam = findExamForCert(cert.code, exams)
                          return (
                            <div key={cert.code} className="flex items-start gap-2.5">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[0.625rem] font-bold shrink-0 mt-0.5"
                                style={{ background: `${path.color}14`, color: path.color }}
                              >
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Badge color={LEVEL_BADGE[cert.level] || 'blue'} className="text-[0.6rem]">{cert.level}</Badge>
                                  <span className="text-xs font-semibold text-[#0A2540] truncate">{cert.name}</span>
                                </div>
                                {cert.unlocks && <p className="text-[0.6875rem] text-gray-400 mt-0.5 leading-snug">{cert.unlocks}</p>}
                              </div>
                              {exam && (
                                <button
                                  onClick={e => { e.stopPropagation(); navigate(`/exam/${exam.slug}`) }}
                                  className="text-[0.6875rem] font-semibold px-2 py-0.5 rounded shrink-0"
                                  style={{ background: `${path.color}14`, color: path.color }}
                                >
                                  Practice
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={e => {
                            e.stopPropagation()
                            const firstExam = findExamForCert(path.certs[0].code, exams)
                            if (firstExam) navigate(`/exam/${firstExam.slug}`)
                            else allExamsRef.current?.scrollIntoView({ behavior: 'smooth' })
                          }}
                        >
                          Start This Path
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={e => { e.stopPropagation(); setShowJourney(true) }}
                        >
                          Personalize
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {!journeyComplete && (
            <div className="mt-6 rounded-xl p-5 flex items-center gap-4 flex-wrap"
                 style={{ background: 'linear-gradient(135deg, #0A2540, #1A3B5C)', border: '1px solid rgba(0,212,170,0.2)' }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(0,212,170,0.15)' }}>
                  <Sparkles className="w-5 h-5 text-[#00D4AA]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Not sure which path to take?</p>
                  <p className="text-white/60 text-xs mt-0.5">Answer 4 questions and we'll build your personalized roadmap with timeline and salary data.</p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowJourney(true)}>
                Take the Quiz →
              </Button>
            </div>
          )}
        </Container>
      </section>
    )
  }

  // ─── My Path ─────────────────────────────────────────────────────
  const renderMyPath = () => {
    if (!journeyComplete || !PATHS[pathAnswers.role]) return null

    const { experience = 'beginner', role, depth = 'role', hoursPerWeek = 10, skipFoundation = false } = pathAnswers
    const path = PATHS[role]
    const timeline = computeTimeline(path, experience, depth, hoursPerWeek, skipFoundation)
    const visibleCerts = timeline.certs

    const expLabels = { beginner: 'Beginner', it_background: 'IT Background', some_aws: 'Some AWS', experienced: 'Experienced' }
    const depthLabels = { quick: 'Quick Win', role: 'Role Ready', senior: 'Senior Level', expert: 'Expert' }

    return (
      <section className="py-12 bg-gray-50">
        <Container>
          <SectionHeader
            label="Your Certification Journey"
            title={`My Path — ${path.name}`}
            className="mb-6"
            action={
              <Button variant="secondary" size="sm" onClick={() => setShowJourney(true)}>
                Retake Quiz
              </Button>
            }
          />

          <div className="rounded-2xl p-6 sm:p-8 mb-4 relative overflow-hidden"
               style={{ background: `linear-gradient(135deg, ${path.color}14 0%, ${path.color}06 100%)`, border: `1px solid ${path.color}25` }}>
            <div className="absolute w-56 h-56 rounded-full blur-3xl -top-10 -right-10 opacity-15"
                 style={{ background: path.color }} />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
                     style={{ background: `${path.color}18` }}>
                  {path.emoji}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                     style={{ color: path.color }}>{path.targetRole}</p>
                  <h3 className="text-xl font-bold text-[#0A2540]">{path.name} Path</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Est. Timeline', value: `${timeline.months} months` },
                  { label: 'Certifications', value: `${timeline.count} certs` },
                  { label: 'Avg Salary', value: path.avgSalary },
                  { label: 'Job Demand', value: path.jobDemand.split(' ').slice(0,2).join(' ') },
                ].map((s, i) => (
                  <div key={i} className="bg-white/70 rounded-lg p-3 border border-white/80">
                    <p className="text-base font-bold text-[#0A2540] leading-tight">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {[expLabels[experience], depthLabels[depth]].map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full text-[0.6875rem] font-semibold border"
                        style={{ background: `${path.color}14`, color: path.color, borderColor: `${path.color}28` }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            {visibleCerts.map((cert, idx) => (
              <Card key={cert.code} className="flex items-start gap-4 p-4"
                    style={{ borderLeft: `3px solid ${path.color}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5"
                     style={{ background: `${path.color}14`, color: path.color }}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge color={LEVEL_BADGE[cert.level] || 'blue'}>{cert.level}</Badge>
                    <span className="text-[0.6875rem] text-gray-400 font-medium">{cert.code}</span>
                  </div>
                  <p className="text-sm font-bold text-[#0A2540] mb-0.5">{cert.name}</p>
                  {cert.unlocks && <p className="text-xs text-gray-500 leading-snug">{cert.unlocks}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-[#0A2540]">~{timeline.markers[idx]}w</p>
                  <p className="text-[0.6875rem] text-gray-400">${cert.cost}</p>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button variant="primary" size="lg"
                    onClick={() => {
                      const exam = findExamForCert(visibleCerts[0].code, exams)
                      if (exam) navigate(`/exam/${exam.slug}`)
                      else allExamsRef.current?.scrollIntoView({ behavior: 'smooth' })
                    }}>
              Start Practicing →
            </Button>
            {!isSubscribed && (
              <Button variant="secondary" size="lg" onClick={() => setShowEnrollmentModal(true)}>
                Unlock Full Access
              </Button>
            )}
          </div>
        </Container>
      </section>
    )
  }

  // ─── Exam Countdown ───────────────────────────────────────────────
  const renderExamCountdown = () => {
    const future = [...examDates.filter(d => calculateDaysUntil(d.exam_date) >= 0)]
      .sort((a, b) => new Date(a.exam_date) - new Date(b.exam_date))
    if (future.length === 0) return null

    return (
      <section className="py-12 bg-white">
        <Container>
          <SectionHeader label="Your Exam Schedule" title="Exam Countdown" className="mb-6" />
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

  // ─── Progress Row ─────────────────────────────────────────────────
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
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="grid gap-6 items-stretch dashboard-progress-row"
               style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
            {renderStreak()}
            {renderRecentResults()}
          </div>
        </Container>
      </section>
    )
  }

  // ─── All Exams ────────────────────────────────────────────────────
  const renderAllExams = () => {
    if (exams.length === 0) return null

    // Group exams by level
    const grouped = {}
    for (const level of EXAM_LEVEL_ORDER) grouped[level] = []
    for (const exam of exams) {
      const level = exam.level || 'Associate'
      if (!grouped[level]) grouped[level] = []
      grouped[level].push(exam)
    }
    const nonEmpty = EXAM_LEVEL_ORDER.filter(l => grouped[l].length > 0)

    return (
      <section ref={allExamsRef} className="py-12 bg-white">
        <Container>
          <SectionHeader label="All Practice Exams" title="Available Exams" className="mb-2" />
          <p className="text-gray-500 text-sm mb-6">
            {isSubscribed
              ? 'You have full access to all exams below. Start a practice session anytime.'
              : 'Free samples available for every exam. Subscribe for full access to all question sets.'}
          </p>

          {/* Subscribe banner for non-subscribers */}
          {!isSubscribed && (
            <div className="mb-6 rounded-xl p-4 flex items-center gap-4 flex-wrap"
                 style={{ background: 'linear-gradient(135deg, #0A2540, #1A3B5C)', border: '1px solid rgba(0,212,170,0.25)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Unlock all question sets</p>
                <p className="text-white/60 text-xs mt-0.5">One subscription gives you full access to every exam on the platform. Plans from $5/month.</p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setShowEnrollmentModal(true)}>
                View Plans →
              </Button>
            </div>
          )}

          {nonEmpty.map(level => (
            <div key={level} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Badge color={LEVEL_BADGE[level] || 'blue'}>{level}</Badge>
                <span className="text-xs text-gray-400 font-medium">{grouped[level].length} exam{grouped[level].length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
                {grouped[level].map(exam => {
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
                        <Button
                          variant="primary"
                          size="sm"
                          className="flex-1"
                          onClick={e => { e.stopPropagation(); navigate(`/exam/${exam.slug}`) }}
                        >
                          {isSubscribed ? 'Start Practicing' : 'Try Free'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={e => { e.stopPropagation(); setSelectedExamForDate(exam); setShowExamDateModal(true) }}
                          title={`${scheduled ? 'Update' : 'Set'} exam date`}
                        >
                          <CalendarDays className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </Container>
      </section>
    )
  }

  // ─── Subscription Summary ─────────────────────────────────────────
  const renderSubscriptionSummary = () => {
    const { subscription } = usePurchaseStore.getState()
    if (!isSubscribed) return null
    return (
      <section className="py-12 bg-white">
        <Container>
          <SectionHeader label="Account" title="Subscription" className="mb-6" />
          {subscription && (
            <Card className="p-5 border-[#00D4AA]! border-2">
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#0A2540] mb-1">Active Subscription</h3>
                  <p className="text-sm text-gray-500">
                    {subscription.subscription_plans?.name || 'Plan'} — Full access to all exams
                  </p>
                  {subscription.current_period_end && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Badge color="green">Active</Badge>
              </div>
            </Card>
          )}
        </Container>
      </section>
    )
  }

  // ─── Footer ───────────────────────────────────────────────────────
  const renderDashboardFooter = () => (
    <footer className="bg-[#0A2540] py-12 w-full">
      <Container>
        <div className="grid gap-8 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#00D4AA] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-sm font-bold text-white">Cloud Exam Lab</h3>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              Master cloud certifications with professional exam practice. AWS, Azure, and GCP.
            </p>
          </div>
          <div>
            <h4 className="text-[0.6875rem] font-bold text-white/35 uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Browse Exams', action: () => allExamsRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                { label: 'Dashboard', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
                { label: 'Support', href: 'mailto:cloudexamlab@gmail.com' },
              ].map((item, i) => (
                <li key={i}>
                  {item.href
                    ? <a href={item.href} className="text-white/50 hover:text-white/90 text-xs transition-colors">{item.label}</a>
                    : <button onClick={item.action} className="text-white/50 hover:text-white/90 text-xs transition-colors bg-transparent border-0 p-0 cursor-pointer">{item.label}</button>
                  }
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[0.6875rem] font-bold text-white/35 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: 'All Certifications', section: 'certifications' },
                { label: 'Pricing', section: 'pricing' },
                { label: 'FAQ', section: 'faq' },
              ].map((item, i) => (
                <li key={i}>
                  <button
                    onClick={() => { navigate('/'); setTimeout(() => document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' }), 100) }}
                    className="text-white/50 hover:text-white/90 text-xs transition-colors bg-transparent border-0 p-0 cursor-pointer">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-6 border-t border-white/[0.08] text-center">
          <p className="text-[0.6875rem] text-white/30 leading-relaxed max-w-2xl mx-auto mb-2">
            <strong className="text-white/40">Disclaimer:</strong> Independent practice questions for certification preparation.
            Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, Google Cloud Platform (GCP),
            or any other certification provider. All trademarks are property of their respective owners.
          </p>
          <p className="text-[0.6875rem] text-white/25">© {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  )

  // ─── Main ─────────────────────────────────────────────────────────
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
                  Dashboard
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
                  Welcome back, {userName}!
                </h1>
                <p className="text-white/60 text-sm sm:text-base max-w-md">
                  {isSubscribed
                    ? 'You have full access to all exams. Keep up the great work!'
                    : 'Free samples available for every exam. Subscribe to unlock everything.'}
                </p>
              </div>
              {!isSubscribed && (
                <Button variant="primary" size="lg" className="shrink-0 shadow-teal"
                        onClick={() => setShowEnrollmentModal(true)}>
                  Subscribe for Full Access
                </Button>
              )}
              {isSubscribed && (
                <div className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-[#00D4AA] bg-[#00D4AA]/10 border border-[#00D4AA]/20 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Full Access Active
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Stats */}
        {renderQuickStats()}

        {/* Continue Learning */}
        {renderContinueLearning()}

        {/* Certification Paths — always visible, helps users discover all paths */}
        {renderCertificationPaths()}

        {/* My Path — only shown after quiz */}
        {renderMyPath()}

        {/* Exam Countdown */}
        {renderExamCountdown()}

        {/* Progress: Streak + Recent Results */}
        {renderProgressRow()}

        {/* All Exams — single section, subscription-aware */}
        {renderAllExams()}

        {/* Subscription Summary */}
        {renderSubscriptionSummary()}
      </div>

      {renderDashboardFooter()}

      <CloudCertificationJourneyModal
        isOpen={showJourney}
        onClose={() => { setShowJourney(false); refreshPathAnswers() }}
        onStartFree={startFreeOnPath}
        onSubscribe={() => { setShowJourney(false); refreshPathAnswers(); setShowEnrollmentModal(true) }}
      />

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
