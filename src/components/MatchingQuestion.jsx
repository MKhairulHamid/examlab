import React from 'react'

function MatchingQuestion({ options, currentAnswer, onChange }) {
  const leftItems = options.filter(o => o.side === 'left').map(o => o.text)
  const rightItems = options.filter(o => o.side === 'right').map(o => o.text)

  // Parse current answer into a left→right map
  const currentMap = {}
  ;(currentAnswer || []).forEach(pair => {
    const idx = pair.indexOf('|')
    if (idx !== -1) currentMap[pair.slice(0, idx)] = pair.slice(idx + 1)
  })

  const handleSelect = (leftText, rightText) => {
    const newMap = {}
    // Copy existing pairs, removing any duplicate use of the same right item
    Object.entries(currentMap).forEach(([l, r]) => {
      if (r !== rightText) newMap[l] = r
    })
    if (rightText) {
      newMap[leftText] = rightText
    } else {
      delete newMap[leftText]
    }

    const pairs = Object.entries(newMap)
      .filter(([, r]) => r)
      .map(([l, r]) => `${l}|${r}`)
      .sort()
    onChange(pairs)
  }

  const usedRight = new Set(Object.values(currentMap))
  const allMatched = leftItems.length > 0 && leftItems.every(l => currentMap[l])

  return (
    <div className="matching-container">
      <p className="matching-hint">Match each item on the left to its correct pair on the right.</p>
      <div className="matching-rows">
        {leftItems.map(left => {
          const selected = currentMap[left] || ''
          return (
            <div key={left} className={`matching-row ${selected ? 'matching-row-filled' : ''}`}>
              <div className="matching-left-cell">{left}</div>
              <div className="matching-arrow">→</div>
              <select
                value={selected}
                onChange={e => handleSelect(left, e.target.value)}
                className={`matching-select ${selected ? 'matching-select-filled' : ''}`}
              >
                <option value="">Select a match…</option>
                {rightItems.map(right => {
                  const usedElsewhere = usedRight.has(right) && right !== selected
                  return (
                    <option key={right} value={right} disabled={usedElsewhere}>
                      {right}{usedElsewhere ? ' ✓' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          )
        })}
      </div>
      {allMatched && (
        <p className="matching-complete">All items matched — review your selections before moving on.</p>
      )}
    </div>
  )
}

export default MatchingQuestion
