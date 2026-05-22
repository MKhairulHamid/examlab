import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'
import { Button, Card } from '../design-system'

const CERTIFICATIONS = {
  aws: [
    { code: 'DVA-C02', name: 'AWS Developer Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65, available: true },
    { code: 'CLF-C02', name: 'AWS Cloud Practitioner', examQuestions: 65, practiceQuestions: 195, perSet: 65, available: false },
    { code: 'SAA-C03', name: 'AWS Solutions Architect Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65, available: false },
    { code: 'SOA-C02', name: 'AWS SysOps Administrator Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65, available: false },
    { code: 'SAP-C02', name: 'AWS Solutions Architect Professional', examQuestions: 75, practiceQuestions: 225, perSet: 75, available: false },
    { code: 'DOP-C02', name: 'AWS DevOps Engineer Professional', examQuestions: 75, practiceQuestions: 225, perSet: 75, available: false },
    { code: 'ANS-C01', name: 'AWS Advanced Networking', examQuestions: 65, practiceQuestions: 195, perSet: 65, available: false },
  ],
  azure: [
    { code: 'AZ-900', name: 'Azure Fundamentals', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-104', name: 'Azure Administrator', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-204', name: 'Azure Developer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-305', name: 'Azure Solutions Architect Expert', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-400', name: 'Azure DevOps Engineer Expert', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-500', name: 'Azure Security Engineer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
    { code: 'AZ-700', name: 'Azure Network Engineer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50, available: false },
  ],
  gcp: [
    { code: 'GCP-ACE', name: 'GCP Associate Cloud Engineer', examQuestions: 50, practiceQuestions: 150, perSet: 50, available: false },
    { code: 'GCP-PCA', name: 'GCP Professional Cloud Architect', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
    { code: 'GCP-PDE', name: 'GCP Professional Data Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
    { code: 'GCP-PCD', name: 'GCP Professional Cloud Developer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
    { code: 'GCP-PCNE', name: 'GCP Professional Cloud Network Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
    { code: 'GCP-PCSE', name: 'GCP Professional Cloud Security Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
    { code: 'GCP-PCDO', name: 'GCP Professional Cloud DevOps Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55, available: false },
  ]
}

const FAQ_ITEMS = [
  {
    question: 'How do your questions compare to the actual exam?',
    answer: 'Our questions match the format, difficulty, and style of the real AWS Developer Associate certification exam. They\'re original practice questions designed to prepare you thoroughly for test day.'
  },
  {
    question: 'How does the subscription work?',
    answer: 'Choose from monthly ($19.99) or annual ($99/year — save $141) plans. Your subscription gives you unlimited access to all available practice questions and features. Cancel anytime with no commitment.'
  },
  {
    question: 'What\'s included in my subscription?',
    answer: 'Full access to all 195 AWS Developer Associate practice questions (3 complete sets of 65 questions), detailed explanations, documentation references, progress tracking, and all platform features.'
  },
  {
    question: 'Can I try before subscribing?',
    answer: 'Yes! Start with 10 free sample questions with full explanations and documentation references. No credit card required to try the free sample.'
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes! You can cancel anytime with no penalties or commitments. Your access continues until the end of your current billing period.'
  }
]

const TESTIMONIALS = [
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    company: 'Passed DVA-C02 — Score: 847/1000',
    avatar: 'MC',
    text: 'The practice questions are eerily similar to the real exam. I walked in knowing exactly what to expect and passed on my first attempt. The explanations helped me actually understand concepts, not just memorize answers.',
    stars: 5
  },
  {
    name: 'Sarah Williams',
    role: 'Cloud Engineer',
    company: 'Deloitte — Passed DVA-C02',
    avatar: 'SW',
    text: 'I had failed once using another platform. Switched to CloudExamLab and passed 3 weeks later. The just-in-time study materials per question were a game-changer — no more hunting through endless docs.',
    stars: 5
  },
  {
    name: 'Raj Patel',
    role: 'DevOps Engineer',
    company: 'Passed DVA-C02 — Score: 891/1000',
    avatar: 'RP',
    text: 'Worth every single penny. The official doc links per question saved me hours. I knew my weak areas before exam day and targeted them directly. Couldn\'t recommend it more highly.',
    stars: 5
  }
]

const PATH_PREVIEWS = [
  { key: 'architect', emoji: '🌩️', name: 'Cloud Architect',    salary: '$153K–$165K', color: '#0EA5E9', roles: '2,000+ roles' },
  { key: 'devops',    emoji: '🛠️', name: 'DevOps Engineer',    salary: '$131K–$151K', color: '#10B981', roles: '1,000+ roles' },
  { key: 'data',      emoji: '📊', name: 'Data Engineer',      salary: '$137K–$165K', color: '#F59E0B', roles: '2,000+ roles' },
  { key: 'aiml',      emoji: '🤖', name: 'AI / ML Engineer',   salary: '$154K–$188K', color: '#8B5CF6', roles: '33,000+ roles' },
  { key: 'security',  emoji: '🔒', name: 'Security Specialist', salary: '$132K–$202K', color: '#EF4444', roles: '+73% YoY demand' },
  { key: 'network',   emoji: '🌐', name: 'Network Specialist',  salary: '$127K–$153K', color: '#06B6D4', roles: '1,000+ roles' },
]

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal]           = useState(false)
  const [authModalMode, setAuthModalMode]           = useState('signup')
  const [expandedProvider, setExpandedProvider]     = useState('aws')
  const [expandedFAQ, setExpandedFAQ]               = useState(null)
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState(null)
  const [showDemoMaterials, setShowDemoMaterials]   = useState(false)
  const [showDemoResults, setShowDemoResults]       = useState(false)

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }
  const openLogin  = () => { setAuthModalMode('login');  setShowAuthModal(true) }

  useEffect(() => {
    const hasAuthTokens = window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token')
    if (user && !hasAuthTokens) navigate('/dashboard')
  }, [user, navigate])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header className="header-button">
        <nav className="header-nav">
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="nav-link">How It Works</button>
          <button type="button" onClick={() => scrollToSection('certifications')} className="nav-link">Certifications</button>
          <button type="button" onClick={() => scrollToSection('pricing')} className="nav-link">Pricing</button>
          <button type="button" onClick={() => scrollToSection('faq')} className="nav-link">FAQ</button>
        </nav>
        <button type="button" onClick={() => setShowAuthModal(true)} className="header-cta">
          Login / Sign Up
        </button>
      </header>

      {/* ═══════════════════════════════════════
          ZONE 1 — HERO
      ═══════════════════════════════════════ */}
      <section className="hero-section" style={{ padding: '6rem 1.5rem 4rem', alignItems: 'flex-start' }}>
        <div className="hero-bg-1" />
        <div className="hero-bg-2" />

        <div className="max-w-[72rem] mx-auto w-full relative z-10">
          <div className="grid gap-12 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>

            {/* Left — copy */}
            <div>
              <div className="hero-badge" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
                🗺️ All 13 AWS Certifications — 6 Career Paths
              </div>
              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] mb-6 tracking-[-0.03em]">
                Learn, Practice, and Pass<br />
                <span className="text-[#00D4AA]">Your Cloud Certs.</span>
              </h1>
              <p className="text-[clamp(1rem,2.5vw,1.2rem)] text-white/85 leading-[1.7] mb-10 max-w-[38rem]">
                Structured 30-minute study sessions cover every exam domain — each one ending with a real exam-style question. Then validate with full practice exams mapped to the official blueprint.
              </p>
              <div className="hero-buttons" style={{ marginBottom: '2rem' }}>
                <button onClick={openSignup} className="btn-primary" style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}>
                  Start Free →
                </button>
                <button onClick={() => scrollToSection('demo')} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                  See It in Action
                </button>
              </div>
              <div className="flex gap-6 flex-wrap text-white/65 text-sm">
                <span>✓ Guided study sessions</span>
                <span>✓ Exam-style practice per session</span>
                <span>✓ From $8.25/month</span>
              </div>
            </div>

            {/* Right — product preview mockup */}
            <div className="flex justify-center items-start">
              <div className="bg-white rounded-2xl overflow-hidden w-full max-w-[480px] border border-white/[0.08]" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
                {/* Browser chrome */}
                <div className="bg-[#1e293b] px-4 py-2.5 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="ml-2.5 bg-[#334155] rounded flex-1 px-3 py-1 text-[0.7rem] text-slate-400 text-center">
                    cloudexamlab.com/exam
                  </div>
                </div>

                {/* App header bar */}
                <div className="bg-gradient-to-r from-[#0A2540] to-[#1A3B5C] px-5 py-3.5 flex justify-between items-center">
                  <span className="text-white font-semibold text-[0.8125rem]">AWS Developer Associate — Set 1</span>
                  <span className="bg-[#00D4AA]/20 text-[#00D4AA] px-2.5 py-1 rounded-full text-[0.7rem] font-bold border border-[#00D4AA]/35">⏱ 01:23:47</span>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] bg-gray-200">
                  <div className="h-full w-[32%] bg-gradient-to-r from-[#00D4AA] to-[#00A884]" />
                </div>

                {/* Question content */}
                <div className="p-5 bg-white">
                  <div className="mb-3">
                    <span className="bg-[#0A2540] text-white text-[0.6875rem] font-bold px-2.5 py-1 rounded-full">Question 21 of 65</span>
                  </div>
                  <p className="text-[0.85rem] font-semibold text-[#0A2540] leading-[1.55] mb-4">
                    A developer needs sensitive configuration data encrypted at rest with automatic rotation. Which AWS service best meets this requirement?
                  </p>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'AWS Systems Manager Parameter Store', selected: false },
                      { label: 'AWS Secrets Manager', selected: true },
                      { label: 'Amazon S3 with SSE-S3 encryption', selected: false },
                      { label: 'AWS KMS with key policies', selected: false },
                    ].map((opt, i) => (
                      <div key={i} className={`px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 border-2 ${opt.selected ? 'border-[#00D4AA] bg-[#00D4AA]/[0.07]' : 'border-gray-200 bg-white'}`}>
                        <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border-2 ${opt.selected ? 'border-[#00D4AA] bg-[#00D4AA]' : 'border-gray-300 bg-white'}`}>
                          {opt.selected && <span className="text-white text-[0.5625rem] font-extrabold">✓</span>}
                        </div>
                        <span className={`text-[0.78rem] ${opt.selected ? 'text-[#0A2540] font-semibold' : 'text-gray-500'}`}>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 gap-2">
                    <button className="px-4 py-2 bg-slate-100 rounded text-[0.78rem] text-slate-500 font-semibold cursor-default">← Previous</button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#00D4AA] to-[#00A884] rounded text-[0.78rem] text-white font-semibold cursor-default">Next →</button>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-200 flex justify-between text-[0.7rem] text-gray-500">
                  <span>✓ 20 answered</span>
                  <span className="text-[#00A884] font-bold">82% on track to pass</span>
                  <span>44 remaining</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PATH PREVIEWS
      ═══════════════════════════════════════ */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">
              6 CERTIFICATION PATHS
            </p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              Pick your direction. We'll show you how to get there.
            </h2>
            <p className="text-gray-500 text-base max-w-[36rem] mx-auto">
              Every path comes with a personalized timeline, salary benchmarks, and practice questions mapped to each cert.
            </p>
          </div>

          <div className="grid gap-3.5 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
            {PATH_PREVIEWS.map(p => (
              <button
                key={p.key}
                onClick={openSignup}
                className="bg-white rounded-2xl p-5 border border-gray-200 cursor-pointer text-left transition-all duration-200 relative overflow-hidden"
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.borderColor = p.color
                  e.currentTarget.style.boxShadow = `0 8px 24px ${p.color}22`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] opacity-70" style={{ background: p.color }} />
                <div className="text-[1.75rem] mb-2.5">{p.emoji}</div>
                <div className="font-bold text-[#0A2540] text-[0.9375rem] mb-1">{p.name}</div>
                <div className="font-extrabold text-base mb-1" style={{ color: p.color }}>
                  {p.salary}<span className="font-medium text-gray-400 text-xs">/yr</span>
                </div>
                <div className="text-gray-400 text-xs">{p.roles}</div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              onClick={openSignup}
              className="!px-10 !py-4 !rounded-[0.875rem] !text-[1.0625rem] shadow-teal hover:shadow-teal-lg hover:-translate-y-1"
            >
              Start Free — Map My Journey →
            </Button>
            <p className="text-gray-400 text-[0.8125rem] mt-3">
              Free to start • Build your roadmap right after signup
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 2 — AGITATION & PARADIGM SHIFT
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">
              THE PROBLEM WITH EXAM PREP
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] leading-snug tracking-tight">
              Most exam prep is broken.<br />We fixed it.
            </h2>
          </div>

          <div className="grid gap-5 max-w-[860px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
            {/* Before card */}
            <div className="bg-white rounded-[1.25rem] p-8 border-2 border-red-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-lg shrink-0">❌</div>
                <div>
                  <div className="text-[0.6875rem] font-bold text-red-500 uppercase tracking-[0.05em]">The Old Way</div>
                  <div className="text-[1.0625rem] font-bold text-[#0A2540]">Expensive & Unfocused</div>
                </div>
              </div>
              <ul className="space-y-3 list-none p-0 m-0">
                {[
                  "$500+ video courses you'll never finish",
                  'Reading 1,000 pages of documentation',
                  'Generic quizzes not tied to the exam blueprint',
                  'No progress tracking or weak-area analysis',
                  'Blindsided by the real exam on test day',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-500 text-[0.9375rem] leading-relaxed">
                    <span className="text-red-400 font-bold shrink-0 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After card */}
            <div className="bg-white rounded-[1.25rem] p-8 border-2 border-[#00D4AA] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4AA] to-[#00A884]" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00D4AA]/10 flex items-center justify-center text-lg shrink-0">✅</div>
                <div>
                  <div className="text-[0.6875rem] font-bold text-[#00A884] uppercase tracking-[0.05em]">The CloudExamLab Way</div>
                  <div className="text-[1.0625rem] font-bold text-[#0A2540]">Targeted & Proven</div>
                </div>
              </div>
              <ul className="space-y-3 list-none p-0 m-0">
                {[
                  '16 structured 30-min sessions per certification',
                  'Real exam-style question at the end of every session',
                  'Exam-realistic practice from $8.25/month',
                  '195 questions mapped to the official blueprint',
                  'Walk in knowing exactly what to expect',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-gray-700 text-[0.9375rem] leading-relaxed">
                    <span className="text-[#00D4AA] font-bold shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 3 — BENTO GRID (Core Value Pillars)
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">THE PLATFORM</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
          </div>

          {/* Row 1: Full-width tech card */}
          <div className="bg-gradient-to-br from-[#0A2540] to-[#1A3B5C] rounded-[1.25rem] p-[clamp(1.5rem,4vw,2.5rem)] mb-4 relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#00D4AA]/[0.08] rounded-full blur-[50px]" />
            <div className="absolute -bottom-10 left-[40%] w-40 h-40 bg-blue-500/[0.06] rounded-full blur-[40px]" />
            <div className="relative z-10 flex flex-wrap gap-8 items-center justify-between">
              <div className="flex-1 min-w-[220px]">
                <div className="text-3xl mb-3.5">🎯</div>
                <h3 className="text-[clamp(1.25rem,3vw,1.625rem)] font-bold text-white mb-3">
                  Learn First. Then Practice.
                </h3>
                <p className="text-white/[0.78] leading-[1.65] text-[0.9375rem] max-w-[440px]">
                  Start with structured course sessions that teach every exam domain — each 30 minutes with key terms, AWS services, exam tips, and a real sample question. Then drill with full practice exams.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 min-w-[200px]">
                {[
                  '16 study sessions per certification',
                  'Sample exam question per session',
                  '65 questions per timed practice set',
                  'Blueprint-mapped domains',
                  'Official AWS doc links included',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/[0.85]">
                    <span className="text-[#00D4AA] font-bold text-xs">→</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Two medium cards */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            <div className="bg-gradient-to-br from-[#00D4AA]/[0.06] to-[#00A884]/10 rounded-[1.25rem] p-8 border-2 border-[#00D4AA]/25">
              <div className="text-[1.75rem] mb-3.5">💰</div>
              <h3 className="text-[1.1875rem] font-bold text-[#0A2540] mb-2">Unbeatable Value</h3>
              <div className="mb-2">
                <span className="text-[2.75rem] font-extrabold text-[#00A884] tracking-tight">$8.25</span>
                <span className="text-base font-semibold text-gray-500">/month</span>
              </div>
              <p className="text-gray-600 text-[0.9rem] leading-[1.55] mb-4">
                Annual plan. Less than a coffee for full exam readiness.
              </p>
              <div className="px-3.5 py-2.5 bg-white rounded-[0.625rem] text-[0.8125rem] text-gray-400 border border-gray-200">
                vs. $500+ boot camps &amp; courses
              </div>
            </div>

            <div className="bg-slate-50 rounded-[1.25rem] p-8 border border-gray-200">
              <div className="text-[1.75rem] mb-3.5">📊</div>
              <h3 className="text-[1.1875rem] font-bold text-[#0A2540] mb-3">Study on Your Terms</h3>
              <p className="text-gray-600 text-[0.9rem] leading-[1.6] mb-5">
                Track progress across all 195 questions. Resume mid-set anytime. Study on any device at your own pace — timed or untimed.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Progress saving', 'Any device', 'Timed mode', 'Weak-area focus'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1.5 bg-white rounded-full text-[0.78rem] font-semibold text-gray-700 border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Full-width growing library card */}
          <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-[1.25rem] p-[clamp(1.5rem,4vw,2rem)] border border-sky-200 flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 min-w-[220px]">
              <div className="text-[1.75rem] mb-3.5">🚀</div>
              <h3 className="text-[1.1875rem] font-bold text-[#0A2540] mb-2">Growing Certification Library</h3>
              <p className="text-sky-700 text-[0.9rem] leading-[1.55]">
                AWS DVA-C02 live now. Your subscription automatically includes all new certs as they launch — no extra cost.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {[
                { label: '✅ AWS DVA-C02', available: true },
                { label: '🚧 AWS SAA-C03', available: false },
                { label: '🚧 AZ-104', available: false },
                { label: '🚧 GCP ACE', available: false },
              ].map((cert, i) => (
                <div key={i} className={`px-3.5 py-2 rounded-[0.625rem] text-[0.8125rem] font-semibold border ${cert.available ? 'bg-[#00D4AA]/10 text-[#00A884] border-[#00D4AA]/30' : 'bg-white text-gray-400 border-gray-200'}`}>
                  {cert.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 4 — 3-STEP FRICTION REDUCER
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0A2540]">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-14">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">GET STARTED IN MINUTES</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white tracking-tight">
              From zero to certified in 3 steps
            </h2>
          </div>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
            {[
              {
                step: '01',
                icon: '✍️',
                title: 'Create Free Account',
                desc: 'Sign up in 30 seconds with email or Google. No credit card required.',
              },
              {
                step: '02',
                icon: '🗺️',
                title: 'Map Your Journey',
                desc: "Answer a few questions about your career and we'll build your personalized roadmap — target role, salary, and timeline — then unlock 10 free practice questions.",
              },
              {
                step: '03',
                icon: '🏆',
                title: 'Practice & Pass',
                desc: 'Work through exam-realistic questions with instant feedback, explanations, and official AWS doc links. Walk into exam day with no surprises.',
              },
            ].map((item, index) => (
              <div key={index} className={`p-8 relative ${index > 0 ? 'border-l border-white/[0.08]' : ''}`}>
                <div className="text-[4.5rem] font-black text-[#00D4AA]/[0.12] leading-none mb-3.5 tracking-tighter tabular-nums">
                  {item.step}
                </div>
                <div className="text-3xl mb-3.5">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/65 leading-[1.65] text-[0.9375rem]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button
              variant="primary"
              onClick={openSignup}
              className="!px-10 !py-4 !rounded-[0.875rem] !text-[1.0625rem] shadow-teal hover:shadow-teal-lg hover:-translate-y-1"
            >
              Start Free →
            </Button>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">INTERACTIVE DEMO</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] mb-3 tracking-tight">
              Experience the exam interface
            </h2>
            <p className="text-gray-500 text-base max-w-[38rem] mx-auto">
              This is the exact interface you'll use — try selecting an answer below.
            </p>
          </div>

          <div className="max-w-[860px] mx-auto mb-10 bg-white rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
            {/* Demo header */}
            <div className="bg-gradient-to-r from-[#0A2540] to-[#1A3B5C] px-6 py-5 text-white flex justify-between items-center flex-wrap gap-3">
              <h3 className="text-base font-semibold m-0">AWS Developer Associate Practice</h3>
              <div className="flex items-center gap-2 text-sm bg-white/10 px-3.5 py-1.5 rounded-lg">
                ⏱️ Time Remaining: 01:30:00
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200">
              <div className="h-full w-[15%] bg-gradient-to-r from-[#00D4AA] to-[#00A884]" />
            </div>

            {/* Question navigation */}
            <div className="bg-gradient-to-r from-[#0A2540] to-[#1A3B5C] px-5 py-3.5 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2.5 text-white text-[0.8125rem]">
                <span>Questions: 1/65</span>
              </div>
              <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`py-1.5 rounded text-center text-[0.8125rem] font-semibold ${i === 0 ? 'bg-[#00D4AA] text-white border-2 border-white' : 'bg-white/10 text-white'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="px-5 py-3.5 bg-white border-b border-gray-200 flex justify-center gap-3 flex-wrap">
              <Button
                variant="primary"
                onClick={() => setShowDemoMaterials(true)}
                className="shadow-[0_2px_8px_rgba(0,212,170,0.3)] hover:shadow-[0_4px_12px_rgba(0,212,170,0.4)] hover:-translate-y-0.5"
              >
                📚 Study Materials
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDemoResults(true)}
                className="!border-[#0A2540]/40 !text-[#0A2540] hover:!bg-[#0A2540] hover:!text-white hover:!border-[#0A2540]"
              >
                📊 View Results
              </Button>
            </div>

            {/* Question */}
            <div className="p-[clamp(1.25rem,4vw,2rem)] bg-white">
              <div className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200 mb-5">
                <div className="inline-block bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold mb-3.5">
                  Question 1 • Multiple Choice (select one)
                </div>
                <p className="text-[0.9375rem] text-[#0A2540] leading-[1.6] m-0 font-medium">
                  A developer is building a serverless application using AWS Lambda. The application needs to process images uploaded to an S3 bucket. Which AWS service should be used to trigger the Lambda function when a new image is uploaded?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  'Amazon CloudWatch Events',
                  'Amazon S3 Event Notifications',
                  'Amazon SNS',
                  'AWS Step Functions'
                ].map((option, index) => (
                  <div
                    key={index}
                    onClick={() => setDemoSelectedAnswer(index)}
                    className="px-[1.125rem] py-3.5 rounded-xl cursor-pointer transition-all duration-150 flex items-center gap-3.5"
                    style={{
                      background: demoSelectedAnswer === index ? 'rgba(0,212,170,0.08)' : 'white',
                      border: `2px solid ${demoSelectedAnswer === index ? '#00D4AA' : '#e5e7eb'}`,
                    }}
                    onMouseEnter={e => {
                      if (demoSelectedAnswer !== index) {
                        e.currentTarget.style.borderColor = '#00D4AA'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (demoSelectedAnswer !== index) {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all duration-150"
                      style={{
                        border: `2px solid ${demoSelectedAnswer === index ? '#00D4AA' : '#d1d5db'}`,
                        background: demoSelectedAnswer === index ? '#00D4AA' : 'white',
                      }}
                    >
                      {demoSelectedAnswer === index && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`text-[#0A2540] text-[0.9375rem] ${demoSelectedAnswer === index ? 'font-semibold' : 'font-normal'}`}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mt-6 gap-3 flex-wrap">
                <button disabled className="px-5 py-3 bg-gray-200 text-gray-400 rounded-lg font-semibold cursor-not-allowed text-[0.9375rem] opacity-60">
                  ← Previous
                </button>
                <button className="px-5 py-3 bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white rounded-lg font-semibold text-[0.9375rem] shadow-[0_4px_12px_rgba(0,212,170,0.3)]">
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div className="text-center flex flex-col items-center gap-3">
            <Button
              variant="primary"
              onClick={openSignup}
              className="!px-8 !py-3.5 !rounded-xl shadow-[0_4px_12px_rgba(0,212,170,0.3)] hover:shadow-[0_6px_16px_rgba(0,212,170,0.4)] hover:-translate-y-0.5"
            >
              Start Free →
            </Button>
            <button onClick={openSignup} className="bg-transparent border-none text-gray-400 text-sm cursor-pointer underline p-0">
              or start with 10 free questions
            </button>
          </div>
        </div>
      </section>

      {/* ── Certifications Catalog ── */}
      <section id="certifications" className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">AVAILABLE NOW + 20 MORE COMING SOON</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] mb-3 tracking-tight">
              Your certification journey starts here
            </h2>
            <p className="text-gray-500 text-base max-w-[40rem] mx-auto">
              Start with AWS Developer Associate today. More certifications launching soon across AWS, Azure, and GCP.
            </p>
          </div>

          {/* Provider tabs */}
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {['aws', 'azure', 'gcp'].map(provider => (
              <button
                key={provider}
                onClick={() => setExpandedProvider(provider)}
                className={`px-5 py-2.5 border-2 border-[#0A2540] rounded-lg font-semibold cursor-pointer transition-all duration-200 uppercase text-[0.8125rem] min-w-[90px] ${expandedProvider === provider ? 'bg-[#0A2540] text-white' : 'bg-white text-[#0A2540]'}`}
              >
                {provider === 'aws' && '🔶 AWS'}
                {provider === 'azure' && '☁️ Azure'}
                {provider === 'gcp' && '🔷 GCP'}
              </button>
            ))}
          </div>

          {/* Certification cards */}
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))' }}>
            {CERTIFICATIONS[expandedProvider].map((cert, index) => (
              <div
                key={index}
                className={`bg-white p-6 rounded-2xl transition-all duration-[250ms] relative ${cert.available ? 'border-2 border-[#00D4AA]' : 'border border-gray-200 opacity-75'}`}
                style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)' }}
                onMouseEnter={e => {
                  if (cert.available) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,212,170,0.25)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = cert.available
                    ? '0 4px 6px -1px rgba(0,212,170,0.15)'
                    : '0 4px 6px -1px rgba(0,0,0,0.08)'
                }}
              >
                {cert.available ? (
                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white px-3 py-1 rounded-full text-[0.7rem] font-bold shadow-[0_2px_8px_rgba(0,212,170,0.3)]">
                    ✨ AVAILABLE NOW
                  </div>
                ) : (
                  <div className="absolute -top-2.5 right-3 bg-gray-400 text-white px-3 py-1 rounded-full text-[0.7rem] font-bold">
                    🚧 COMING SOON
                  </div>
                )}

                <div className="mt-2 mb-3.5">
                  <div className="text-gray-400 text-xs font-semibold mb-1.5">{cert.code}</div>
                  <h3 className="text-[1.0625rem] font-bold text-[#0A2540]">{cert.name}</h3>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="text-[0.8125rem] text-gray-500 mb-1">
                    <strong className="text-gray-700">Actual exam:</strong> {cert.examQuestions} questions
                  </div>
                  <div className="text-[0.8125rem] text-gray-500">
                    <strong className="text-gray-700">Practice questions:</strong> {cert.practiceQuestions} (3 sets of {cert.perSet})
                  </div>
                </div>

                <button
                  onClick={() => cert.available ? setShowAuthModal(true) : null}
                  disabled={!cert.available}
                  className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${cert.available ? 'bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white cursor-pointer' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {cert.available ? 'Try 10 Free Questions' : 'Notify Me When Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-[#0A2540] to-[#1A3B5C]">
        <div className="max-w-[72rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">SIMPLE PRICING</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-white mb-3 tracking-tight">
              Choose your study plan
            </h2>
            <p className="text-white/80 text-base">
              Unlimited access • Study at your own pace • Cancel anytime
            </p>
          </div>

          <div className="grid gap-5 max-w-[900px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
            {/* Free */}
            <div className="bg-white/[0.08] backdrop-blur-xl p-8 rounded-[1.25rem] border border-white/15 text-center">
              <div className="text-3xl mb-3.5">🎁</div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Free Sample</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">$0</div>
              <p className="text-white/65 text-sm mb-6">Try before you subscribe</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2">
                {['10 sample questions', 'Full explanations', 'No credit card required'].map((item, i) => (
                  <li key={i} className="text-white/85 flex items-center gap-2 text-[0.9rem]">
                    <span className="text-[#00D4AA]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button variant="dark" onClick={() => setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl">
                Start Free
              </Button>
            </div>

            {/* Monthly */}
            <div className="bg-white/[0.08] backdrop-blur-xl p-8 rounded-[1.25rem] border border-white/15 text-center">
              <div className="text-3xl mb-3.5">📅</div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Monthly</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">$19.99</div>
              <p className="text-white/65 text-sm mb-6">Per month • Billed monthly</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2">
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime'].map((item, i) => (
                  <li key={i} className="text-white/85 flex items-center gap-2 text-[0.9rem]">
                    <span className="text-[#00D4AA]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button variant="dark" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl">
                {user ? 'Enroll Now' : 'Get Started'}
              </Button>
            </div>

            {/* Annual — best value */}
            <div className="bg-white/[0.12] backdrop-blur-xl p-8 rounded-[1.25rem] border-2 border-[#00D4AA] text-center relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00D4AA] text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                BEST VALUE
              </div>
              <div className="text-3xl mb-3.5">🎓</div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Annual</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1 tracking-tight">$99</div>
              <p className="text-white/45 text-[0.8125rem] line-through mb-1">$239.88/year</p>
              <p className="text-white/75 text-sm mb-6">12 months • Save $141 • $8.25/mo</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2">
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime', 'All new certs included'].map((item, i) => (
                  <li key={i} className="text-white/90 flex items-center gap-2 text-[0.9rem]">
                    <span className="text-[#00D4AA]">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Button variant="primary" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl shadow-teal">
                {user ? 'Enroll Now' : 'Get Started'}
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-white/70 text-sm">
              All plans include access to all certifications • Currently: AWS Developer Associate • Coming soon: 20+ more
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 5 — SOCIAL PROOF & TRUST
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          {/* Metrics bar */}
          <div className="grid gap-4 mb-16 p-8 bg-slate-50 rounded-[1.25rem] border border-gray-200" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
            {[
              { stat: '500+', label: 'Certified professionals' },
              { stat: '82%', label: 'First-attempt pass rate' },
              { stat: '4.9/5', label: 'Average rating' },
              { stat: '195', label: 'Practice questions' },
            ].map((item, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-[#0A2540] tracking-tight mb-1">{item.stat}</div>
                <div className="text-sm text-gray-500 font-medium">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">REAL RESULTS</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Trusted by cloud professionals
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} variant="tinted" className="!p-7 flex flex-col gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, si) => (
                    <span key={si} className="text-amber-400 text-base">★</span>
                  ))}
                </div>
                <p className="text-gray-700 text-[0.9375rem] leading-[1.65] flex-1">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full shrink-0 bg-gradient-to-br from-[#0A2540] to-[#1A3B5C] flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-[#0A2540] text-[0.9375rem]">{t.name}</div>
                    <div className="text-gray-500 text-[0.8125rem]">{t.role}</div>
                    <div className="text-[#00A884] text-xs font-semibold">{t.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[48rem] mx-auto">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">FAQ</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-[0.875rem] overflow-hidden bg-white">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className={`w-full px-5 py-5 border-none text-left cursor-pointer flex justify-between items-center font-semibold text-[#0A2540] text-[0.9375rem] gap-4 transition-colors ${expandedFAQ === index ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <span>{item.question}</span>
                  <span
                    className="text-base shrink-0 text-gray-400 transition-transform duration-[250ms]"
                    style={{ transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >▼</span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-5 pb-5 text-gray-600 leading-[1.65] text-[0.9375rem]">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 6 — CLOSING CALL TO ACTION
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0A2540] via-[#0d2d4a] to-[#1A3B5C] text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00D4AA]/[0.06] rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-[52rem] mx-auto relative z-10">
          <div className="inline-block bg-[#00D4AA]/15 border border-[#00D4AA]/30 text-[#00D4AA] px-4 py-1.5 rounded-full text-[0.8125rem] font-bold mb-6 uppercase tracking-[0.06em]">
            Start for free today
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-5 leading-[1.15] tracking-tighter">
            Ready to get your<br />
            <span className="text-[#00D4AA]">AWS certification?</span>
          </h2>
          <p className="text-[clamp(1rem,2.5vw,1.1875rem)] text-white/75 mb-10 leading-[1.65]">
            Join 500+ professionals who passed on their first attempt. Start free — 10 questions, full explanations, no credit card.
          </p>
          <Button
            variant="primary"
            onClick={openSignup}
            className="!px-12 !py-5 !rounded-[0.875rem] !text-[1.1875rem] shadow-[0_8px_28px_rgba(0,212,170,0.4)] hover:shadow-[0_14px_36px_rgba(0,212,170,0.5)] hover:-translate-y-1 mb-4"
          >
            Start Free →
          </Button>
          <div className="mb-6">
            <button onClick={openLogin} className="bg-transparent border-none text-white/45 text-sm cursor-pointer underline p-0">
              Already a member? Sign in
            </button>
          </div>
          <div className="flex gap-8 justify-center flex-wrap text-white/55 text-sm">
            <span>🔒 Secure payment</span>
            <span>⚡ Instant access</span>
            <span>🔄 Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A2540] pt-12 pb-6 px-6">
        <div className="max-w-[72rem] mx-auto">
          <div className="grid gap-8 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))' }}>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-base">Cloud Exam Lab</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Subscription-based practice questions for cloud certifications. AWS DVA-C02 available now — 20+ more coming soon.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Available Now</h3>
              <ul className="list-none p-0 m-0">
                <li className="mb-2">
                  <button
                    onClick={() => { setExpandedProvider('aws'); scrollToSection('certifications') }}
                    className="bg-transparent border-none text-[#00D4AA] text-sm cursor-pointer p-0 font-semibold"
                  >
                    ✨ AWS Developer Associate (DVA-C02)
                  </button>
                </li>
                <li className="text-white/45 text-sm mb-1.5">195 practice questions</li>
                <li className="text-white/45 text-sm">3 complete exam sets</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Coming Soon</h3>
              <ul className="list-none p-0 m-0">
                {['🚧 AWS Solutions Architect', '🚧 AWS Cloud Practitioner', '🚧 Azure & GCP Certifications'].map((item, i) => (
                  <li key={i} className="text-white/45 text-sm mb-2">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Support & Legal</h3>
              <ul className="list-none p-0 m-0">
                {[
                  { label: 'Contact Support', href: 'mailto:cloudexamlab@gmail.com' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Refund Policy', href: '#' },
                ].map((link, i) => (
                  <li key={i} className="mb-2">
                    <a href={link.href} className="text-white/60 text-sm no-underline hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-6">
            <p className="text-white/40 text-xs text-center mb-1.5">
              <strong>Disclaimer:</strong> Independent practice questions. Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, or Google Cloud Platform (GCP).
            </p>
            <p className="text-white/40 text-xs text-center">
              © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Demo: Study Materials Modal ── */}
      {showDemoMaterials && (
        <div onClick={() => setShowDemoMaterials(false)} className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-[660px] w-full max-h-[80vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="p-[clamp(1.25rem,4vw,2rem)]">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[clamp(1.125rem,3vw,1.4rem)] font-bold text-[#0A2540] mb-1.5">📚 Study Materials</h3>
                  <p className="text-gray-500 text-sm">Just-in-time learning resources for this question</p>
                </div>
                <button onClick={() => setShowDemoMaterials(false)} className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 p-1 leading-none">×</button>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-5">
                <h4 className="text-base font-bold text-[#0A2540] mb-3.5">📖 AWS Lambda &amp; S3 Event Notifications</h4>
                <p className="text-gray-600 text-sm leading-[1.65] mb-4">
                  Amazon S3 can publish events (object creation, deletion, restoration) directly to AWS Lambda, SNS, SQS, and EventBridge. S3 Event Notifications is the most direct and efficient way to trigger Lambda when objects are uploaded.
                </p>
                <div className="bg-white p-4 rounded-lg border-l-4 border-[#00D4AA]">
                  <p className="text-sm text-[#0A2540] font-semibold mb-1.5">💡 Key Concept</p>
                  <p className="text-sm text-gray-600 leading-[1.55]">
                    S3 Event Notifications provide a serverless, event-driven architecture that automatically triggers your Lambda function — no polling required.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50 p-5 rounded-xl border border-sky-200">
                <h4 className="text-sm font-bold text-sky-700 mb-3.5">📚 Official AWS Documentation</h4>
                {[
                  { label: 'Using AWS Lambda with Amazon S3', href: 'https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html' },
                  { label: 'Configuring S3 Event Notifications', href: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html' },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-sky-700 no-underline text-sm flex items-center gap-2 mb-2 last:mb-0">
                    <span>→</span> {link.label}
                  </a>
                ))}
              </div>

              <Button variant="primary" onClick={() => setShowDemoMaterials(false)} className="!w-full !mt-5 !py-3.5 !rounded-lg">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Demo: Results Modal ── */}
      {showDemoResults && (
        <div onClick={() => setShowDemoResults(false)} className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-[560px] w-full max-h-[80vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="p-[clamp(1.25rem,4vw,2rem)]">
              <div className="text-center mb-7">
                <div className="text-[2.75rem] mb-3.5">🎉</div>
                <h3 className="text-[clamp(1.25rem,4vw,1.625rem)] font-bold text-[#0A2540] mb-1.5">Exam Complete!</h3>
                <p className="text-gray-500 text-[0.9375rem]">AWS Developer Associate — Practice Set 1</p>
              </div>

              <div className="bg-[#00D4AA]/[0.08] p-7 rounded-2xl border-2 border-[#00D4AA] mb-7 text-center">
                <div className="text-[clamp(2.25rem,6vw,3rem)] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">82%</div>
                <div className="text-xl font-bold text-[#0A2540] mb-1.5">PASSED ✓</div>
                <div className="text-sm text-gray-500">53 / 65 questions correct</div>
              </div>

              <div className="flex flex-col gap-2.5 mb-6">
                {[
                  ['Score', '820 / 1000'],
                  ['Time Taken', '48 minutes'],
                  ['Passing Score', '720 / 1000 (72%)'],
                ].map(([label, value], i) => (
                  <div key={i} className="flex justify-between px-4 py-3.5 bg-gray-50 rounded-lg">
                    <span className="text-gray-500 text-sm">{label}</span>
                    <span className="text-[#0A2540] font-semibold text-sm">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 mb-5">
                <p className="text-sm text-sky-700 m-0 leading-[1.55]">
                  <strong>💡 Great job!</strong> You're ready for the actual exam. Review the questions you missed to lock in the remaining weak areas.
                </p>
              </div>

              <Button variant="primary" onClick={() => setShowDemoResults(false)} className="!w-full !py-3.5 !rounded-lg">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />

    </div>
  )
}

export default Landing
