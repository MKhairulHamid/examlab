import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import ExamLandingSection from '../components/exam/ExamLandingSection'
import { Button, Badge } from '../design-system'
import supabase from '../services/supabase'
import studyProgressService from '../services/studyProgressService'
import progressService from '../services/progressService'
import certificateService, { buildVerifyPath } from '../services/certificateService'
import CertificateCard from '../components/certificate/CertificateCard'
import HowToEarn from '../components/certificate/HowToEarn'
import { getSessionCourse } from '../utils/sessionCourses'
import BackLink from '../components/layout/BackLink'
import { getProgram } from '../data/programs'
import { getOfficialResourceUrl } from '../utils/officialResources'
import {
  FileText, Clock, Target, BookOpen, ExternalLink, Lock, BarChart2,
  GraduationCap, TrendingUp, TrendingDown, CheckCircle2, PlayCircle, Sparkles, ArrowRight, AlertTriangle,
} from 'lucide-react'

function ExamDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getExamBySlug, fetchQuestionSets, questionSets } = useExamStore()
  const { user, profile } = useAuthStore()
  const { isSubscribed, fetchSubscription, fetchPromoAccess, hasExamAccess } = usePurchaseStore()
  const [exam, setExam] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [examResults, setExamResults] = useState([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(true)
  const [completedSessions, setCompletedSessions] = useState([])
  const [inProgressExam, setInProgressExam] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const issueAttempted = useRef(false)

  // Session-based study course for this exam (null for exams without one).
  const course = useMemo(() => getSessionCourse(slug), [slug])

  useEffect(() => {
    // Reset loading state SYNCHRONOUSLY so the component never renders
    // stale "no sets" data from a previous exam page visit.
    setLoadingQuestionSets(true)
    setInProgressExam(null)

    const loadExam = async () => {
      const examData = await getExamBySlug(slug)
      setExam(examData)

      if (examData) {
        await fetchQuestionSets(examData.id)

        if (user) {
          await fetchSubscription(user.id)
          await fetchPromoAccess(user.id)
          await loadExamResults(examData.id)
        }
      }
      setLoadingQuestionSets(false)
    }

    loadExam()
  }, [slug, user])

  // Study progress — hydrate instantly from localStorage, then let the DB
  // (cross-device source of truth) override. Mirrors SessionCourse's storage keys.
  useEffect(() => {
    if (!course) { setCompletedSessions([]); return }
    try {
      const cached = localStorage.getItem(`course-progress-${course.slug}`)
      if (cached) setCompletedSessions(JSON.parse(cached))
    } catch { /* ignore */ }

    if (!user) return
    let cancelled = false
    studyProgressService.load(user.id, course.slug).then(data => {
      if (cancelled || !data) return
      setCompletedSessions(Array.isArray(data.completedSessions) ? data.completedSessions : [])
    })
    return () => { cancelled = true }
  }, [course, user])

  // Detect an unfinished practice exam across this exam's question sets.
  useEffect(() => {
    if (!user || !questionSets.length) return
    let cancelled = false
    const findOngoing = async () => {
      for (const set of questionSets) {
        const ip = await progressService.findInProgressExam(user.id, set.id)
        if (cancelled) return
        if (ip) {
          setInProgressExam({
            ...ip,
            setName: set.name,
            questionCount: set.question_count || 0,
            answeredCount: ip.answers ? Object.keys(ip.answers).filter(k => (ip.answers[k] || []).length > 0).length : 0,
          })
          return
        }
      }
    }
    findOngoing()
    return () => { cancelled = true }
  }, [user, questionSets])

  const loadExamResults = async (examTypeId) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          question_sets!inner (
            name,
            exam_type_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .eq('question_sets.exam_type_id', examTypeId)
        .order('completed_at', { ascending: false })

      if (error) throw error

      const transformedResults = (data || []).map(result => ({
        id: result.id,
        userId: result.user_id,
        questionSetId: result.question_set_id,
        startedAt: result.started_at,
        completedAt: result.completed_at,
        timeSpent: result.time_spent_seconds,
        answers: result.answers_json,
        rawScore: result.raw_score,
        percentageScore: result.percentage_score,
        scaledScore: result.scaled_score,
        passed: result.passed,
        questionSetName: result.question_sets?.name || 'Question Set',
        totalQuestions: result.answers_json ? Object.keys(result.answers_json).length : 0
      }))

      setExamResults(transformedResults)
    } catch (error) {
      console.error('Error loading exam results:', error)
      setExamResults([])
    }
  }

  // Paid subscription unlocks all exams; a redeemed promo unlocks just this one.
  const hasAccess = isSubscribed || (exam ? hasExamAccess(exam.id) : false)
  const freeSet = questionSets.find(set => set.is_free_sample || set.price_cents === 0)
  const paidSets = questionSets.filter(set => !set.is_free_sample && set.price_cents > 0)
  const officialUrl = exam ? getOfficialResourceUrl(exam) : null

  // The set a "take a practice exam" CTA should open: a free sample if there is
  // one, otherwise the first set (only reachable when subscribed).
  const practiceTarget = freeSet || (hasAccess ? questionSets[0] : null)
  const startPractice = () => {
    if (practiceTarget) navigate(`/exam/${slug}/take?set=${practiceTarget.id}`)
    else setShowPurchaseModal(true)
  }
  const startStudy = () => navigate(`/exam/${slug}/study`)

  // Per-domain study completion (only for exams that have a session course).
  const studyStats = useMemo(() => {
    if (!course) return null
    const done = new Set(completedSessions)
    const byDomain = course.modules
      .filter(m => m.id !== 'exam')
      .map(m => {
        const sessions = course.sessions.filter(s => s.domain === m.id)
        return { ...m, total: sessions.length, done: sessions.filter(s => done.has(s.id)).length }
      })
    const totalSessions = course.sessions.length
    const totalDone = course.sessions.filter(s => done.has(s.id)).length
    const nextDomain = byDomain.find(d => d.done < d.total) || null
    return { byDomain, totalSessions, totalDone, nextDomain, allDone: totalDone >= totalSessions }
  }, [course, completedSessions])

  // Practice-exam performance summary.
  const practiceStats = useMemo(() => {
    const scores = examResults.map(r => r.percentageScore).filter(n => typeof n === 'number')
    if (!scores.length) return { attempts: 0, best: null, latest: null, first: null, trend: null, passed: false }
    return {
      attempts: examResults.length,
      best: Math.max(...scores),
      latest: examResults[0].percentageScore,                    // results are newest-first
      first: examResults[examResults.length - 1].percentageScore,
      trend: scores.length > 1 ? examResults[0].percentageScore - examResults[examResults.length - 1].percentageScore : null,
      passed: examResults.some(r => r.passed),
    }
  }, [examResults])

  const passThreshold = exam?.passing_score && exam?.max_score
    ? Math.round((exam.passing_score / exam.max_score) * 100)
    : 70

  // Overall readiness level — drives the badge and the recommended next action.
  const readiness = useMemo(() => {
    const studied = studyStats?.totalDone || 0
    const { attempts, best, passed } = practiceStats
    if (studied === 0 && attempts === 0)
      return { level: 'Not started', color: '#9ca3af', hint: 'Begin with the study material' }
    if (passed || (best != null && best >= passThreshold))
      return { level: 'Exam ready', color: '#10b981', hint: 'You\'ve cleared the passing bar in practice' }
    if (attempts > 0 && best != null && best >= passThreshold - 10)
      return { level: 'Almost ready', color: '#00D4AA', hint: 'A little more practice and you\'re there' }
    return { level: 'In progress', color: '#f59e0b', hint: 'Keep working through the material' }
  }, [studyStats, practiceStats, passThreshold])

  // The single most useful next step, given where the learner is.
  const nextAction = useMemo(() => {
    if (!course) return null
    const studied = studyStats?.totalDone || 0
    const { attempts, best } = practiceStats

    if (studied === 0 && attempts === 0) {
      const first = studyStats?.byDomain[0]
      return { title: `Start with ${first?.label || 'Domain 1'}`, sub: `${first?.total || 0} sessions · build your foundation`, label: 'Begin studying', onClick: startStudy }
    }
    if (!studyStats?.allDone) {
      const nd = studyStats.nextDomain
      const remaining = nd ? nd.total - nd.done : 0
      return { title: `Continue ${nd?.label || 'studying'}`, sub: `${remaining} session${remaining === 1 ? '' : 's'} left in this domain`, label: 'Continue studying', onClick: startStudy }
    }
    if (attempts === 0)
      return { title: 'You\'ve finished every study session', sub: 'Test your readiness with a full practice exam', label: 'Take a practice exam', onClick: startPractice }
    if (best != null && best < passThreshold - 10)
      return { title: `Best score ${best}% — revisit your weak domains`, sub: 'Review the material, then try again', label: 'Review study material', onClick: startStudy }
    if (best != null && best < passThreshold)
      return { title: `Best score ${best}% — you're close`, sub: 'One more focused pass, then retake the exam', label: 'Retake practice exam', onClick: startPractice }
    return { title: 'You\'re ready to sit the real exam', sub: `Best practice score: ${best}%`, label: 'Take another practice exam', onClick: startPractice }
  }, [course, studyStats, practiceStats, passThreshold])

  // ── Proficiency credential ──────────────────────────────────────────────
  // Earned by completing all study sessions AND passing the program's final
  // mock exam. Only programs with a guided session course can earn it.
  const program = useMemo(() => (exam ? getProgram(exam.slug) : null), [exam])
  const finalExamSet = useMemo(() => questionSets.find(s => s.is_final_exam), [questionSets])
  const examPassedFinal = useMemo(() => {
    if (!finalExamSet) return false
    return examResults.some(r => r.passed && r.questionSetId === finalExamSet.id)
  }, [examResults, finalExamSet])
  const studyComplete = !!studyStats?.allDone
  const eligibleForCert = studyComplete && examPassedFinal
  const recipientName = (profile?.full_name && profile.full_name.trim())
    || user?.email?.split('@')[0] || ''

  // Load an already-issued certificate for this program.
  useEffect(() => {
    if (!user || !program) { setCertificate(null); return }
    let cancelled = false
    certificateService.listMine().then(mine => {
      if (cancelled) return
      setCertificate(mine.find(c => c.programCode === program.code) || null)
    })
    return () => { cancelled = true }
  }, [user, program])

  // Auto-issue once both gates are met (idempotent server-side; guarded here too).
  useEffect(() => {
    if (!eligibleForCert || certificate || issueAttempted.current) return
    if (!program || !studyStats?.totalSessions) return
    issueAttempted.current = true
    certificateService.issue(program.code, studyStats.totalSessions).then(({ certificate: c }) => {
      if (c) setCertificate(c)
    })
  }, [eligibleForCert, certificate, program, studyStats])

  if (!exam) {
    return (
      <div className="loading-container">
        <div className="loading-content">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">

        {/* Back button */}
        <BackLink to="/dashboard" label="Dashboard" tone="light" className="mb-4 sm:mb-6" />

        {/* Resume an unfinished practice exam */}
        {inProgressExam && (
          <button
            onClick={() => navigate(`/exam/${slug}/take?set=${inProgressExam.questionSetId}`)}
            className="w-full mb-4 sm:mb-6 flex items-center gap-3 sm:gap-4 text-left bg-[#00D4AA]/10 hover:bg-[#00D4AA]/15 border border-[#00D4AA]/30 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center shrink-0">
              <PlayCircle className="w-6 h-6 text-[#00A884]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#0A2540] font-bold text-[0.9375rem]">Resume your practice exam</div>
              <div className="text-gray-500 text-[0.8125rem] truncate">
                {inProgressExam.setName}
                {inProgressExam.questionCount > 0 && ` · ${inProgressExam.answeredCount}/${inProgressExam.questionCount} answered`}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#00D4AA] shrink-0" />
          </button>
        )}

        {/* Exam Header Card */}
        <div className="exam-header-card">
          <div className="exam-header-icon"><GraduationCap className="w-11 h-11 text-[#00D4AA]" strokeWidth={1.5} /></div>
          <div className="exam-header-provider">{exam.provider}</div>
          <h1 className="exam-header-title">{exam.name}</h1>
          <p className="exam-header-description">{exam.description}</p>
          <div className="exam-header-meta">
            <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 opacity-70" />{exam.total_questions || 'N/A'} Questions</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-70" />{exam.duration_minutes || 'N/A'} min</span>
            {exam.passing_score && <span className="inline-flex items-center gap-1.5"><Target className="w-3.5 h-3.5 opacity-70" />Pass: {exam.passing_score}/{exam.max_score || 1000}</span>}
          </div>
          {officialUrl && (
            <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <a
                href={officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/[0.17] text-white rounded-xl font-semibold border border-white/20 hover:border-white/30 transition-all duration-200 text-[0.9375rem] no-underline"
              >
                <ExternalLink className="w-4 h-4" /> Official Exam Page
              </a>
            </div>
          )}
        </div>

        {/* Prep Readiness — only for exams with a guided session course */}
        {course && user && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <h2 className="text-[#0A2540] font-bold text-lg inline-flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#00D4AA]" /> Your Exam Prep
                </h2>
                <span
                  className="px-3 py-1 rounded-full text-[0.8125rem] font-bold border"
                  style={{ color: readiness.color, borderColor: `${readiness.color}66`, background: `${readiness.color}1a` }}
                >
                  {readiness.level}
                </span>
              </div>

              {/* Three stats */}
              <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))' }}>
                {/* Study */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[#00D4AA] mb-1.5 inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> Study Sessions
                  </div>
                  <div className="text-[#0A2540] font-extrabold text-2xl tabular-nums">
                    {studyStats.totalDone}<span className="text-gray-300 text-base font-bold"> / {studyStats.totalSessions}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00D4AA] rounded-full transition-all duration-500" style={{ width: `${studyStats.totalSessions ? (studyStats.totalDone / studyStats.totalSessions) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Practice attempts */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[#00D4AA] mb-1.5 inline-flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5" /> Practice Attempts
                  </div>
                  <div className="text-[#0A2540] font-extrabold text-2xl tabular-nums">{practiceStats.attempts}</div>
                  <div className="text-gray-500 text-[0.75rem] mt-2">
                    {practiceStats.best != null ? `Best score ${practiceStats.best}%` : 'No attempts yet'}
                  </div>
                </div>

                {/* Best score vs pass line */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-[#00D4AA] mb-1.5 inline-flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> Best vs Pass
                  </div>
                  <div className="text-[#0A2540] font-extrabold text-2xl tabular-nums">
                    {practiceStats.best != null ? `${practiceStats.best}%` : '—'}
                    <span className="text-gray-300 text-base font-bold"> / {passThreshold}%</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden relative">
                    {practiceStats.best != null && (
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, practiceStats.best)}%`, background: practiceStats.best >= passThreshold ? '#10b981' : '#f59e0b' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended next action */}
            {nextAction && (
              <div className="border-t border-gray-100 bg-[#00D4AA]/[0.06] p-5 sm:p-6 flex items-center gap-4 flex-wrap">
                <Sparkles className="w-5 h-5 text-[#00A884] shrink-0" />
                <div className="flex-1 min-w-[180px]">
                  <div className="text-[#0A2540] font-bold text-[0.9375rem]">{nextAction.title}</div>
                  <div className="text-gray-500 text-[0.8125rem]">{nextAction.sub}</div>
                </div>
                <Button variant="primary" onClick={nextAction.onClick} className="shadow-teal gap-1.5 shrink-0">
                  {nextAction.label} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Earn your Proficiency credential */}
        {course && user && program && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden p-5 sm:p-6">
            <div className="grid gap-6 items-start" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
              <CertificateCard
                program={program}
                state={certificate ? 'earned' : 'in-progress'}
                name={certificate ? certificate.recipientName : recipientName}
                score={certificate?.percentageScore}
                credentialCode={certificate?.credentialCode}
                issuedAt={certificate?.issuedAt}
              />
              <div>
                {certificate ? (
                  <div className="rounded-xl border border-[#00D4AA]/30 bg-[#00D4AA]/[0.06] p-5 sm:p-6">
                    <h3 className="text-[#0A2540] font-bold text-lg mb-1.5">Credential earned 🎉</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Your {program.shortName} Readiness credential is live with a public verification link.
                    </p>
                    <Button variant="primary" onClick={() => navigate(buildVerifyPath(certificate.programCode, certificate.credentialCode))} className="gap-2">
                      View / share credential <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <HowToEarn
                    program={program}
                    mode="live"
                    studyDone={studyStats.totalDone}
                    studyTotal={studyStats.totalSessions}
                    examPassed={examPassedFinal}
                    onStudy={startStudy}
                    onExam={() => {
                      const target = finalExamSet && (finalExamSet.is_free_sample || hasAccess)
                        ? finalExamSet
                        : practiceTarget
                      if (target) navigate(`/exam/${slug}/take?set=${target.id}`)
                      else setShowPurchaseModal(true)
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certification Landing Info */}
        <ExamLandingSection landing={exam.landing_content} />

        {/* Study Material — a first-class offering, co-equal with the practice exams */}
        <h2 className="section-title mt-8 !text-[#0A2540]">Study Material</h2>
        {course && studyStats ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
              <div className="min-w-0">
                <h3 className="text-[#0A2540] font-bold text-base">{course.title}</h3>
                <p className="text-gray-500 text-[0.8125rem] mt-0.5">{course.subtitle}</p>
              </div>
              {hasAccess ? (
                <span className="px-3 py-1 bg-[#00D4AA]/20 text-[#00D4AA] rounded-lg text-sm font-semibold shrink-0">
                  ✓ Subscribed
                </span>
              ) : (
                <span className="badge-free shrink-0">✓ Free preview</span>
              )}
            </div>

            {/* Per-domain progress — the clearest "what to study next" signal */}
            <div className="flex flex-col gap-3 mb-5">
              {studyStats.byDomain.map(d => {
                const pct = d.total ? Math.round((d.done / d.total) * 100) : 0
                const complete = d.total > 0 && d.done >= d.total
                return (
                  <div key={d.id} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center border"
                      style={{
                        background: complete ? '#10b981' : '#f3f4f6',
                        borderColor: complete ? '#10b981' : '#d1d5db',
                      }}
                    >
                      {complete && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2 mb-1">
                        <span className="text-gray-700 text-[0.8125rem] truncate">
                          {d.label}{d.weight && d.weight !== '—' ? ` · ${d.weight}` : ''}
                        </span>
                        <span className="text-gray-400 text-[0.75rem] tabular-nums shrink-0">{d.done}/{d.total}</span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: complete ? '#10b981' : '#00D4AA' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={startStudy} className="start-exam-button">
              {studyStats.totalDone === 0
                ? (hasAccess ? 'Start Studying →' : 'Start Free Preview →')
                : studyStats.allDone ? 'Review Study Material →' : 'Continue Studying →'}
            </button>
            {!hasAccess && (
              <p className="text-gray-500 text-[0.75rem] text-center mt-2.5">
                First domain free · Subscribe to unlock the full course
              </p>
            )}
          </div>
        ) : (
          <div className="question-sets-grid">
            <div className="question-set-card">
              <div className="question-set-header">
                <h3 className="question-set-title">Full Study Course</h3>
                {hasAccess ? (
                  <span className="px-3 py-1 bg-[#00D4AA]/20 text-[#00D4AA] rounded-lg text-sm font-semibold">
                    ✓ Subscribed
                  </span>
                ) : (
                  <span className="badge-free">✓ Free preview</span>
                )}
              </div>
              <p className="question-set-description">
                Comprehensive, exam-aligned lessons across every domain — key concepts, AWS service
                breakdowns, exam tips, and a practice question in each session. Learn the material in
                depth, then prove it with the practice exams.
              </p>
              <div className="question-set-meta">
                <span className="inline-flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 opacity-60" />Guided sessions</span>
                <span>Every exam domain</span>
              </div>
              <button
                onClick={() => navigate(`/exam/${slug}/study`)}
                className="start-exam-button"
              >
                {hasAccess ? 'Continue Studying →' : 'Start Free Preview →'}
              </button>
              {!hasAccess && (
                <p className="text-gray-500 text-[0.75rem] text-center mt-2.5">
                  First domain free · Subscribe to unlock the full course
                </p>
              )}
            </div>
          </div>
        )}

        {/* Question Sets */}
        <h2 className="section-title mt-8 !text-[#0A2540]">Question Sets</h2>
        <div className="question-sets-grid">
          {loadingQuestionSets ? (
            <div className="col-span-full empty-state">
              <div>Loading question sets...</div>
            </div>
          ) : paidSets.length > 0 && !freeSet && !hasAccess ? (
            <div className="col-span-full bg-white rounded-2xl p-10 border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] text-center">
              <div className="mb-4 flex justify-center"><Lock className="w-10 h-10 text-gray-300" /></div>
              <h3 className="text-xl font-bold text-[#0A2540] mb-2">Subscribe to Access Question Sets</h3>
              <p className="text-gray-500 text-[0.9375rem] mb-6 max-w-[400px] mx-auto">
                Get full access to all practice exams and question sets with an active subscription.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowPurchaseModal(true)}
                className="shadow-teal"
              >
                View Plans
              </Button>
            </div>
          ) : questionSets.length === 0 ? (
            <div className="col-span-full empty-state">
              <div>No question sets available yet.</div>
            </div>
          ) : (
            questionSets.map(set => {
              const isFree = set.is_free_sample || set.price_cents === 0
              const isLocked = !isFree && !hasAccess

              return (
                <div
                  key={set.id}
                  className="question-set-card"
                  style={{ opacity: isLocked ? 0.7 : 1 }}
                >
                  <div className="question-set-header">
                    <h3 className="question-set-title">{set.name}</h3>
                    {isFree ? (
                      <span className="badge-free">✓ Free</span>
                    ) : hasAccess ? (
                      <span className="px-3 py-1 bg-[#00D4AA]/20 text-[#00D4AA] rounded-lg text-sm font-semibold">
                        ✓ Subscribed
                      </span>
                    ) : (
                      <span className="badge-locked inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Subscribe</span>
                    )}
                  </div>
                  <p className="question-set-description">{set.description}</p>
                  <div className="question-set-meta">
                    <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 opacity-60" />{set.question_count} Questions</span>
                    <span>Set {set.set_number}</span>
                  </div>

                  {set.is_final_exam && (
                    <div className="flex items-start gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[0.8125rem] leading-snug">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Final exam — <strong>one attempt only</strong>. This result defines your certificate and cannot be retaken.</span>
                    </div>
                  )}

                  {(isFree || hasAccess) ? (
                    (() => {
                      const completedFinal = set.is_final_exam
                        ? examResults.find(r => r.questionSetId === set.id)
                        : null
                      if (completedFinal) {
                        return (
                          <button
                            onClick={() => navigate(`/exam/${slug}/results?resultId=${completedFinal.id}&set=${set.id}`)}
                            className="w-full py-3 bg-gray-100 text-[#0A2540] border border-gray-300 rounded-lg font-semibold cursor-pointer text-sm hover:bg-gray-200 transition-all duration-200 inline-flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Completed ({completedFinal.percentageScore}%) — View Result
                          </button>
                        )
                      }
                      return (
                        <button
                          onClick={() => {
                            if (set.is_final_exam && !window.confirm('This is your final exam. You can take it only once — the result defines your certificate and cannot be retaken. Start now?')) return
                            navigate(`/exam/${slug}/take?set=${set.id}`)
                          }}
                          className="start-exam-button"
                        >
                          {set.is_final_exam ? 'Start Final Exam →' : 'Start Practice Exam →'}
                        </button>
                      )
                    })()
                  ) : (
                    <button
                      onClick={() => setShowPurchaseModal(true)}
                      className="w-full py-3 bg-[#00D4AA]/10 text-[#00D4AA] border-2 border-[#00D4AA]/30 rounded-lg font-semibold cursor-pointer text-sm hover:bg-[#00D4AA]/20 hover:border-[#00D4AA]/50 transition-all duration-200 inline-flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" /> Subscribe to Unlock
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Enrollment CTA */}
        {paidSets.length > 0 && !hasAccess && (
          <div className="mt-12 rounded-2xl p-8 text-center border border-white/10"
               style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', boxShadow: '0 4px 24px rgba(10,37,64,0.12)' }}>
            <h3 className="text-2xl font-bold text-white mb-4">Get Full Access</h3>
            <p className="text-white/80 text-base mb-6">
              Subscribe to unlock all {paidSets.length} question sets and every exam on the platform. Plans start at $5/month.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowPurchaseModal(true)}
              className="!px-8 !py-3.5 !text-lg shadow-teal"
            >
              View Plans
            </Button>
          </div>
        )}

        {/* Exam Attempts History */}
        {examResults.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="section-title !mb-0 !text-[#0A2540]">Your Exam Attempts</h2>
              {practiceStats.trend != null && (
                <span
                  className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold"
                  style={{ color: practiceStats.trend >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {practiceStats.trend >= 0
                    ? <TrendingUp className="w-4 h-4" />
                    : <TrendingDown className="w-4 h-4" />}
                  {practiceStats.first}% → {practiceStats.latest}%
                  {' '}({practiceStats.trend >= 0 ? '+' : ''}{practiceStats.trend} pts over {practiceStats.attempts} attempts)
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 mt-4">
              {examResults.map((result) => {
                const passColor = result.passed ? '#10b981' : '#ef4444'
                const passIcon = result.passed ? '✓' : '✗'

                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-2xl p-[clamp(1rem,3vw,1.5rem)] border border-gray-200 shadow-[0_1px_4px_rgba(0,0,0,0.06)] cursor-pointer transition-all duration-200 hover:shadow-[0_6px_24px_rgba(0,0,0,0.09)] hover:translate-x-1"
                    style={{ borderLeft: `4px solid ${passColor}` }}
                    onClick={() => navigate(`/exam/${slug}/results?resultId=${result.id}&set=${result.questionSetId}`)}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Status Icon + Details */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-[0.625rem] flex items-center justify-center text-white font-bold text-xl shrink-0"
                          style={{ background: passColor }}
                        >
                          {passIcon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-[0.9375rem] font-bold text-[#0A2540] truncate max-w-full">
                              {result.questionSetName || 'Practice Exam'}
                            </h3>
                            <Badge color={result.passed ? 'green' : 'red'} className="shrink-0">
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </Badge>
                          </div>
                          <div className="text-[0.8125rem] text-gray-500 truncate">
                            {new Date(result.completedAt).toLocaleDateString()} • {Math.floor(result.timeSpent / 60)} min
                          </div>
                        </div>
                      </div>

                      {/* Score + Arrow */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold" style={{ color: passColor }}>
                            {result.percentageScore}%
                          </div>
                          <div className="text-[0.6875rem] text-gray-400">
                            {result.rawScore}/{result.totalQuestions}
                          </div>
                        </div>
                        <div className="text-gray-300 text-xl">→</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <EnrollmentModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </div>
  )
}

export default ExamDetail
