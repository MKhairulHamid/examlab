import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useExamStore from '../stores/examStore'
import PageLayout from '../components/layout/PageLayout'

function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()
  const { exams, fetchExams } = useExamStore()

  useEffect(() => {
    fetchExams()
  }, [fetchExams])

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 py-4 sm:p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">🎓 My Dashboard</h1>
        </div>

        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 sm:p-8 mb-6 sm:mb-8 border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
            👋 Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}!
          </h2>
          <p className="text-white/90 text-sm sm:text-base leading-relaxed">
            Ready to ace your certification exams? Choose an exam below to get started with your practice tests.
          </p>
        </div>

        {/* Exams Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">📋 Available Exams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-white/60 text-base sm:text-lg">Loading exams...</div>
              </div>
            ) : (
              exams.map(exam => (
                <div
                  key={exam.id}
                  onClick={() => navigate(`/exam/${exam.slug}`)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 sm:p-6 border border-white/20 hover:bg-white/15 cursor-pointer transform hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{exam.icon || '📚'}</div>
                  <div className="text-accent text-xs sm:text-sm font-semibold uppercase tracking-wide mb-2">
                    {exam.provider}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight">{exam.name}</h3>
                  <p className="text-white/80 text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">{exam.description}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-white/70">
                    <span>📝 {exam.total_questions || 'N/A'} Questions</span>
                    <span>⏱️ {exam.duration_minutes || 'N/A'} min</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default Dashboard
