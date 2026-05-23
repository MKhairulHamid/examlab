import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Check, X, ChevronDown, ChevronUp, Star, Clock, Cloud,
  Server, Database, BrainCircuit, ShieldCheck, Network, Target, Wallet, Gauge,
  Rocket, UserPlus, Route, Trophy, BookOpen, BarChart3, Gift, Calendar,
  GraduationCap, Lock, Zap, RefreshCw, Sparkles, Lightbulb, BadgeCheck,
  CircleCheckBig,
} from 'lucide-react'
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
  { key: 'architect', Icon: Cloud,        name: 'Cloud Architect',     salary: '$153K–$165K', color: '#0EA5E9', roles: '2,000+ roles' },
  { key: 'devops',    Icon: Server,       name: 'DevOps Engineer',     salary: '$131K–$151K', color: '#10B981', roles: '1,000+ roles' },
  { key: 'data',      Icon: Database,     name: 'Data Engineer',       salary: '$137K–$165K', color: '#F59E0B', roles: '2,000+ roles' },
  { key: 'aiml',      Icon: BrainCircuit, name: 'AI / ML Engineer',    salary: '$154K–$188K', color: '#8B5CF6', roles: '33,000+ roles' },
  { key: 'security',  Icon: ShieldCheck,  name: 'Security Specialist', salary: '$132K–$202K', color: '#EF4444', roles: '+73% YoY demand' },
  { key: 'network',   Icon: Network,      name: 'Network Specialist',  salary: '$127K–$153K', color: '#06B6D4', roles: '1,000+ roles' },
]

const METRICS = [
  { value: 500, suffix: '+',  decimals: 0, label: 'Certified professionals' },
  { value: 82,  suffix: '%',  decimals: 0, label: 'First-attempt pass rate' },
  { value: 4.9, suffix: '/5', decimals: 1, label: 'Average rating' },
  { value: 195, suffix: '',   decimals: 0, label: 'Practice questions' },
]

const TRUST_BADGES = [
  'Blueprint-mapped domains', 'Official AWS doc links', 'Timed practice exams',
  'Progress tracking', 'Just-in-time study notes', 'No credit card to start',
]

/* Scroll-reveal wrapper — fades + lifts content as it enters the viewport */
function Reveal({ children, className = '', delay = 0, as: Tag = 'div', style, ...props }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </Tag>
  )
}

