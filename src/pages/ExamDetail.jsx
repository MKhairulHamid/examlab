import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useExamStore from '../stores/examStore'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import EnrollmentModal from '../components/enrollment/EnrollmentModal'
import ExamLandingSection from '../components/exam/ExamLandingSection'
import { Button } from '../design-system'
import supabase from '../services/supabase'
import { getOfficialResourceUrl } from '../utils/officialResources'
import { FileText, Clock, Target, BookOpen, ExternalLink, Lock, BarChart2, GraduationCap } from 'lucide-react'

function ExamDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { getExamBySlug, fetchQuestionSets, questionSets } = useExamStore()
  const { user } = useAuthStore()
  const { isSubscribed, fetchSubscription } = usePurchaseStore()
  const [exam, setExam] = useState(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [examResults, setExamResults] = useState([])
  const [loadingQuestionSets, setLoadingQuestionSets] = useState(true)

  useEffect(() => {
    // Reset loading state SYNCHRONOUSLY so the component never renders
    // stale "no sets" data from a previous exam page visit.
    setLoadingQuestionSets(true)

    const loadExam = async () => {
      const examData = await getExamBySlug(slug)
      setExam(examData)

      if (examData) {
        await fetchQuestionSets(examData.id)

        if (user) {
          await fetchSubscription(user.id)
          await loadExamResults(examData.id)
        }
      }
      setLoadingQuestionSets(false)
    }

    loadExam()
  }, [slug, user])

  const loadExamResults = async (examTypeId) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('exam_attempts')
        .select(`
          *,
          question_sets (
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

  if (!exam) {
    return (
      <div className="loading-container">
        <div className="loading-content">Loading...</div>
      </div>
    )
  }

  const hasAccess = isSubscribed
  const freeSet = questionSets.find(set => set.is_free_sample || set.price_cents === 0)
  const paidSets = questionSets.filter(set => !set.is_free_sample && set.price_cents > 0)
  const officialUrl = getOfficialResourceUrl(exam)

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">

        {/* Back button */}
        <button onClick={() => navigate('/dashboard')} className="back-button mb-4 sm:mb-6">
          ← Back to Dashboard
        </button>

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

        {/* Certification Landing Info */}
        <ExamLandingSection landing={exam.landing_content} />

        {/* Study Material — a first-class offering, co-equal with the practice exams */}
        <h2 className="section-title mt-8">Study Material</h2>
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
              <p className="text-white/55 text-[0.75rem] text-center mt-2.5">
                First domain free · Subscribe to unlock the full course
              </p>
            )}
          </div>
        </div>

        {/* Question Sets */}
        <h2 className="section-title mt-8">Question Sets</h2>
        <div className="question-sets-grid">
          {loadingQuestionSets ? (
            <div className="col-span-full empty-state">
              <div>Loading question sets...</div>
            </div>
          ) : paidSets.length > 0 && !freeSet && !isSubscribed ? (
            <div className="col-span-full bg-white/[0.08] backdrop-blur-xl rounded-2xl p-10 border border-white/15 text-center">
              <div className="mb-4 flex justify-center"><Lock className="w-10 h-10 text-white/60" /></div>
              <h3 className="text-xl font-bold text-white mb-2">Subscribe to Access Question Sets</h3>
              <p className="text-white/70 text-[0.9375rem] mb-6 max-w-[400px] mx-auto">
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

                  {(isFree || hasAccess) ? (
                    <button
                      onClick={() => navigate(`/exam/${slug}/take?set=${set.id}`)}
                      className="start-exam-button"
                    >
                      Start Practice Exam →
                    </button>
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
          <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 text-center">
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
            <h2 className="section-title">Your Exam Attempts</h2>
            <div className="flex flex-col gap-4">
              {examResults.map((result) => {
                const passColor = result.passed ? '#10b981' : '#ef4444'
                const passIcon = result.passed ? '✓' : '✗'

                return (
                  <div
                    key={result.id}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-[clamp(1rem,3vw,1.5rem)] border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/[0.15] hover:translate-x-1"
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
                            <h3 className="text-[0.9375rem] font-bold text-white truncate max-w-full">
                              {result.questionSetName || 'Practice Exam'}
                            </h3>
                            <span
                              className="px-2 py-0.5 rounded text-[0.6875rem] font-semibold shrink-0 border"
                              style={{
                                background: result.passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                borderColor: passColor,
                                color: passColor,
                              }}
                            >
                              {result.passed ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="text-[0.8125rem] text-white/70 truncate">
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
                          <div className="text-[0.6875rem] text-white/70">
                            {result.rawScore}/{result.totalQuestions}
                          </div>
                        </div>
                        <div className="text-white/50 text-xl">→</div>
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
