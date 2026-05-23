import React, { useRef, useState } from 'react'
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react'

function OrderingQuestion({ options, currentOrder, onChange }) {
  const optionTexts = options.map(o => (typeof o === 'string' ? o : o.text))
  // Use saved order if user has interacted, otherwise use the (shuffled) option order
  const items = currentOrder && currentOrder.length > 0 ? currentOrder : optionTexts

  const rowRefs = useRef([])
  const [dragIndex, setDragIndex] = useState(null)

  const move = (index, dir) => {
    const next = [...items]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const reorder = (from, to) => {
    if (from === to) return
    const next = [...items]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    onChange(next)
  }

  const handlePointerDown = (e, index) => {
    // Ignore non-primary mouse buttons
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragIndex(index)
  }

  const handlePointerMove = (e) => {
    if (dragIndex === null) return
    e.preventDefault()
    const y = e.clientY

    // Find which slot the pointer is over (rows keep their real positions —
    // the dragged row is only highlighted, never floated — so rects are stable).
    let target = items.length - 1
    for (let i = 0; i < rowRefs.current.length; i++) {
      const el = rowRefs.current[i]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (y < r.top + r.height / 2) {
        target = i
        break
      }
    }

    if (target !== dragIndex) {
      reorder(dragIndex, target)
      setDragIndex(target)
    }
  }

  const handlePointerUp = (e) => {
    if (dragIndex === null) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (_) {}
    setDragIndex(null)
  }

  return (
    <div className="ordering-list">
      <p className="ordering-hint">
        Drag the handle <GripVertical className="ordering-hint-icon" /> to reorder, or use the arrows. Arrange items into the correct sequence.
      </p>
      {items.map((item, i) => (
        <div
          key={`${item}`}
          ref={el => (rowRefs.current[i] = el)}
          className={`ordering-item ${dragIndex === i ? 'ordering-item-dragging' : ''}`}
        >
          <button
            type="button"
            className="ordering-grip"
            aria-label="Drag to reorder"
            onPointerDown={e => handlePointerDown(e, i)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <span className="ordering-rank">{i + 1}</span>
          <span className="ordering-text">{item}</span>
          <div className="ordering-controls">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="ordering-btn"
              aria-label="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              className="ordering-btn"
              aria-label="Move down"
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
