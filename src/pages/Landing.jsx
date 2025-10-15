import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'

function Landing() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])
  
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
        {/* Animated background elements */}
        <div className="hero-bg-1"></div>
        <div className="hero-bg-2"></div>
        
        <div className="hero-content">
          <div className="hero-badge">
            🎓 Professional Exam Practice Platform
          </div>
          
          <div className="hero-emoji">🚀</div>
          
          <h1 className="hero-title">
            Master Your Certification Exams with Confidence
          </h1>
          
          <p className="hero-description">
            Practice with real-world exam questions, comprehensive study materials, and intelligent progress tracking. Join thousands of professionals who have achieved their certification goals.
          </p>
          
          <div className="hero-buttons">
            <button
              onClick={() => setShowAuthModal(true)}
              className="btn-primary"
            >
              Start Free Practice →
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary"
            >
              Learn More →
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="features-header">
            <div className="features-label">
              Why Professionals Choose Cloud Exam Lab
            </div>
            <h2 className="features-title">
              Everything You Need to Pass Your Certification
            </h2>
            <p className="features-description">
              Our platform provides you with real exam simulation, detailed explanations, and progress tracking to ensure your success
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                icon: '🎯',
                title: 'Real Exam Simulation',
                description: 'Practice with questions that mirror actual certification exams, including timing, format, and difficulty level.'
              },
              {
                icon: '💾',
                title: 'Auto-Save Progress',
                description: 'Your progress is automatically saved. Study on your schedule and pick up exactly where you left off, anytime.'
              },
              {
                icon: '📚',
                title: 'Comprehensive Study Materials',
                description: 'Each question includes detailed explanations and reference materials to deepen your understanding.'
              },
              {
                icon: '📊',
                title: 'Performance Analytics',
                description: 'Track your progress with detailed analytics, identify weak areas, and focus your study efforts effectively.'
              },
              {
                icon: '📱',
                title: 'Offline Mode',
                description: 'Study anywhere, even without internet. All your data syncs automatically when you\'re back online.'
              },
              {
                icon: '🆓',
                title: 'Free to Start',
                description: 'Begin practicing immediately with our free exam sets. No credit card required to get started.'
              }
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">
            Ready to Start Practicing?
          </h2>
          <p className="cta-description">
            Join thousands of professionals and start your journey to certification success today.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
          >
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

export default Landing
