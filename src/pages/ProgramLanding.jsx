import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import {
  ArrowRight, Check, Cloud, Lock, Zap, RefreshCw,
  BookOpen, Target, Clock, Award, BadgeCheck, GraduationCap,
  Mic, Lightbulb, Users, FileCheck, Briefcase,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'
import { Button } from '../design-system'
import { PROGRAMS, getProgram } from '../data/programs'

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

function ProgramLanding() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const program = getProgram(code)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signup')
  const [scrolled, setScrolled] = useState(false)

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }

  useEffect(() => {
    if (program) document.title = `${program.name} (${program.code}) — CloudExamLab`
    return () => { document.title = 'CloudExamLab' }
  }, [program])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Logged-in users belong in the app, not on marketing pages.
  const hasAuthTokens = window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token')
  if (user && !hasAuthTokens) {
    return <Navigate to="/dashboard" replace />
  }

  // Unknown code → home.
  if (!program) {
    return <Navigate to="/" replace />
  }

  const { Icon, color } = program
  const tint = (a) => `${color}${a}`
  const others = PROGRAMS.filter(p => p.code !== program.code)

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header
        className="header-button"
        style={scrolled ? { boxShadow: '0 8px 30px rgba(0,0,0,0.25)' } : undefined}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center shadow-[0_2px_8px_rgba(0,212,170,0.4)]">
            <Cloud size={18} className="text-white" strokeWidth={2.4} />
          </span>
          <span className="text-white font-bold text-[0.9375rem] tracking-tight hidden sm:inline">CloudExamLab</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">All Programs</Link>
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
              <Link to="/" className="inline-flex items-center gap-1.5 text-white/50 text-sm font-medium mb-5 no-underline hover:text-white/80 transition-colors">
                <ArrowRight size={14} className="rotate-180" /> All programs
              </Link>

              <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm">
                <BadgeCheck size={15} style={{ color }} />
                <span className="text-white/90 text-sm font-semibold tracking-wide">AWS {program.level} · {program.code}</span>
              </div>

              <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold text-white leading-[1.1] mb-6 tracking-[-0.03em]">
                {program.heroLead}<br />
                <span className="gradient-text">{program.heroAccent}</span>
              </h1>

              <p className="text-[clamp(1rem,2.5vw,1.175rem)] text-white/85 leading-[1.7] mb-10 max-w-[38rem]">
                {program.blurb}
              </p>

              <div className="hero-buttons" style={{ marginBottom: '1rem', flexDirection: 'row', flexWrap: 'wrap' }}>
                <button onClick={openSignup} className="btn-primary inline-flex items-center justify-center gap-2" style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}>
                  Start Free <ArrowRight size={18} />
                </button>
                <button onClick={() => document.getElementById('learn')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                  What You'll Learn
                </button>
              </div>

              <div className="flex gap-x-6 gap-y-2 flex-wrap text-white/65 text-sm">
                {[`${program.sessions} study sessions`, `${program.domains.length} exam domains`, 'Skills first, certificate second'].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5">
                    <Check size={15} style={{ color }} strokeWidth={3} /> {t}
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
                <div className="px-6 py-5 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tint('26'), border: `1px solid ${tint('40')}` }}>
                      <Icon size={20} style={{ color }} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em]" style={{ color }}>AWS Certified</div>
                      <div className="text-white font-bold text-base leading-tight">{program.shortName}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 divide-x divide-y divide-white/[0.07]">
                  {[
                    { label: 'Questions', value: program.facts.questions, sub: 'On the real exam' },
                    { label: 'Time limit', value: program.facts.time, sub: 'Timed exam' },
                    { label: 'Passing score', value: program.facts.passing, sub: 'To pass' },
                    { label: 'Exam cost', value: program.facts.cost, sub: 'USD (AWS)' },
                  ].map((f, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="text-[0.7rem] text-white/45 font-semibold uppercase tracking-[0.05em] mb-0.5">{f.label}</div>
                      <div className="text-white font-extrabold text-lg leading-tight">{f.value}</div>
                      <div className="text-white/45 text-[0.7rem] mt-0.5">{f.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5">
                  <div className="text-[0.7rem] font-bold text-white/45 uppercase tracking-[0.06em] mb-3">{program.domains.length} Exam Domains</div>
                  <div className="flex flex-col gap-2">
                    {program.domains.map((d, i) => (
                      <div key={i} className="flex items-center justify-between gap-3">
                        <span className="text-white/75 text-[0.8125rem]">{d.label}</span>
                        <span className="text-[0.75rem] font-bold tabular-nums shrink-0" style={{ color }}>{d.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

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

      {/* Quick stats strip */}
      <section className="bg-[#0A2540] border-y border-white/[0.06] py-5 px-6">
        <div className="max-w-[72rem] mx-auto grid gap-4 text-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))' }}>
          {[
            { Icon: BookOpen, value: program.sessions, label: 'Study sessions' },
            { Icon: Target, value: program.domains.length, label: 'Exam domains' },
            { Icon: Clock, value: program.facts.time, label: 'Exam duration' },
            { Icon: Award, value: program.facts.passing, label: 'Passing score' },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-center gap-2.5">
              <s.Icon size={20} style={{ color }} strokeWidth={2.2} />
              <div className="text-left">
                <div className="text-white font-extrabold text-base leading-none">{s.value}</div>
                <div className="text-white/45 text-xs mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY THIS TOPIC MATTERS */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[52rem] mx-auto text-center">
          <Reveal>
            <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] mb-3" style={{ color }}>WHY IT MATTERS</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-6">
              Why {program.shortName} is worth your time
            </h2>
            <p className="text-gray-600 text-[1.0625rem] leading-[1.8]">
              {program.whyTopic}
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHAT YOU'LL LEARN */}
      <section id="learn" className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-12">
            <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] mb-3" style={{ color }}>WHAT YOU'LL LEARN</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
              Everything you'll walk away knowing
            </h2>
            <p className="text-gray-500 text-base max-w-[40rem] mx-auto">
              {program.sessions} structured sessions, mapped to the official {program.code} blueprint — building real understanding, not memorization.
            </p>
          </Reveal>

          <div className="grid gap-4 max-w-[60rem] mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))' }}>
            {program.learnOutcomes.map((o, i) => (
              <Reveal key={i} delay={i * 60} className="bg-white rounded-[1rem] p-5 border border-gray-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: tint('14') }}>
                  <Check size={17} style={{ color }} strokeWidth={3} />
                </div>
                <p className="text-gray-700 text-[0.95rem] leading-[1.6]">{o}</p>
              </Reveal>
            ))}
          </div>

          {/* Domains */}
          <Reveal className="mt-12 max-w-[60rem] mx-auto">
            <div className="text-center text-[0.8125rem] font-bold text-gray-400 uppercase tracking-[0.08em] mb-5">Mapped to every exam domain</div>
            <div className="flex flex-col gap-3">
              {program.domains.map((d, i) => (
                <div key={i} className="bg-white rounded-[0.875rem] p-4 border border-gray-200 flex items-center justify-between gap-4" style={{ borderLeft: `4px solid ${color}` }}>
                  <span className="font-semibold text-[#0A2540] text-[0.95rem]">{d.label}</span>
                  <span className="text-[0.8rem] font-bold tabular-nums shrink-0 px-2.5 py-1 rounded-full" style={{ background: tint('14'), color }}>{d.weight} of exam</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT BENEFITS YOU */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[72rem] mx-auto">
          <div className="grid gap-12 items-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))' }}>
            <Reveal>
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] mb-3" style={{ color }}>HOW IT BENEFITS YOU</p>
              <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-5">
                What this does for your career
              </h2>
              <p className="text-gray-600 text-[1.0625rem] leading-[1.8] mb-6">
                {program.careerBenefit}
              </p>
              <div className="flex items-center gap-2 text-[0.8125rem] font-bold text-gray-400 uppercase tracking-[0.06em]">
                <Briefcase size={15} /> Built for
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {program.roles.map((r, i) => (
                  <span key={i} className="px-3.5 py-2 rounded-full text-[0.85rem] font-medium border" style={{ background: tint('0D'), color: '#0A2540', borderColor: tint('33') }}>
                    {r}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={120} className="rounded-2xl p-8 border-2" style={{ borderColor: tint('33'), background: tint('08') }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: tint('1A') }}>
                <GraduationCap size={24} style={{ color }} strokeWidth={2.2} />
              </div>
              <h3 className="font-bold text-[#0A2540] text-[1.25rem] mb-3">Even if you never take the exam</h3>
              <p className="text-gray-600 text-[0.95rem] leading-[1.75] mb-5">
                {program.evergreenValue}
              </p>
              <div className="h-px bg-gray-200 my-5" />
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck size={18} style={{ color }} />
                <h3 className="font-bold text-[#0A2540] text-[1.0625rem]">And if you do take it</h3>
              </div>
              <p className="text-gray-600 text-[0.95rem] leading-[1.75]">
                This is the best place to prepare for {program.code}. Sessions map to the official blueprint, practice exams mirror the real format, and every answer comes with a full explanation and an official AWS doc link — so you pass because you understood it, not because you memorized it.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* TEACH TO LEARN */}
      <section className="py-20 px-6 bg-[#0A2540] relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-80 h-80 top-0 right-1/4" style={{ background: tint('14') }} />
        <div className="max-w-[60rem] mx-auto relative z-10 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.06]">
              <Mic size={15} style={{ color }} />
              <span className="text-white/90 text-sm font-semibold tracking-wide">Teach to Learn</span>
            </div>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-white tracking-tight mb-4">
              Build proof you can actually do this
            </h2>
            <p className="text-white/70 text-base max-w-[42rem] mx-auto mb-12 leading-[1.7]">
              A certificate says you passed. Explaining a concept clearly proves you understand it. Every session ends with our Teach to Learn flow — so you not only remember {program.shortName} concepts, you build a portfolio that demonstrates them.
            </p>
          </Reveal>

          <div className="grid gap-5 text-left" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
            {[
              { Icon: Lightbulb, t: 'Explain it first', d: 'Put each concept in your own words before moving on — the moment understanding becomes real.' },
              { Icon: Users, t: 'See how others explain it', d: 'Watch peer and curated explanations to sharpen your own mental model.' },
              { Icon: FileCheck, t: 'Record the proof', d: 'Teach it back and save it — a growing portfolio of demonstrated skill to share with employers.' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100} className="bg-white/[0.05] border border-white/[0.1] rounded-[1.25rem] p-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: tint('1F') }}>
                  <s.Icon size={22} style={{ color }} strokeWidth={2.2} />
                </div>
                <h3 className="font-bold text-white text-[1.0625rem] mb-2">{s.t}</h3>
                <p className="text-white/60 text-[0.9rem] leading-[1.6]">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CTA band */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-[52rem] mx-auto text-center">
          <Reveal>
            <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] mb-3" style={{ color }}>SIMPLE PRICING</p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[#0A2540] tracking-tight mb-4">
              Start free. Unlock everything for $8.25/month.
            </h2>
            <p className="text-gray-500 text-base max-w-[40rem] mx-auto mb-8">
              Your {program.code} subscription includes all {PROGRAMS.length} programs and every new cert we add. Begin with 10 free questions — no card required. The {program.code} exam itself costs {program.facts.cost}; preparing properly is a fraction of that.
            </p>
            <Button
              variant="primary"
              onClick={openSignup}
              className="gap-2 !px-10 !py-4 !rounded-[0.875rem] !text-[1.0625rem] shadow-teal hover:shadow-teal-lg hover:-translate-y-1"
            >
              Start {program.code} Free <ArrowRight size={18} />
            </Button>
            <div className="flex gap-6 justify-center flex-wrap text-gray-400 text-sm mt-6">
              <span className="inline-flex items-center gap-1.5"><Lock size={15} style={{ color }} /> Secure payment</span>
              <span className="inline-flex items-center gap-1.5"><Zap size={15} style={{ color }} /> Instant access</span>
              <span className="inline-flex items-center gap-1.5"><RefreshCw size={15} style={{ color }} /> Cancel anytime</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* OTHER PROGRAMS */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-[72rem] mx-auto">
          <Reveal className="text-center mb-10">
            <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">KEEP GOING</p>
            <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight">
              Explore the other programs
            </h2>
          </Reveal>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
            {others.map((p, i) => (
              <Reveal key={p.code} delay={i * 70}>
                <Link
                  to={`/${p.code}`}
                  className="block group bg-white rounded-[1.25rem] p-6 border border-gray-200 hover:border-[#00D4AA] hover:shadow-[0_12px_32px_rgba(0,212,170,0.14)] transition-all duration-200 no-underline h-full"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.color}14` }}>
                      <p.Icon size={22} style={{ color: p.color }} strokeWidth={2.2} />
                    </div>
                    <div>
                      <div className="text-[0.7rem] font-bold uppercase tracking-[0.06em]" style={{ color: p.color }}>{p.level} · {p.code}</div>
                      <div className="font-bold text-[#0A2540] text-[1rem] leading-tight">{p.shortName}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-[0.875rem] leading-[1.55] mb-3">{p.tagline}</p>
                  <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[#00A884] group-hover:gap-2.5 transition-all">
                    Explore <ArrowRight size={15} />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#0A2540] via-[#0d2d4a] to-[#1A3B5C] text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="aurora-blob w-[600px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: tint('14') }} />
        <div className="max-w-[52rem] mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[0.8125rem] font-bold mb-6 uppercase tracking-[0.06em]" style={{ background: tint('26'), border: `1px solid ${tint('4D')}`, color }}>
            <BadgeCheck size={14} /> AWS {program.level} · {program.code}
          </div>
          <h2 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-white mb-5 leading-[1.15] tracking-tighter">
            Master {program.shortName}.<br />
            <span className="gradient-text">Prove it. Pass it.</span>
          </h2>
          <p className="text-[clamp(1rem,2.5vw,1.1875rem)] text-white/75 mb-10 leading-[1.65]">
            Start with 10 free questions — no credit card, no commitment. See how it feels to actually understand {program.code}.
          </p>
          <Button
            variant="primary"
            onClick={openSignup}
            className="gap-2 !px-12 !py-5 !rounded-[0.875rem] !text-[1.1875rem] shadow-[0_8px_28px_rgba(0,212,170,0.4)] hover:shadow-[0_14px_36px_rgba(0,212,170,0.5)] hover:-translate-y-1 mb-4"
          >
            Start Free <ArrowRight size={20} />
          </Button>
          <div className="mb-2">
            <Link to="/" className="bg-transparent border-none text-white/45 text-sm cursor-pointer underline p-0 no-underline hover:text-white/70">
              See all {PROGRAMS.length} programs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] pt-12 pb-6 px-6 border-t border-white/[0.06]">
        <div className="max-w-[72rem] mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center">
                <Cloud size={18} className="text-white" strokeWidth={2.4} />
              </span>
              <h3 className="text-white font-bold text-base m-0">Cloud Exam Lab</h3>
            </Link>
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              {PROGRAMS.map((p) => (
                <Link key={p.code} to={`/${p.code}`} className="text-white/55 text-sm no-underline hover:text-white transition-colors">
                  {p.code}
                </Link>
              ))}
            </nav>
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

export default ProgramLanding
