import React, { useState } from 'react'

// ─── Path Data ────────────────────────────────────────────────────────────────
const PATHS = {
  architect: {
    key: 'architect',
    name: 'Cloud Architect',
    emoji: '🌩️',
    tagline: 'Design resilient, cost-optimized AWS architectures at enterprise scale.',
    targetRole: 'Solutions Architect / Cloud Architect',
    avgSalary: '$153K–$165K/yr',
    salaryRange: '$100K–$233K',
    jobDemand: '2,000+ open roles on LinkedIn',
    color: '#0EA5E9',
    darkColor: '#0284C7',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #0C3054 100%)',
    accentBg: 'rgba(14,165,233,0.1)',
    accentBorder: 'rgba(14,165,233,0.3)',
    certs: [
      { code: 'CLF-C02', name: 'Cloud Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'Cloud literacy · Entry cloud roles · 9,000+ job listings' },
      { code: 'SAA-C03', name: 'Solutions Architect – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Architect roles · $153K avg salary · Top 10 cert of 2023' },
      { code: 'SAP-C02', name: 'Solutions Architect – Professional', level: 'Professional', baseHours: 175, cost: 300, unlocks: 'Senior Architect · $165K avg salary · Enterprise design' },
      { code: 'SCS-C02', name: 'Security – Specialty', level: 'Specialty', baseHours: 140, cost: 300, unlocks: 'Security Architect · Highest-paying specialty (+73% demand)' },
    ],
  },
  devops: {
    key: 'devops',
    name: 'DevOps Engineer',
    emoji: '🛠️',
    tagline: 'Build CI/CD pipelines, automate infrastructure, and operate distributed systems.',
    targetRole: 'Senior DevOps / Platform Engineer',
    avgSalary: '$131K–$151K/yr',
    salaryRange: '$85K–$205K',
    jobDemand: '1,000+ open roles · 495 new per week',
    color: '#10B981',
    darkColor: '#059669',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #0A2E1A 100%)',
    accentBg: 'rgba(16,185,129,0.1)',
    accentBorder: 'rgba(16,185,129,0.3)',
    certs: [
      { code: 'CLF-C02', name: 'Cloud Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'Cloud literacy · Foundation for all paths' },
      { code: 'DVA-C02', name: 'Developer – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Cloud Developer roles · CI/CD · Lambda expertise' },
      { code: 'CloudOps', name: 'CloudOps Engineer – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Ops roles · Infrastructure management · SRE track' },
      { code: 'DOP-C02', name: 'DevOps Engineer – Professional', level: 'Professional', baseHours: 175, cost: 300, unlocks: 'Senior DevOps · $151K avg salary · Platform Engineer' },
    ],
  },
  data: {
    key: 'data',
    name: 'Data Engineer',
    emoji: '📊',
    tagline: 'Build data pipelines, data lakes, and analytics platforms on AWS.',
    targetRole: 'Data Engineer / Analytics Engineer',
    avgSalary: '$137K–$165K/yr',
    salaryRange: '$89K–$211K',
    jobDemand: '2,000+ open roles · 2,053 new last month',
    color: '#F59E0B',
    darkColor: '#D97706',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #1A1400 100%)',
    accentBg: 'rgba(245,158,11,0.1)',
    accentBorder: 'rgba(245,158,11,0.3)',
    certs: [
      { code: 'CLF-C02', name: 'Cloud Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'Cloud literacy · AWS service fundamentals' },
      { code: 'DEA-C01', name: 'Data Engineer – Associate', level: 'Associate', baseHours: 115, cost: 150, unlocks: 'Data Engineer roles · $137K avg salary · Glue, Kinesis, Redshift' },
      { code: 'SAA-C03', name: 'Solutions Architect – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Data Platform Architect · +10–20% salary bump' },
      { code: 'SCS-C02', name: 'Security – Specialty', level: 'Specialty', baseHours: 140, cost: 300, unlocks: 'Healthcare/Finance data roles · HIPAA & PCI-DSS compliance' },
    ],
  },
  aiml: {
    key: 'aiml',
    name: 'AI / ML Engineer',
    emoji: '🤖',
    tagline: 'Build and deploy production ML systems and generative AI solutions on AWS.',
    targetRole: 'ML Engineer / Generative AI Developer',
    avgSalary: '$154K–$188K/yr',
    salaryRange: '$114K–$310K',
    jobDemand: '33,000+ ML roles · 11,000+ GenAI roles',
    color: '#8B5CF6',
    darkColor: '#7C3AED',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #160A2E 100%)',
    accentBg: 'rgba(139,92,246,0.1)',
    accentBorder: 'rgba(139,92,246,0.3)',
    certs: [
      { code: 'AIF-C01', name: 'AI Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'AI literacy · AI product & analyst roles' },
      { code: 'MLA-C01', name: 'ML Engineer – Associate', level: 'Associate', baseHours: 115, cost: 150, unlocks: 'ML Engineer · $188K avg salary · SageMaker expertise' },
      { code: 'GenAI-Pro', name: 'Generative AI Developer – Pro', level: 'Professional', baseHours: 175, cost: 300, unlocks: 'GenAI Engineer · Bedrock · RAG · Agentic AI · Fastest-growing role' },
    ],
  },
  security: {
    key: 'security',
    name: 'Security Specialist',
    emoji: '🔒',
    tagline: 'Secure AWS environments at scale — IAM, encryption, threat detection, compliance.',
    targetRole: 'Cloud Security Engineer / Architect',
    avgSalary: '$132K–$202K/yr',
    salaryRange: '$87K–$202K',
    jobDemand: 'Demand grew +73% YoY · Highest-paying specialty',
    color: '#EF4444',
    darkColor: '#DC2626',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #200A0A 100%)',
    accentBg: 'rgba(239,68,68,0.1)',
    accentBorder: 'rgba(239,68,68,0.3)',
    certs: [
      { code: 'CLF-C02', name: 'Cloud Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'Shared Responsibility Model · Cloud fundamentals' },
      { code: 'SAA-C03', name: 'Solutions Architect – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Junior Security Engineer · $153K base · Top prerequisite for security roles' },
      { code: 'SCS-C02', name: 'Security – Specialty', level: 'Specialty', baseHours: 140, cost: 300, unlocks: 'Security Architect · Top-paying AWS cert · Gov/Finance/Healthcare sector entry' },
    ],
  },
  network: {
    key: 'network',
    name: 'Network Specialist',
    emoji: '🌐',
    tagline: 'Design hybrid and cloud-native networks — BGP, Direct Connect, VPCs at scale.',
    targetRole: 'Cloud Network Architect',
    avgSalary: '$127K–$153K/yr',
    salaryRange: '$70K–$188K',
    jobDemand: '1,000+ open roles · 403 new per week',
    color: '#06B6D4',
    darkColor: '#0891B2',
    bgGradient: 'linear-gradient(135deg, #0A2540 0%, #001A20 100%)',
    accentBg: 'rgba(6,182,212,0.1)',
    accentBorder: 'rgba(6,182,212,0.3)',
    certs: [
      { code: 'CLF-C02', name: 'Cloud Practitioner', level: 'Foundational', baseHours: 50, cost: 100, unlocks: 'Cloud fundamentals · AWS service vocabulary' },
      { code: 'SAA-C03', name: 'Solutions Architect – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Network Engineer (AWS) · VPCs, subnets, routing context' },
      { code: 'ANS-C01', name: 'Advanced Networking – Specialty', level: 'Specialty', baseHours: 175, cost: 300, unlocks: 'Network Architect · BGP/MPLS/DDoS · Rare cert = premium salary' },
    ],
  },
}

const EXP_MULTIPLIERS = { beginner: 1.0, it_background: 0.75, some_aws: 0.5, experienced: 0.35 }
const DEPTH_LIMITS    = { quick: 1, role: 2, senior: 3, expert: 4 }
const LEVEL_COLOR     = { Foundational: '#6366F1', Associate: '#0EA5E9', Professional: '#8B5CF6', Specialty: '#EC4899' }

function computeTimeline(path, experience, depth) {
  const mult  = EXP_MULTIPLIERS[experience] ?? 1.0
  const limit = DEPTH_LIMITS[depth] ?? path.certs.length
  const certs = path.certs.slice(0, Math.min(limit, path.certs.length))
  const hours = certs.reduce((s, c) => s + c.baseHours * mult, 0)
  const weeks = Math.round(hours / 10)
  return { weeks, months: (weeks / 4.3).toFixed(1), count: certs.length }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }) {
  const steps = ['Experience', 'Focus', 'Goal']
  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', marginBottom: '2rem' }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i < step ? '#00D4AA' : i === step - 1 ? 'linear-gradient(135deg,#00D4AA,#00A884)' : '#e5e7eb',
              border: i === step - 1 ? '2px solid #00A884' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: '700',
              color: i < step || i === step - 1 ? 'white' : '#9ca3af',
              transition: 'all 0.3s',
            }}>
              {i < step - 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.6875rem', color: i < step ? '#00A884' : '#9ca3af', fontWeight: i === step - 1 ? '700' : '500' }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < step - 1 ? '#00D4AA' : '#e5e7eb', borderRadius: '1px', marginBottom: '18px', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function OptionCard({ icon, title, desc, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '0.875rem 1rem',
        background: selected ? 'rgba(0,212,170,0.07)' : 'white',
        border: `2px solid ${selected ? '#00D4AA' : '#e5e7eb'}`,
        borderRadius: '0.75rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = '#00D4AA' }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = '#e5e7eb' }}
    >
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{title}</div>
        <div style={{ color: '#6b7280', fontSize: '0.8125rem', lineHeight: '1.4' }}>{desc}</div>
      </div>
      {selected && (
        <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: '#00D4AA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: '800' }}>✓</span>
        </div>
      )}
    </button>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ answers, onAnswer }) {
  const opts = [
    { value: 'beginner',     icon: '🌱', title: 'Brand New',       desc: 'No cloud or IT background yet' },
    { value: 'it_background',icon: '💻', title: 'IT Background',   desc: 'Systems / IT experience, no AWS yet' },
    { value: 'some_aws',     icon: '☁️', title: 'AWS User',        desc: '~1 year of hands-on AWS experience' },
    { value: 'experienced',  icon: '⚡', title: 'AWS Professional', desc: '2+ years of solid AWS experience' },
  ]
  return (
    <div>
      <div style={{ color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
        STEP 1 OF 3
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A2540', marginBottom: '0.375rem' }}>
        What's your cloud background?
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        This helps us set your starting point and estimate your timeline.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {opts.map(o => (
          <OptionCard key={o.value} {...o} selected={answers.experience === o.value} onClick={() => onAnswer('experience', o.value)} />
        ))}
      </div>
    </div>
  )
}

function Step2({ answers, onAnswer }) {
  const opts = [
    { value: 'architect', icon: '🌩️', title: 'Cloud Architect',    desc: 'I design systems, infrastructure, and cloud architecture' },
    { value: 'devops',    icon: '🛠️', title: 'DevOps / Developer',  desc: 'I build apps, CI/CD pipelines, and automate infrastructure' },
    { value: 'data',      icon: '📊', title: 'Data Engineer',       desc: 'I build data pipelines, ETL workflows, and analytics platforms' },
    { value: 'aiml',      icon: '🤖', title: 'AI / ML Engineer',    desc: 'I build or work with machine learning and AI systems' },
    { value: 'security',  icon: '🔒', title: 'Security Specialist',  desc: 'I handle cloud security, IAM, and compliance' },
    { value: 'network',   icon: '🌐', title: 'Network Specialist',   desc: 'I manage networks, VPCs, and cloud connectivity' },
  ]
  return (
    <div>
      <div style={{ color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
        STEP 2 OF 3
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A2540', marginBottom: '0.375rem' }}>
        What best describes your work?
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        This picks your certification track.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {opts.map(o => (
          <OptionCard key={o.value} {...o} selected={answers.role === o.value} onClick={() => onAnswer('role', o.value)} />
        ))}
      </div>
    </div>
  )
}

function Step3({ answers, onAnswer }) {
  const opts = [
    { value: 'quick',  icon: '🎯', title: 'Quick Win',        desc: 'Just a baseline credential to get started fast' },
    { value: 'role',   icon: '✅', title: 'Fully Validated',  desc: 'Solid technical cert that proves my role expertise' },
    { value: 'senior', icon: '🚀', title: 'Senior-Level',     desc: 'Advanced professional credentials for senior roles' },
    { value: 'expert', icon: '🏆', title: 'Domain Expert',    desc: 'Deep specialty certification — #1 in my domain' },
  ]
  return (
    <div>
      <div style={{ color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.375rem' }}>
        STEP 3 OF 3
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A2540', marginBottom: '0.375rem' }}>
        How far do you want to go?
      </h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        This defines how many certifications are in your path.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {opts.map(o => (
          <OptionCard key={o.value} {...o} selected={answers.depth === o.value} onClick={() => onAnswer('depth', o.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function CertRow({ cert, index, pathColor, visible, blurred, locked }) {
  const levelColor = LEVEL_COLOR[cert.level] ?? '#6366F1'
  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', gap: '0.875rem', alignItems: 'flex-start',
        padding: '0.875rem',
        background: visible ? 'white' : '#f9fafb',
        border: `1px solid ${visible ? '#e5e7eb' : '#f0f0f0'}`,
        borderRadius: '0.75rem',
        filter: blurred ? 'blur(3px)' : locked ? 'blur(5px)' : 'none',
        userSelect: locked || blurred ? 'none' : 'auto',
        transition: 'filter 0.2s',
      }}>
        {/* Step number */}
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
          background: visible ? pathColor : '#e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '0.75rem', fontWeight: '800',
        }}>
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.9rem' }}>{cert.name}</span>
            <span style={{
              padding: '0.125rem 0.5rem', borderRadius: '1rem',
              background: `${levelColor}18`, color: levelColor,
              fontSize: '0.6875rem', fontWeight: '700',
            }}>{cert.level}</span>
          </div>
          {visible && (
            <div style={{ color: '#6b7280', fontSize: '0.8rem', lineHeight: '1.4' }}>{cert.unlocks}</div>
          )}
          {(blurred || locked) && (
            <div style={{ color: '#9ca3af', fontSize: '0.8rem' }}>████████████████████████</div>
          )}
        </div>
        {visible && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>exam</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>${cert.cost}</div>
          </div>
        )}
      </div>
      {/* Lock overlay */}
      {locked && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'white', padding: '0.375rem 0.75rem', borderRadius: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: '0.875rem' }}>🔒</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#374151' }}>Unlock to reveal</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultScreen({ path, timeline, answers, onSignup, onLogin, onBack }) {
  const certsToShow = path.certs.slice(0, DEPTH_LIMITS[answers.depth] ?? path.certs.length)

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)',
        padding: '1.5rem',
        borderRadius: '1.25rem 1.25rem 0 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D4AA', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Path Is Ready</span>
        </div>

        {/* Path name + emoji */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>{path.emoji}</div>
          <div>
            <div style={{ fontSize: '1.375rem', fontWeight: '800', color: 'white', lineHeight: 1.2 }}>{path.name} Path</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{path.tagline}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
          {[
            { label: 'Target Role', value: path.targetRole.split(' / ')[0] },
            { label: 'Avg Salary',  value: path.avgSalary.split('–')[0] + '+' },
            { label: 'Journey',     value: `~${timeline.months} mo` },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '0.625rem', padding: '0.625rem 0.75rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#00D4AA', lineHeight: 1, marginBottom: '0.2rem' }}>{stat.value}</div>
              <div style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.55)', fontWeight: '500' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '1.25rem' }}>

        {/* Cert Journey */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.875rem' }}>Your Certification Journey</span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{certsToShow.length} certs · ~{timeline.weeks} weeks</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certsToShow.map((cert, i) => (
              <CertRow
                key={cert.code}
                cert={cert}
                index={i}
                pathColor={path.color}
                visible={i === 0}
                blurred={i === 1}
                locked={i >= 2}
              />
            ))}
          </div>
        </div>

        {/* Salary teaser */}
        <div style={{
          background: path.accentBg,
          border: `1px solid ${path.accentBorder}`,
          borderRadius: '0.75rem',
          padding: '0.875rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>Target role avg salary</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A2540' }}>{path.avgSalary}</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>{path.jobDemand}</div>
          </div>
          <div style={{ textAlign: 'right', opacity: 0.4 }}>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.25rem' }}>Full career timeline</div>
            <div style={{ fontSize: '0.875rem', background: '#e5e7eb', borderRadius: '0.5rem', padding: '0.25rem 0.75rem', filter: 'blur(3px)', userSelect: 'none' }}>
              █████████████
            </div>
          </div>
        </div>

        {/* ─── CTA Section ─── */}
        {/* Primary: Pay */}
        <button
          onClick={onSignup}
          style={{
            width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
            color: 'white', border: 'none', borderRadius: '0.875rem',
            fontWeight: '800', fontSize: '1.0625rem', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,212,170,0.35)',
            transition: 'all 0.2s', marginBottom: '0.75rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,212,170,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,170,0.35)' }}
        >
          Unlock Full Path + Start Practicing →
        </button>

        {/* Value reminder */}
        <div style={{ textAlign: 'center', marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {['📍 Full path with timeline', '📚 Practice questions', '🔄 Cancel anytime'].map((t, i) => (
            <span key={i} style={{ fontSize: '0.75rem', color: '#6b7280' }}>{t}</span>
          ))}
        </div>

        {/* Secondary: Free */}
        <button
          onClick={() => onSignup('free')}
          style={{
            width: '100%', padding: '0.75rem',
            background: 'white', color: '#0A2540',
            border: '2px solid #e5e7eb',
            borderRadius: '0.75rem', fontWeight: '600', fontSize: '0.9375rem',
            cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1rem',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#0A2540'}
          onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        >
          Start with 10 free questions instead →
        </button>

        {/* Tertiary: Login — intentionally subtle */}
        <p style={{ textAlign: 'center', margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>
          Already a member?{' '}
          <button
            onClick={onLogin}
            style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
          >
            Sign in
          </button>
        </p>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '0.875rem' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
          >
            ← Retake quiz
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function PathFinderModal({ isOpen, onClose, onSignup, onLogin }) {
  const [step, setStep]       = useState(1)
  const [answers, setAnswers] = useState({ experience: null, role: null, depth: null })

  if (!isOpen) return null

  const path     = answers.role     ? PATHS[answers.role]                                       : null
  const timeline = path && answers.experience && answers.depth
    ? computeTimeline(path, answers.experience, answers.depth)
    : null

  const handleAnswer = (key, value) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    // Save progress to localStorage so dashboard can read it
    localStorage.setItem('cloudexamlab_path_answers', JSON.stringify(updated))
    // Auto-advance
    setTimeout(() => {
      if (key === 'experience') setStep(2)
      else if (key === 'role')   setStep(3)
      else if (key === 'depth')  setStep('result')
    }, 180)
  }

  const handleClose = () => {
    setStep(1)
    setAnswers({ experience: null, role: null, depth: null })
    onClose()
  }

  const handleSignup = (mode) => {
    handleClose()
    onSignup(mode)
  }

  const handleLogin = () => {
    handleClose()
    onLogin()
  }

  const isResultStep = step === 'result'

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: isResultStep ? 'white' : 'white',
          borderRadius: '1.25rem',
          maxWidth: isResultStep ? '520px' : '480px',
          width: '100%', maxHeight: '92vh', overflow: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
          position: 'relative',
        }}
      >
        {/* Close button */}
        {!isResultStep && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
              background: '#f3f4f6', border: 'none', color: '#6b7280',
              width: '30px', height: '30px', borderRadius: '50%',
              fontSize: '1.125rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        )}

        {/* Close on result */}
        {isResultStep && (
          <button
            onClick={handleClose}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              width: '30px', height: '30px', borderRadius: '50%',
              fontSize: '1.125rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        )}

        {/* Steps */}
        {!isResultStep && (
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <ProgressBar step={step} />
          </div>
        )}

        <div style={{ padding: isResultStep ? 0 : '0 1.5rem 1.5rem' }}>
          {step === 1 && <Step1 answers={answers} onAnswer={handleAnswer} />}
          {step === 2 && (
            <div>
              <Step2 answers={answers} onAnswer={handleAnswer} />
              <button onClick={() => setStep(1)} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8125rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>← Back</button>
            </div>
          )}
          {step === 3 && (
            <div>
              <Step3 answers={answers} onAnswer={handleAnswer} />
              <button onClick={() => setStep(2)} style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8125rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>← Back</button>
            </div>
          )}
          {isResultStep && path && timeline && (
            <ResultScreen
              path={path}
              timeline={timeline}
              answers={answers}
              onSignup={handleSignup}
              onLogin={handleLogin}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Export path data for Dashboard use
export { PATHS, EXP_MULTIPLIERS, DEPTH_LIMITS, computeTimeline }