/* Count-up number that animates once when scrolled into view */
function CountUp({ value, suffix = '', decimals = 0, className = '' }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      obs.disconnect()
      const duration = 1400
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(value * eased)
        if (p < 1) requestAnimationFrame(tick)
        else setDisplay(value)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [value])
  return (
    <span ref={ref} className={className}>
      {display.toFixed(decimals)}{suffix}
    </span>
  )
}

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal]           = useState(false)
  const [authModalMode, setAuthModalMode]           = useState('signup')
  const [expandedProvider, setExpandedProvider]     = useState('aws')
  const [expandedFAQ, setExpandedFAQ]               = useState(null)
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState(null)
  const [demoNavMinimized, setDemoNavMinimized]     = useState(false)
  const [showDemoMaterials, setShowDemoMaterials]   = useState(false)
  const [showDemoResults, setShowDemoResults]       = useState(false)
  const [scrolled, setScrolled]                     = useState(false)

  const demoAnswered = demoSelectedAnswer !== null ? 1 : 0

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }
  const openLogin  = () => { setAuthModalMode('login');  setShowAuthModal(true) }

  useEffect(() => {
    const hasAuthTokens = window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token')
    if (user && !hasAuthTokens) navigate('/dashboard')
  }, [user, navigate])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Header ── */}
      <header
        className="header-button"
        style={scrolled ? { boxShadow: '0 8px 30px rgba(0,0,0,0.25)' } : undefined}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer p-0 shrink-0"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center shadow-[0_2px_8px_rgba(0,212,170,0.4)]">
            <Cloud size={18} className="text-white" strokeWidth={2.4} />
          </span>
          <span className="text-white font-bold text-[0.9375rem] tracking-tight hidden sm:inline">CloudExamLab</span>
        </button>
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
        <div className="absolute inset-0 grid-texture pointer-events-none" />

        <div className="max-w-[72rem] mx-auto w-full relative z-10">
          <div className="grid gap-12 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>

            {/* Left — copy */}
            <Reveal>
              <div className="hero-badge inline-flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                <Sparkles size={15} className="text-[#00D4AA]" />
                All 13 AWS Certifications — 6 Career Paths
              </div>
              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] mb-6 tracking-[-0.03em]">
                Learn, Practice, and Pass<br />
                <span className="gradient-text">Your Cloud Certs.</span>
              </h1>
              <p className="text-[clamp(1rem,2.5vw,1.2rem)] text-white/85 leading-[1.7] mb-10 max-w-[38rem]">
                Structured 30-minute study sessions cover every exam domain — each one ending with a real exam-style question. Then validate with full practice exams mapped to the official blueprint.
              </p>
              <div className="hero-buttons" style={{ marginBottom: '2rem' }}>
                <button onClick={openSignup} className="btn-primary inline-flex items-center justify-center gap-2" style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}>
                  Start Free <ArrowRight size={18} />
                </button>
                <button onClick={() => scrollToSection('demo')} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                  See It in Action
                </button>
              </div>
              <div className="flex gap-x-6 gap-y-2 flex-wrap text-white/65 text-sm">
                {['Guided study sessions', 'Exam-style practice per session', 'From $8.25/month'].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <Check size={15} className="text-[#00D4AA]" strokeWidth={3} /> {t}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Right — product preview mockup (mirrors the real exam interface) */}
            <Reveal delay={120} className="flex justify-center items-start">
              <div className="rounded-2xl overflow-hidden w-full max-w-[480px] border border-white/[0.08] animate-[float_7s_ease-in-out_infinite]" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
                {/* Browser chrome */}
                <div className="bg-[#1e293b] px-4 py-2.5 flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <div className="ml-2.5 bg-[#334155] rounded flex-1 px-3 py-1 text-[0.7rem] text-slate-400 text-center">
                    cloudexamlab.com/exam
                  </div>
                </div>

                {/* Real exam interface (same classes as ExamInterface.jsx) */}
                <div style={{ background: 'var(--gradient-brand)', padding: '1rem' }}>
                  <div className="exam-header">
                    <h1 className="exam-header-title">AWS Developer Associate — Set 1</h1>
                    <div className="exam-timer-display inline-flex items-center gap-1.5">
                      <Clock size={15} /> Time Remaining: 01:23:47
                    </div>
                  </div>

                  <div className="time-bar-container">
                    <div className="time-bar" style={{ width: '78%' }} />
                  </div>

                  <div className="question-navigation minimized">
                    <div className="question-nav-header">
                      <span className="text-sm text-white/80">Questions: 20/65</span>
                      <span className="nav-toggle-btn inline-flex items-center"><ChevronDown size={15} /></span>
                    </div>
                  </div>

                  <div className="question-card !mb-0">
                    <div className="question-header !mb-3">
                      <span className="question-badge">Question 21 • Multiple Choice — select one</span>
                      <p className="question-text">
                        A developer needs sensitive configuration data encrypted at rest with automatic rotation. Which AWS service best meets this requirement?
                      </p>
                    </div>
                    <div className="options-container">
                      {[
                        { label: 'AWS Systems Manager Parameter Store', selected: false },
                        { label: 'AWS Secrets Manager', selected: true },
                        { label: 'Amazon S3 with SSE-S3 encryption', selected: false },
                        { label: 'AWS KMS with key policies', selected: false },
                      ].map((opt, i) => (
                        <div key={i} className={`option ${opt.selected ? 'option-selected' : 'option-default'}`}>
                          <div className="option-content">
                            <div className={`option-checkbox option-checkbox-circle ${opt.selected ? 'option-checkbox-selected' : 'option-checkbox-default'}`}>
                              {opt.selected && <Check size={14} strokeWidth={3} />}
                            </div>
                            <span className="option-text">{opt.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="navigation-buttons !mt-4 !mb-0">
                    <button className="nav-button nav-button-prev inline-flex items-center justify-center cursor-default">
                      <ArrowLeft size={16} className="mr-1.5" /> Previous
                    </button>
                    <button className="nav-button nav-button-next inline-flex items-center justify-center cursor-default">
                      Next <ArrowRight size={16} className="ml-1.5" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Trust strip (marquee) ── */}
      <section className="bg-[#0A2540] border-y border-white/[0.06] py-4 overflow-hidden">
        <div className="marquee-mask">
          <div className="marquee-track gap-10 pr-10">
            {[...TRUST_BADGES, ...TRUST_BADGES].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-white/55 text-sm font-medium whitespace-nowrap shrink-0">
                <BadgeCheck size={16} className="text-[#00D4AA]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PATH PREVIEWS
      ═══════════════════════════════════════ */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">
              6 CERTIFICATION PATHS
            </p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2.25rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              Pick your direction. We'll show you how to get there.
            </h2>
            <p className="text-gray-500 text-base max-w-[36rem] mx-auto">
              Every path comes with a personalized timeline, salary benchmarks, and practice questions mapped to each cert.
            </p>
          </Reveal>

          <div className="grid gap-3.5 mb-10" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
            {PATH_PREVIEWS.map((p, i) => (
              <Reveal as="button" key={p.key} delay={i * 60}
                onClick={openSignup}
                className="group bg-white rounded-2xl p-5 border border-gray-200 cursor-pointer text-left transition-all duration-200 relative overflow-hidden hover:-translate-y-1"
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = p.color
                  e.currentTarget.style.boxShadow = `0 12px 28px ${p.color}22`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] opacity-80" style={{ background: p.color }} />
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110" style={{ background: `${p.color}14` }}>
                  <p.Icon size={22} style={{ color: p.color }} strokeWidth={2.2} />
                </div>
                <div className="font-bold text-[#0A2540] text-[0.9375rem] mb-1">{p.name}</div>
                <div className="font-extrabold text-base mb-1" style={{ color: p.color }}>
                  {p.salary}<span className="font-medium text-gray-400 text-xs">/yr</span>
                </div>
                <div className="text-gray-400 text-xs">{p.roles}</div>
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Button
              variant="primary"
              onClick={openSignup}
              className="!px-10 !py-4 !rounded-[0.875rem] !text-[1.0625rem] shadow-teal hover:shadow-teal-lg hover:-translate-y-1 gap-2"
            >
              Start Free — Map My Journey <ArrowRight size={18} />
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
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">
              THE PROBLEM WITH EXAM PREP
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] leading-snug tracking-tight">
              Most exam prep is broken.<br />We fixed it.
            </h2>
          </Reveal>

          <div className="grid gap-5 max-w-[860px] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
            {/* Before card */}
            <Reveal className="bg-white rounded-[1.25rem] p-8 border-2 border-red-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-400" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <X size={20} className="text-red-500" strokeWidth={2.6} />
                </div>
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
                    <X size={17} className="text-red-400 shrink-0 mt-0.5" strokeWidth={2.6} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* After card */}
            <Reveal delay={120} className="bg-white rounded-[1.25rem] p-8 border-2 border-[#00D4AA] relative overflow-hidden shadow-[0_12px_40px_rgba(0,212,170,0.12)]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00D4AA] to-[#00A884]" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#00D4AA]/10 flex items-center justify-center shrink-0">
                  <Check size={20} className="text-[#00A884]" strokeWidth={3} />
                </div>
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
                    <Check size={17} className="text-[#00D4AA] shrink-0 mt-0.5" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 3 — BENTO GRID (Core Value Pillars)
      ═══════════════════════════════════════ */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">THE PLATFORM</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
          </Reveal>

          {/* Row 1: Full-width tech card */}
          <Reveal className="bg-gradient-to-br from-[#0A2540] to-[#1A3B5C] rounded-[1.25rem] p-[clamp(1.5rem,4vw,2.5rem)] mb-4 relative overflow-hidden">
            <div className="aurora-blob w-56 h-56 bg-[#00D4AA]/[0.10] -top-16 -right-16" />
            <div className="aurora-blob w-40 h-40 bg-blue-500/[0.08] -bottom-10 left-[40%]" style={{ animationDelay: '4s' }} />
            <div className="relative z-10 flex flex-wrap gap-8 items-center justify-between">
              <div className="flex-1 min-w-[220px]">
                <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center mb-3.5 border border-[#00D4AA]/25">
                  <Target size={24} className="text-[#00D4AA]" strokeWidth={2.2} />
                </div>
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
                    <Check size={15} className="text-[#00D4AA] shrink-0" strokeWidth={3} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Row 2: Two medium cards */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            <Reveal className="bg-gradient-to-br from-[#00D4AA]/[0.06] to-[#00A884]/10 rounded-[1.25rem] p-8 border-2 border-[#00D4AA]/25">
              <div className="w-11 h-11 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center mb-3.5">
                <Wallet size={22} className="text-[#00A884]" strokeWidth={2.2} />
              </div>
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
            </Reveal>

            <Reveal delay={100} className="bg-white rounded-[1.25rem] p-8 border border-gray-200">
              <div className="w-11 h-11 rounded-xl bg-sky-50 flex items-center justify-center mb-3.5">
                <Gauge size={22} className="text-sky-600" strokeWidth={2.2} />
              </div>
              <h3 className="text-[1.1875rem] font-bold text-[#0A2540] mb-3">Study on Your Terms</h3>
              <p className="text-gray-600 text-[0.9rem] leading-[1.6] mb-5">
                Track progress across all 195 questions. Resume mid-set anytime. Study on any device at your own pace — timed or untimed.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Progress saving', 'Any device', 'Timed mode', 'Weak-area focus'].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1.5 bg-slate-50 rounded-full text-[0.78rem] font-semibold text-gray-700 border border-gray-200">
                    {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Row 3: Full-width growing library card */}
          <Reveal className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-[1.25rem] p-[clamp(1.5rem,4vw,2rem)] border border-sky-200 flex flex-wrap items-center justify-between gap-6">
            <div className="flex-1 min-w-[220px]">
              <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-3.5 border border-sky-200">
                <Rocket size={22} className="text-sky-600" strokeWidth={2.2} />
              </div>
              <h3 className="text-[1.1875rem] font-bold text-[#0A2540] mb-2">Growing Certification Library</h3>
              <p className="text-sky-700 text-[0.9rem] leading-[1.55]">
                AWS DVA-C02 live now. Your subscription automatically includes all new certs as they launch — no extra cost.
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {[
                { label: 'AWS DVA-C02', available: true },
                { label: 'AWS SAA-C03', available: false },
                { label: 'AZ-104', available: false },
                { label: 'GCP ACE', available: false },
              ].map((cert, i) => (
                <div key={i} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[0.625rem] text-[0.8125rem] font-semibold border ${cert.available ? 'bg-[#00D4AA]/10 text-[#00A884] border-[#00D4AA]/30' : 'bg-white text-gray-400 border-gray-200'}`}>
                  {cert.available ? <Check size={14} strokeWidth={3} /> : <Clock size={14} />}
                  {cert.label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 4 — 3-STEP FRICTION REDUCER
      ═══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-80 h-80 bg-[#00D4AA]/[0.08] top-0 left-1/4" />
        <div className="max-w-[72rem] mx-auto relative z-10">
          <Reveal className="text-center mb-14">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">GET STARTED IN MINUTES</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white tracking-tight">
              From zero to certified in 3 steps
            </h2>
          </Reveal>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
            {[
              {
                step: '01',
                Icon: UserPlus,
                title: 'Create Free Account',
                desc: 'Sign up in 30 seconds with email or Google. No credit card required.',
              },
              {
                step: '02',
                Icon: Route,
                title: 'Map Your Journey',
                desc: "Answer a few questions about your career and we'll build your personalized roadmap — target role, salary, and timeline — then unlock 10 free practice questions.",
              },
              {
                step: '03',
                Icon: Trophy,
                title: 'Practice & Pass',
                desc: 'Work through exam-realistic questions with instant feedback, explanations, and official AWS doc links. Walk into exam day with no surprises.',
              },
            ].map((item, index) => (
              <Reveal key={index} delay={index * 120} className={`p-8 relative ${index > 0 ? 'md:border-l border-white/[0.08]' : ''}`}>
                <div className="text-[4.5rem] font-black text-[#00D4AA]/[0.12] leading-none mb-3.5 tracking-tighter tabular-nums">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center mb-3.5 border border-[#00D4AA]/25">
                  <item.Icon size={24} className="text-[#00D4AA]" strokeWidth={2.2} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/65 leading-[1.65] text-[0.9375rem]">{item.desc}</p>
              </Reveal>
            ))}
          </div>

          <div className="text-center mt-14">
            <Button
              variant="primary"
              onClick={openSignup}
              className="!px-10 !py-4 !rounded-[0.875rem] !text-[1.0625rem] shadow-teal hover:shadow-teal-lg hover:-translate-y-1 gap-2"
            >
              Start Free <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">INTERACTIVE DEMO</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] mb-3 tracking-tight">
              Experience the exam interface
            </h2>
            <p className="text-gray-500 text-base max-w-[38rem] mx-auto">
              This is the exact interface you'll use — try selecting an answer below.
            </p>
          </Reveal>

          <Reveal className="max-w-[680px] mx-auto mb-8 rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
            {/* Real exam interface (same classes as ExamInterface.jsx) */}
            <div style={{ background: 'var(--gradient-brand)', padding: '1.25rem' }}>
              <div className="exam-header">
                <h1 className="exam-header-title">AWS Developer Associate — Practice Set 1</h1>
                <div className="exam-timer-display inline-flex items-center gap-1.5">
                  <Clock size={16} /> Time Remaining: 01:28:43
                </div>
              </div>

              {/* Time bar */}
              <div className="time-bar-container">
                <div className="time-bar" style={{ width: '92%' }} />
              </div>

              {/* Question navigation */}
              <div className={`question-navigation ${demoNavMinimized ? 'minimized' : ''}`}>
                <div className="question-nav-header">
                  <span className="text-sm text-white/80">Questions: {demoAnswered}/65</span>
                  <button
                    onClick={() => setDemoNavMinimized(v => !v)}
                    className="nav-toggle-btn inline-flex items-center"
                    title={demoNavMinimized ? 'Expand navigation' : 'Minimize navigation'}
                  >
                    {demoNavMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                </div>
                {!demoNavMinimized && (
                  <div className="question-nav-grid">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`question-nav-item ${i === 0 ? 'current' : (i < demoAnswered ? 'answered' : 'unanswered')}`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${(demoAnswered / 65) * 100}%` }} />
              </div>
              <div className="progress-text mb-4">{demoAnswered} of 65 questions answered</div>

              {/* AI Learning Guide */}
              <div className="flex justify-center mb-3">
                <button
                  onClick={() => setShowDemoMaterials(true)}
                  className="materials-button inline-flex items-center gap-1.5 bg-[rgba(0,212,170,0.15)] text-[#00D4AA] border-[#00D4AA]"
                >
                  <Sparkles size={14} /> AI Learning Guide
                </button>
              </div>

              {/* Question card */}
              <div className="question-card">
                <div className="question-header">
                  <span className="question-badge">Question 1 • Multiple Choice — select one</span>
                  <p className="question-text">
                    A developer is building a serverless application using AWS Lambda. The application needs to process images uploaded to an S3 bucket. Which AWS service should be used to trigger the Lambda function when a new image is uploaded?
                  </p>
                </div>
                <div className="options-container">
                  {[
                    'Amazon CloudWatch Events',
                    'Amazon S3 Event Notifications',
                    'Amazon SNS',
                    'AWS Step Functions',
                  ].map((option, index) => {
                    const isSelected = demoSelectedAnswer === index
                    return (
                      <div
                        key={index}
                        onClick={() => setDemoSelectedAnswer(index)}
                        className={`option ${isSelected ? 'option-selected' : 'option-default'}`}
                      >
                        <div className="option-content">
                          <div className={`option-checkbox option-checkbox-circle ${isSelected ? 'option-checkbox-selected' : 'option-checkbox-default'}`}>
                            {isSelected && <Check size={15} strokeWidth={3} />}
                          </div>
                          <span className="option-text">{option}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="navigation-buttons">
                <button disabled className="nav-button nav-button-prev inline-flex items-center justify-center">
                  <ArrowLeft size={16} className="mr-1.5" /> Previous
                </button>
                <button className="nav-button nav-button-next inline-flex items-center justify-center">
                  Next <ArrowRight size={16} className="ml-1.5" />
                </button>
              </div>
              <div className="progress-text">{demoAnswered} of 65 questions answered</div>
            </div>
          </Reveal>

          <div className="text-center flex flex-col items-center gap-3">
            <button
              onClick={() => setShowDemoResults(true)}
              className="inline-flex items-center gap-1.5 bg-transparent border-none text-gray-500 text-sm cursor-pointer underline p-0 hover:text-[#00A884]"
            >
              <BarChart3 size={15} /> Preview the results screen
            </button>
            <Button
              variant="primary"
              onClick={openSignup}
              className="gap-2 !px-8 !py-3.5 !rounded-xl shadow-[0_4px_12px_rgba(0,212,170,0.3)] hover:shadow-[0_6px_16px_rgba(0,212,170,0.4)] hover:-translate-y-0.5"
            >
              Start Free <ArrowRight size={18} />
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
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">AVAILABLE NOW + 20 MORE COMING SOON</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] mb-3 tracking-tight">
              Your certification journey starts here
            </h2>
            <p className="text-gray-500 text-base max-w-[40rem] mx-auto">
              Start with AWS Developer Associate today. More certifications launching soon across AWS, Azure, and GCP.
            </p>
          </Reveal>

          {/* Provider tabs */}
          <div className="flex gap-2 justify-center mb-8 flex-wrap">
            {['aws', 'azure', 'gcp'].map(provider => (
              <button
                key={provider}
                onClick={() => setExpandedProvider(provider)}
                className={`px-5 py-2.5 border-2 border-[#0A2540] rounded-lg font-semibold cursor-pointer transition-all duration-200 uppercase text-[0.8125rem] min-w-[90px] ${expandedProvider === provider ? 'bg-[#0A2540] text-white' : 'bg-white text-[#0A2540]'}`}
              >
                {provider}
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
                  <div className="absolute -top-2.5 right-3 inline-flex items-center gap-1 bg-gradient-to-r from-[#00D4AA] to-[#00A884] text-white px-3 py-1 rounded-full text-[0.7rem] font-bold shadow-[0_2px_8px_rgba(0,212,170,0.3)]">
                    <Sparkles size={11} /> AVAILABLE NOW
                  </div>
                ) : (
                  <div className="absolute -top-2.5 right-3 inline-flex items-center gap-1 bg-gray-400 text-white px-3 py-1 rounded-full text-[0.7rem] font-bold">
                    <Clock size={11} /> COMING SOON
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
      <section id="pricing" className="py-20 px-6 bg-gradient-to-br from-[#0A2540] to-[#1A3B5C] relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-72 h-72 bg-[#00D4AA]/[0.07] top-10 right-10" />
        <div className="max-w-[72rem] mx-auto relative z-10">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">SIMPLE PRICING</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-white mb-3 tracking-tight">
              Choose your study plan
            </h2>
            <p className="text-white/80 text-base">
              Unlimited access • Study at your own pace • Cancel anytime
            </p>
          </Reveal>

          <div className="grid gap-5 max-w-[900px] mx-auto items-stretch" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
            {/* Free */}
            <Reveal className="bg-white/[0.08] backdrop-blur-xl p-8 rounded-[1.25rem] border border-white/15 text-center flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3.5">
                <Gift size={24} className="text-[#00D4AA]" strokeWidth={2.2} />
              </div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Free Sample</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">$0</div>
              <p className="text-white/65 text-sm mb-6">Try before you subscribe</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2 flex-1">
                {['10 sample questions', 'Full explanations', 'No credit card required'].map((item, i) => (
                  <li key={i} className="text-white/85 flex items-center gap-2 text-[0.9rem]">
                    <Check size={16} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="dark" onClick={() => setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl">
                Start Free
              </Button>
            </Reveal>

            {/* Monthly */}
            <Reveal delay={90} className="bg-white/[0.08] backdrop-blur-xl p-8 rounded-[1.25rem] border border-white/15 text-center flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3.5">
                <Calendar size={24} className="text-[#00D4AA]" strokeWidth={2.2} />
              </div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Monthly</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">$19.99</div>
              <p className="text-white/65 text-sm mb-6">Per month • Billed monthly</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2 flex-1">
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime'].map((item, i) => (
                  <li key={i} className="text-white/85 flex items-center gap-2 text-[0.9rem]">
                    <Check size={16} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="dark" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl">
                {user ? 'Enroll Now' : 'Get Started'}
              </Button>
            </Reveal>

            {/* Annual — best value */}
            <Reveal delay={180} className="bg-white/[0.12] backdrop-blur-xl p-8 rounded-[1.25rem] border-2 border-[#00D4AA] text-center relative flex flex-col shadow-[0_0_50px_rgba(0,212,170,0.15)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00D4AA] text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                BEST VALUE
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/20 flex items-center justify-center mx-auto mb-3.5">
                <GraduationCap size={24} className="text-[#00D4AA]" strokeWidth={2.2} />
              </div>
              <h3 className="text-[1.375rem] font-bold text-white mb-1.5">Annual</h3>
              <div className="text-[2.75rem] font-extrabold text-[#00D4AA] mb-1 tracking-tight">$99</div>
              <p className="text-white/45 text-[0.8125rem] line-through mb-1">$239.88/year</p>
              <p className="text-white/75 text-sm mb-6">12 months • Save $141 • $8.25/mo</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2 flex-1">
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime', 'All new certs included'].map((item, i) => (
                  <li key={i} className="text-white/90 flex items-center gap-2 text-[0.9rem]">
                    <Check size={16} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="primary" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl shadow-teal">
                {user ? 'Enroll Now' : 'Get Started'}
              </Button>
            </Reveal>
          </div>

          <div className="text-center mt-8 relative z-10">
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
          <Reveal className="grid gap-4 mb-16 p-8 bg-slate-50 rounded-[1.25rem] border border-gray-200" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}>
            {METRICS.map((item, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-[#0A2540] tracking-tight mb-1">
                  <CountUp value={item.value} suffix={item.suffix} decimals={item.decimals} />
                </div>
                <div className="text-sm text-gray-500 font-medium">{item.label}</div>
              </div>
            ))}
          </Reveal>

          <Reveal className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">REAL RESULTS</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Trusted by cloud professionals
            </h2>
          </Reveal>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 100}>
                <Card variant="tinted" className="!p-7 flex flex-col gap-4 h-full">
                  <div className="flex gap-1">
                    {[...Array(t.stars)].map((_, si) => (
                      <Star key={si} size={16} className="text-amber-400 fill-amber-400" />
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[48rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">FAQ</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <Reveal key={index} delay={index * 50} className="border border-gray-200 rounded-[0.875rem] overflow-hidden bg-white">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className={`w-full px-5 py-5 border-none text-left cursor-pointer flex justify-between items-center font-semibold text-[#0A2540] text-[0.9375rem] gap-4 transition-colors ${expandedFAQ === index ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 text-gray-400 transition-transform duration-[250ms]"
                    style={{ transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-5 pb-5 text-gray-600 leading-[1.65] text-[0.9375rem]">
                    {item.answer}
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 6 — CLOSING CALL TO ACTION
      ═══════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0A2540] via-[#0d2d4a] to-[#1A3B5C] text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-[600px] h-[300px] bg-[#00D4AA]/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-[52rem] mx-auto relative z-10">
          <div className="inline-block bg-[#00D4AA]/15 border border-[#00D4AA]/30 text-[#00D4AA] px-4 py-1.5 rounded-full text-[0.8125rem] font-bold mb-6 uppercase tracking-[0.06em]">
            Start for free today
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-5 leading-[1.15] tracking-tighter">
            Ready to get your<br />
            <span className="gradient-text">AWS certification?</span>
          </h2>
          <p className="text-[clamp(1rem,2.5vw,1.1875rem)] text-white/75 mb-10 leading-[1.65]">
            Join 500+ professionals who passed on their first attempt. Start free — 10 questions, full explanations, no credit card.
          </p>
          <Button
            variant="primary"
            onClick={openSignup}
            className="gap-2 !px-12 !py-5 !rounded-[0.875rem] !text-[1.1875rem] shadow-[0_8px_28px_rgba(0,212,170,0.4)] hover:shadow-[0_14px_36px_rgba(0,212,170,0.5)] hover:-translate-y-1 mb-4"
          >
            Start Free <ArrowRight size={20} />
          </Button>
          <div className="mb-6">
            <button onClick={openLogin} className="bg-transparent border-none text-white/45 text-sm cursor-pointer underline p-0">
              Already a member? Sign in
            </button>
          </div>
          <div className="flex gap-8 justify-center flex-wrap text-white/55 text-sm">
            <span className="inline-flex items-center gap-1.5"><Lock size={15} className="text-[#00D4AA]" /> Secure payment</span>
            <span className="inline-flex items-center gap-1.5"><Zap size={15} className="text-[#00D4AA]" /> Instant access</span>
            <span className="inline-flex items-center gap-1.5"><RefreshCw size={15} className="text-[#00D4AA]" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0A2540] pt-12 pb-6 px-6 border-t border-white/[0.06]">
        <div className="max-w-[72rem] mx-auto">
          <div className="grid gap-8 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))' }}>
            <div>
              <div className="flex items-center gap-2.5 mb-3.5">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center">
                  <Cloud size={18} className="text-white" strokeWidth={2.4} />
                </span>
                <h3 className="text-white font-bold text-base m-0">Cloud Exam Lab</h3>
              </div>
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
                    className="inline-flex items-center gap-1.5 bg-transparent border-none text-[#00D4AA] text-sm cursor-pointer p-0 font-semibold text-left"
                  >
                    <Sparkles size={13} className="shrink-0" /> AWS Developer Associate (DVA-C02)
                  </button>
                </li>
                <li className="text-white/45 text-sm mb-1.5">195 practice questions</li>
                <li className="text-white/45 text-sm">3 complete exam sets</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Coming Soon</h3>
              <ul className="list-none p-0 m-0">
                {['AWS Solutions Architect', 'AWS Cloud Practitioner', 'Azure & GCP Certifications'].map((item, i) => (
                  <li key={i} className="inline-flex items-center gap-1.5 text-white/45 text-sm mb-2">
                    <Clock size={13} className="shrink-0" /> {item}
                  </li>
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
                  <h3 className="inline-flex items-center gap-2 text-[clamp(1.125rem,3vw,1.4rem)] font-bold text-[#0A2540] mb-1.5">
                    <Sparkles size={22} className="text-[#00A884]" /> AI Learning Guide
                  </h3>
                  <p className="text-gray-500 text-sm">Just-in-time learning resources for this question</p>
                </div>
                <button onClick={() => setShowDemoMaterials(false)} className="bg-transparent border-none cursor-pointer text-gray-400 p-1 leading-none hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-5">
                <h4 className="text-base font-bold text-[#0A2540] mb-3.5">AWS Lambda &amp; S3 Event Notifications</h4>
                <p className="text-gray-600 text-sm leading-[1.65] mb-4">
                  Amazon S3 can publish events (object creation, deletion, restoration) directly to AWS Lambda, SNS, SQS, and EventBridge. S3 Event Notifications is the most direct and efficient way to trigger Lambda when objects are uploaded.
                </p>
                <div className="bg-white p-4 rounded-lg border-l-4 border-[#00D4AA]">
                  <p className="inline-flex items-center gap-1.5 text-sm text-[#0A2540] font-semibold mb-1.5">
                    <Lightbulb size={15} className="text-amber-500" /> Key Concept
                  </p>
                  <p className="text-sm text-gray-600 leading-[1.55]">
                    S3 Event Notifications provide a serverless, event-driven architecture that automatically triggers your Lambda function — no polling required.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50 p-5 rounded-xl border border-sky-200">
                <h4 className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-700 mb-3.5">
                  <BookOpen size={15} /> Official AWS Documentation
                </h4>
                {[
                  { label: 'Using AWS Lambda with Amazon S3', href: 'https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html' },
                  { label: 'Configuring S3 Event Notifications', href: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html' },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-sky-700 no-underline text-sm flex items-center gap-2 mb-2 last:mb-0">
                    <ArrowRight size={14} className="shrink-0" /> {link.label}
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
                <div className="w-16 h-16 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center mx-auto mb-3.5">
                  <Trophy size={32} className="text-[#00A884]" strokeWidth={2} />
                </div>
                <h3 className="text-[clamp(1.25rem,4vw,1.625rem)] font-bold text-[#0A2540] mb-1.5">Exam Complete!</h3>
                <p className="text-gray-500 text-[0.9375rem]">AWS Developer Associate — Practice Set 1</p>
              </div>

              <div className="bg-[#00D4AA]/[0.08] p-7 rounded-2xl border-2 border-[#00D4AA] mb-7 text-center">
                <div className="text-[clamp(2.25rem,6vw,3rem)] font-extrabold text-[#00D4AA] mb-1.5 tracking-tight">82%</div>
                <div className="inline-flex items-center gap-1.5 text-xl font-bold text-[#0A2540] mb-1.5">
                  <CircleCheckBig size={22} className="text-[#00A884]" /> PASSED
                </div>
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
                <p className="inline-flex items-start gap-1.5 text-sm text-sky-700 m-0 leading-[1.55]">
                  <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Great job!</strong> You're ready for the actual exam. Review the questions you missed to lock in the remaining weak areas.</span>
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
