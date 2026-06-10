import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import {
  ArrowRight, Check, X, ChevronDown, Clock, Cloud,
  BrainCircuit, ShieldCheck, Sparkles, Lock, Zap, RefreshCw,
  BookOpen, Target, BarChart3, Users, Briefcase, Code2,
  BadgeCheck, GraduationCap, Calendar, Gift, Lightbulb,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'
import { Button } from '../design-system'

const DOMAINS = [
  { id: 'd1', label: 'Fundamentals of AI & ML',          weight: '20%', sessions: 3, color: '#0EA5E9', Icon: BrainCircuit,
    topics: ['AI vs ML vs Deep Learning', 'Supervised / unsupervised / reinforcement', 'AWS managed AI services', 'ML development lifecycle'] },
  { id: 'd2', label: 'Fundamentals of Generative AI',     weight: '24%', sessions: 4, color: '#8B5CF6', Icon: Sparkles,
    topics: ['Foundation models & LLMs', 'GenAI use cases & agentic AI', 'Capabilities & limitations', 'AWS GenAI infrastructure'] },
  { id: 'd3', label: 'Applications of Foundation Models', weight: '28%', sessions: 4, color: '#00D4AA', Icon: Target,
    topics: ['RAG & FM design', 'Prompt engineering', 'Fine-tuning approaches', 'Evaluating FM performance'] },
  { id: 'd4', label: 'Guidelines for Responsible AI',     weight: '14%', sessions: 2, color: '#F59E0B', Icon: ShieldCheck,
    topics: ['Building responsible AI systems', 'Transparency & explainability'] },
  { id: 'd5', label: 'Security, Compliance & Governance', weight: '14%', sessions: 2, color: '#EF4444', Icon: Lock,
    topics: ['Securing AI systems on AWS', 'AI governance & compliance'] },
]

const PERSONAS = [
  {
    Icon: Briefcase,
    title: 'Business & Product Roles',
    examples: 'Product manager, business analyst, consultant',
    desc: "You work alongside AI every day but lack a formal credential to back it. AIF-C01 proves you understand AI at the depth that matters for decisions — not just buzzwords.",
  },
  {
    Icon: Code2,
    title: 'Developers Pivoting to AI',
    examples: 'Software engineer, data analyst, DevOps',
    desc: "You already build software. AIF-C01 fills in the AI/ML foundations and GenAI layer your next role will expect. It's the credential that bridges your background to the AI space.",
  },
  {
    Icon: Users,
    title: 'Anyone Validating AI Literacy',
    examples: 'IT professional, team lead, recent graduate',
    desc: "Your org is going all-in on AI and you want to be ahead of it. AIF-C01 is AWS's broadest AI cert — no coding required, and it signals you're serious about the shift.",
  },
]

const FAQ_ITEMS = [
  {
    question: 'Do I need coding or ML experience to pass AIF-C01?',
    answer: "No. AIF-C01 is designed as an AI literacy cert, not an engineering cert. The exam tests your ability to identify the right AI approach, understand how models work conceptually, and apply responsible AI principles — not write code or tune models. Our study sessions are written for exactly this audience.",
  },
  {
    question: 'How long does it take to prepare?',
    answer: "Most people are ready in 2–4 weeks studying 30–60 minutes per day. Our 16 study sessions (30 min each) cover every exam domain — that's 8 hours of structured learning. Then add a few days for full practice exams and you're ready.",
  },
  {
    question: 'What is the passing score for AIF-C01?',
    answer: "700 out of 1000 (approximately 70%). The exam has 65 questions total — 50 are scored and 15 are unscored pilot questions (you won't know which is which). Scoring is compensatory, meaning there's no per-domain minimum — your total score is what matters.",
  },
  {
    question: 'How does AIF-C01 compare to other AWS certifications?',
    answer: "AIF-C01 is AWS's newest foundational cert, launched in 2024. It sits at the same difficulty level as Cloud Practitioner (CLF-C02) but is focused entirely on AI, ML, and generative AI. It's a great standalone cert and a natural first step before more technical AI/ML certifications.",
  },
  {
    question: 'What subscription options are available?',
    answer: "Monthly at $19.99/month or annual at $99/year ($8.25/month — save $141). Both include full access to all study sessions, all 65 practice questions, detailed explanations, and official AWS doc links. Cancel anytime.",
  },
]

const WHAT_YOU_GET = [
  { value: '16',  label: 'Study sessions',    sub: '~30 min each, one per topic' },
  { value: '5',   label: 'Exam domains',      sub: 'Every domain in the official guide' },
  { value: '65',  label: 'Practice questions', sub: 'Mapped to the AIF-C01 blueprint' },
  { value: '$0',  label: 'To get started',    sub: '10 free questions, no card required' },
]

const SAMPLE_QUESTION = {
  stem: 'A retailer wants to group its customers into segments based on purchasing behavior. It has transaction data but no predefined segment labels. Which machine learning approach is most appropriate?',
  options: [
    { text: 'Supervised learning with a classification algorithm',  correct: false, reason: 'Classification needs labeled examples of each segment, which the retailer does not have.' },
    { text: 'Unsupervised learning with a clustering algorithm',    correct: true,  reason: 'Correct — clustering is unsupervised and finds natural groupings without labels.' },
    { text: 'Reinforcement learning with a reward function',        correct: false, reason: 'Reinforcement learning fits sequential decision-making with rewards, not segmentation.' },
    { text: 'Supervised learning with a regression algorithm',      correct: false, reason: 'Regression predicts a continuous numeric value (e.g., spend), not groupings.' },
  ],
  explanation: 'There are no predefined labels (segments), so the model must discover natural groupings on its own — that is clustering, an unsupervised technique.',
  domain: 'Domain 1 · Fundamentals of AI & ML',
  source: 'Official AIF-C01 exam guide · Task 1.1',
}

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

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal]   = useState(false)
  const [authModalMode, setAuthModalMode]   = useState('login')
  const [expandedFAQ, setExpandedFAQ]       = useState(null)
  const [scrolled, setScrolled]             = useState(false)
  const [sampleSelected, setSampleSelected] = useState(null)
  const [sampleRevealed, setSampleRevealed] = useState(false)

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }
  const openLogin  = () => { setAuthModalMode('login');  setShowAuthModal(true) }

  // Auth is already resolved by App before Landing renders, so redirect synchronously.
  const hasAuthTokens = window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token')
  if (user && !hasAuthTokens) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
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
          <button type="button" onClick={() => scrollTo('domains')}      className="nav-link">Domains</button>
          <button type="button" onClick={() => scrollTo('how-it-works')} className="nav-link">How It Works</button>
          <button type="button" onClick={() => scrollTo('pricing')}      className="nav-link">Pricing</button>
          <button type="button" onClick={() => scrollTo('faq')}          className="nav-link">FAQ</button>
        </nav>
        <button type="button" onClick={() => setShowAuthModal(true)} className="header-cta">
          Login / Sign Up
        </button>
      </header>

      {/* HERO */}
      <section
        className="hero-section"
        style={{ paddingBottom: '5rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', alignItems: 'flex-start' }}
      >
        <div className="hero-bg-1" />
        <div className="hero-bg-2" />
        <div className="absolute inset-0 grid-texture pointer-events-none" />

        <div className="max-w-[72rem] mx-auto w-full relative z-10">
          <div className="grid gap-12 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' }}>

            {/* Left — copy */}
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm">
                <BadgeCheck size={15} className="text-[#00D4AA]" />
                <span className="text-white/90 text-sm font-semibold tracking-wide">AWS AI Practitioner · AIF-C01</span>
              </div>

              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] mb-6 tracking-[-0.03em]">
                AI is changing every role.<br />
                <span className="gradient-text">Get certified.</span>
              </h1>

              <p className="text-[clamp(1rem,2.5vw,1.175rem)] text-white/85 leading-[1.7] mb-10 max-w-[38rem]">
                The AWS AI Practitioner proves you understand AI, machine learning, and generative AI at the depth that matters — for every role, not just developers. 16 structured study sessions + exam-realistic practice questions.
              </p>

              <div className="hero-buttons" style={{ marginBottom: '2rem' }}>
                <button onClick={openSignup} className="btn-primary inline-flex items-center justify-center gap-2" style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}>
                  Start Free <ArrowRight size={18} />
                </button>
                <button onClick={() => scrollTo('domains')} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                  See What's Covered
                </button>
              </div>

              <div className="flex gap-x-6 gap-y-2 flex-wrap text-white/65 text-sm">
                {['No coding experience required', '16 study sessions', 'From $8.25/month'].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <Check size={15} className="text-[#00D4AA]" strokeWidth={3} /> {t}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Right — exam snapshot card */}
            <Reveal delay={120} className="flex justify-center items-start">
              <div
                className="w-full max-w-[400px] rounded-2xl overflow-hidden border border-white/[0.1]"
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.45)', background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)' }}
              >
                {/* Card header */}
                <div className="px-6 py-5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/15 border border-[#00D4AA]/25 flex items-center justify-center shrink-0">
                      <BrainCircuit size={20} className="text-[#00D4AA]" strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-bold text-[#00D4AA] uppercase tracking-[0.06em]">AWS Certified</div>
                      <div className="text-white font-bold text-base leading-tight">AI Practitioner</div>
                    </div>
                  </div>
                </div>

                {/* Exam facts */}
                <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.07]">
                  {[
                    { label: 'Questions',     value: '65',       sub: '50 scored + 15 unscored' },
                    { label: 'Time limit',    value: '90 min',   sub: 'Timed exam' },
                    { label: 'Passing score', value: '700/1000', sub: 'Approx. 70%' },
                    { label: 'Exam cost',     value: '$300',     sub: 'USD (AWS voucher)' },
                  ].map((f, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="text-[0.7rem] text-white/45 font-semibold uppercase tracking-[0.05em] mb-0.5">{f.label}</div>
                      <div className="text-white font-extrabold text-lg leading-tight">{f.value}</div>
                      <div className="text-white/45 text-[0.7rem] mt-0.5">{f.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Domains */}
                <div className="px-6 py-5">
                  <div className="text-[0.7rem] font-bold text-white/45 uppercase tracking-[0.06em] mb-3">5 Exam Domains</div>
                  <div className="flex flex-col gap-2">
                    {DOMAINS.map(d => (
                      <div key={d.id} className="flex items-center justify-between">
                        <span className="text-white/75 text-[0.8125rem]">{d.label}</span>
                        <span className="text-[0.75rem] font-bold tabular-nums" style={{ color: d.color }}>{d.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="px-6 pb-6">
                  <button
                    onClick={openSignup}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white inline-flex items-center justify-center gap-2"
                    style={{ background: 'var(--gradient-teal)', boxShadow: '0 4px 14px rgba(0,212,170,0.3)' }}
                  >
                    Start Preparing Free <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#0A2540] border-y border-white/[0.06] py-4 overflow-hidden">
        <div className="marquee-mask">
          <div className="marquee-track gap-10 pr-10">
            {[
              'No coding required', '16 study sessions', '65 practice questions',
              'Blueprint-mapped domains', 'Official AWS doc links', 'Timed practice exam',
              'No coding required', '16 study sessions', '65 practice questions',
              'Blueprint-mapped domains', 'Official AWS doc links', 'Timed practice exam',
            ].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-white/55 text-sm font-medium whitespace-nowrap shrink-0">
                <BadgeCheck size={16} className="text-[#00D4AA]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">WHO IT'S FOR</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              Built for every role, not just developers
            </h2>
            <p className="text-gray-500 text-base max-w-[40rem] mx-auto">
              AIF-C01 is AWS's broadest AI cert. If you work with AI — or want to — this is your credential.
            </p>
          </Reveal>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {PERSONAS.map((p, i) => (
              <Reveal key={i} delay={i * 100} className="bg-white rounded-[1.25rem] p-7 border border-gray-200 hover:border-[#00D4AA] hover:shadow-[0_8px_28px_rgba(0,212,170,0.12)] transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-4">
                  <p.Icon size={22} className="text-[#00A884]" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-[#0A2540] text-[1.0625rem] mb-1">{p.title}</h3>
                <p className="text-[0.8rem] text-gray-400 font-medium mb-3">{p.examples}</p>
                <p className="text-gray-600 text-[0.9rem] leading-[1.65]">{p.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DOMAIN BREAKDOWN */}
      <section id="domains" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">EXAM DOMAINS</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              Every domain, covered in depth
            </h2>
            <p className="text-gray-500 text-base max-w-[38rem] mx-auto">
              Our study sessions are mapped directly to the official AIF-C01 exam guide. Nothing is skipped.
            </p>
          </Reveal>

          <div className="flex flex-col gap-4">
            {DOMAINS.map((d, i) => (
              <Reveal key={d.id} delay={i * 80}
                className="bg-white rounded-[1.25rem] p-6 border border-gray-200 flex flex-wrap items-start gap-6"
                style={{ borderLeft: `4px solid ${d.color}` }}
              >
                <div className="flex items-center gap-4 min-w-[220px] flex-1">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${d.color}14` }}>
                    <d.Icon size={22} style={{ color: d.color }} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em] mb-0.5" style={{ color: d.color }}>
                      {d.weight} of exam · {d.sessions} {d.sessions === 1 ? 'session' : 'sessions'}
                    </div>
                    <div className="font-bold text-[#0A2540] text-[1rem]">{d.label}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 flex-1 items-center justify-end">
                  {d.topics.map((t, ti) => (
                    <span key={ti} className="px-3 py-1.5 bg-slate-50 rounded-full text-[0.78rem] font-medium text-gray-600 border border-gray-200 whitespace-nowrap">
                      {t}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-80 h-80 bg-[#00D4AA]/[0.08] top-0 left-1/4" />
        <div className="max-w-[72rem] mx-auto relative z-10">
          <Reveal className="text-center mb-14">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">YOUR STUDY PLAN</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white tracking-tight">
              From zero to AIF-C01 certified
            </h2>
          </Reveal>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
            {[
              {
                step: '01',
                Icon: BookOpen,
                title: 'Learn Every Domain',
                desc: '16 structured 30-minute sessions — one per topic. Each covers key concepts, AWS services, exam tips, and a real exam-style question to lock in what you just learned. No prior AI experience needed.',
              },
              {
                step: '02',
                Icon: BarChart3,
                title: 'Practice Under Exam Conditions',
                desc: '65 questions mapped to the official AIF-C01 blueprint — timed, just like the real thing. Every question includes a full explanation and official AWS documentation link so you know exactly why each answer is right.',
              },
              {
                step: '03',
                Icon: GraduationCap,
                title: 'Walk In Prepared',
                desc: "Track your progress domain by domain, identify weak areas, and review before exam day. Our students pass at 82% on the first attempt — you'll know when you're ready.",
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
            <p className="text-white/45 text-sm mt-3">No credit card required · 10 free questions to start</p>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET + SAMPLE QUESTION */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">

          <Reveal className="grid gap-4 mb-16 p-8 bg-slate-50 rounded-[1.25rem] border border-gray-200"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))' }}
          >
            {WHAT_YOU_GET.map((item, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold text-[#0A2540] tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-0.5">{item.label}</div>
                <div className="text-xs text-gray-400">{item.sub}</div>
              </div>
            ))}
          </Reveal>

          <Reveal className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">SAMPLE QUESTION</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              See exactly what you're getting
            </h2>
            <p className="text-gray-500 text-base max-w-[36rem] mx-auto">
              This is a real question from the AIF-C01 prep course — the same format, depth, and explanation you'll get for every question.
            </p>
          </Reveal>

          <Reveal className="max-w-[680px] mx-auto rounded-2xl overflow-hidden border border-gray-200" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}>
            <div style={{ background: 'var(--gradient-brand)', padding: '1.25rem' }}>

              <div className="mb-4">
                <div className="inline-flex items-center gap-2 text-[0.7rem] font-bold text-white/60 uppercase tracking-[0.06em] mb-3">
                  <span className="px-2 py-0.5 bg-white/10 rounded text-white/70">{SAMPLE_QUESTION.domain}</span>
                  <span>· Multiple Choice — select one</span>
                </div>
                <p className="text-white font-semibold text-[1rem] leading-[1.6]">
                  {SAMPLE_QUESTION.stem}
                </p>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                {SAMPLE_QUESTION.options.map((opt, i) => {
                  const isSelected = sampleSelected === i
                  const showResult = sampleRevealed
                  let optClass = 'option-default'
                  if (showResult && opt.correct)                     optClass = 'option-correct'
                  else if (showResult && isSelected && !opt.correct) optClass = 'option-incorrect'
                  else if (isSelected)                               optClass = 'option-selected'

                  return (
                    <div
                      key={i}
                      onClick={() => { if (!sampleRevealed) setSampleSelected(i) }}
                      className={`option ${optClass} ${sampleRevealed ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="option-content">
                        <div className={`option-checkbox option-checkbox-circle ${isSelected || (showResult && opt.correct) ? 'option-checkbox-selected' : 'option-checkbox-default'}`}>
                          {showResult && opt.correct              && <Check size={14} strokeWidth={3} />}
                          {showResult && !opt.correct && isSelected && <X size={14} strokeWidth={3} />}
                          {!showResult && isSelected               && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="option-text">{opt.text}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!sampleRevealed ? (
                <button
                  onClick={() => { if (sampleSelected !== null) setSampleRevealed(true) }}
                  disabled={sampleSelected === null}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-150"
                  style={{
                    background: sampleSelected !== null ? 'var(--gradient-teal)' : 'rgba(255,255,255,0.1)',
                    color: sampleSelected !== null ? 'white' : 'rgba(255,255,255,0.35)',
                    cursor: sampleSelected !== null ? 'pointer' : 'not-allowed',
                  }}
                >
                  {sampleSelected === null ? 'Select an answer to reveal explanation' : 'Check My Answer'}
                </button>
              ) : (
                <div className="bg-white/[0.08] rounded-xl p-4 border border-white/[0.12]">
                  <div className="flex items-start gap-2 mb-3">
                    <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-white/90 text-sm leading-[1.6] font-medium">{SAMPLE_QUESTION.explanation}</p>
                  </div>
                  {SAMPLE_QUESTION.options.map((opt, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5 border-t border-white/[0.07]">
                      <span className="shrink-0 mt-0.5">
                        {opt.correct
                          ? <Check size={13} className="text-[#00D4AA]" strokeWidth={3} />
                          : <X size={13} className="text-white/30" strokeWidth={2.5} />}
                      </span>
                      <p className="text-white/60 text-xs leading-[1.55]">
                        <span className={`font-semibold ${opt.correct ? 'text-[#00D4AA]' : 'text-white/45'}`}>{opt.text}: </span>
                        {opt.reason}
                      </p>
                    </div>
                  ))}
                  <div className="mt-3 pt-2.5 border-t border-white/[0.07] flex items-center justify-between">
                    <span className="text-[0.7rem] text-white/35">{SAMPLE_QUESTION.source}</span>
                    <button onClick={openSignup} className="inline-flex items-center gap-1 text-[0.8rem] font-semibold text-[#00D4AA] bg-transparent border-none cursor-pointer p-0">
                      See all 65 questions <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm mb-4">Every question includes a full explanation like this — plus a link to the official AWS documentation.</p>
            <Button variant="primary" onClick={openSignup} className="gap-2 !px-8 !py-3.5 !rounded-xl shadow-teal">
              Try 10 Free Questions <ArrowRight size={16} />
            </Button>
          </div>

        </div>
      </section>

      {/* PRICING */}
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
              Unlimited access · Study at your own pace · Cancel anytime
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
              <p className="text-white/65 text-sm mb-6">Per month · Billed monthly</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2 flex-1">
                {['All 65 AIF-C01 questions', '16 study sessions', 'Cancel anytime'].map((item, i) => (
                  <li key={i} className="text-white/85 flex items-center gap-2 text-[0.9rem]">
                    <Check size={16} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="dark" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl">
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </Reveal>

            {/* Annual */}
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
              <p className="text-white/75 text-sm mb-6">12 months · Save $141 · $8.25/mo</p>
              <ul className="list-none p-0 mb-6 text-left space-y-2 flex-1">
                {['All 65 AIF-C01 questions', '16 study sessions', 'Cancel anytime', 'All new certs included'].map((item, i) => (
                  <li key={i} className="text-white/90 flex items-center gap-2 text-[0.9rem]">
                    <Check size={16} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
              <Button variant="primary" onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} className="!w-full !py-3.5 !rounded-xl shadow-teal">
                {user ? 'Go to Dashboard' : 'Get Started'}
              </Button>
            </Reveal>
          </div>

          <div className="text-center mt-8 relative z-10">
            <p className="text-white/55 text-sm">
              The AIF-C01 exam costs $300 — your prep investment is a fraction of that.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[48rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">FAQ</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Questions about AIF-C01
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

      {/* CLOSING CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0A2540] via-[#0d2d4a] to-[#1A3B5C] text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-[600px] h-[300px] bg-[#00D4AA]/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-[52rem] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00D4AA]/15 border border-[#00D4AA]/30 text-[#00D4AA] px-4 py-1.5 rounded-full text-[0.8125rem] font-bold mb-6 uppercase tracking-[0.06em]">
            <BadgeCheck size={14} /> AWS AI Practitioner · AIF-C01
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-5 leading-[1.15] tracking-tighter">
            Ready to add AI Practitioner<br />
            <span className="gradient-text">to your credentials?</span>
          </h2>
          <p className="text-[clamp(1rem,2.5vw,1.1875rem)] text-white/75 mb-10 leading-[1.65]">
            Start with 10 free questions — no credit card, no commitment. See exactly what the exam covers and how we prepare you for it.
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

      {/* Footer */}
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
                Full exam preparation for cloud certifications — structured study sessions and practice exams.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">AIF-C01 Prep</h3>
              <ul className="list-none p-0 m-0">
                {['16 study sessions', '5 exam domains', '65 practice questions', 'Official AWS doc links'].map((item, i) => (
                  <li key={i} className="text-white/45 text-sm mb-1.5 flex items-center gap-1.5">
                    <Check size={12} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Other Certifications</h3>
              <ul className="list-none p-0 m-0">
                {['AWS Developer Associate (DVA-C02)', 'AWS Solutions Architect', 'Azure & GCP — Coming Soon'].map((item, i) => (
                  <li key={i} className="text-white/45 text-sm mb-2 flex items-center gap-1.5">
                    <Clock size={12} className="shrink-0" /> {item}
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
                    <a href={link.href} className="text-white/60 text-sm no-underline hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-6">
            <p className="text-white/40 text-xs text-center mb-1.5">
              <strong>Disclaimer:</strong> Independent practice questions. Not affiliated with or endorsed by Amazon Web Services (AWS).
            </p>
            <p className="text-white/40 text-xs text-center">
              © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />

    </div>
  )
}

export default Landing
