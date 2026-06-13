import React, { useState, useRef, useEffect } from 'react'
import supabase from '../services/supabase'
import usePurchaseStore from '../stores/purchaseStore'

// Simple markdown-to-JSX renderer (no external dependency required)
function renderMarkdown(text) {
  if (!text) return null

  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.trim().startsWith('```')) {
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(
        <pre key={i} style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.5rem',
          padding: '0.75rem 1rem',
          overflowX: 'auto',
          fontSize: '0.8125rem',
          color: '#00D4AA',
          margin: '0.5rem 0'
        }}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      )
      i++
      continue
    }

    // Heading 3
    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ color: '#00D4AA', fontSize: '0.95rem', fontWeight: '700', margin: '0.75rem 0 0.25rem' }}>{inlineFormat(line.slice(4))}</h3>)
      i++
      continue
    }

    // Heading 2
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ color: '#00D4AA', fontSize: '1rem', fontWeight: '700', margin: '1rem 0 0.25rem' }}>{inlineFormat(line.slice(3))}</h2>)
      i++
      continue
    }

    // Heading 1
    if (line.startsWith('# ')) {
      elements.push(<h2 key={i} style={{ color: '#00D4AA', fontSize: '1.05rem', fontWeight: '700', margin: '1rem 0 0.25rem' }}>{inlineFormat(line.slice(2))}</h2>)
      i++
      continue
    }

    // Bullet list item
    if (line.match(/^[\-\*\•] /)) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>
          <span style={{ color: '#00D4AA', flexShrink: 0, marginTop: '0.1rem' }}>•</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', fontSize: '0.875rem' }}>{inlineFormat(line.slice(2))}</span>
        </div>
      )
      i++
      continue
    }

    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\. (.*)/)
    if (numberedMatch) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>
          <span style={{ color: '#00D4AA', flexShrink: 0, fontWeight: '600', fontSize: '0.875rem', minWidth: '1.25rem' }}>{numberedMatch[1]}.</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.6', fontSize: '0.875rem' }}>{inlineFormat(numberedMatch[2])}</span>
        </div>
      )
      i++
      continue
    }

    // Horizontal rule
    if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.75rem 0' }} />)
      i++
      continue
    }

    // Empty line → spacing
    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: '0.5rem' }} />)
      i++
      continue
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{ color: 'rgba(255,255,255,0.9)', lineHeight: '1.7', fontSize: '0.875rem', margin: '0.25rem 0' }}>
        {inlineFormat(line)}
      </p>
    )
    i++
  }

  return elements
}

// Handle inline formatting: **bold**, *italic*, `code`, and URLs
function inlineFormat(text) {
  if (!text) return ''

  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*/)
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>)
      parts.push(<strong key={key++} style={{ color: 'white', fontWeight: '700' }}>{boldMatch[2]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }

    // Inline code: `code`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`/)
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>)
      parts.push(
        <code key={key++} style={{
          background: 'rgba(0,212,170,0.15)',
          color: '#00D4AA',
          borderRadius: '0.25rem',
          padding: '0.1rem 0.3rem',
          fontSize: '0.8rem',
          fontFamily: 'monospace'
        }}>{codeMatch[2]}</code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }

    // URL: https://...
    const urlMatch = remaining.match(/^(.*?)(https?:\/\/[^\s\)]+)/)
    if (urlMatch) {
      if (urlMatch[1]) parts.push(<span key={key++}>{urlMatch[1]}</span>)
      parts.push(
        <a key={key++} href={urlMatch[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#60a5fa', textDecoration: 'underline', wordBreak: 'break-all' }}>
          {urlMatch[2]}
        </a>
      )
      remaining = remaining.slice(urlMatch[0].length)
      continue
    }

    // No more patterns — output the rest as plain text
    parts.push(<span key={key++}>{remaining}</span>)
    break
  }

  return parts.length > 0 ? parts : text
}

const EXAM_PROMPTS = [
  {
    key: 'concept_guide',
    text: 'Explain the concept I need to answer this question',
  },
  {
    key: 'official_links',
    text: 'Show me the official AWS documentation for this topic',
  }
]

function getMaxRevealSteps(resp) {
  if (!resp) return 0
  if (typeof resp === 'object' && !Array.isArray(resp) && resp.title) {
    return 2 + (resp.key_facts?.length || 0) + (resp.related_concepts?.length || 0)
  }
  if (Array.isArray(resp)) return resp.length
  return 1
}

