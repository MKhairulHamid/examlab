import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'

// Certification data
const CERTIFICATIONS = {
  aws: [
    { code: 'CLF-C02', name: 'AWS Cloud Practitioner', examQuestions: 65, practiceQuestions: 195, perSet: 65 },
    { code: 'DVA-C02', name: 'AWS Developer Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65 },
    { code: 'SAA-C03', name: 'AWS Solutions Architect Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65 },
    { code: 'SOA-C02', name: 'AWS SysOps Administrator Associate', examQuestions: 65, practiceQuestions: 195, perSet: 65 },
    { code: 'SAP-C02', name: 'AWS Solutions Architect Professional', examQuestions: 75, practiceQuestions: 225, perSet: 75 },
    { code: 'DOP-C02', name: 'AWS DevOps Engineer Professional', examQuestions: 75, practiceQuestions: 225, perSet: 75 },
    { code: 'ANS-C01', name: 'AWS Advanced Networking', examQuestions: 65, practiceQuestions: 195, perSet: 65 },
  ],
  azure: [
    { code: 'AZ-900', name: 'Azure Fundamentals', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-104', name: 'Azure Administrator', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-204', name: 'Azure Developer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-305', name: 'Azure Solutions Architect Expert', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-400', name: 'Azure DevOps Engineer Expert', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-500', name: 'Azure Security Engineer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
    { code: 'AZ-700', name: 'Azure Network Engineer Associate', examQuestions: '40-60', practiceQuestions: 150, perSet: 50 },
  ],
  gcp: [
    { code: 'GCP-ACE', name: 'GCP Associate Cloud Engineer', examQuestions: 50, practiceQuestions: 150, perSet: 50 },
    { code: 'GCP-PCA', name: 'GCP Professional Cloud Architect', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
    { code: 'GCP-PDE', name: 'GCP Professional Data Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
    { code: 'GCP-PCD', name: 'GCP Professional Cloud Developer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
    { code: 'GCP-PCNE', name: 'GCP Professional Cloud Network Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
    { code: 'GCP-PCSE', name: 'GCP Professional Cloud Security Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
    { code: 'GCP-PCDO', name: 'GCP Professional Cloud DevOps Engineer', examQuestions: '50-60', practiceQuestions: 165, perSet: 55 },
  ]
}

const FAQ_ITEMS = [
  {
    question: 'Why do different certifications have different question counts?',
    answer: 'Each cloud provider structures their exams differently. We match the actual exam format for each certification, so you practice with the same number and style of questions you\'ll see on test day.'
  },
  {
    question: 'Can I purchase sets individually?',
    answer: 'Yes! You can buy one set for $5 to try it out, then add more sets anytime. Or save $5 by getting all 3 sets in a bundle for $10.'
  },
  {
    question: 'What\'s included in the free sample?',
    answer: '10 questions with full explanations, documentation references, and the same quality as our paid sets. Available for every certification with no credit card required.'
  },
  {
    question: 'How do your questions compare to the actual exam?',
    answer: 'Our questions match the format, difficulty, and style of real certification exams. They\'re original practice questions (not actual exam questions) designed to prepare you thoroughly.'
  },
  {
    question: 'Do purchased sets expire?',
    answer: 'No! Once you purchase a question set, you have lifetime access. Practice as many times as you want, whenever you want.'
  },
  {
    question: 'Can I switch between certifications?',
    answer: 'Yes! Each certification is purchased separately, and you can access all your purchased sets from your dashboard anytime.'
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
            ☁️ Multi-Cloud Certification Practice
          </div>
          
          <h1 className="hero-title">
            Practice Questions for AWS, Azure & GCP Certifications
          </h1>
          
          <p className="hero-description">
            Exam-realistic question sets for 21 cloud certifications. Master your certification with practice questions that mirror actual exam format and difficulty.
          </p>
          
          <div className="hero-buttons">
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Try 10 Free Questions →
            </button>
            <button
              onClick={() => scrollToSection('certifications')}
              className="btn-secondary"
            >
              Browse Certifications
            </button>
          </div>

          {/* Cloud Provider Badges */}
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
            }}>🔶 AWS (7 certs)</div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>☁️ Azure (7 certs)</div>
            <div style={{ 
              padding: '0.5rem 1rem', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>🔷 GCP (7 certs)</div>
          </div>
        </div>
      </section>

      {/* Certification Catalog */}
      <section id="certifications" style={{ padding: '4rem 1rem', background: 'linear-gradient(to bottom, white, #f9fafb)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00D4AA', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.75rem' }}>
              21 CERTIFICATIONS AVAILABLE
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem', lineHeight: '1.3' }}>
              Choose Your Certification Path
            </h2>
            <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '42rem', margin: '0 auto 2rem' }}>
              Practice with exam-realistic questions for AWS, Azure, and GCP certifications
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
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
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
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  Try 10 Free Questions
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
                Start with 10 Free Practice Questions
              </h2>
              <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                Available for <strong>every certification</strong> • No credit card required
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
                  SAMPLE QUESTION PREVIEW
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#0A2540', marginBottom: '1rem' }}>
                  Each question includes:
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Real-world scenario description</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Multiple choice options</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Detailed explanations for all answers</span>
                  </li>
                  <li style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start' }}>
                    <span style={{ marginRight: '0.5rem' }}>✓</span>
                    <span style={{ color: '#4b5563' }}>Official documentation references</span>
                  </li>
                </ul>
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
                Create Free Account to Access
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
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
              One-time payment • Lifetime access • No subscription
            </p>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', maxWidth: '900px', margin: '0 auto' }}>
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
                10 questions per certification
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Full explanations
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Documentation links
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> All certifications
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
                3-Set Bundle
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $10
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Save $5 • All 3 question sets
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> 3 complete question sets
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Full exam simulation
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Lifetime access
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
                Get Bundle
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
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                Single Set
              </h3>
              <div style={{ fontSize: '3rem', fontWeight: '700', color: '#00D4AA', marginBottom: '0.5rem' }}>
                $5
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Per question set
              </p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem', textAlign: 'left' }}>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> One complete set
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Add more anytime
                </li>
                <li style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '0.5rem' }}>✓</span> Lifetime access
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
                Buy One Set
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              * Question counts vary by certification.{' '}
              <button
                onClick={() => scrollToSection('breakdown')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00D4AA',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                See full breakdown
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '4rem 1rem', background: '#f9fafb' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#0A2540', marginBottom: '1rem' }}>
              How It Works
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {[
              {
                step: '1',
                title: 'Create Account & Try Free',
                description: 'Sign up and access 10 free questions for any certification. No credit card needed.'
              },
              {
                step: '2',
                title: 'Choose Certification',
                description: 'Browse 21 certifications across AWS, Azure, and GCP. Start with one set or get the bundle.'
              },
              {
                step: '3',
                title: 'Practice with Explanations',
                description: 'Work through exam-realistic questions with detailed explanations and documentation links.'
              },
              {
                step: '4',
                title: 'Track Progress',
                description: 'Monitor your completion and identify areas needing review with our progress tracking.'
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
            How We Structure Our Question Sets
          </h2>
          <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1rem', lineHeight: '1.6' }}>
            Question counts match or exceed the length of actual exams. Practice with <strong>3× the exam volume</strong> for thorough preparation.
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Example: AWS Professional certifications have 75 questions on the actual exam, so each of our 3 practice sets contains 75 questions (225 total).
          </p>
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
            Begin Your Certification Preparation
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.9)', marginBottom: '2rem' }}>
            10 free questions for any certification - no credit card
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
              <span>💯</span> Money-Back Guarantee
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
                Practice questions for AWS, Azure & GCP certifications. Exam-realistic preparation for 21 cloud certifications.
              </p>
            </div>

            {/* Quick Links - AWS */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>AWS Certifications</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {CERTIFICATIONS.aws.slice(0, 4).map((cert, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <a 
                      href="#certifications" 
                      onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); setExpandedProvider('aws'); }}
                      style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    >
                      {cert.code}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links - Azure */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>Azure Certifications</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {CERTIFICATIONS.azure.slice(0, 4).map((cert, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem' }}>
                    <a 
                      href="#certifications" 
                      onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); setExpandedProvider('azure'); }}
                      style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                    >
                      {cert.code}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links - GCP & Support */}
            <div>
              <h3 style={{ color: 'white', fontWeight: '700', marginBottom: '1rem', fontSize: '0.875rem' }}>GCP & Support</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href="#certifications" 
                    onClick={(e) => { e.preventDefault(); scrollToSection('certifications'); setExpandedProvider('gcp'); }}
                    style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    View GCP Certs
                  </a>
                </li>
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
