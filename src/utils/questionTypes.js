export const isMultipleResponseQuestion = (t) =>
  t === 'Multiple Response' || t === 'multiple' || t === 'multiple_response'
export const isOrderingQuestion = (t) => t === 'Ordering' || t === 'ordering'
export const isMatchingQuestion = (t) => t === 'Matching' || t === 'matching'

export const getTypeLabel = (t) => {
  if (isOrderingQuestion(t)) return 'Ordering'
  if (isMatchingQuestion(t)) return 'Matching'
  if (isMultipleResponseQuestion(t)) return 'Multiple Response'
  return 'Multiple Choice'
}

// Matching answers are stored as "left|right" strings
export const parsePairs = (arr) => {
  const map = {}
  ;(arr || []).forEach(pair => {
    const idx = String(pair).indexOf('|')
    if (idx !== -1) map[String(pair).slice(0, idx)] = String(pair).slice(idx + 1)
  })
  return map
}
