/**
 * logo.js — SVG building blocks for the CloudExamLab mark.
 *
 * These return SVG fragment strings (no <svg> wrapper) built from the brand
 * tokens, so asset templates can compose them at any size/position. The mark
 * is the Lucide "Cloud" glyph in white, inside the teal gradient square — the
 * same lockup used in the live header and footer.
 */
import { COLORS, GRADIENTS, TYPOGRAPHY, BRAND, CLOUD_PATH } from '../../../data/brand'

/** <defs> with the two canonical gradients. Include once per full SVG. */
export function brandDefs() {
  return `<defs>
    <linearGradient id="cel-brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${GRADIENTS.brand.stops[0]}"/>
      <stop offset="100%" stop-color="${GRADIENTS.brand.stops[1]}"/>
    </linearGradient>
    <linearGradient id="cel-teal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${GRADIENTS.teal.stops[0]}"/>
      <stop offset="100%" stop-color="${GRADIENTS.teal.stops[1]}"/>
    </linearGradient>
  </defs>`
}

/** The teal rounded square with the white cloud glyph centered inside it. */
export function logoSquare({ x = 0, y = 0, size = 100 } = {}) {
  const rx = size * 0.22
  // Cloud glyph lives in a 24×24 grid; inset it ~22% and center.
  const glyph = size * 0.62
  const gx = x + (size - glyph) / 2
  const gy = y + (size - glyph) / 2
  const s = glyph / 24
  const stroke = Math.max(1.6, 2 / s) // keep visual weight roughly constant
  return `<g>
    <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${rx}" fill="url(#cel-teal)"/>
    <g transform="translate(${gx},${gy}) scale(${s})">
      <path d="${CLOUD_PATH}" fill="none" stroke="${COLORS.white.hex}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>`
}

/** Wordmark text "Cloud Exam Lab". Baseline-anchored at (x, y). */
export function wordmark({ x = 0, y = 0, fontSize = 48, color = COLORS.white.hex, weight = 700 } = {}) {
  return `<text x="${x}" y="${y}" font-family="${TYPOGRAPHY.svgFontFamily}" font-size="${fontSize}" font-weight="${weight}" letter-spacing="-0.5" fill="${color}">${BRAND.name}</text>`
}

/** A full standalone SVG of just the icon mark on a solid background. */
export function logoIconSvg({ size = 512, background = 'transparent', squareRatio = 0.66 } = {}) {
  const square = Math.round(size * squareRatio)
  const offset = Math.round((size - square) / 2)
  const bg = background === 'transparent'
    ? ''
    : `<rect width="${size}" height="${size}" fill="${background}"/>`
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${bg}${logoSquare({ x: offset, y: offset, size: square })}</svg>`
}

/** Horizontal lockup: icon + wordmark side by side. */
export function logoHorizontalSvg({ width = 900, height = 260, onDark = true } = {}) {
  const square = Math.round(height * 0.5)
  const sy = Math.round((height - square) / 2)
  const sx = Math.round(height * 0.22)
  const textX = sx + square + Math.round(square * 0.38)
  const fontSize = Math.round(square * 0.62)
  const textY = Math.round(height / 2 + fontSize * 0.34)
  const bg = onDark ? `<rect width="${width}" height="${height}" fill="url(#cel-brand)"/>` : `<rect width="${width}" height="${height}" fill="${COLORS.white.hex}"/>`
  const textColor = onDark ? COLORS.white.hex : COLORS.navy.hex
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${bg}${logoSquare({ x: sx, y: sy, size: square })}${wordmark({ x: textX, y: textY, fontSize, color: textColor, weight: 800 })}</svg>`
}

/** Stacked lockup: icon above wordmark, centered. */
export function logoStackedSvg({ width = 600, height = 520, onDark = true } = {}) {
  const square = Math.round(width * 0.34)
  const sx = Math.round((width - square) / 2)
  const sy = Math.round(height * 0.16)
  const fontSize = Math.round(width * 0.11)
  const textY = sy + square + Math.round(height * 0.18)
  const bg = onDark ? `<rect width="${width}" height="${height}" fill="url(#cel-brand)"/>` : `<rect width="${width}" height="${height}" fill="${COLORS.white.hex}"/>`
  const textColor = onDark ? COLORS.white.hex : COLORS.navy.hex
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${bg}${logoSquare({ x: sx, y: sy, size: square })}<text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="${TYPOGRAPHY.svgFontFamily}" font-size="${fontSize}" font-weight="800" letter-spacing="-0.5" fill="${textColor}">${BRAND.name}</text></svg>`
}
