import React, { useState } from 'react'

// ─── Path Data ────────────────────────────────────────────────────────────────
const PATHS = {
  architect: {
    key: 'architect',
    name: 'Cloud Architect',
    emoji: '🌩️',
    tagline: 'Design resilient, cost-optimized AWS architectures at enterprise scale.',
    currentRole: 'Systems / Infrastructure Designer',
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
    currentRole: 'Developer / Operations Engineer',
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
      { code: 'DVA-C02', name: 'Developer – Associate', level: 'Associate', baseHours: 100, cost: 150, unlocks: 'Cloud Developer · CI/CD · Lambda · (or CloudOps for ops-first roles)' },
      { code: 'DOP-C02', name: 'DevOps Engineer – Professional', level: 'Professional', baseHours: 175, cost: 300, unlocks: 'Senior DevOps · $151K avg salary · Platform Engineer' },
      { code: 'SCS-C02', name: 'Security – Specialty', level: 'Specialty', baseHours: 140, cost: 300, unlocks: 'DevSecOps · Security automation · Highest-paying specialty (+73% demand)' },
    ],
  },
  data: {
    key: 'data',
    name: 'Data Engineer',
    emoji: '📊',
    tagline: 'Build data pipelines, data lakes, and analytics platforms on AWS.',
    currentRole: 'Data / Analytics Engineer',
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
    currentRole: 'ML / AI Developer',
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
      { code: 'SCS-C02', name: 'Security – Specialty', level: 'Specialty', baseHours: 140, cost: 300, unlocks: 'Secure ML/AI workloads · Data governance · Compliance' },
    ],
  },
  security: {
    key: 'security',
    name: 'Security Specialist',
    emoji: '🔒',
    tagline: 'Secure AWS environments at scale — IAM, encryption, threat detection, compliance.',
    currentRole: 'Security / Compliance Analyst',
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
    currentRole: 'Network Engineer',
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

// AWS familiarity drives the study-hour multiplier (replaces the old single "experience" question)
const FAMILIARITY_MULTIPLIERS = { never: 1.0, a_little: 0.75, regularly: 0.5, extensively: 0.35 }
// Kept for backward compatibility with Dashboard's `experience` key
const EXP_MULTIPLIERS = { beginner: 1.0, it_background: 0.75, some_aws: 0.5, experienced: 0.35 }
const FAMILIARITY_TO_EXP = { never: 'beginner', a_little: 'it_background', regularly: 'some_aws', extensively: 'experienced' }
const DEPTH_LIMITS    = { quick: 1, role: 2, senior: 3, expert: 4 }
const LEVEL_COLOR     = { Foundational: '#6366F1', Associate: '#0EA5E9', Professional: '#8B5CF6', Specialty: '#EC4899' }

// Readable labels for the user's current role (separate from their aspiring path).
const CURRENT_ROLE_LABELS = {
  software_dev: 'Software Developer',
  sysadmin:     'SysAdmin / Ops Engineer',
  data:         'Data / Analytics',
  security:     'Security / Compliance',
  network:      'Network Engineer',
  aiml:         'AI / ML Practitioner',
  student:      'Student',
  other:        'Career Changer',
}

// A user is "past foundation" if they already hold an AWS cert or use AWS extensively.
function isPastFoundation({ existingCerts, awsFamiliarity }) {
  return ['aws_foundational', 'aws_associate', 'aws_pro'].includes(existingCerts) || awsFamiliarity === 'extensively'
}

// Returns the certs that make up the user's journey, after dropping the foundation cert if they're past it.
function journeyCerts(path, depth, skipFoundation) {
  const limit = DEPTH_LIMITS[depth] ?? path.certs.length
  let certs = path.certs.slice(0, Math.min(limit, path.certs.length))
  if (skipFoundation && certs.length > 1 && certs[0].level === 'Foundational') {
    certs = certs.slice(1)
  }
  return certs
}

// experience: one of EXP_MULTIPLIERS keys. hoursPerWeek defaults to 10. skipFoundation drops the Foundational cert.
function computeTimeline(path, experience, depth, hoursPerWeek = 10, skipFoundation = false) {
  const mult  = EXP_MULTIPLIERS[experience] ?? 1.0
  const hpw   = hoursPerWeek > 0 ? hoursPerWeek : 10
  const certs = journeyCerts(path, depth, skipFoundation)
  const hours = certs.reduce((s, c) => s + c.baseHours * mult, 0)
  const weeks = Math.max(1, Math.round(hours / hpw))
  // Per-cert cumulative week markers
  let cumulative = 0
  const markers = certs.map(c => {
    cumulative += Math.max(1, Math.round((c.baseHours * mult) / hpw))
    return cumulative
  })
  return { weeks, months: (weeks / 4.3).toFixed(1), count: certs.length, certs, markers }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Role', 'Path', 'Experience', 'AWS', 'Certs', 'Goal', 'Depth', 'Timeline', 'Hours']
const TOTAL_STEPS = STEP_LABELS.length

function ProgressBar({ step }) {
  const pct = Math.round((step / TOTAL_STEPS) * 100)
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ color: '#00A884', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
        </span>
        <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: '600' }}>{pct}%</span>
      </div>
      <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#00D4AA,#00A884)', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
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
      {icon && <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{icon}</span>}
      <div>
        <div style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.9375rem', marginBottom: desc ? '0.125rem' : 0 }}>{title}</div>
        {desc && <div style={{ color: '#6b7280', fontSize: '0.8125rem', lineHeight: '1.4' }}>{desc}</div>}
      </div>
      {selected && (
        <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: '#00D4AA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontSize: '0.625rem', fontWeight: '800' }}>✓</span>
        </div>
      )}
    </button>
  )
}

