import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import {
  ArrowRight, Check, ChevronDown, Clock, Cloud,
  ShieldCheck, Sparkles, Lock, Zap, RefreshCw,
  BookOpen, Target, BarChart3, Users,
  BadgeCheck, GraduationCap, Calendar, Gift, Lightbulb,
  Mic, Repeat, FileCheck, Mail,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'
import { Button } from '../design-system'
import { PROGRAMS } from '../data/programs'
import SocialLinks from '../components/layout/SocialLinks'

const LEARNING_FEATURES = [
  {
    Icon: BookOpen,
    title: 'Sessions written to teach, not to cram',
    desc: 'Every topic is a focused ~30-minute session that explains the why before the what — built from the ground up so concepts actually stick, not just survive until exam day.',
  },
  {
    Icon: Lightbulb,
    title: 'Active recall, built in',
    desc: 'Each session opens with a pre-learning question and ends with a real exam-style problem. Retrieving an answer — even getting it wrong — is what moves knowledge into long-term memory.',
  },
  {
    Icon: Mic,
    title: 'Teach to Learn',
    desc: 'The fastest way to remember something is to teach it. Every session ends with a prompt to explain it in your own words, watch how others explain it, then record your own — and build public proof you understand it.',
  },
  {
    Icon: BarChart3,
    title: 'Exam-realistic practice',
    desc: 'Full-length timed practice exams mapped to the official blueprint. Every question carries a complete explanation and a link to the official AWS documentation, so you learn from every answer.',
  },
  {
    Icon: Repeat,
    title: 'Track progress, find weak spots',
    desc: 'See your progress domain by domain, surface the topics you are weakest on, and review with purpose instead of re-reading everything.',
  },
  {
    Icon: ShieldCheck,
    title: 'Learn anywhere, even offline',
    desc: 'A fast, installable app that works on any device and keeps your progress in sync — study on the train, pick up exactly where you left off.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    Icon: BookOpen,
    title: 'Learn every domain',
    desc: 'Work through structured 30-minute sessions — one per topic. Each builds real understanding from first principles: key concepts, the AWS services that matter, and exam-style checks to lock it in.',
  },
  {
    step: '02',
    Icon: Mic,
    title: 'Teach it to prove it',
    desc: 'Explain each topic in your own words and record yourself teaching it. This is the single most effective study technique there is — and it leaves you with a portfolio that proves what you know.',
  },
  {
    step: '03',
    Icon: GraduationCap,
    title: 'Practice, then pass',
    desc: 'Sit full-length timed exams, review every explanation, and watch your scores climb. Walk into the real exam already knowing you are ready — or simply walk away genuinely skilled.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Do I have to take the AWS exam to get value from this?',
    answer: "Not at all. Our curriculum is built to make you genuinely good at the subject — cloud, AI, architecture, development, or ML — not just to pass a test. Many learners use us purely to build real, durable skills. If you do decide to sit the exam, you will already be fully prepared.",
  },
  {
    question: 'What is "Teach to Learn"?',
    answer: "Teaching a topic is the most effective way to learn it. At the end of every session we prompt you to explain the concept in your own words, watch how others explain it, and record your own short explanation. It cements the knowledge — and gives you public proof that you genuinely understand the material, which you can share with employers.",
  },
  {
    question: 'Which certifications do you cover?',
    answer: "We cover the AWS foundational, associate, and professional certifications: Cloud Practitioner (CLF-C02), AI Practitioner (AIF-C01), Solutions Architect Associate (SAA-C03), Developer Associate (DVA-C02), Machine Learning Engineer Associate (MLA-C01), CloudOps Engineer Associate (SOA-C03), Solutions Architect Professional (SAP-C02), Generative AI Developer Professional (AIP-C01), and DevOps Engineer Professional (DOP-C02). One subscription gives you access to all of them.",
  },
  {
    question: 'How long does it take to prepare?',
    answer: "Most people are ready for a foundational exam in 2–4 weeks, an associate exam in 4–8 weeks, and the professional exam in 8–12 weeks, studying 30–60 minutes a day. Each program is broken into ~30-minute sessions, so it fits around real life — and you move at your own pace.",
  },
  {
    question: 'Do I need a coding or technical background?',
    answer: "It depends on the cert. Cloud Practitioner and AI Practitioner require no coding at all. The associate certs (Solutions Architect, Developer, ML Engineer) assume some technical comfort, and our sessions build the rest up for you from the fundamentals.",
  },
  {
    question: 'What does it cost?',
    answer: "Start free — every program includes 10 sample questions with full explanations, no card required. Full access is $19.99/month or $99/year ($8.25/month), and includes every program plus all new certifications we add. Cancel anytime.",
  },
]

const LEVEL_ORDER = ['Foundational', 'Associate', 'Professional']

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

function ProgramCard({ program, delay }) {
  const { Icon, color } = program
  return (
    <Reveal delay={delay}>
      <Link
        to={`/${program.code}`}
        className="block group bg-white rounded-[1.25rem] p-6 border border-gray-200 hover:border-[#00D4AA] hover:shadow-[0_12px_32px_rgba(0,212,170,0.14)] transition-all duration-200 no-underline h-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}14` }}>
            <Icon size={24} style={{ color }} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em]" style={{ color }}>
              {program.level} · {program.code}
            </div>
            <div className="font-bold text-[#0A2540] text-[1.0625rem] leading-tight">{program.shortName}</div>
          </div>
        </div>
        <p className="text-gray-600 text-[0.9rem] leading-[1.6] mb-4">{program.tagline}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-gray-400 font-medium mb-4">
          <span className="inline-flex items-center gap-1"><BookOpen size={13} /> {program.sessions} sessions</span>
          <span className="inline-flex items-center gap-1"><Target size={13} /> {program.domains.length} domains</span>
          <span className="inline-flex items-center gap-1"><Clock size={13} /> {program.facts.time}</span>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[#00A884] group-hover:gap-2.5 transition-all">
          Explore this program <ArrowRight size={15} />
        </span>
      </Link>
    </Reveal>
  )
}

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }
  const openLogin = () => { setAuthModalMode('login'); setShowAuthModal(true) }

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
          <button type="button" onClick={() => scrollTo('programs')}     className="nav-link">Programs</button>
          <button type="button" onClick={() => scrollTo('why')}          className="nav-link">Why Us</button>
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

        <div className="max-w-[60rem] mx-auto w-full relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm">
              <BadgeCheck size={15} className="text-[#00D4AA]" />
              <span className="text-white/90 text-sm font-semibold tracking-wide">{PROGRAMS.length} AWS certification programs · one subscription</span>
            </div>

            <h1 className="text-[clamp(2.25rem,5.5vw,4rem)] font-extrabold text-white leading-[1.08] mb-6 tracking-[-0.03em]">
              Learn the cloud the right way.<br />
              <span className="gradient-text">Earn the certificate to prove it.</span>
            </h1>

            <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-white/85 leading-[1.7] mb-10 max-w-[44rem] mx-auto">
              CloudExamLab teaches AWS the way it actually sticks — structured sessions that build real understanding, active-recall practice, and our Teach to Learn method. Become genuinely skilled first; pass the exam as a natural result.
            </p>

            <div className="hero-buttons" style={{ marginBottom: '1.25rem', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={openSignup} className="btn-primary inline-flex items-center justify-center gap-2" style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}>
                Start Free <ArrowRight size={18} />
              </button>
              <button onClick={() => scrollTo('programs')} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                Browse Programs
              </button>
            </div>

            <div className="flex gap-x-6 gap-y-2 flex-wrap justify-center text-white/65 text-sm">
              {['10 free questions, no card required', 'Skills first, certificate second', 'All certs · from $8.25/month'].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5">
                  <Check size={15} className="text-[#00D4AA]" strokeWidth={3} /> {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-[#0A2540] border-y border-white/[0.06] py-4 overflow-hidden">
        <div className="marquee-mask">
          <div className="marquee-track gap-10 pr-10">
            {[...Array(2)].flatMap((_, r) => [
              'Structured study sessions', 'Teach to Learn method', 'Timed practice exams',
              'Blueprint-mapped domains', 'Official AWS doc links', 'Progress tracking', 'Works offline',
            ].map((t, i) => (
              <span key={`${r}-${i}`} className="inline-flex items-center gap-2 text-white/55 text-sm font-medium whitespace-nowrap shrink-0">
                <BadgeCheck size={16} className="text-[#00D4AA]" /> {t}
              </span>
            )))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">PROGRAMS</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              {PROGRAMS.length} complete AWS programs
            </h2>
            <p className="text-gray-500 text-base max-w-[42rem] mx-auto">
              From your first day in the cloud to designing production systems. Each program is a full curriculum — pick where you are and go deep. One subscription unlocks them all.
            </p>
          </Reveal>

          {LEVEL_ORDER.map((level) => {
            const items = PROGRAMS.filter(p => p.level === level)
            if (!items.length) return null
            return (
              <div key={level} className="mb-10 last:mb-0">
                <Reveal className="flex items-center gap-3 mb-5">
                  <span className="text-[0.8125rem] font-bold text-[#0A2540] uppercase tracking-[0.08em]">{level}</span>
                  <span className="flex-1 h-px bg-gray-200" />
                </Reveal>
                <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
                  {items.map((p, i) => <ProgramCard key={p.code} program={p} delay={i * 80} />)}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* WHY US — learning features */}
      <section id="why" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">WHY CLOUDEXAMLAB</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              The best way to actually learn this
            </h2>
            <p className="text-gray-500 text-base max-w-[42rem] mx-auto">
              Most exam prep teaches you to memorize. We teach you to understand — using the learning science that makes knowledge last well beyond exam day.
            </p>
          </Reveal>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' }}>
            {LEARNING_FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 70} className="bg-white rounded-[1.25rem] p-7 border border-gray-200 hover:border-[#00D4AA] hover:shadow-[0_8px_28px_rgba(0,212,170,0.12)] transition-all duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mb-4">
                  <f.Icon size={22} className="text-[#00A884]" strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-[#0A2540] text-[1.0625rem] mb-2">{f.title}</h3>
                <p className="text-gray-600 text-[0.9rem] leading-[1.65]">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TWO PROMISES — skills-first + exam-ready */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">OUR PROMISE</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight">
              Worth it with or without the exam
            </h2>
          </Reveal>

          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' }}>
            <Reveal className="rounded-[1.25rem] p-8 border border-gray-200 bg-slate-50">
              <div className="w-12 h-12 rounded-xl bg-[#6366F1]/10 flex items-center justify-center mb-4">
                <GraduationCap size={24} className="text-[#6366F1]" strokeWidth={2.2} />
              </div>
              <h3 className="font-bold text-[#0A2540] text-[1.25rem] mb-3">If you never sit the exam</h3>
              <p className="text-gray-600 text-[0.95rem] leading-[1.7] mb-4">
                You still come out genuinely skilled. Our curriculum is built to teach the subject for real — the concepts, the trade-offs, the way professionals actually think. That understanding shows up in your work immediately, no certificate required.
              </p>
              <p className="text-gray-600 text-[0.95rem] leading-[1.7]">
                And with Teach to Learn, you build a portfolio of yourself explaining each concept — concrete proof of skill you can show an employer, exam or not.
              </p>
            </Reveal>

            <Reveal delay={100} className="rounded-[1.25rem] p-8 border-2 border-[#00D4AA] bg-[#00D4AA]/[0.04]">
              <div className="w-12 h-12 rounded-xl bg-[#00D4AA]/15 flex items-center justify-center mb-4">
                <BadgeCheck size={24} className="text-[#00A884]" strokeWidth={2.2} />
              </div>
              <h3 className="font-bold text-[#0A2540] text-[1.25rem] mb-3">If you do take the exam</h3>
              <p className="text-gray-600 text-[0.95rem] leading-[1.7] mb-4">
                This is the best place to prepare. Every session maps to the official exam blueprint, every practice question mirrors the real format, and every answer comes with a full explanation and a link to the official AWS docs.
              </p>
              <p className="text-gray-600 text-[0.95rem] leading-[1.7]">
                Because you learned the material properly instead of memorizing it, you walk in confident — and passing is the natural result, not a gamble.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-80 h-80 bg-[#00D4AA]/[0.08] top-0 left-1/4" />
        <div className="max-w-[72rem] mx-auto relative z-10">
          <Reveal className="text-center mb-14">
            <p className="text-[0.8125rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em] mb-3">HOW IT WORKS</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white tracking-tight">
              Learn it. Teach it. Pass it.
            </h2>
          </Reveal>

          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' }}>
            {HOW_IT_WORKS.map((item, index) => (
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
            <p className="text-white/45 text-sm mt-3">No credit card required · 10 free questions in every program</p>
          </div>
        </div>
      </section>

      {/* TEACH TO LEARN spotlight */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <div className="grid gap-12 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' }}>
            <Reveal>
              <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">TEACH TO LEARN</p>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-5">
                Build proof you can actually do this
              </h2>
              <p className="text-gray-600 text-[1rem] leading-[1.75] mb-5">
                A certificate says you passed a test. Being able to clearly explain a concept proves you understand it — and that is what Teach to Learn is built around.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { Icon: Lightbulb, t: 'Explain it first', d: 'Put the concept in your own words before you move on — the moment understanding becomes real.' },
                  { Icon: Users, t: 'See how others explain it', d: 'Watch peer and curated explanations to fill the gaps and sharpen your own mental model.' },
                  { Icon: FileCheck, t: 'Record and keep the proof', d: 'Teach it back from auto-generated slides and save it — a growing portfolio of demonstrated skill to share with employers.' },
                ].map((s, i) => (
                  <div key={i} className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center shrink-0">
                      <s.Icon size={20} className="text-[#00A884]" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A2540] text-[1rem] mb-0.5">{s.t}</h3>
                      <p className="text-gray-600 text-[0.9rem] leading-[1.6]">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-2xl p-8 border border-gray-200 bg-slate-50" style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-5">
                <Mic size={18} className="text-[#00A884]" />
                <span className="text-[0.75rem] font-bold text-[#0A2540] uppercase tracking-[0.06em]">The science is settled</span>
              </div>
              <blockquote className="text-[#0A2540] text-[1.125rem] leading-[1.6] font-semibold mb-4">
                “Those who teach learn best. Explaining an idea to someone else forces you to organize and clarify it in your own mind.”
              </blockquote>
              <p className="text-gray-500 text-[0.875rem] leading-[1.6]">
                Decades of research on the protégé effect show that preparing to teach — and teaching — produces deeper, longer-lasting understanding than studying alone. We built it into every session.
              </p>
            </Reveal>
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
              One subscription. Every program.
            </h2>
            <p className="text-white/80 text-base">
              All {PROGRAMS.length} certifications · every new cert we add · study at your own pace · cancel anytime
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
                {['10 sample questions per program', 'Full explanations', 'No credit card required'].map((item, i) => (
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
                {[`All ${PROGRAMS.length} programs`, 'Every study session & practice exam', 'Teach to Learn', 'Cancel anytime'].map((item, i) => (
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
                {['Everything in Monthly', 'All new certs included', 'Best value', 'Cancel anytime'].map((item, i) => (
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
              A single AWS exam costs $100–$150 — your prep across every program is a fraction of one attempt.
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
              Questions, answered
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

          <Reveal className="mt-10 text-center">
            <p className="text-gray-500 text-[0.9375rem] mb-4">Still have a question? We&apos;re happy to help.</p>
            <a
              href="mailto:cloudexamlab@gmail.com"
              className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#0d2d4a] text-white font-semibold px-6 py-3 rounded-xl no-underline transition-colors duration-200"
            >
              <Mail size={17} strokeWidth={2.2} />
              Email us
            </a>
          </Reveal>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0A2540] via-[#0d2d4a] to-[#1A3B5C] text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-[600px] h-[300px] bg-[#00D4AA]/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-[52rem] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#00D4AA]/15 border border-[#00D4AA]/30 text-[#00D4AA] px-4 py-1.5 rounded-full text-[0.8125rem] font-bold mb-6 uppercase tracking-[0.06em]">
            <BadgeCheck size={14} /> {PROGRAMS.length} programs · one subscription
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-5 leading-[1.15] tracking-tighter">
            Become genuinely good at AWS.<br />
            <span className="gradient-text">The certificate follows.</span>
          </h2>
          <p className="text-[clamp(1rem,2.5vw,1.1875rem)] text-white/75 mb-10 leading-[1.65]">
            Start with 10 free questions in any program — no credit card, no commitment. See how it feels to actually understand the material.
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
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                Learn AWS the way it sticks — structured study sessions, the Teach to Learn method, and exam-realistic practice across every program.
              </p>
              <SocialLinks />
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Programs</h3>
              <ul className="list-none p-0 m-0">
                {PROGRAMS.map((p) => (
                  <li key={p.code} className="mb-2">
                    <Link to={`/${p.code}`} className="text-white/60 text-sm no-underline hover:text-white transition-colors flex items-center gap-1.5">
                      <p.Icon size={13} className="shrink-0" style={{ color: p.color }} /> {p.shortName} ({p.code})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">How You Learn</h3>
              <ul className="list-none p-0 m-0">
                {['Structured study sessions', 'Teach to Learn method', 'Timed practice exams', 'Official AWS doc links'].map((item, i) => (
                  <li key={i} className="text-white/45 text-sm mb-1.5 flex items-center gap-1.5">
                    <Check size={12} className="text-[#00D4AA] shrink-0" strokeWidth={3} /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-3.5 text-sm">Support & Legal</h3>
              <ul className="list-none p-0 m-0">
                {[
                  { label: 'Articles & Guides', href: '/blog' },
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
              <strong>Disclaimer:</strong> Independent study materials and practice questions. Not affiliated with or endorsed by Amazon Web Services (AWS).
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
