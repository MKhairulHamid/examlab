import React, { useState } from 'react'

const glassCard = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(20px)',
  borderRadius: '1rem',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '1.5rem',
}

const statItem = {
  background: 'rgba(255,255,255,0.06)',
  borderRadius: '0.75rem',
  padding: '1rem 1.25rem',
  border: '1px solid rgba(255,255,255,0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.25rem',
}

const statLabel = {
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#00D4AA',
}

const statValue = {
  fontSize: '0.9375rem',
  fontWeight: '500',
  color: 'rgba(255,255,255,0.9)',
  lineHeight: '1.4',
}

const sectionHeading = {
  fontSize: '1.125rem',
  fontWeight: '700',
  color: 'white',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      paddingBottom: open ? '1rem' : '0',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          padding: '1rem 0',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'rgba(255,255,255,0.9)', lineHeight: '1.4' }}>
          {question}
        </span>
        <span style={{
          color: '#00D4AA',
          fontSize: '1.25rem',
          flexShrink: 0,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          display: 'inline-block',
        }}>
          +
        </span>
      </button>
      {open && (
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', paddingBottom: '0.5rem' }}>
          {answer}
        </p>
      )}
    </div>
  )
}

function ExamLandingSection({ landing }) {
  const [expanded, setExpanded] = useState(false)

  if (!landing) return null

  const {
    tagline,
    overview,
    exam_at_a_glance,
    why_get_certified,
    who_should_take,
    next_steps,
    faqs,
  } = landing

  const glanceStats = exam_at_a_glance ? [
    exam_at_a_glance.category && { label: 'Level', value: exam_at_a_glance.category, icon: '🏆' },
    exam_at_a_glance.duration && { label: 'Exam Duration', value: exam_at_a_glance.duration, icon: '⏱️' },
    exam_at_a_glance.format && { label: 'Format', value: exam_at_a_glance.format, icon: '📋' },
    exam_at_a_glance.cost && { label: 'Cost', value: exam_at_a_glance.cost, icon: '💳' },
    exam_at_a_glance.testing_options && { label: 'Testing Options', value: exam_at_a_glance.testing_options, icon: '🖥️' },
    exam_at_a_glance.validity_years && { label: 'Validity', value: `${exam_at_a_glance.validity_years} years`, icon: '📅' },
    exam_at_a_glance.languages?.length && {
      label: 'Available Languages',
      value: exam_at_a_glance.languages.join(', '),
      icon: '🌐',
    },
  ].filter(Boolean) : []

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Toggle Header */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: expanded ? '1rem 1rem 0 0' : '1rem',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
          color: 'white',
          marginBottom: expanded ? '0' : '0',
          transition: 'border-radius 0.2s',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '1rem' }}>
          <span>📖</span> About This Certification
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          style={{
            flexShrink: 0,
            transition: 'transform 0.25s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="#00D4AA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Collapsible Content */}
      {expanded && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderTop: 'none',
          borderRadius: '0 0 1rem 1rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}>

      {/* Tagline / Overview */}
      {(tagline || overview) && (
        <div style={glassCard}>
          {tagline && (
            <p style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#00D4AA',
              marginBottom: overview ? '0.75rem' : 0,
              lineHeight: '1.5',
            }}>
              {tagline}
            </p>
          )}
          {overview && (
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
              {overview}
            </p>
          )}
        </div>
      )}

      {/* Exam At A Glance */}
      {glanceStats.length > 0 && (
        <div style={glassCard}>
          <h3 style={sectionHeading}>
            <span>📊</span> Exam At A Glance
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            {glanceStats.map((stat) => (
              <div key={stat.label} style={statItem}>
                <span style={statLabel}>{stat.icon} {stat.label}</span>
                <span style={statValue}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-column: Why Get Certified + Who Should Take */}
      {(why_get_certified?.length > 0 || who_should_take) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
        }}>
          {why_get_certified?.length > 0 && (
            <div style={glassCard}>
              <h3 style={sectionHeading}>
                <span>🎯</span> Why Get Certified?
              </h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {why_get_certified.map((reason, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                    <span style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      borderRadius: '50%',
                      background: 'rgba(0,212,170,0.2)',
                      border: '1px solid rgba(0,212,170,0.4)',
                      color: '#00D4AA',
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '0.1rem',
                    }}>
                      ✓
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
                      {reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {who_should_take && (
            <div style={glassCard}>
              <h3 style={sectionHeading}>
                <span>👤</span> Who Should Take This?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7' }}>
                {who_should_take}
              </p>
            </div>
          )}
        </div>
      )}

      {/* What's Next */}
      {next_steps?.length > 0 && (
        <div style={glassCard}>
          <h3 style={sectionHeading}>
            <span>🚀</span> What's Next After This Certification?
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
            {next_steps.map((step, i) => (
              <span key={i} style={{
                padding: '0.375rem 0.875rem',
                background: 'rgba(0,212,170,0.1)',
                border: '1px solid rgba(0,212,170,0.3)',
                borderRadius: '2rem',
                fontSize: '0.8125rem',
                fontWeight: '500',
                color: '#00D4AA',
              }}>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* FAQs */}
      {faqs?.length > 0 && (
        <div style={glassCard}>
          <h3 style={sectionHeading}>
            <span>❓</span> Key FAQs
          </h3>
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      )}

        </div>
      )}
    </div>
  )
}

export default ExamLandingSection