function QuestionStep({ title, subtitle, options, value, optKey, onAnswer, gap = '0.625rem' }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0A2540', marginBottom: '0.375rem' }}>{title}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.25rem' }}>{subtitle}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap }}>
        {options.map(o => (
          <OptionCard key={o.value} icon={o.icon} title={o.title} desc={o.desc}
            selected={value === o.value} onClick={() => onAnswer(optKey, o.value)} />
        ))}
      </div>
    </div>
  )
}

// ─── Question definitions ───────────────────────────────────────────────────

const QUESTIONS = {
  currentRole: {
    title: "What's your current role?",
    subtitle: 'Where you are today — this is your starting point, not your destination.',
    optKey: 'currentRole',
    options: [
      { value: 'software_dev', icon: '👨‍💻', title: 'Software Developer',    desc: 'I write code and build applications' },
      { value: 'sysadmin',     icon: '🖥️', title: 'SysAdmin / Ops',         desc: 'I manage servers, infrastructure, and operations' },
      { value: 'data',         icon: '📊', title: 'Data / Analytics',       desc: 'I work with data pipelines and analytics' },
      { value: 'security',     icon: '🔒', title: 'Security / Compliance',   desc: 'I handle security, IAM, or compliance' },
      { value: 'network',      icon: '🌐', title: 'Network Engineer',        desc: 'I manage networks and connectivity' },
      { value: 'aiml',         icon: '🤖', title: 'AI / ML Practitioner',    desc: 'I work with ML or AI systems' },
      { value: 'student',      icon: '🎓', title: 'Student / New to Tech',   desc: 'Just getting started in tech' },
      { value: 'other',        icon: '💼', title: 'Other / Non-technical',   desc: 'Business, management, or switching fields' },
    ],
    gap: '0.5rem',
  },
  role: {
    title: 'Which direction do you want to grow?',
    subtitle: "Your aspiring future — pick the role you're aiming for. (A developer can target Architect or DevOps.)",
    optKey: 'role',
    options: [
      { value: 'architect', icon: '🌩️', title: 'Cloud Architect',     desc: 'Design resilient, cost-optimized cloud systems' },
      { value: 'devops',    icon: '🛠️', title: 'DevOps Engineer',      desc: 'Build CI/CD, automate infra, ship & operate apps' },
      { value: 'data',      icon: '📊', title: 'Data Engineer',        desc: 'Build data pipelines and analytics platforms' },
      { value: 'aiml',      icon: '🤖', title: 'AI / ML Engineer',     desc: 'Build ML systems and generative AI on AWS' },
      { value: 'security',  icon: '🔒', title: 'Security Specialist',   desc: 'Secure cloud at scale — IAM, threat detection' },
      { value: 'network',   icon: '🌐', title: 'Network Specialist',    desc: 'Design hybrid and cloud-native networks' },
    ],
    gap: '0.5rem',
  },
  years: {
    title: 'How many years of professional experience do you have?',
    subtitle: 'Counts your total time in tech, not just on AWS.',
    optKey: 'years',
    options: [
      { value: '0_1',  icon: '🌱', title: '0–1 years',  desc: 'Just getting started or studying' },
      { value: '2_4',  icon: '💼', title: '2–4 years',  desc: 'Solid working experience' },
      { value: '5_9',  icon: '📈', title: '5–9 years',  desc: 'Seasoned professional' },
      { value: '10p',  icon: '⭐', title: '10+ years',  desc: 'Senior / lead level' },
    ],
  },
  awsFamiliarity: {
    title: 'How familiar are you with AWS?',
    subtitle: 'This sets your starting point and study estimate.',
    optKey: 'awsFamiliarity',
    options: [
      { value: 'never',       icon: '🌱', title: 'Never used it',   desc: 'New to AWS' },
      { value: 'a_little',    icon: '💻', title: 'Used it a little', desc: 'Tried a few services' },
      { value: 'regularly',   icon: '☁️', title: 'Use it regularly', desc: '~1 year hands-on' },
      { value: 'extensively', icon: '⚡', title: 'Use it extensively', desc: '2+ years hands-on' },
    ],
  },
  existingCerts: {
    title: 'Do you already hold any certifications?',
    subtitle: "We'll skip what you've already earned.",
    optKey: 'existingCerts',
    options: [
      { value: 'none',             icon: '📭', title: 'None yet',           desc: 'Starting fresh' },
      { value: 'aws_foundational', icon: '🥉', title: 'AWS Foundational',   desc: 'Cloud Practitioner or AI Practitioner' },
      { value: 'aws_associate',    icon: '🥈', title: 'AWS Associate',      desc: 'SAA, DVA, SOA, DEA, or MLA' },
      { value: 'aws_pro',          icon: '🥇', title: 'AWS Pro / Specialty', desc: 'Professional or Specialty level' },
      { value: 'other_cloud',      icon: '🔷', title: 'Other cloud certs',  desc: 'Azure, GCP, or similar' },
    ],
    gap: '0.5rem',
  },
  goal: {
    title: "What's your primary goal?",
    subtitle: 'This shapes how we frame your journey.',
    optKey: 'goal',
    options: [
      { value: 'higher_pay',    icon: '💰', title: 'Get a higher-paying job', desc: 'Increase my earning potential' },
      { value: 'promotion',     icon: '🚀', title: 'Get promoted',            desc: 'Advance at my current company' },
      { value: 'career_change', icon: '🔄', title: 'Change careers',          desc: 'Move into cloud from another field' },
      { value: 'requirement',   icon: '📋', title: 'Meet a requirement',      desc: 'My employer or project needs it' },
      { value: 'validate',      icon: '✅', title: 'Validate my skills',      desc: 'Prove what I already know' },
    ],
    gap: '0.5rem',
  },
  depth: {
    title: 'How far do you want to go?',
    subtitle: 'This defines how many certifications are in your path.',
    optKey: 'depth',
    options: [
      { value: 'quick',  icon: '🎯', title: 'Quick Win',       desc: 'A baseline credential to get started fast' },
      { value: 'role',   icon: '✅', title: 'Fully Validated', desc: 'A solid cert that proves my role expertise' },
      { value: 'senior', icon: '🚀', title: 'Senior-Level',    desc: 'Advanced credentials for senior roles' },
      { value: 'expert', icon: '🏆', title: 'Domain Expert',   desc: 'Deep specialty — #1 in my domain' },
    ],
  },
  targetTimeline: {
    title: 'When do you want to be certified?',
    subtitle: 'We use this to set a realistic pace.',
    optKey: 'targetTimeline',
    options: [
      { value: 'under_3',  icon: '🔥', title: 'Under 3 months', desc: 'I want to move fast' },
      { value: '3_6',      icon: '📅', title: '3–6 months',      desc: 'A steady, focused pace' },
      { value: '6_12',     icon: '🗓️', title: '6–12 months',     desc: 'Spread out alongside work' },
      { value: 'flexible', icon: '🌊', title: 'Flexible',        desc: 'No fixed deadline' },
    ],
  },
  hoursPerWeek: {
    title: 'How many hours per week can you study?',
    subtitle: 'This calculates your personal timeline.',
    optKey: 'hoursPerWeek',
    options: [
      { value: 5,  icon: '🐢', title: '~5 hours',  desc: 'Casual — alongside a busy schedule' },
      { value: 10, icon: '🚶', title: '~10 hours', desc: 'Part-time — evenings & weekends' },
      { value: 15, icon: '🏃', title: '~15 hours', desc: 'Committed — a daily habit' },
      { value: 20, icon: '⚡', title: '20+ hours', desc: 'Intensive — bootcamp pace' },
    ],
  },
}

