import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

function OrderingQuestion({ options, currentOrder, onChange }) {
  const optionTexts = options.map(o => (typeof o === 'string' ? o : o.text))
  // Use saved order if user has interacted, otherwise use the (shuffled) option order
  const items = currentOrder && currentOrder.length > 0 ? currentOrder : optionTexts

  const move = (index, dir) => {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div className="ordering-list">
      <p className="ordering-hint">Use the arrows to arrange items in the correct sequence.</p>
      {items.map((item, i) => (
        <div key={`${item}`} className="ordering-item">
          <span className="ordering-rank">{i + 1}</span>
          <span className="ordering-text">{item}</span>
          <div className="ordering-controls">
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="ordering-btn"
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="ordering-btn"
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderingQuestion
