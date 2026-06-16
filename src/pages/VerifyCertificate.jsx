import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Cloud, ArrowRight, ShieldCheck, AlertCircle, Copy, Check, Share2, BookOpen, FileCheck2,
} from 'lucide-react'
import useAuthStore from '../stores/authStore'
import AuthModal from '../components/auth/AuthModal'
import certificateService from '../services/certificateService'
import CertificateCard from '../components/certificate/CertificateCard'
import { PROGRAMS, getProgram } from '../data/programs'
import useDocumentMeta from '../hooks/useDocumentMeta'

function PublicHeader({ onSignup }) {
  return (
    <header className="header-button">
      <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0">
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00D4AA] to-[#00A884] flex items-center justify-center shadow-[0_2px_8px_rgba(0,212,170,0.4)]">
          <Cloud size={18} className="text-white" strokeWidth={2.4} />
        </span>
        <span className="text-white font-bold text-[0.9375rem] tracking-tight hidden sm:inline">CloudExamLab</span>
      </Link>
      <nav className="header-nav">
        <Link to="/" className="nav-link">All Programs</Link>
      </nav>
      <button type="button" onClick={onSignup} className="header-cta">Login / Sign Up</button>
    </header>
  )
}

function Footer() {
  return (
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
  )
}

/** Builds a LinkedIn "Add to profile" URL for the credential. */
function linkedInAddUrl(cert, verifyUrl) {
  const issued = cert.issuedAt ? new Date(cert.issuedAt) : null
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: `${cert.programName} Proficiency`,
    organizationName: 'Cloud Exam Lab',
    certUrl: verifyUrl,
    certId: cert.credentialCode,
  })
  if (issued) {
    params.set('issueYear', String(issued.getFullYear()))
    params.set('issueMonth', String(issued.getMonth() + 1))
  }
  return `https://www.linkedin.com/profile/add?${params.toString()}`
}

