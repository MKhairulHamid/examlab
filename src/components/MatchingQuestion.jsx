import React, { useState } from 'react'
import { X } from 'lucide-react'

// Colorblind-safe-ish palette; pairs are also distinguished by a number badge.
const PAIR_COLORS = [
  '#2563eb', '#16a34a', '#d97706', '#9333ea',
  '#dc2626', '#0891b2', '#ca8a04', '#db2777',
  '#4f46e5', '#0d9488',
]

function MatchingQuestion({ options, currentAnswer, onChange }) {
  const leftItems = options.filter(o => o.side === 'left').map(o => o.text)
  const rightItems = options.filter(o => o.side === 'right').map(o => o.text)

  const [activeLeft, setActiveLeft] = useState(null)

  // Parse current answer into a left→right map
  const currentMap = {}
  ;(currentAnswer || []).forEach(pair => {
    const idx = pair.indexOf('|')
    if (idx !== -1) currentMap[pair.slice(0, idx)] = pair.slice(idx + 1)
  })
  const rightToLeft = {}
  Object.entries(currentMap).forEach(([l, r]) => { rightToLeft[r] = l })

  // Stable pair number/color keyed off the left item's position
  const pairMeta = {}
  leftItems.forEach((l, i) => {
    pairMeta[l] = { num: i + 1, color: PAIR_COLORS[i % PAIR_COLORS.length] }
  })

  const commit = (map) => {
    const pairs = Object.entries(map)
      .filter(([, r]) => r)
      .map(([l, r]) => `${l}|${r}`)
      .sort()
    onChange(pairs)
  }

  const selectLeft = (left) => {
    setActiveLeft(prev => (prev === left ? null : left))
  }

  const selectRight = (right) => {
    if (activeLeft === null) {
      // No left selected: tapping a matched right unpairs it for quick correction
      const owner = rightToLeft[right]
      if (owner) {
        const map = { ...currentMap }
        delete map[owner]
        commit(map)
      }
      return
    }
    const map = { ...currentMap }
    // A right item can only belong to one left — release it from any prior owner
    Object.keys(map).forEach(l => { if (map[l] === right) delete map[l] })
    map[activeLeft] = right
    commit(map)
    setActiveLeft(null)
  }

  const unpairLeft = (e, left) => {
    e.stopPropagation()
    const map = { ...currentMap }
    delete map[left]
    commit(map)
    if (activeLeft === left) setActiveLeft(null)
  }

  const matchedCount = leftItems.filter(l => currentMap[l]).length
  const allMatched = leftItems.length > 0 && matchedCount === leftItems.length

  return (
    <div className="matching-container">
      <p className="matching-hint">
        {activeLeft
          ? 'Now tap its match in the right column.'
          : 'Tap an item on the left, then tap its match on the right.'}
      </p>

      <div className="matching-grid">
        {/* Left column — the prompts */}
        <div className="matching-col">
          <span className="matching-col-label">Items</span>
          {leftItems.map(left => {
            const matched = currentMap[left]
            const meta = pairMeta[left]
            const isActive = activeLeft === left
            return (
              <button
                type="button"
                key={left}
                className={`matching-card matching-card-left ${isActive ? 'matching-card-active' : ''} ${matched ? 'matching-card-matched' : ''}`}
                style={matched ? { borderColor: meta.color } : undefined}
                onClick={() => selectLeft(left)}
              >
                {matched && (
                  <span className="matching-badge" style={{ background: meta.color }}>
                    {meta.num}
                  </span>
                )}
                <span className="matching-card-text">{left}</span>
                {matched && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="matching-unpair"
                    aria-label="Remove match"
                    onClick={e => unpairLeft(e, left)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') unpairLeft(e, left) }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Right column — the answers */}
        <div className="matching-col">
          <span className="matching-col-label">Matches</span>
          {rightItems.map(right => {
            const owner = rightToLeft[right]
            const meta = owner ? pairMeta[owner] : null
            return (
              <button
                type="button"
                key={right}
                className={`matching-card matching-card-right ${owner ? 'matching-card-matched' : ''} ${activeLeft ? 'matching-card-target' : ''}`}
                style={owner ? { borderColor: meta.color } : undefined}
                onClick={() => selectRight(right)}
              >
                {owner && (
                  <span className="matching-badge" style={{ background: meta.color }}>
                    {meta.num}
                  </span>
                )}
                <span className="matching-card-text">{right}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="matching-progress">
        {matchedCount} of {leftItems.length} matched
      </div>
      {allMatched && (
        <p className="matching-complete">All items matched — review your pairings before moving on.</p>
      )}
    </div>
  )
}

export default MatchingQuestion
