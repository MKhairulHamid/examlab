import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'

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
  { key: 'architect', emoji: '🌩️', name: 'Cloud Architect',   salary: '$153K–$165K', color: '#0EA5E9', roles: '2,000+ roles' },
  { key: 'devops',    emoji: '🛠️', name: 'DevOps Engineer',   salary: '$131K–$151K', color: '#10B981', roles: '1,000+ roles' },
  { key: 'data',      emoji: '📊', name: 'Data Engineer',     salary: '$137K–$165K', color: '#F59E0B', roles: '2,000+ roles' },
  { key: 'aiml',      emoji: '🤖', name: 'AI / ML Engineer',  salary: '$154K–$188K', color: '#8B5CF6', roles: '33,000+ roles' },
  { key: 'security',  emoji: '🔒', name: 'Security Specialist',salary: '$132K–$202K', color: '#EF4444', roles: '+73% YoY demand' },
  { key: 'network',   emoji: '🌐', name: 'Network Specialist', salary: '$127K–$153K', color: '#06B6D4', roles: '1,000+ roles' },
]

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal]     = useState(false)
  const [authModalMode, setAuthModalMode]     = useState('signup')
  const [expandedProvider, setExpandedProvider] = useState('aws')
  const [expandedFAQ, setExpandedFAQ]         = useState(null)
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState(null)
  const [showDemoMaterials, setShowDemoMaterials]   = useState(false)
  const [showDemoResults, setShowDemoResults]       = useState(false)

  const openSignup = () => { setAuthModalMode('signup'); setShowAuthModal(true) }
  const openLogin  = () => { setAuthModalMode('login');  setShowAuthModal(true) }

  useEffect(() => {
    const hasAuthTokens = window.location.hash.includes('access_token') ||
      window.location.hash.includes('refresh_token')
    if (user && !hasAuthTokens) {
      navigate('/dashboard')
    }
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

        <div style={{ maxWidth: '72rem', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
          <div style={{
            display: 'grid',
            gap: '3rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            alignItems: 'center'
          }}>

            {/* Left — copy */}
            <div>
              <div className="hero-badge" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
                🗺️ All 13 AWS Certifications — 6 Career Paths
              </div>

              <h1 style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
                fontWeight: '800',
                color: 'white',
                lineHeight: '1.1',
                marginBottom: '1.5rem',
                letterSpacing: '-0.03em'
              }}>
                Your AWS Certification<br />
                <span style={{ color: '#00D4AA' }}>Path Starts Here.</span>
              </h1>

              <p style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: '1.7',
                marginBottom: '2.5rem',
                maxWidth: '38rem'
              }}>
                Sign up free, then map your existing career to a personalized certification roadmap — with your timeline, target salary, and exam-realistic practice to get you there.
              </p>

              <div className="hero-buttons" style={{ marginBottom: '2rem' }}>
                <button
                  onClick={openSignup}
                  className="btn-primary"
                  style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}
                >
                  Start Free →
                </button>
                <button onClick={() => scrollToSection('demo')} className="btn-secondary" style={{ fontSize: '0.9375rem', padding: '1rem 1.5rem' }}>
                  See It in Action
                </button>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem' }}>
                <span>✓ Personalized roadmap</span>
                <span>✓ Salary & timeline data</span>
                <span>✓ From $8.25/month</span>
              </div>
            </div>

            {/* Right — product preview mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{
                background: 'white',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
                width: '100%',
                maxWidth: '480px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {/* Browser chrome */}
                <div style={{ background: '#1e293b', padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#22c55e' }} />
                  <div style={{ marginLeft: '0.625rem', background: '#334155', borderRadius: '0.3rem', padding: '0.2rem 0.75rem', flex: 1, fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>
                    cloudexamlab.com/exam
                  </div>
                </div>

                {/* App header bar */}
                <div style={{
                  background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '0.8125rem' }}>AWS Developer Associate — Set 1</span>
                  <span style={{
                    background: 'rgba(0,212,170,0.2)',
                    color: '#00D4AA',
                    padding: '0.2rem 0.625rem',
                    borderRadius: '1rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    border: '1px solid rgba(0,212,170,0.35)'
                  }}>⏱ 01:23:47</span>
                </div>

                {/* Progress bar */}
                <div style={{ height: '3px', background: '#e5e7eb' }}>
                  <div style={{ height: '100%', width: '32%', background: 'linear-gradient(90deg, #00D4AA, #00A884)' }} />
                </div>

                {/* Question content */}
                <div style={{ padding: '1.25rem', background: 'white' }}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{
                      background: '#0A2540',
                      color: 'white',
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      padding: '0.2rem 0.625rem',
                      borderRadius: '1rem'
                    }}>Question 21 of 65</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#0A2540', lineHeight: '1.55', marginBottom: '1rem' }}>
                    A developer needs sensitive configuration data encrypted at rest with automatic rotation. Which AWS service best meets this requirement?
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { label: 'AWS Systems Manager Parameter Store', selected: false },
                      { label: 'AWS Secrets Manager', selected: true },
                      { label: 'Amazon S3 with SSE-S3 encryption', selected: false },
                      { label: 'AWS KMS with key policies', selected: false },
                    ].map((opt, i) => (
                      <div key={i} style={{
                        padding: '0.625rem 0.875rem',
                        borderRadius: '0.5rem',
                        border: `2px solid ${opt.selected ? '#00D4AA' : '#e5e7eb'}`,
                        background: opt.selected ? 'rgba(0,212,170,0.07)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem'
                      }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${opt.selected ? '#00D4AA' : '#d1d5db'}`,
                          background: opt.selected ? '#00D4AA' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {opt.selected && <span style={{ color: 'white', fontSize: '0.5625rem', fontWeight: '800' }}>✓</span>}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: opt.selected ? '#0A2540' : '#4b5563', fontWeight: opt.selected ? '600' : '400' }}>
                          {opt.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', gap: '0.5rem' }}>
                    <button style={{ padding: '0.5rem 1rem', background: '#f1f5f9', border: 'none', borderRadius: '0.375rem', fontSize: '0.78rem', color: '#64748b', fontWeight: '600', cursor: 'default' }}>← Previous</button>
                    <button style={{ padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #00D4AA, #00A884)', border: 'none', borderRadius: '0.375rem', fontSize: '0.78rem', color: 'white', fontWeight: '600', cursor: 'default' }}>Next →</button>
                  </div>
                </div>

                {/* Bottom status bar */}
                <div style={{
                  padding: '0.625rem 1.25rem',
                  background: '#f9fafb',
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: '#6b7280'
                }}>
                  <span>✓ 20 answered</span>
                  <span style={{ color: '#00A884', fontWeight: '700' }}>82% on track to pass</span>
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
      <section style={{ padding: '4rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              6 CERTIFICATION PATHS
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', fontWeight: '800', color: '#0A2540', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Pick your direction. We'll show you how to get there.
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '36rem', margin: '0 auto' }}>
              Every path comes with a personalized timeline, salary benchmarks, and practice questions mapped to each cert.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '0.875rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', marginBottom: '2.5rem' }}>
            {PATH_PREVIEWS.map(p => (
              <button
                key={p.key}
                onClick={openSignup}
                style={{
                  background: 'white', borderRadius: '1rem', padding: '1.375rem',
                  border: '1px solid #e5e7eb', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = p.color; e.currentTarget.style.boxShadow = `0 8px 24px ${p.color}22` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none' }}
              >
                {/* Color accent top bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: p.color, opacity: 0.7 }} />
                <div style={{ fontSize: '1.75rem', marginBottom: '0.625rem' }}>{p.emoji}</div>
                <div style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{p.name}</div>
                <div style={{ fontWeight: '800', color: p.color, fontSize: '1rem', marginBottom: '0.25rem' }}>{p.salary}<span style={{ fontWeight: '500', color: '#9ca3af', fontSize: '0.75rem' }}>/yr</span></div>
                <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{p.roles}</div>
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={openSignup}
              style={{
                padding: '1rem 2.5rem',
                background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                color: 'white', border: 'none', borderRadius: '0.875rem',
                fontWeight: '700', fontSize: '1.0625rem', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,212,170,0.35)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,212,170,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,170,0.35)' }}
            >
              Start Free — Map My Journey →
            </button>
            <p style={{ color: '#9ca3af', fontSize: '0.8125rem', marginTop: '0.75rem' }}>
              Free to start • Build your roadmap right after signup
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 2 — AGITATION & PARADIGM SHIFT
      ═══════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              THE PROBLEM WITH EXAM PREP
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#0A2540', lineHeight: '1.2', letterSpacing: '-0.02em' }}>
              Most exam prep is broken.<br />We fixed it.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            maxWidth: '860px',
            margin: '0 auto'
          }}>
            {/* Before card */}
            <div style={{
              background: 'white',
              borderRadius: '1.25rem',
              padding: '2rem',
              border: '2px solid #fecaca',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>❌</div>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The Old Way</div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0A2540' }}>Expensive & Unfocused</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  '$500+ video courses you\'ll never finish',
                  'Reading 1,000 pages of documentation',
                  'Generic quizzes not tied to the exam blueprint',
                  'No progress tracking or weak-area analysis',
                  'Blindsided by the real exam on test day',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', color: '#6b7280', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <span style={{ color: '#f87171', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* After card */}
            <div style={{
              background: 'white',
              borderRadius: '1.25rem',
              padding: '2rem',
              border: '2px solid #00D4AA',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #00D4AA, #00A884)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0,212,170,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', flexShrink: 0 }}>✅</div>
                <div>
                  <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#00A884', textTransform: 'uppercase', letterSpacing: '0.05em' }}>The CloudExamLab Way</div>
                  <div style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0A2540' }}>Targeted & Proven</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {[
                  'Exam-realistic practice from $8.25/month',
                  'Just-in-time study materials per question',
                  '195 questions mapped to the official blueprint',
                  'Progress tracking & per-domain analytics',
                  'Walk in knowing exactly what to expect',
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', color: '#374151', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                    <span style={{ color: '#00D4AA', fontWeight: '700', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
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
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              THE PLATFORM
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: '#0A2540', letterSpacing: '-0.02em' }}>
              Everything you need. Nothing you don't.
            </h2>
          </div>

          {/* Row 1: Full-width tech card */}
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            marginBottom: '1rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '220px', height: '220px', background: 'rgba(0,212,170,0.08)', borderRadius: '50%', filter: 'blur(50px)' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '40%', width: '160px', height: '160px', background: 'rgba(59,130,246,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: '1', minWidth: '220px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>🎯</div>
                <h3 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.625rem)', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>
                  Exam-Realistic Technology
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.78)', lineHeight: '1.65', fontSize: '0.9375rem', maxWidth: '440px' }}>
                  Every question maps to the official DVA-C02 blueprint. Same format, same difficulty, same scenario style as the real exam — built to close the gap between practice and passing.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', minWidth: '200px' }}>
                {[
                  '65 questions per timed set',
                  'Blueprint-mapped domains',
                  'Scenario-based question style',
                  'Official AWS doc links included',
                  'Detailed answer explanations',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
                    <span style={{ color: '#00D4AA', fontWeight: '700', fontSize: '0.75rem' }}>→</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Two medium cards */}
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', marginBottom: '1rem' }}>
            {/* Value card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0,212,170,0.06) 0%, rgba(0,168,132,0.1) 100%)',
              borderRadius: '1.25rem',
              padding: '2rem',
              border: '2px solid rgba(0,212,170,0.25)'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.875rem' }}>💰</div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>Unbeatable Value</h3>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '2.75rem', fontWeight: '800', color: '#00A884', letterSpacing: '-0.03em' }}>$8.25</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: '#6b7280' }}>/month</span>
              </div>
              <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.55', marginBottom: '1rem' }}>
                Annual plan. Less than a coffee for full exam readiness.
              </p>
              <div style={{ padding: '0.625rem 0.875rem', background: 'white', borderRadius: '0.625rem', fontSize: '0.8125rem', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                vs. $500+ boot camps &amp; courses
              </div>
            </div>

            {/* Flexibility card */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '1.25rem',
              padding: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.875rem' }}>📊</div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.75rem' }}>Study on Your Terms</h3>
              <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                Track progress across all 195 questions. Resume mid-set anytime. Study on any device at your own pace — timed or untimed.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Progress saving', 'Any device', 'Timed mode', 'Weak-area focus'].map((tag, i) => (
                  <span key={i} style={{
                    padding: '0.3rem 0.625rem',
                    background: 'white',
                    borderRadius: '1rem',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    color: '#374151',
                    border: '1px solid #e5e7eb'
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Full-width growing library card */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '1.25rem',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            border: '1px solid #bae6fd',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem'
          }}>
            <div style={{ flex: '1', minWidth: '220px' }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.875rem' }}>🚀</div>
              <h3 style={{ fontSize: '1.1875rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>Growing Certification Library</h3>
              <p style={{ color: '#0369a1', fontSize: '0.9rem', lineHeight: '1.55' }}>
                AWS DVA-C02 live now. Your subscription automatically includes all new certs as they launch — no extra cost.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {[
                { label: '✅ AWS DVA-C02', available: true },
                { label: '🚧 AWS SAA-C03', available: false },
                { label: '🚧 AZ-104', available: false },
                { label: '🚧 GCP ACE', available: false },
              ].map((cert, i) => (
                <div key={i} style={{
                  padding: '0.5rem 0.875rem',
                  background: cert.available ? 'rgba(0,212,170,0.12)' : 'white',
                  borderRadius: '0.625rem',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  color: cert.available ? '#00A884' : '#9ca3af',
                  border: `1px solid ${cert.available ? 'rgba(0,212,170,0.3)' : '#e5e7eb'}`
                }}>
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
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', background: '#0A2540' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              GET STARTED IN MINUTES
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>
              From zero to certified in 3 steps
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gap: '0',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          }}>
            {[
              {
                step: '01',
                icon: '✍️',
                title: 'Create Free Account',
                desc: 'Sign up in 30 seconds. No credit card required. Instantly unlock 10 free practice questions with full explanations.',
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Practice & Learn',
                desc: '195 exam-realistic questions across 3 full sets. Instant feedback, answer explanations, and official AWS doc links — right when you need them.',
              },
              {
                step: '03',
                icon: '🏆',
                title: 'Pass With Confidence',
                desc: 'Walk into exam day having seen every question type, every scenario format. No surprises. No retakes.',
              },
            ].map((item, index, arr) => (
              <div key={index} style={{
                padding: '2rem',
                borderLeft: index > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                position: 'relative'
              }}>
                <div style={{
                  fontSize: '4.5rem',
                  fontWeight: '900',
                  color: 'rgba(0,212,170,0.12)',
                  lineHeight: '1',
                  marginBottom: '0.875rem',
                  letterSpacing: '-0.05em',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.65', fontSize: '0.9375rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <button
              onClick={openSignup}
              style={{
                padding: '1.125rem 2.5rem',
                background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.875rem',
                fontWeight: '700',
                fontSize: '1.0625rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,212,170,0.35)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,212,170,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,212,170,0.35)' }}
            >
              Start Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── Interactive Demo ── */}
      <section id="demo" style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              INTERACTIVE DEMO
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '800', color: '#0A2540', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Experience the exam interface
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '38rem', margin: '0 auto' }}>
              This is the exact interface you'll use — try selecting an answer below.
            </p>
          </div>

          <div style={{
            maxWidth: '860px',
            margin: '0 auto 2.5rem',
            background: 'white',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
            border: '1px solid #e5e7eb'
          }}>
            {/* Demo header */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
              padding: '1.25rem 1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>AWS Developer Associate Practice</h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.375rem 0.875rem',
                borderRadius: '0.5rem'
              }}>
                ⏱️ Time Remaining: 01:30:00
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: '#e5e7eb' }}>
              <div style={{ height: '100%', width: '15%', background: 'linear-gradient(90deg, #00D4AA, #00A884)' }} />
            </div>

            {/* Question navigation */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
              padding: '0.875rem 1.25rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.625rem', color: 'white', fontSize: '0.8125rem' }}>
                <span>Questions: 1/65</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(34px, 1fr))', gap: '0.35rem' }}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={{
                    padding: '0.4rem',
                    background: i === 0 ? '#00D4AA' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '0.35rem',
                    textAlign: 'center',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    border: i === 0 ? '2px solid white' : 'none'
                  }}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '0.875rem 1.25rem', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowDemoMaterials(true)}
                style={{ padding: '0.625rem 1.25rem', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 2px 8px rgba(0,212,170,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,212,170,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,212,170,0.3)' }}
              >
                📚 Study Materials
              </button>
              <button
                onClick={() => setShowDemoResults(true)}
                style={{ padding: '0.625rem 1.25rem', background: 'white', color: '#0A2540', border: '2px solid #0A2540', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0A2540'; e.currentTarget.style.color = 'white' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#0A2540' }}
              >
                📊 View Results
              </button>
            </div>

            {/* Question */}
            <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem)', background: 'white' }}>
              <div style={{ background: '#f9fafb', padding: '1.25rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', marginBottom: '1.25rem' }}>
                <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', padding: '0.375rem 0.875rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.875rem' }}>
                  Question 1 • Multiple Choice (select one)
                </div>
                <p style={{ fontSize: '0.9375rem', color: '#0A2540', lineHeight: '1.6', margin: 0, fontWeight: '500' }}>
                  A developer is building a serverless application using AWS Lambda. The application needs to process images uploaded to an S3 bucket. Which AWS service should be used to trigger the Lambda function when a new image is uploaded?
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  'Amazon CloudWatch Events',
                  'Amazon S3 Event Notifications',
                  'Amazon SNS',
                  'AWS Step Functions'
                ].map((option, index) => (
                  <div
                    key={index}
                    onClick={() => setDemoSelectedAnswer(index)}
                    style={{
                      padding: '0.875rem 1.125rem',
                      background: demoSelectedAnswer === index ? 'rgba(0,212,170,0.08)' : 'white',
                      border: `2px solid ${demoSelectedAnswer === index ? '#00D4AA' : '#e5e7eb'}`,
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem'
                    }}
                    onMouseEnter={e => { if (demoSelectedAnswer !== index) { e.currentTarget.style.borderColor = '#00D4AA'; e.currentTarget.style.transform = 'translateX(4px)' } }}
                    onMouseLeave={e => { if (demoSelectedAnswer !== index) { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.transform = 'translateX(0)' } }}
                  >
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${demoSelectedAnswer === index ? '#00D4AA' : '#d1d5db'}`,
                      background: demoSelectedAnswer === index ? '#00D4AA' : 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s'
                    }}>
                      {demoSelectedAnswer === index && <span style={{ color: 'white', fontSize: '0.75rem' }}>✓</span>}
                    </div>
                    <span style={{ color: '#0A2540', fontSize: '0.9375rem', fontWeight: demoSelectedAnswer === index ? '600' : '400' }}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button style={{ padding: '0.75rem 1.25rem', background: '#e5e7eb', color: '#9ca3af', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'not-allowed', fontSize: '0.9375rem', opacity: 0.6 }} disabled>
                  ← Previous
                </button>
                <button style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 4px 12px rgba(0,212,170,0.3)' }}>
                  Next →
                </button>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={openSignup}
              style={{ padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,212,170,0.3)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,212,170,0.4)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,212,170,0.3)' }}
            >
              Start Free →
            </button>
            <button
              onClick={openSignup}
              style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              or start with 10 free questions
            </button>
          </div>
        </div>
      </section>

      {/* ── Certifications Catalog ── */}
      <section id="certifications" style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              AVAILABLE NOW + 20 MORE COMING SOON
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '800', color: '#0A2540', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Your certification journey starts here
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '40rem', margin: '0 auto' }}>
              Start with AWS Developer Associate today. More certifications launching soon across AWS, Azure, and GCP.
            </p>
          </div>

          {/* Provider tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {['aws', 'azure', 'gcp'].map(provider => (
              <button
                key={provider}
                onClick={() => setExpandedProvider(provider)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: expandedProvider === provider ? '#0A2540' : 'white',
                  color: expandedProvider === provider ? 'white' : '#0A2540',
                  border: '2px solid #0A2540',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  fontSize: '0.8125rem',
                  minWidth: '90px'
                }}
              >
                {provider === 'aws' && '🔶 AWS'}
                {provider === 'azure' && '☁️ Azure'}
                {provider === 'gcp' && '🔷 GCP'}
              </button>
            ))}
          </div>

          {/* Certification cards */}
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))' }}>
            {CERTIFICATIONS[expandedProvider].map((cert, index) => (
              <div
                key={index}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.08)',
                  border: cert.available ? '2px solid #00D4AA' : '1px solid #e5e7eb',
                  transition: 'all 0.25s',
                  position: 'relative',
                  opacity: cert.available ? 1 : 0.75
                }}
                onMouseEnter={e => { if (cert.available) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,212,170,0.25)' } }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = cert.available ? '0 4px 6px -1px rgba(0,212,170,0.15)' : '0 4px 6px -1px rgba(0,0,0,0.08)' }}
              >
                {cert.available && (
                  <div style={{ position: 'absolute', top: '-10px', right: '12px', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,212,170,0.3)' }}>
                    ✨ AVAILABLE NOW
                  </div>
                )}
                {!cert.available && (
                  <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#9ca3af', color: 'white', padding: '0.2rem 0.75rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: '700' }}>
                    🚧 COMING SOON
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.375rem' }}>{cert.code}</div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#0A2540' }}>{cert.name}</h3>
                </div>

                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                    <strong style={{ color: '#374151' }}>Actual exam:</strong> {cert.examQuestions} questions
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                    <strong style={{ color: '#374151' }}>Practice questions:</strong> {cert.practiceQuestions} (3 sets of {cert.perSet})
                  </div>
                </div>

                <button
                  onClick={() => cert.available ? setShowAuthModal(true) : null}
                  disabled={!cert.available}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: cert.available ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)' : '#f3f4f6',
                    color: cert.available ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: cert.available ? 'pointer' : 'not-allowed',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {cert.available ? 'Try 10 Free Questions' : 'Notify Me When Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '5rem 1.5rem', background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              SIMPLE PRICING
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '800', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
              Choose your study plan
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              Unlimited access • Study at your own pace • Cancel anytime
            </p>
          </div>

          <div style={{
            display: 'grid',
            gap: '1.25rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Free */}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'white', marginBottom: '0.375rem' }}>Free Sample</h3>
              <div style={{ fontSize: '2.75rem', fontWeight: '800', color: '#00D4AA', marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>$0</div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Try before you subscribe</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                {['10 sample questions', 'Full explanations', 'No credit card required'].map((item, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#00D4AA' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowAuthModal(true)} style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                Start Free
              </button>
            </div>

            {/* Monthly */}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', padding: '2rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>📅</div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'white', marginBottom: '0.375rem' }}>Monthly</h3>
              <div style={{ fontSize: '2.75rem', fontWeight: '800', color: '#00D4AA', marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>$19.99</div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Per month • Billed monthly</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime'].map((item, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#00D4AA' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} style={{ width: '100%', padding: '0.875rem', background: 'rgba(255,255,255,0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.25)', borderRadius: '0.75rem', fontWeight: '600', cursor: 'pointer', fontSize: '0.9375rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                {user ? 'Enroll Now' : 'Get Started'}
              </button>
            </div>

            {/* Annual — best value */}
            <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)', padding: '2rem', borderRadius: '1.25rem', border: '2px solid #00D4AA', textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#00D4AA', color: 'white', padding: '0.2rem 1rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}>
                BEST VALUE
              </div>
              <div style={{ fontSize: '2rem', marginBottom: '0.875rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'white', marginBottom: '0.375rem' }}>Annual</h3>
              <div style={{ fontSize: '2.75rem', fontWeight: '800', color: '#00D4AA', marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>$99</div>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem', textDecoration: 'line-through', marginBottom: '0.25rem' }}>$239.88/year</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>12 months • Save $141 • $8.25/mo</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                {['All 195 questions', 'Unlimited practice', 'Cancel anytime', 'All new certs included'].map((item, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: '#00D4AA' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <button onClick={() => user ? navigate('/dashboard') : setShowAuthModal(true)} style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: '700', cursor: 'pointer', fontSize: '0.9375rem', boxShadow: '0 4px 12px rgba(0,212,170,0.3)' }}>
                {user ? 'Enroll Now' : 'Get Started'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              All plans include access to all certifications • Currently: AWS Developer Associate • Coming soon: 20+ more
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ZONE 5 — SOCIAL PROOF & TRUST
      ═══════════════════════════════════════ */}
      <section style={{ padding: '5rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          {/* Metrics bar */}
          <div style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
            marginBottom: '4rem',
            padding: '2rem',
            background: '#f8fafc',
            borderRadius: '1.25rem',
            border: '1px solid #e5e7eb'
          }}>
            {[
              { stat: '500+', label: 'Certified professionals' },
              { stat: '82%', label: 'First-attempt pass rate' },
              { stat: '4.9/5', label: 'Average rating' },
              { stat: '195', label: 'Practice questions' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: '800', color: '#0A2540', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{item.stat}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              REAL RESULTS
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '800', color: '#0A2540', letterSpacing: '-0.02em' }}>
              Trusted by cloud professionals
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                background: '#f8fafc',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '0.2rem' }}>
                  {[...Array(5)].map((_, si) => (
                    <span key={si} style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>
                  ))}
                </div>

                {/* Quote */}
                <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: '1.65', flex: 1 }}>
                  "{t.text}"
                </p>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #0A2540, #1A3B5C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '0.875rem', fontWeight: '700'
                  }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.9375rem' }}>{t.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '0.8125rem' }}>{t.role}</div>
                    <div style={{ color: '#00A884', fontSize: '0.75rem', fontWeight: '600' }}>{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>FAQ</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: '800', color: '#0A2540', letterSpacing: '-0.02em' }}>
              Frequently asked questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} style={{ border: '1px solid #e5e7eb', borderRadius: '0.875rem', overflow: 'hidden', background: 'white' }}>
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: expandedFAQ === index ? '#f9fafb' : 'white',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '600',
                    color: '#0A2540',
                    fontSize: '0.9375rem',
                    gap: '1rem'
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ fontSize: '1rem', transition: 'transform 0.25s', transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0)', flexShrink: 0, color: '#9ca3af' }}>▼</span>
                </button>
                {expandedFAQ === index && (
                  <div style={{ padding: '0 1.25rem 1.25rem', color: '#4b5563', lineHeight: '1.65', fontSize: '0.9375rem' }}>
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
      <section style={{ padding: '6rem 1.5rem', background: 'linear-gradient(135deg, #0A2540 0%, #0d2d4a 50%, #1A3B5C 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', background: 'rgba(0,212,170,0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '52rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA', padding: '0.375rem 1rem', borderRadius: '1rem', fontSize: '0.8125rem', fontWeight: '700', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Start for free today
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', color: 'white', marginBottom: '1.25rem', lineHeight: '1.15', letterSpacing: '-0.03em' }}>
            Ready to get your<br />
            <span style={{ color: '#00D4AA' }}>AWS certification?</span>
          </h2>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.1875rem)', color: 'rgba(255,255,255,0.75)', marginBottom: '2.5rem', lineHeight: '1.65' }}>
            Join 500+ professionals who passed on their first attempt. Start free — 10 questions, full explanations, no credit card.
          </p>

          <button
            onClick={openSignup}
            style={{
              padding: '1.25rem 3rem',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.875rem',
              fontWeight: '700',
              fontSize: '1.1875rem',
              cursor: 'pointer',
              boxShadow: '0 8px 28px rgba(0,212,170,0.4)',
              transition: 'all 0.25s',
              marginBottom: '1rem',
              display: 'inline-block'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,212,170,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,212,170,0.4)' }}
          >
            Start Free →
          </button>
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={openLogin}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              Already a member? Sign in
            </button>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>
            <span>🔒 Secure payment</span>
            <span>⚡ Instant access</span>
            <span>🔄 Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0A2540', padding: '3rem 1.5rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.875rem', fontSize: '1rem' }}>Cloud Exam Lab</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Subscription-based practice questions for cloud certifications. AWS DVA-C02 available now — 20+ more coming soon.
              </p>
            </div>

            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.875rem', fontSize: '0.875rem' }}>Available Now</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <button onClick={() => { setExpandedProvider('aws'); scrollToSection('certifications') }} style={{ background: 'none', border: 'none', color: '#00D4AA', fontSize: '0.875rem', cursor: 'pointer', padding: 0, fontWeight: '600' }}>
                    ✨ AWS Developer Associate (DVA-C02)
                  </button>
                </li>
                <li style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '0.3rem' }}>195 practice questions</li>
                <li style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>3 complete exam sets</li>
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.875rem', fontSize: '0.875rem' }}>Coming Soon</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {['🚧 AWS Solutions Architect', '🚧 AWS Cloud Practitioner', '🚧 Azure & GCP Certifications'].map((item, i) => (
                  <li key={i} style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '0.875rem', fontSize: '0.875rem' }}>Support & Legal</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {[
                  { label: 'Contact Support', href: 'mailto:cloudexamlab@gmail.com' },
                  { label: 'Privacy Policy', href: '#' },
                  { label: 'Terms of Service', href: '#' },
                  { label: 'Refund Policy', href: '#' },
                ].map((link, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <a href={link.href} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'white'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.375rem' }}>
              <strong>Disclaimer:</strong> Independent practice questions. Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, or Google Cloud Platform (GCP).
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textAlign: 'center' }}>
              © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* ── Demo Modals ── */}
      {showDemoMaterials && (
        <div onClick={() => setShowDemoMaterials(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '1rem', maxWidth: '660px', width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: 'clamp(1.125rem, 3vw, 1.4rem)', fontWeight: '700', color: '#0A2540', marginBottom: '0.375rem' }}>📚 Study Materials</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Just-in-time learning resources for this question</p>
                </div>
                <button onClick={() => setShowDemoMaterials(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af', padding: '0.25rem' }}>×</button>
              </div>

              <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.875rem' }}>📖 AWS Lambda &amp; S3 Event Notifications</h4>
                <p style={{ color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.65', marginBottom: '1rem' }}>
                  Amazon S3 can publish events (object creation, deletion, restoration) directly to AWS Lambda, SNS, SQS, and EventBridge. S3 Event Notifications is the most direct and efficient way to trigger Lambda when objects are uploaded.
                </p>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid #00D4AA' }}>
                  <p style={{ fontSize: '0.875rem', color: '#0A2540', fontWeight: '600', marginBottom: '0.375rem' }}>💡 Key Concept</p>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.55' }}>
                    S3 Event Notifications provide a serverless, event-driven architecture that automatically triggers your Lambda function — no polling required.
                  </p>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #bae6fd' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0369a1', marginBottom: '0.875rem' }}>📚 Official AWS Documentation</h4>
                {[
                  { label: 'Using AWS Lambda with Amazon S3', href: 'https://docs.aws.amazon.com/lambda/latest/dg/with-s3.html' },
                  { label: 'Configuring S3 Event Notifications', href: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/NotificationHowTo.html' },
                ].map((link, i) => (
                  <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{ color: '#0369a1', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: i === 0 ? '0.5rem' : 0 }}>
                    <span>→</span> {link.label}
                  </a>
                ))}
              </div>

              <button onClick={() => setShowDemoMaterials(false)} style={{ width: '100%', marginTop: '1.25rem', padding: '0.875rem', background: 'linear-gradient(135deg, #00D4AA, #00A884)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showDemoResults && (
        <div onClick={() => setShowDemoResults(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '1rem', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: 'clamp(1.25rem, 4vw, 2rem)' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '2.75rem', marginBottom: '0.875rem' }}>🎉</div>
                <h3 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.625rem)', fontWeight: '700', color: '#0A2540', marginBottom: '0.375rem' }}>Exam Complete!</h3>
                <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>AWS Developer Associate — Practice Set 1</p>
              </div>

              <div style={{ background: 'rgba(0,212,170,0.08)', padding: '1.75rem', borderRadius: '1rem', border: '2px solid #00D4AA', marginBottom: '1.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2.25rem, 6vw, 3rem)', fontWeight: '800', color: '#00D4AA', marginBottom: '0.375rem', letterSpacing: '-0.03em' }}>82%</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.375rem' }}>PASSED ✓</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>53 / 65 questions correct</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                {[
                  ['Score', '820 / 1000'],
                  ['Time Taken', '48 minutes'],
                  ['Passing Score', '720 / 1000 (72%)'],
                ].map(([label, value], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>{label}</span>
                    <span style={{ color: '#0A2540', fontWeight: '600', fontSize: '0.875rem' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #bae6fd', marginBottom: '1.25rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#0369a1', margin: 0, lineHeight: '1.55' }}>
                  <strong>💡 Great job!</strong> You're ready for the actual exam. Review the questions you missed to lock in the remaining weak areas.
                </p>
              </div>

              <button onClick={() => setShowDemoResults(false)} style={{ width: '100%', padding: '0.875rem', background: 'linear-gradient(135deg, #00D4AA, #00A884)', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' }}>
                Close
              </button>
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
