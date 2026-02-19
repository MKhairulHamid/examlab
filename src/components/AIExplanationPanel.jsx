import React, { useState, useRef, useEffect } from 'react'
import supabase from '../services/supabase'

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

const PREDEFINED = [
  {
    key: 'concept_guide',
    label: 'Concept Guide',
    icon: '📖',
    description: 'Learn the concepts behind this question'
  },
  {
    key: 'explanations',
    label: 'Explain Answers',
    icon: '💡',
    description: 'Why each option is correct or incorrect'
  },
  {
    key: 'official_links',
    label: 'Official Links',
    icon: '🔗',
    description: 'Relevant official documentation'
  }
]

export default function AIExplanationPanel({ question, onClose }) {
  const [response, setResponse] = useState(null)
  const [activeType, setActiveType] = useState(null)
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)
  const [error, setError] = useState(null)
  const [customInput, setCustomInput] = useState('')
  const responseRef = useRef(null)

  // Scroll to response when it arrives
  useEffect(() => {
    if (response && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [response])

  const callAI = async (promptType, customQuery = '') => {
    if (!question?.question_item_id) {
      setError('Question ID not available. Please reload the exam.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)
    setActiveType(promptType)
    setCached(false)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('ai-explanation', {
        body: {
          question_id: question.question_item_id,
          prompt_type: promptType,
          custom_query: customQuery || undefined
        }
      })

      if (fnError) throw fnError

      if (data?.error) {
        setError(data.error)
      } else {
        setResponse(data?.response || '')
        setCached(data?.cached || false)
      }
    } catch (err) {
      console.error('AI explanation error:', err)
      setError('Failed to connect to AI service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePredefined = (key) => {
    callAI(key)
  }

  const handleCustomSend = () => {
    const query = customInput.trim()
    if (!query) return
    callAI('custom', query)
    setCustomInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleCustomSend()
    }
  }

  const questionPreview = question?.question
    ? question.question.length > 120
      ? question.question.slice(0, 120) + '…'
      : question.question
    : ''

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
        padding: '0'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #0f2a45 0%, #0a1e32 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '1.25rem 1.25rem 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.5)'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem 0.75rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🤖</span>
            <span style={{ color: 'white', fontWeight: '700', fontSize: '1rem' }}>Ask AI</span>
          </div>
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
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
          >
            ×
          </button>
        </div>

        {/* Question preview */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            lineHeight: '1.5',
            margin: 0
          }}>
            {questionPreview}
          </p>
        </div>

        {/* Predefined quick buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          {PREDEFINED.map(({ key, label, icon }) => {
            const isActive = activeType === key && (loading || response !== null)
            return (
              <button
                key={key}
                onClick={() => handlePredefined(key)}
                disabled={loading}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: '2rem',
                  border: `1px solid ${isActive ? '#00D4AA' : 'rgba(255,255,255,0.2)'}`,
                  background: isActive ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#00D4AA' : 'rgba(255,255,255,0.8)',
                  fontSize: '0.8125rem',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                  opacity: loading && activeType !== key ? 0.5 : 1
                }}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Scrollable response area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1.25rem',
          minHeight: '120px'
        }}>
          {/* Loading state */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1.25rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{
                width: '1.25rem',
                height: '1.25rem',
                border: '2px solid rgba(0,212,170,0.3)',
                borderTop: '2px solid #00D4AA',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                flexShrink: 0
              }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                Generating response…
              </span>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{
              padding: '1rem 1.25rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '0.75rem',
              color: '#fca5a5',
              fontSize: '0.875rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Response */}
          {!loading && response && (
            <div ref={responseRef}>
              {/* Status badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                {PREDEFINED.find(p => p.key === activeType) && (
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.5)',
                    fontWeight: '500'
                  }}>
                    {PREDEFINED.find(p => p.key === activeType)?.icon}{' '}
                    {PREDEFINED.find(p => p.key === activeType)?.label}
                  </span>
                )}
                {cached && (
                  <span style={{
                    fontSize: '0.6875rem',
                    color: '#00D4AA',
                    background: 'rgba(0,212,170,0.12)',
                    border: '1px solid rgba(0,212,170,0.25)',
                    borderRadius: '2rem',
                    padding: '0.1rem 0.5rem',
                    fontWeight: '600'
                  }}>
                    ✓ Cached
                  </span>
                )}
              </div>

              {/* Rendered markdown response */}
              <div style={{
                padding: '1rem 1.125rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                {renderMarkdown(response)}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !response && (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1rem',
              color: 'rgba(255,255,255,0.3)',
              fontSize: '0.875rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
              <p style={{ margin: 0 }}>Select a quick option above or type your own question below.</p>
            </div>
          )}
        </div>

        {/* Free-text input */}
        <div style={{
          padding: '0.75rem 1.25rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          flexShrink: 0
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-end',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '0.75rem',
            padding: '0.5rem 0.5rem 0.5rem 0.875rem',
            transition: 'border-color 0.2s'
          }}>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this question…"
              rows={1}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'white',
                fontSize: '0.875rem',
                resize: 'none',
                lineHeight: '1.5',
                maxHeight: '80px',
                overflow: 'auto',
                fontFamily: 'inherit',
                padding: '0.25rem 0'
              }}
              onInput={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 80) + 'px'
              }}
            />
            <button
              onClick={handleCustomSend}
              disabled={loading || !customInput.trim()}
              style={{
                padding: '0.5rem 0.875rem',
                background: customInput.trim() && !loading
                  ? 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: '0.5rem',
                color: customInput.trim() && !loading ? 'white' : 'rgba(255,255,255,0.3)',
                fontWeight: '600',
                cursor: customInput.trim() && !loading ? 'pointer' : 'not-allowed',
                fontSize: '0.8125rem',
                flexShrink: 0,
                transition: 'all 0.2s'
              }}
            >
              Send
            </button>
          </div>
          <p style={{
            fontSize: '0.6875rem',
            color: 'rgba(255,255,255,0.25)',
            margin: '0.375rem 0 0',
            textAlign: 'center'
          }}>
            Enter to send • Shift+Enter for new line • Custom answers are not cached
          </p>
        </div>
      </div>

      {/* Keyframe for spinner — injected once */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