function VerifyCertificate() {
  const { credentialCode } = useParams()
  const { user } = useAuthStore()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const verifyUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    let active = true
    setLoading(true)
    certificateService.getByCode(credentialCode).then((data) => {
      if (active) {
        setCert(data)
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [credentialCode])

  // Owner detection (for the share bar) — only when signed in.
  useEffect(() => {
    let active = true
    if (!user || !cert) { setIsOwner(false); return }
    certificateService.listMine().then((mine) => {
      if (active) setIsOwner(mine.some((c) => c.credentialCode === cert.credentialCode))
    })
    return () => { active = false }
  }, [user, cert])

  const program = cert ? getProgram(cert.programCode) : null

  useDocumentMeta({
    title: cert
      ? `${cert.recipientName} — ${cert.programName} Proficiency | Cloud Exam Lab`
      : 'Verify credential | Cloud Exam Lab',
    description: cert
      ? `Verified Cloud Exam Lab credential: ${cert.recipientName} demonstrated proficiency in ${cert.programName} by completing the study program and passing the final mock exam (${cert.percentageScore}%).`
      : 'Verify a Cloud Exam Lab Proficiency credential.',
    url: verifyUrl,
  })

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  const others = program ? PROGRAMS.filter((p) => p.code !== program.code) : PROGRAMS.slice(0, 4)

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader onSignup={() => setShowAuthModal(true)} />

      <section className="hero-section" style={{ paddingTop: '7rem', paddingBottom: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', alignItems: 'flex-start', minHeight: 'auto' }}>
        <div className="hero-bg-1" />
        <div className="hero-bg-2" />
        <div className="absolute inset-0 grid-texture pointer-events-none" />
        <div className="max-w-[44rem] mx-auto w-full relative z-10">
          {loading ? (
            <div className="text-center py-20">
              <div className="spinner" />
              <p className="text-white/70 mt-4">Verifying credential…</p>
            </div>
          ) : !cert ? (
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-10 text-center backdrop-blur-sm">
              <AlertCircle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
              <h1 className="text-white text-2xl font-bold mb-2">Credential not found</h1>
              <p className="text-white/65 mb-6">
                We couldn't find a credential with the ID <span className="font-mono">{credentialCode}</span>. Check the link and try again.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 text-[#00D4AA] font-semibold no-underline hover:gap-3 transition-all">
                Explore Cloud Exam Lab <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full border border-white/20 bg-white/[0.07] backdrop-blur-sm">
                <ShieldCheck size={15} className="text-[#00D4AA]" />
                <span className="text-white/90 text-sm font-semibold tracking-wide">
                  {cert.revoked ? 'Credential revoked' : 'Verified credential'}
                </span>
              </div>

              <CertificateCard
                program={program || { name: cert.programName, code: cert.programCode }}
                state="earned"
                name={cert.recipientName}
                score={cert.percentageScore}
                credentialCode={cert.credentialCode}
                issuedAt={cert.issuedAt}
              />

              {cert.revoked && (
                <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm text-amber-100">
                  This credential has been revoked and is no longer valid.
                </div>
              )}

              {/* Share bar — owner only */}
              {isOwner && !cert.revoked && (
                <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.06] p-4 backdrop-blur-sm">
                  <span className="text-white/80 text-sm font-semibold">Share your credential</span>
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy link'}
                  </button>
                  <a
                    href={linkedInAddUrl(cert, verifyUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A66C2] px-3 py-1.5 text-sm font-semibold text-white no-underline hover:opacity-90 transition-opacity"
                  >
                    <Share2 size={15} /> Add to LinkedIn
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {cert && !loading && (
        <>
          {/* What this verifies */}
          <section className="py-14 px-6 bg-white">
            <div className="max-w-[44rem] mx-auto">
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-[#00A884] mb-3">What this verifies</p>
              <h2 className="text-2xl font-extrabold text-[#0A2540] tracking-tight mb-5">
                An earned, gated credential — not just a sign-up
              </h2>
              <p className="text-gray-600 text-[1.0625rem] leading-[1.8] mb-6">
                {cert.recipientName} completed the full Cloud Exam Lab study program for{' '}
                <strong>{cert.programName}</strong> and passed the final mock exam with a score of{' '}
                <strong>{cert.percentageScore}%</strong> (70% required to pass).
              </p>
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
                  <BookOpen className="h-5 w-5 text-[#00A884] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0A2540] text-sm">Completed the full study program</div>
                    <div className="text-gray-500 text-sm mt-0.5">
                      {cert.sessionsTotal ? `All ${cert.sessionsTotal} guided study sessions` : 'All guided study sessions'}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
                  <FileCheck2 className="h-5 w-5 text-[#00A884] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-semibold text-[#0A2540] text-sm">Passed the final mock exam</div>
                    <div className="text-gray-500 text-sm mt-0.5">{cert.percentageScore}% · ≥70% required</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Marketing tail */}
          <section className="py-16 px-6 bg-slate-50">
            <div className="max-w-[72rem] mx-auto">
              <div className="text-center mb-10">
                <p className="text-[0.8125rem] font-bold text-[#00A884] uppercase tracking-[0.08em] mb-3">Earn yours</p>
                <h2 className="text-[clamp(1.5rem,3.5vw,2rem)] font-extrabold text-[#0A2540] tracking-tight mb-3">
                  Prepare for AWS certifications with Cloud Exam Lab
                </h2>
                <p className="text-gray-500 text-base max-w-[40rem] mx-auto">
                  Structured study sessions, realistic practice exams, and an earnable Proficiency credential for every program.
                </p>
              </div>
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' }}>
                {(program ? [program, ...others] : others).map((p) => (
                  <Link
                    key={p.code}
                    to={`/${p.code}`}
                    className="block group bg-white rounded-[1.25rem] p-6 border border-gray-200 hover:border-[#00D4AA] hover:shadow-[0_12px_32px_rgba(0,212,170,0.14)] transition-all duration-200 no-underline h-full"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${p.color}14` }}>
                        {p.Icon && <p.Icon size={22} style={{ color: p.color }} strokeWidth={2.2} />}
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
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signup" />
    </div>
  )
}

export default VerifyCertificate
