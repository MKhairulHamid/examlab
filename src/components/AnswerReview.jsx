import React from 'react'
import { isOrderingQuestion, isMatchingQuestion, parsePairs } from '../utils/questionTypes'

const norm = (a) => (a || []).map(s => String(s).trim()).filter(Boolean)

function SubLabel({ children }) {
  return (
    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.55)', fontWeight: 700, margin: '0 0 0.5rem' }}>
      {children}
    </div>
  )
}

function OrderingReview({ userAnswer, correctAnswers }) {
  const u = norm(userAnswer)
  const c = norm(correctAnswers)
  const row = (item, i, ok) => (
    <div key={`${i}-${item}`} style={{
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.5rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.375rem',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
      background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
    }}>
      <span style={{
        minWidth: '1.5rem', height: '1.5rem', borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: ok ? '#10b981' : '#ef4444', color: 'white', fontSize: '0.75rem', fontWeight: 700
      }}>{i + 1}</span>
      <span style={{ color: 'white', fontSize: '0.8125rem', flex: 1, minWidth: 0, lineHeight: 1.4, wordBreak: 'break-word' }}>{item}</span>
      <span style={{ color: ok ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.75rem', flexShrink: 0 }}>{ok ? '✓' : '✗'}</span>
    </div>
  )
  return (
    <div style={{ marginBottom: '1rem' }}>
      <SubLabel>Your Order</SubLabel>
      {u.length === 0 ? (
        <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: '0.75rem' }}>Not answered</div>
      ) : (
        u.map((item, i) => row(item, i, u[i] === c[i]))
      )}
      <div style={{ marginTop: '0.75rem' }}><SubLabel>Correct Order</SubLabel></div>
      {c.map((item, i) => row(item, i, true))}
    </div>
  )
}

function MatchingReview({ question, userAnswer, correctAnswers }) {
  const leftItems = (question.options || []).filter(o => o.side === 'left').map(o => o.text)
  const userMap = parsePairs(userAnswer)
  const correctMap = parsePairs(correctAnswers)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
      {leftItems.map((left, i) => {
        const userR = userMap[left]
        const correctR = correctMap[left]
        const ok = !!userR && userR === correctR
        return (
          <div key={`${i}-${left}`} style={{
            padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
            border: `1px solid ${ok ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
            background: ok ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '0.8125rem' }}>{left}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>→</span>
              <span style={{ color: ok ? '#10b981' : '#ef4444', fontSize: '0.8125rem', fontWeight: 500 }}>
                {userR || '— not matched'}
              </span>
              <span style={{ marginLeft: 'auto', color: ok ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.75rem' }}>{ok ? '✓' : '✗'}</span>
            </div>
            {!ok && (
              <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: '#10b981' }}>
                Correct match: <strong>{correctR}</strong>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ChoiceReview({ question, userAnswer, correctAnswers }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {question.options?.map((option, optIndex) => {
        const optionText = typeof option === 'string' ? option : option.text
        const isUserAnswer = userAnswer.includes(optionText)
        const isCorrectAnswer = correctAnswers.includes(optionText)

        let optionStyle = {
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '0.5rem',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.05)'
        }
        if (isCorrectAnswer) {
          optionStyle.background = 'rgba(16,185,129,0.2)'
          optionStyle.border = '1px solid rgba(16,185,129,0.5)'
        } else if (isUserAnswer && !isCorrectAnswer) {
          optionStyle.background = 'rgba(239,68,68,0.2)'
          optionStyle.border = '1px solid rgba(239,68,68,0.5)'
        }

        return (
          <div key={optIndex} style={optionStyle}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8125rem', flexShrink: 0, marginTop: '0.125rem' }}>
                {String.fromCharCode(65 + optIndex)}.
              </span>
              <span style={{ color: 'white', fontSize: '0.8125rem', flex: 1, minWidth: 0, lineHeight: '1.5', wordBreak: 'break-word' }}>
                {optionText}
              </span>
              {isCorrectAnswer && (
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.6875rem', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                  ✓ Correct
                </span>
              )}
              {isUserAnswer && !isCorrectAnswer && (
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.6875rem', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '0.125rem' }}>
                  ✗ Yours
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnswerReview({ question, userAnswer, correctAnswers }) {
  if (isOrderingQuestion(question.type)) {
    return <OrderingReview userAnswer={userAnswer} correctAnswers={correctAnswers} />
  }
  if (isMatchingQuestion(question.type)) {
    return <MatchingReview question={question} userAnswer={userAnswer} correctAnswers={correctAnswers} />
  }
  return <ChoiceReview question={question} userAnswer={userAnswer} correctAnswers={correctAnswers} />
}
