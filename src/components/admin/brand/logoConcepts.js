/**
 * logoConcepts.js — alternative icon-mark options for the CloudExamLab square.
 *
 * The live mark uses Lucide's "Cloud" glyph, which is left/right asymmetric
 * (one large lobe, one small) — rotate it 90° and the silhouette reads badly.
 * Every concept here is built to be mirror-symmetric about its vertical axis
 * (or close to it), so no rotation produces an unfortunate shape. They reuse
 * the exact same brand tokens — teal gradient square, white mark — so the
 * lockup, colours, and corner radius are identical to the current logo.
 *
 * Each glyph is authored in a 24×24 grid (same as the Lucide glyph) and scaled
 * to fit the square, so stroke weight stays visually constant at any size.
 */
import { COLORS, GRADIENTS } from '../../../data/brand'
import { brandDefs } from './logo'

/** Stroke width that keeps a roughly constant visual weight after scaling. */
const sw = s => Math.max(1.6, 2 / s)

// ── Concept glyphs (24×24 space, white on teal) ───────────────────────────────
// Each is a function of the scale factor `s` so it can size its own strokes.

/** 1 · Symmetric cloud — the current mark, redrawn as a balanced silhouette. */
const cloudSym = () => `<g fill="${COLORS.white.hex}">
  <circle cx="8.5" cy="13" r="3.4"/>
  <circle cx="12" cy="10" r="4.6"/>
  <circle cx="15.5" cy="13" r="3.4"/>
  <rect x="5" y="12.4" width="14" height="5.2" rx="2.6"/>
</g>`

/** 2 · Cloud + check — symmetric cloud carrying a teal "passed" check. */
const cloudCheck = s => `<g>
  <g fill="${COLORS.white.hex}">
    <circle cx="8.5" cy="12" r="3.3"/>
    <circle cx="12" cy="9.2" r="4.5"/>
    <circle cx="15.5" cy="12" r="3.3"/>
    <rect x="5" y="11.4" width="14" height="5" rx="2.5"/>
  </g>
  <path d="M9 13 l2.2 2.2 L15.5 10.5" fill="none" stroke="url(#cel-teal)" stroke-width="${sw(s) * 1.2}" stroke-linecap="round" stroke-linejoin="round"/>
</g>`

/** 3 · Graduation cap — the "Exam"/certification mark, symmetric mortarboard. */
const gradCap = s => `<g fill="none" stroke="${COLORS.white.hex}" stroke-width="${sw(s)}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 5 L21.5 9 L12 13 L2.5 9 Z" fill="${COLORS.white.hex}"/>
  <path d="M6.5 10.6 V14.5 C6.5 16.2 9 17.5 12 17.5 S17.5 16.2 17.5 14.5 V10.6"/>
  <path d="M21.5 9 V13.5"/>
</g>`

/** 4 · Lab flask — the "Lab" mark, symmetric Erlenmeyer with a fill line. */
const flask = s => `<g fill="none" stroke="${COLORS.white.hex}" stroke-width="${sw(s)}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.5 3.5 H14.5"/>
  <path d="M10 3.5 V9.4 L5.2 17.6 A1.6 1.6 0 0 0 6.6 20 H17.4 A1.6 1.6 0 0 0 18.8 17.6 L14 9.4 V3.5"/>
  <path d="M7.4 14.2 H16.6"/>
</g>`

/** 5 · Open book — the "Learn/Study" mark, symmetric open spread. */
const book = s => `<g fill="none" stroke="${COLORS.white.hex}" stroke-width="${sw(s)}" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 6.5 C9.8 5 6.3 4.7 3.8 5.3 V17.2 C6.3 16.6 9.8 16.9 12 18.4"/>
  <path d="M12 6.5 C14.2 5 17.7 4.7 20.2 5.3 V17.2 C17.7 16.6 14.2 16.9 12 18.4"/>
  <path d="M12 6.5 V18.4"/>
</g>`

export const CONCEPTS = {
  optCloudSym:   { label: 'Option 1 · Symmetric cloud', glyph: cloudSym,   ratio: 0.66 },
  optCloudCheck: { label: 'Option 2 · Cloud + check',   glyph: cloudCheck, ratio: 0.66 },
  optGradCap:    { label: 'Option 3 · Graduation cap',  glyph: gradCap,    ratio: 0.62 },
  optFlask:      { label: 'Option 4 · Lab flask',       glyph: flask,      ratio: 0.6 },
  optBook:       { label: 'Option 5 · Open book',       glyph: book,       ratio: 0.64 },
}

/** Teal rounded square with one of the concept glyphs centered inside it. */
export function conceptSquare({ x = 0, y = 0, size = 100, concept } = {}) {
  const c = CONCEPTS[concept]
  if (!c) throw new Error(`Unknown logo concept: ${concept}`)
  const rx = size * 0.22
  const glyph = size * c.ratio
  const gx = x + (size - glyph) / 2
  const gy = y + (size - glyph) / 2
  const s = glyph / 24
  return `<g>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${rx}" fill="url(#cel-teal)"/>
    <g transform="translate(${gx},${gy}) scale(${s})">${c.glyph(s)}</g>
  </g>`
}

/** A full standalone SVG of one concept mark on a solid background. */
export function conceptIconSvg(concept, { size = 512, background = COLORS.navy.hex, squareRatio = 0.66 } = {}) {
  const square = Math.round(size * squareRatio)
  const offset = Math.round((size - square) / 2)
  const bg = background === 'transparent'
    ? ''
    : `<rect width="${size}" height="${size}" fill="${background}"/>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${bg}${conceptSquare({ x: offset, y: offset, size: square, concept })}</svg>`
}

// Re-exported so callers don't need a second import for the gradient css.
export { GRADIENTS }