// Order steps are shown in (region is captured passively, not as a blocking step)
const STEP_ORDER = ['currentRole', 'role', 'years', 'awsFamiliarity', 'existingCerts', 'goal', 'depth', 'targetTimeline', 'hoursPerWeek']

// ─── Result Screen ────────────────────────────────────────────────────────────

function CertRow({ cert, index, pathColor, weekMarker, visible, blurred, locked }) {
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
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ready in</div>
            <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#374151' }}>~{weekMarker} wks</div>
          </div>
        )}
      </div>
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

function ResultScreen({ path, timeline, answers, onStartFree, onSubscribe, onBack }) {
  const certs = timeline.certs
  const firstCert = certs[0]

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', padding: '1.5rem', borderRadius: '1.25rem 1.25rem 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D4AA', animation: 'pulse 2s infinite' }} />
          <span style={{ color: '#00D4AA', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Cloud Certification Journey</span>
        </div>

        {/* Role transformation line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.65)' }}>
            {CURRENT_ROLE_LABELS[answers.currentRole] || path.currentRole}
          </div>
          <div style={{ color: '#00D4AA', fontSize: '1rem' }}>→</div>
          <div style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'white' }}>
            {path.targetRole.split(' / ')[0]}
          </div>
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
            { label: 'Target Salary', value: path.avgSalary.split('–')[0] + '+' },
            { label: 'Certs',         value: `${timeline.count}` },
            { label: 'Journey',       value: `~${timeline.months} mo` },
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
        {/* Promise line */}
        <div style={{ background: path.accentBg, border: `1px solid ${path.accentBorder}`, borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#0A2540', fontWeight: '600', lineHeight: 1.5 }}>
            In <strong>~{timeline.months} months</strong> at your pace, you could be earning <strong>{path.avgSalary}</strong> as a {path.targetRole.split(' / ')[0]}.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.375rem' }}>{path.jobDemand}</div>
        </div>

        {/* Cert Journey */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: '700', color: '#0A2540', fontSize: '0.875rem' }}>Your Certification Sequence</span>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{timeline.count} certs · ~{timeline.weeks} weeks</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {certs.map((cert, i) => (
              <CertRow
                key={cert.code}
                cert={cert}
                index={i}
                pathColor={path.color}
                weekMarker={timeline.markers[i]}
                visible={i === 0}
                blurred={i === 1}
                locked={i >= 2}
              />
            ))}
          </div>
        </div>

        {/* Primary CTA: start free on the first cert */}
        <button
          onClick={onStartFree}
          style={{
            width: '100%', padding: '1rem',
            background: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)',
            color: 'white', border: 'none', borderRadius: '0.875rem',
            fontWeight: '800', fontSize: '1.0625rem', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,212,170,0.35)', transition: 'all 0.2s', marginBottom: '0.75rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,212,170,0.45)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,170,0.35)' }}
        >
          Try 10 free questions on {firstCert.name} →
        </button>

        {/* Secondary CTA: subscribe */}
        <button
          onClick={onSubscribe}
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
          Unlock my full journey — subscribe →
        </button>

        <div style={{ textAlign: 'center' }}>
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

const STORAGE_KEY = 'cloudexamlab_path_answers'

const INITIAL_ANSWERS = {
  currentRole: null, role: null, years: null, awsFamiliarity: null, existingCerts: null,
  goal: null, depth: null, targetTimeline: null, hoursPerWeek: null,
}

// onStartFree(answers) — route user to the foundation/first-cert free sample.
// onSubscribe(answers) — open enrollment/subscription.
export default function CloudCertificationJourneyModal({ isOpen, onClose, onStartFree, onSubscribe }) {
  const [step, setStep]       = useState(1)
  const [answers, setAnswers] = useState(INITIAL_ANSWERS)

  if (!isOpen) return null

  const path     = answers.role ? PATHS[answers.role] : null
  const skipFoundation = isPastFoundation(answers)
  const experience = FAMILIARITY_TO_EXP[answers.awsFamiliarity] ?? 'beginner'
  const timeline = path && answers.depth && answers.hoursPerWeek
    ? computeTimeline(path, experience, answers.depth, answers.hoursPerWeek, skipFoundation)
    : null

  const persist = (data) => {
    // Persist new keys + a derived `experience` key for backward compatibility.
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      experience: FAMILIARITY_TO_EXP[data.awsFamiliarity] ?? 'beginner',
      skipFoundation: isPastFoundation(data),
      completed: data.hoursPerWeek != null,
    }))
  }

  const handleAnswer = (key, value) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    persist(updated)
    setTimeout(() => {
      if (step < TOTAL_STEPS) setStep(step + 1)
      else setStep('result')
    }, 180)
  }

  const reset = () => {
    setStep(1)
    setAnswers(INITIAL_ANSWERS)
  }

  const handleClose = () => { onClose() }

  const isResultStep = step === 'result'
  const currentKey = !isResultStep ? STEP_ORDER[step - 1] : null
  const q = currentKey ? QUESTIONS[currentKey] : null

  return (
    <div
      onClick={handleClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: '1.25rem',
          maxWidth: isResultStep ? '520px' : '480px',
          width: '100%', maxHeight: '92vh', overflow: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)', position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem', zIndex: 10,
            background: isResultStep ? 'rgba(255,255,255,0.15)' : '#f3f4f6',
            border: 'none', color: isResultStep ? 'white' : '#6b7280',
            width: '30px', height: '30px', borderRadius: '50%',
            fontSize: '1.125rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >×</button>

        {/* Steps */}
        {!isResultStep && (
          <div style={{ padding: '1.5rem 1.5rem 0' }}>
            <ProgressBar step={step} />
          </div>
        )}

        <div style={{ padding: isResultStep ? 0 : '0 1.5rem 1.5rem' }}>
          {!isResultStep && q && (
            <div>
              <QuestionStep
                title={q.title}
                subtitle={q.subtitle}
                options={q.options}
                value={answers[q.optKey]}
                optKey={q.optKey}
                onAnswer={handleAnswer}
                gap={q.gap}
              />
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8125rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                >← Back</button>
              )}
            </div>
          )}
          {isResultStep && path && timeline && (
            <ResultScreen
              path={path}
              timeline={timeline}
              answers={answers}
              onStartFree={() => { onStartFree && onStartFree({ ...answers, skipFoundation, path: path.key }) }}
              onSubscribe={() => { onSubscribe && onSubscribe({ ...answers, skipFoundation, path: path.key }) }}
              onBack={() => setStep(TOTAL_STEPS)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Export path data + helpers for Dashboard use
export { PATHS, EXP_MULTIPLIERS, DEPTH_LIMITS, CURRENT_ROLE_LABELS, FAMILIARITY_TO_EXP, computeTimeline, isPastFoundation, journeyCerts }
