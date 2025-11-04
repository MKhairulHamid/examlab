import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'

// Certification data - DVA-C02 is available, others coming soon
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
    question: 'How does the subscription work?',
    answer: 'Choose from monthly ($5), quarterly ($10), or annual ($30) plans. Your subscription gives you unlimited access to all available practice questions and features. Cancel anytime with no commitment.'
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
    question: 'How do your questions compare to the actual exam?',
    answer: 'Our questions match the format, difficulty, and style of the real AWS Developer Associate certification exam. They\'re original practice questions designed to prepare you thoroughly for test day.'
  },
  {
    question: 'What certifications are available?',
    answer: 'AWS Developer Associate (DVA-C02) is currently available with 195 practice questions. We\'re actively developing content for 20+ additional certifications across AWS, Azure, and GCP - coming soon!'
  },
  {
    question: 'Can I cancel my subscription?',
    answer: 'Yes! You can cancel anytime with no penalties or commitments. Your access continues until the end of your current billing period.'
  }
]

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('aws')
  const [expandedProvider, setExpandedProvider] = useState('aws')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [demoStep, setDemoStep] = useState(0)
  const [demoSelectedAnswer, setDemoSelectedAnswer] = useState(null)
  
  // Redirect if already logged in (but not if processing auth tokens)
  useEffect(() => {
    // Check if URL contains auth tokens (from magic link or OAuth)
    const hasAuthTokens = window.location.hash.includes('access_token') || 
                         window.location.hash.includes('refresh_token')
    
    // Only redirect if user is logged in AND not currently processing auth tokens
    if (user && !hasAuthTokens) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const allCertifications = [
    ...CERTIFICATIONS.aws.map(cert => ({ ...cert, provider: 'AWS' })),
    ...CERTIFICATIONS.azure.map(cert => ({ ...cert, provider: 'Azure' })),
    ...CERTIFICATIONS.gcp.map(cert => ({ ...cert, provider: 'GCP' }))
  ]

  const filteredCertifications = allCertifications.filter(cert =>
    cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedCertifications = [...filteredCertifications].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aVal = a[sortConfig.key]
    const bVal = b[sortConfig.key]
    const modifier = sortConfig.direction === 'asc' ? 1 : -1
    return aVal > bVal ? modifier : -modifier
  })

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="header-button">
        <button onClick={() => setShowAuthModal(true)}>
          Login / Sign Up
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-1"></div>
        <div className="hero-bg-2"></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            🚀 Now Available: AWS Developer Associate
          </div>
          
          <h1 className="hero-title">
            Master AWS Developer Associate Certification
          </h1>
          
          <p className="hero-description">
            195 exam-realistic practice questions for AWS Developer Associate (DVA-C02). Unlimited access with detailed explanations, progress tracking, and more. Start with 10 free questions!
          </p>
          
          <div className="hero-buttons">
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Try 10 Free Questions →
            </button>
            <button
              onClick={() => scrollToSection('how-it-works-demo')}
              className="btn-secondary"
            >
              See How It Works
            </button>
          </div>

          {/* Subscription Info */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            marginTop: '2rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>💰 From $5/month</div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>📚 195 Questions</div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>🔄 Cancel Anytime</div>
          </div>
        </div>
      </section>

      {/* Certification Catalog */}
      <section id="certifications" style={{ padding: '4rem 1rem', background: 'linear-gradient(to bottom, white, #f9fafb)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
              AVAILABLE NOW + 20 MORE COMING SOON
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
              Your Certification Journey Starts Here
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '42rem', margin: '0 auto 2rem' }}>
              Start with AWS Developer Associate today. More certifications launching soon across AWS, Azure, and GCP!
            </p>
          </div>

          {/* Provider Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {['aws', 'azure', 'gcp'].map(provider => (
              <button
                key={provider}
                onClick={() => {
                  setExpandedProvider(provider)
                  setSelectedProvider(provider)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: expandedProvider === provider ? '#0A2540' : 'white',
                  color: expandedProvider === provider ? 'white' : '#0A2540',
                  border: '2px solid #0A2540',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'uppercase',
                  fontSize: '0.875rem'
                }}
              >
                {provider === 'aws' && '🔶 AWS'}
                {provider === 'azure' && '☁️ Azure'}
                {provider === 'gcp' && '🔷 GCP'}
              </button>
            ))}
          </div>

          {/* Certification Cards */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {CERTIFICATIONS[expandedProvider].map((cert, index) => (
              <div 
                key={index}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  border: cert.available ? '2px solid #00D4AA' : '1px solid #e5e7eb',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  position: 'relative',
                  opacity: cert.available ? 1 : 0.75
                }}
                onMouseEnter={(e) => {
                  if (cert.available) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,212,170,0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = cert.available ? '0 4px 6px -1px rgba(0,212,170,0.2)' : '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                {cert.available && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    boxShadow: '0 2px 8px rgba(0,212,170,0.3)'
                  }}>
                    ✨ AVAILABLE NOW
                  </div>
                )}
                {!cert.available && (
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '10px',
                    background: '#6b7280',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '700'
                  }}>
                    🚧 COMING SOON
                  </div>
                )}
                
                <div style={{ marginBottom: '1rem', marginTop: cert.available || !cert.available ? '0.5rem' : '0' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {cert.code}
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.75rem' }}>
                    {cert.name}
                  </h3>
                </div>

                <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                    <strong>Actual exam:</strong> {cert.examQuestions} questions
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                    <strong>Practice questions:</strong> {cert.practiceQuestions} (3 sets of {cert.perSet})
                  </div>
                </div>

                <button
                  onClick={() => cert.available ? setShowAuthModal(true) : null}
                  disabled={!cert.available}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: cert.available ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)' : '#e5e7eb',
                    color: cert.available ? 'white' : '#9ca3af',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: cert.available ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    if (cert.available) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {cert.available ? 'Try 10 Free Questions' : 'Notify Me When Available'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Sample Offer */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
                Try 10 Free AWS Developer Associate Questions
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                Experience the full quality before subscribing • No credit card required
              </p>
              
              <div style={{ 
                background: 'white', 
                padding: '2rem', 
                borderRadius: '1rem', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                marginBottom: '1.5rem',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '0 auto 1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#00D4AA', fontWeight: '600', marginBottom: '1rem' }}>
                  WHAT'S INCLUDED IN FREE SAMPLE
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0A2540', marginBottom: '1rem' }}>
                  Each question includes:
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Real-world AWS development scenarios</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Exam-realistic multiple choice format</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Detailed explanations for correct & incorrect answers</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Links to official AWS documentation</span>
                  </li>
                </ul>
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  background: '#f9fafb', 
                  borderRadius: '0.5rem',
                  borderLeft: '4px solid #00D4AA'
                }}>
                  <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
                    <strong>After trying the free sample,</strong> subscribe for unlimited access to all 195 questions across 3 complete practice sets.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              >
                Start Free Trial →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Our Questions Different */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              What Makes Our Questions Different
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {[
              {
                icon: '🎯',
                title: 'Exam-Matched Format',
                description: 'Question counts and difficulty mirror actual certification exams'
              },
              {
                icon: '💡',
                title: 'Comprehensive Explanations',
                description: 'Detailed reasoning for correct and incorrect answers'
              },
              {
                icon: '📖',
                title: 'Official References',
                description: 'Links to AWS/Azure/GCP documentation for further study'
              },
              {
                icon: '📚',
                title: 'Multiple Practice Sets',
                description: 'Three distinct question sets per certification for thorough preparation'
              },
              {
                icon: '🌐',
                title: 'Scenario-Based',
                description: 'Real-world situations matching actual exam style'
              },
              {
                icon: '📊',
                title: 'Progress Tracking',
                description: 'Monitor your performance and identify areas for improvement'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '1rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{ padding: '4rem 1rem', background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '1rem' }}>
              Simple, Flexible Subscription Plans
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
              Unlimited access to all 195 practice questions • Cancel anytime
            </p>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
              padding: '2rem', 
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎁</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Free Sample
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $0
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Try before you subscribe
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> 10 sample questions
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Full explanations
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> No credit card required
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Start Free
              </button>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
              padding: '2rem', 
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Monthly
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $5
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Per month • Billed monthly
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> All 195 questions
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Unlimited practice
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Cancel anytime
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Get Started
              </button>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(20px)',
              padding: '2rem', 
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📆</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Quarterly
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $10
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                3 months • Save $5
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> All 195 questions
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Unlimited practice
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Cancel anytime
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Get Started
              </button>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.15)', 
              backdropFilter: 'blur(20px)',
              padding: '2rem', 
              borderRadius: '1rem',
              border: '2px solid #00D4AA',
              textAlign: 'center',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '-12px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                background: '#00D4AA',
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                BEST VALUE
              </div>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Annual
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $30
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                12 months • Save $30
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> All 195 questions
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Unlimited practice
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Cancel anytime
                </li>
              </ul>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,212,170,0.3)'
                }}
              >
                Get Started
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              All plans include full access to AWS Developer Associate (DVA-C02) with 195 practice questions
            </p>
          </div>
        </div>
      </section>

      {/* Animated Demo Section - How It Works */}
      <section id="how-it-works-demo" style={{ padding: '4rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
              INTERACTIVE DEMO
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              Experience the Exam Interface
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '42rem', margin: '0 auto' }}>
              See exactly how our practice exams work with this interactive demo
            </p>
          </div>

          {/* Demo Exam Interface */}
          <div style={{ 
            maxWidth: '900px', 
            margin: '0 auto 3rem',
            background: '#f9fafb',
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid #e5e7eb'
          }}>
            {/* Demo Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
              padding: '1.5rem',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
                AWS Developer Associate Practice
              </h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.875rem',
                background: 'rgba(255,255,255,0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem'
              }}>
                ⏱️ Time Remaining: 01:30:00
              </div>
            </div>

            {/* Time Bar */}
            <div style={{ 
              height: '4px', 
              background: '#e5e7eb',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: '75%',
                background: 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
                transition: 'width 0.5s ease'
              }}></div>
            </div>

            {/* Question Navigation */}
            <div style={{
              background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                color: 'white',
                fontSize: '0.875rem'
              }}>
                <span>Questions: 1/65</span>
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
                gap: '0.5rem',
                maxHeight: '120px',
                overflowY: 'auto'
              }}>
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.5rem',
                      background: i === 0 ? '#00D4AA' : 'rgba(255,255,255,0.1)',
                      color: 'white',
                      borderRadius: '0.375rem',
                      textAlign: 'center',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: i === 0 ? '2px solid white' : 'none'
                    }}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ 
                height: '8px', 
                background: '#e5e7eb',
                borderRadius: '1rem',
                overflow: 'hidden',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  height: '100%',
                  width: '15%',
                  background: 'linear-gradient(90deg, #00D4AA 0%, #00A884 100%)',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', margin: 0 }}>
                1 of 65 questions answered
              </p>
            </div>

            {/* Question Content */}
            <div style={{ padding: '2rem', background: 'white' }}>
              <div style={{
                background: '#f9fafb',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                border: '2px solid #e5e7eb',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  Question 1 • ⭕ Multiple Choice (select one)
                </div>
                <p style={{ 
                  fontSize: '1rem', 
                  color: '#0A2540', 
                  lineHeight: '1.6',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  A developer is building a serverless application using AWS Lambda. The application needs to process images uploaded to an S3 bucket. Which AWS service should be used to trigger the Lambda function when a new image is uploaded?
                </p>
              </div>

              {/* Answer Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      padding: '1rem 1.25rem',
                      background: demoSelectedAnswer === index ? 'linear-gradient(135deg, #00D4AA15 0%, #00A88415 100%)' : 'white',
                      border: demoSelectedAnswer === index ? '2px solid #00D4AA' : '2px solid #e5e7eb',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      if (demoSelectedAnswer !== index) {
                        e.currentTarget.style.borderColor = '#00D4AA'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (demoSelectedAnswer !== index) {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: demoSelectedAnswer === index ? '2px solid #00D4AA' : '2px solid #d1d5db',
                      background: demoSelectedAnswer === index ? '#00D4AA' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s'
                    }}>
                      {demoSelectedAnswer === index && (
                        <span style={{ color: 'white', fontSize: '0.875rem' }}>✓</span>
                      )}
                    </div>
                    <span style={{ 
                      color: '#0A2540',
                      fontSize: '0.95rem',
                      fontWeight: demoSelectedAnswer === index ? '600' : '400'
                    }}>
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginTop: '2rem',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: '#e5e7eb',
                    color: '#6b7280',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'not-allowed',
                    fontSize: '0.95rem',
                    opacity: 0.5
                  }}
                  disabled
                >
                  ← Previous
                </button>
                <button
                  style={{
                    padding: '0.875rem 1.5rem',
                    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(0,212,170,0.3)'
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Feature Highlights Below Demo */}
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginTop: '3rem' }}>
            {[
              {
                icon: '⏱️',
                title: 'Timed Practice',
                description: 'Realistic exam timer to simulate actual test conditions'
              },
              {
                icon: '📊',
                title: 'Progress Tracking',
                description: 'Visual indicators show which questions you\'ve answered'
              },
              {
                icon: '💡',
                title: 'Instant Feedback',
                description: 'Get detailed explanations after completing each set'
              },
              {
                icon: '🔄',
                title: 'Resume Anytime',
                description: 'Your progress is automatically saved - pick up where you left off'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              Get Started in 3 Easy Steps
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {[
              {
                step: '1',
                title: 'Create Free Account',
                description: 'Sign up in seconds and try 10 free questions. No credit card required.'
              },
              {
                step: '2',
                title: 'Choose Your Plan',
                description: 'Select monthly, quarterly, or annual subscription for unlimited access.'
              },
              {
                step: '3',
                title: 'Start Practicing',
                description: 'Access all 195 questions with detailed explanations and track your progress.'
              }
            ].map((item, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '1rem',
                  margin: '0 auto 1rem'
                }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem', textAlign: 'center' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#6b7280', textAlign: 'center' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              Platform Features
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              { icon: '📊', title: 'Progress Tracking', description: 'Monitor completion across all question sets' },
              { icon: '📈', title: 'Performance Analytics', description: 'See strengths and weaknesses by exam domain' },
              { icon: '⚡', title: 'Flexible Practice Modes', description: 'Study mode, timed mode, review mode' },
              { icon: '🔖', title: 'Question Bookmarking', description: 'Flag questions for later review' },
              { icon: '📱', title: 'Mobile-Friendly', description: 'Practice anywhere on any device' },
              { icon: '💰', title: 'No Subscription', description: 'One-time purchase, permanent access' }
            ].map((feature, index) => (
              <div 
                key={index}
                style={{
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00D4AA'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0A2540', marginBottom: '0.5rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Transparency */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
            Comprehensive AWS Developer Associate Coverage
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1rem', lineHeight: '1.6' }}>
            195 practice questions across 3 complete sets - <strong>3× the actual exam volume</strong> for thorough preparation.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '2rem' }}>
            The actual AWS Developer Associate exam has 65 questions. Each of our 3 practice sets contains 65 questions (195 total).
          </p>
          
          {/* Coming Soon Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
            padding: '2rem',
            borderRadius: '1rem',
            color: 'white',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🚀</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              More Certifications Coming Soon
            </h3>
            <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '1rem' }}>
              We're actively developing content for 20+ additional certifications across AWS, Azure, and GCP. Your subscription will automatically include access to new certifications as they launch!
            </p>
            <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
              Next up: AWS Solutions Architect Associate & AWS Cloud Practitioner
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '4rem 1rem', background: 'white' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQ_ITEMS.map((item, index) => (
              <div 
                key={index}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
              >
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
                    fontSize: '1rem'
                  }}
                >
                  <span>{item.question}</span>
                  <span style={{ fontSize: '1.25rem', transition: 'transform 0.3s', transform: expandedFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    ▼
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div style={{ padding: '0 1.25rem 1.25rem', color: '#4b5563', lineHeight: '1.6' }}>
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section style={{ padding: '5rem 1rem', background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', textAlign: 'center' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '1rem', lineHeight: '1.2' }}>
            Start Your AWS Developer Associate Journey
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            Try 10 free questions - no credit card required
          </p>
          
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '1.25rem 2.5rem',
              background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontWeight: '700',
              fontSize: '1.25rem',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,212,170,0.3)',
              transition: 'all 0.3s',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,212,170,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,212,170,0.3)'
            }}
          >
            Create Free Account →
          </button>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔒</span> Secure Payment
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚡</span> Instant Access
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🔄</span> Cancel Anytime
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer style={{ background: '#0A2540', padding: '3rem 1rem 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2rem' }}>
            {/* About */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem' }}>Cloud Exam Lab</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                Subscription-based practice questions for cloud certifications. Currently featuring AWS Developer Associate with 20+ more certifications coming soon.
              </p>
            </div>

            {/* Available Now */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>Available Now</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href="#certifications" 
                    onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); setExpandedProvider('aws'); }}
                    style={{ color: '#00D4AA', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '600' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#00D4AA'}
                  >
                    ✨ AWS Developer Associate (DVA-C02)
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  195 practice questions
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  3 complete exam sets
                </li>
              </ul>
            </div>

            {/* Coming Soon */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>Coming Soon</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  🚧 AWS Solutions Architect
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  🚧 AWS Cloud Practitioner
                </li>
                <li style={{ marginBottom: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
                  🚧 Azure & GCP Certifications
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href="#certifications" 
                    onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); }}
                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    View All →
                  </a>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>Support & Legal</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="mailto:support@cloudexamlab.com" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    Contact Support
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    Privacy Policy
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    Terms of Service
                  </a>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a href="#" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}>
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>
              <strong>Disclaimer:</strong> Independent practice questions. Not affiliated with or endorsed by Amazon Web Services (AWS), Microsoft Azure, or Google Cloud Platform (GCP).
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textAlign: 'center' }}>
              © {new Date().getFullYear()} Cloud Exam Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default Landing