export default function AIExplanationPanel({ question, onClose }) {
  const isSubscribed = usePurchaseStore((s) => s.isSubscribed)

  const [response, setResponse] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState(null)
  const [errorCode, setErrorCode] = useState(null)
  const [revealStep, setRevealStep] = useState(0)
  const [sentPrompt, setSentPrompt] = useState(null)
  const [previewExpanded, setPreviewExpanded] = useState(true)
  const responseRef = useRef(null)

  // Reset when question changes
  useEffect(() => {
    setResponse(null)
    setActiveType(null)
    setLoading(false)
    setCached(false)
    setError(null)
    setErrorCode(null)
    setRevealStep(0)
    setSentPrompt(null)
    setPreviewExpanded(true)
  }, [question?.question_item_id])

  // Auto-collapse question preview when response arrives
  useEffect(() => {
    if (response) setPreviewExpanded(false)
  }, [response])

  // Start typewriter reveal after response arrives
  useEffect(() => {
    if (response === null) {
      setRevealStep(0)
      return
    }
    const t = setTimeout(() => setRevealStep(1), 60)
    return () => clearTimeout(t)
  }, [response])

  // Increment reveal step with stagger
  useEffect(() => {
    if (!response || revealStep === 0) return
    const maxSteps = getMaxRevealSteps(response)
    if (revealStep >= maxSteps) return
    const t = setTimeout(() => setRevealStep((s) => s + 1), 160)
    return () => clearTimeout(t)
  }, [response, revealStep])

  // Scroll response into view when it arrives
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [response])

  const callAI = async (promptType) => {
    if (!question?.question_item_id) {
      setError('Question ID not available. Please reload the exam.')
      setErrorCode(null)
      return
    }

    // DB-level cache check
    if (question.ai_cache?.[promptType]) {
      setResponse(question.ai_cache[promptType])
      setActiveType(promptType)
      setCached(true)
      setError(null)
      setErrorCode(null)
      return
    }

    setLoading(true)
    setError(null)
    setErrorCode(null)
    setResponse(null)
    setActiveType(promptType)
    setCached(false)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-explanation', {
        body: {
          question_id: question.question_item_id,
          prompt_type: promptType,
        }
      })

      if (fnError) throw fnError

      if (data?.error) {
        setError(data.error)
        setErrorCode(data?.code || null)
      } else {
        const text = data?.response || ''
        setResponse(text)
        setCached(data?.cached || false)
        if (text && question.ai_cache) {
          question.ai_cache[promptType] = text
        }
      }
    } catch (err) {
      console.error('AI explanation error:', err)
      setError('Failed to connect to AI service. Please try again.')
      setErrorCode(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSendPrompt = (prompt) => {
    setSentPrompt(prompt)
    callAI(prompt.key)
  }

  const questionPreview = question?.question
    ? question.question.length > 200
      ? question.question.slice(0, 200) + '…'
      : question.question
    : ''

  const renderResponse = () => {
    if (!response) return null

    // concept_guide — object with title + summary
    if (typeof response === 'object' && !Array.isArray(response) && response.title && response.summary) {
      const keyFactsCount = response.key_facts?.length || 0
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {revealStep >= 1 && (
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: '0.75rem', animation: 'lgFadeIn 0.3s ease' }}>
              <span style={{ color: '#00D4AA', fontWeight: '700', fontSize: '0.9375rem' }}>{response.title}</span>
            </div>
          )}
          {revealStep >= 2 && (
            <div style={{ padding: '1rem 1.125rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)', animation: 'lgFadeIn 0.3s ease' }}>
              <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: '1.7', fontSize: '0.875rem', margin: 0 }}>{response.summary}</p>
            </div>
          )}
          {Array.isArray(response.key_facts) && response.key_facts.length > 0 && (
            <div style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Key Facts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {response.key_facts.map((fact, idx) => revealStep >= 3 + idx ? (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', animation: 'lgFadeIn 0.3s ease' }}>
                    <span style={{ color: '#00D4AA', flexShrink: 0, marginTop: '0.2rem', fontSize: '0.75rem' }}>▸</span>
                    <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.8125rem', lineHeight: '1.6' }}>{fact}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
          {Array.isArray(response.related_concepts) && response.related_concepts.length > 0 && (
            <div style={{ padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.6875rem', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Related Concepts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {response.related_concepts.map((concept, idx) => revealStep >= 3 + keyFactsCount + idx ? (
                  <div key={idx} style={{ display: 'flex', gap: '0.625rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.07)', animation: 'lgFadeIn 0.3s ease' }}>
                    <span style={{ color: '#60a5fa', fontWeight: '600', fontSize: '0.8125rem', flexShrink: 0, minWidth: '8rem' }}>{concept.name}</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', lineHeight: '1.5' }}>{concept.description}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}
        </div>
      )
    }

    // official_links — array
    if (Array.isArray(response)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {response.map((link, idx) => revealStep >= idx + 1 ? (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem 1rem', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '0.625rem', color: '#93c5fd', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500', transition: 'all 0.2s', animation: 'lgFadeIn 0.3s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.15)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(96,165,250,0.08)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)' }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔗</span>
              <span style={{ flex: 1 }}>{link.title}</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6, flexShrink: 0 }}>↗</span>
            </a>
          ) : null)}
        </div>
      )
    }

    // Plain string fallback
    return (
      <div style={{ padding: '1rem 1.125rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
        {renderMarkdown(typeof response === 'string' ? response : JSON.stringify(response, null, 2))}
      </div>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="lg-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'linear-gradient(180deg, #0f2a45 0%, #0a1e32 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '1.25rem 1.25rem 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header — always visible, never scrolled */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0
        }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>Learning Guide</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '1.125rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ×
          </button>
        </div>

        {/* Question preview — collapsible */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          <button
            onClick={() => setPreviewExpanded((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.45rem 1.25rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.35)',
              fontSize: '0.7rem',
              fontWeight: '500',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              gap: '0.5rem'
            }}
          >
            <span>Question</span>
            <span style={{
              fontSize: '0.65rem',
              transition: 'transform 0.2s',
              transform: previewExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              display: 'inline-block'
            }}>▼</span>
          </button>
          {previewExpanded && (
            <div style={{ padding: '0 1.25rem 0.625rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontStyle: 'italic', lineHeight: '1.5', margin: 0 }}>
                {questionPreview}
              </p>
            </div>
          )}
        </div>

        {/* Chat messages area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.25rem',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {/* No question sent yet */}
          {!sentPrompt && !loading && !error && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem 0',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '0.8125rem',
              textAlign: 'center'
            }}>
              Tap a question below to get started
            </div>
          )}

          {/* Sent user message bubble */}
          {sentPrompt && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                borderRadius: '1rem 1rem 0.25rem 1rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '500',
                lineHeight: '1.5'
              }}>
                {sentPrompt.text}
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.25rem 1rem 1rem 1rem',
              maxWidth: '6rem'
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#00D4AA',
                  animation: `lgDot 1.2s ${i * 0.2}s infinite ease-in-out`
                }} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              padding: '1rem 1.25rem',
              background: errorCode === 'upgrade_required'
                ? 'rgba(245,158,11,0.1)'
                : errorCode === 'rate_limit_exceeded'
                  ? 'rgba(139,92,246,0.1)'
                  : 'rgba(239,68,68,0.1)',
              border: `1px solid ${
                errorCode === 'upgrade_required'
                  ? 'rgba(245,158,11,0.3)'
                  : errorCode === 'rate_limit_exceeded'
                    ? 'rgba(139,92,246,0.3)'
                    : 'rgba(239,68,68,0.25)'
              }`,
              borderRadius: '0.75rem',
              fontSize: '0.875rem'
            }}>
              {errorCode === 'upgrade_required' ? (
                <div>
                  <div style={{ color: '#fcd34d', fontWeight: '600', marginBottom: '0.375rem' }}>
                    🔒 Premium Feature
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
                    {error}
                  </div>
                  <a
                    href="/pricing"
                    style={{
                      display: 'inline-block',
                      padding: '0.4rem 1rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      fontWeight: '600',
                      fontSize: '0.8125rem',
                      textDecoration: 'none'
                    }}
                  >
                    Upgrade Now →
                  </a>
                </div>
              ) : errorCode === 'rate_limit_exceeded' ? (
                <div>
                  <div style={{ color: '#c4b5fd', fontWeight: '600', marginBottom: '0.375rem' }}>
                    ⏱ Daily Limit Reached
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)' }}>{error}</div>
                </div>
              ) : errorCode === 'content_not_ready' ? (
                <div>
                  <div style={{ color: '#67e8f9', fontWeight: '600', marginBottom: '0.375rem' }}>
                    🕐 Explanation Coming Soon
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Our team is preparing this explanation. Please check back soon.
                  </div>
                </div>
              ) : (
                <span style={{ color: '#fca5a5' }}>⚠️ {error}</span>
              )}
            </div>
          )}

          {/* AI response with typewriter reveal */}
          {!loading && response && (
            <div ref={responseRef}>
              {renderResponse()}
            </div>
          )}
        </div>

        {/* Pre-typed question suggestions */}
        <div style={{
          padding: '0.75rem 1.25rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {EXAM_PROMPTS.map((prompt) => {
            const isSent = sentPrompt?.key === prompt.key
            return (
              <button
                key={prompt.key}
                onClick={() => !isSent && !loading && handleSendPrompt(prompt)}
                disabled={loading || isSent}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: isSent ? 'rgba(14,165,233,0.06)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSent ? 'rgba(14,165,233,0.2)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: '0.75rem',
                  color: isSent ? 'rgba(147,197,253,0.4)' : 'rgba(255,255,255,0.78)',
                  cursor: loading || isSent ? 'default' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'all 0.2s',
                  opacity: isSent ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading && !isSent) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.09)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSent) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                <span>{prompt.text}</span>
                {isSent
                  ? <span style={{ color: 'rgba(147,197,253,0.35)', fontSize: '0.6875rem', flexShrink: 0 }}>sent</span>
                  : <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '1rem', flexShrink: 0 }}>↑</span>
                }
              </button>
            )
          })}
        </div>
      </div>

      <style>{`
        .lg-sheet {
          height: calc(100vh - 1rem);
          height: calc(100dvh - 1rem);
          max-height: calc(100vh - 1rem);
          max-height: calc(100dvh - 1rem);
        }
        @keyframes lgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lgDot {
          0%, 80%, 100% { transform: scale(0.5); opacity: 0.3; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  )
}
