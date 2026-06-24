/**
 * assetTemplates.js — generates every downloadable brand asset as an SVG
 * string, built entirely from the brand tokens in src/data/brand.js.
 *
 * buildAssetSvg(id) returns the SVG for any id in ASSET_SPECS.
 * emailSignatureHtml() returns a ready-to-paste HTML email signature.
 */
import {
  COLORS, GRADIENTS, TYPOGRAPHY, BRAND, TAGLINES, ASSET_SPECS, NEUTRALS,
} from '../../../data/brand'
import {
  brandDefs, logoSquare, logoIconSvg, logoHorizontalSvg, logoStackedSvg,
} from './logo'
import { conceptIconSvg } from './logoConcepts'

const FONT = TYPOGRAPHY.svgFontFamily
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// A teal "Start free" CTA pill, baseline-positioned with its left edge at x.
function ctaPill({ x, y, h, label = 'Start free', fontSize }) {
  const fs = fontSize ?? Math.round(h * 0.42)
  const w = Math.round(label.length * fs * 0.62 + h * 1.1)
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#cel-teal)"/>
    <text x="${x + w / 2}" y="${y + h / 2 + fs * 0.35}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="${COLORS.ink.hex}">${esc(label)}</text>
  </g>`
}

function frame(width, height, fill = 'url(#cel-brand)') {
  // brand gradient bg + signature teal top edge
  const bar = Math.max(4, Math.round(height * 0.016))
  return `<rect width="${width}" height="${height}" fill="${fill}"/><rect width="${width}" height="${bar}" fill="url(#cel-teal)"/>`
}

function tealSpan(text) {
  return `<tspan fill="url(#cel-teal)">${esc(text)}</tspan>`
}

// ── Google Ads banners (adaptive layout) ──────────────────────────────────────
function adSvg(width, height) {
  const narrow = width <= 420 && height <= 110 // small mobile banners
  const wide = !narrow && width >= height * 2.2 // leaderboards
  const tall = height >= width * 1.4            // skyscrapers, half page
  let body = ''

  if (narrow) {
    // Too tight for headline + pill side by side: icon + short message only.
    if (height >= 80) {
      const sq = Math.round(height * 0.5)
      const sx = Math.round(height * 0.2)
      const sy = Math.round((height - sq) / 2)
      const fs = Math.round(height * 0.26)
      const tx = sx + sq + Math.round(height * 0.18)
      const y1 = Math.round(height * 0.46)
      body = `${logoSquare({ x: sx, y: sy, size: sq })}
        <text x="${tx}" y="${y1}" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="url(#cel-teal)">${esc('Skills first,')}</text>
        <text x="${tx}" y="${y1 + fs * 1.05}" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="${COLORS.white.hex}">${esc('certificate second.')}</text>`
    } else {
      const sq = Math.round(height * 0.6)
      const sx = Math.round(height * 0.24)
      const sy = Math.round((height - sq) / 2)
      const fs = Math.round(height * 0.34)
      const tx = sx + sq + Math.round(height * 0.3)
      body = `${logoSquare({ x: sx, y: sy, size: sq })}
        <text x="${tx}" y="${height / 2 + fs * 0.35}" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="${COLORS.white.hex}">${tealSpan('Skills first,')} ${esc('cert second.')}</text>`
    }
  } else if (wide) {
    const sq = Math.round(height * 0.56)
    const sy = Math.round((height - sq) / 2)
    const sx = Math.round(height * 0.22)
    const hl = Math.round(height * 0.3)
    const tx = sx + sq + Math.round(height * 0.22)
    const cta = Math.round(height * 0.5)
    const pillW = Math.round(cta * 3.4)
    const compact = height < 70
    body = `${logoSquare({ x: sx, y: sy, size: sq })}
      <text x="${tx}" y="${height / 2 + hl * 0.34}" font-family="${FONT}" font-size="${hl}" font-weight="800" fill="${COLORS.white.hex}">${compact ? esc('Master AWS — skills first.') : tealSpan('Skills first,') + esc(' then the cert.')}</text>
      ${ctaPill({ x: width - pillW - Math.round(height * 0.22), y: (height - cta) / 2, h: cta })}`
  } else if (tall) {
    const sq = Math.round(width * 0.4)
    const sx = Math.round((width - sq) / 2)
    const sy = Math.round(height * 0.08)
    const fs = Math.round(width * 0.135)
    let ty = sy + sq + Math.round(height * 0.1)
    const lines = ['Skills', 'first,', 'cert', 'second.']
    const textLines = lines.map((l, i) => `<text x="${width / 2}" y="${ty + i * fs * 1.12}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="${i < 2 ? COLORS.white.hex : COLORS.teal.hex}">${esc(l)}</text>`).join('')
    const cta = Math.round(width * 0.22)
    body = `${logoSquare({ x: sx, y: sy, size: sq })}${textLines}${ctaPill({ x: (width - Math.round(cta * 3.1)) / 2, y: height - cta - Math.round(height * 0.06), h: cta })}`
  } else {
    // block (300×250, 336×280)
    const m = Math.round(width * 0.09)
    const sq = Math.round(width * 0.17)
    const sy = m
    const fs = Math.round(width * 0.105)
    const subFs = Math.round(fs * 0.42)
    const h1 = Math.round(height * 0.46)
    const cta = Math.round(height * 0.17)
    body = `${logoSquare({ x: m, y: sy, size: sq })}
      <text x="${m}" y="${h1}" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="url(#cel-teal)">${esc('Skills first.')}</text>
      <text x="${m}" y="${h1 + fs * 1.12}" font-family="${FONT}" font-size="${fs}" font-weight="800" fill="${COLORS.white.hex}">${esc('Cert second.')}</text>
      <text x="${m}" y="${h1 + fs * 1.12 + subFs * 1.9}" font-family="${FONT}" font-size="${subFs}" fill="rgba(255,255,255,0.7)">${esc('Learn AWS the way it sticks.')}</text>
      ${ctaPill({ x: m, y: height - cta - Math.round(height * 0.09), h: cta })}`
  }
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${frame(width, height)}${body}</svg>`
}

// ── Instagram 1080×1080 posts ─────────────────────────────────────────────────
function igPostSvg(index) {
  const W = 1080, H = 1080
  const defs = brandDefs()
  const sq = 150, sx = 90, sy = 90
  const wm = `${logoSquare({ x: sx, y: sy, size: sq })}<text x="${sx + sq + 40}" y="${sy + sq / 2 + 22}" font-family="${FONT}" font-size="46" font-weight="800" fill="${COLORS.white.hex}">${esc(BRAND.name)}</text>`
  let body = ''

  if (index === 1) {
    body = `<text x="90" y="560" font-family="${FONT}" font-size="92" font-weight="800" fill="${COLORS.white.hex}">Learn the cloud</text>
      <text x="90" y="672" font-family="${FONT}" font-size="92" font-weight="800" fill="${COLORS.white.hex}">the right way.</text>
      <text x="90" y="800" font-family="${FONT}" font-size="92" font-weight="800" fill="url(#cel-teal)">Prove it.</text>
      <text x="90" y="930" font-family="${FONT}" font-size="40" fill="rgba(255,255,255,0.7)">Structured AWS study that actually sticks.</text>`
  } else if (index === 2) {
    body = `<text x="90" y="470" font-family="${FONT}" font-size="44" font-weight="700" fill="url(#cel-teal)">THE METHOD</text>
      <text x="90" y="600" font-family="${FONT}" font-size="96" font-weight="800" fill="${COLORS.white.hex}">Teach to Learn.</text>
      <text x="90" y="724" font-family="${FONT}" font-size="46" fill="rgba(255,255,255,0.82)">Explain it out loud, build real proof,</text>
      <text x="90" y="784" font-family="${FONT}" font-size="46" fill="rgba(255,255,255,0.82)">and the exam takes care of itself.</text>`
  } else {
    body = `<text x="90" y="520" font-family="${FONT}" font-size="100" font-weight="800" fill="${COLORS.white.hex}">Start with</text>
      <text x="90" y="640" font-family="${FONT}" font-size="100" font-weight="800" fill="url(#cel-teal)">10 free questions.</text>
      <text x="90" y="760" font-family="${FONT}" font-size="46" fill="rgba(255,255,255,0.78)">No credit card. Any program.</text>
      ${ctaPill({ x: 90, y: 850, h: 96, label: 'cloudexamlab.com', fontSize: 40 })}`
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${defs}${frame(W, H)}${wm}${body}<text x="90" y="1010" font-family="${FONT}" font-size="34" fill="rgba(255,255,255,0.4)">${esc(BRAND.domain)}</text></svg>`
}

// ── Instagram Story 1080×1920 ──────────────────────────────────────────────────
function igStorySvg() {
  const W = 1080, H = 1920
  const sq = 160, sx = (W - sq) / 2, sy = 360
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${frame(W, H)}
    ${logoSquare({ x: sx, y: sy, size: sq })}
    <text x="${W / 2}" y="${sy + sq + 90}" text-anchor="middle" font-family="${FONT}" font-size="56" font-weight="800" fill="${COLORS.white.hex}">${esc(BRAND.name)}</text>
    <text x="${W / 2}" y="900" text-anchor="middle" font-family="${FONT}" font-size="86" font-weight="800" fill="${COLORS.white.hex}">Skills first,</text>
    <text x="${W / 2}" y="1000" text-anchor="middle" font-family="${FONT}" font-size="86" font-weight="800" fill="url(#cel-teal)">certificate second.</text>
    <text x="${W / 2}" y="1120" text-anchor="middle" font-family="${FONT}" font-size="44" fill="rgba(255,255,255,0.75)">Structured AWS study that sticks.</text>
    ${ctaPill({ x: (W - 560) / 2, y: 1320, h: 110, label: 'Start free →', fontSize: 48 })}
    <text x="${W / 2}" y="1640" text-anchor="middle" font-family="${FONT}" font-size="40" fill="rgba(255,255,255,0.5)">${esc(BRAND.domain)}</text>
  </svg>`
}

// ── Profile avatar (icon on brand gradient) ────────────────────────────────────
function avatarSvg() {
  const S = 1080
  const sq = Math.round(S * 0.56)
  const o = Math.round((S - sq) / 2)
  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}<rect width="${S}" height="${S}" fill="url(#cel-brand)"/>${logoSquare({ x: o, y: o, size: sq })}</svg>`
}

// ── X / Twitter header 1500×500 ────────────────────────────────────────────────
function xHeaderSvg() {
  const W = 1500, H = 500
  const sq = 150, sx = 110, sy = (H - sq) / 2
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${frame(W, H)}
    ${logoSquare({ x: sx, y: sy, size: sq })}
    <text x="${sx + sq + 50}" y="${H / 2 - 30}" font-family="${FONT}" font-size="64" font-weight="800" fill="${COLORS.white.hex}">${esc(BRAND.name)}</text>
    <text x="${sx + sq + 50}" y="${H / 2 + 46}" font-family="${FONT}" font-size="40" fill="rgba(255,255,255,0.72)">Skills first, certificate second.</text>
    <text x="${sx + sq + 50}" y="${H / 2 + 104}" font-family="${FONT}" font-size="34" fill="url(#cel-teal)">${esc(BRAND.domain)}</text>
  </svg>`
}

// ── LinkedIn cover 1128×191 ────────────────────────────────────────────────────
function linkedinCoverSvg() {
  const W = 1128, H = 191
  const sq = 96, sx = 70, sy = (H - sq) / 2
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${frame(W, H)}
    ${logoSquare({ x: sx, y: sy, size: sq })}
    <text x="${sx + sq + 34}" y="${H / 2 - 6}" font-family="${FONT}" font-size="40" font-weight="800" fill="${COLORS.white.hex}">${esc(BRAND.name)}</text>
    <text x="${sx + sq + 34}" y="${H / 2 + 38}" font-family="${FONT}" font-size="26" fill="rgba(255,255,255,0.72)">Learn AWS the way it sticks. Skills first, certificate second.</text>
  </svg>`
}

// ── Social share / OG card 1200×630 (regenerated from tokens) ──────────────────
function ogCardSvg() {
  const W = 1200, H = 630
  const sq = 64, sx = 90, sy = 84
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${brandDefs()}${frame(W, H)}
    ${logoSquare({ x: sx, y: sy, size: sq })}
    <text x="${sx + sq + 28}" y="${sy + sq / 2 + 12}" font-family="${FONT}" font-size="36" font-weight="700" fill="${COLORS.white.hex}">${esc(BRAND.name)}</text>
    <text x="90" y="350" font-family="${FONT}" font-size="76" font-weight="800" fill="${COLORS.white.hex}">Skills first,</text>
    <text x="90" y="440" font-family="${FONT}" font-size="76" font-weight="800" fill="url(#cel-teal)">certificate second.</text>
    <text x="90" y="540" font-family="${FONT}" font-size="30" fill="rgba(255,255,255,0.6)">Structured AWS study, the Teach to Learn method, and exam-realistic practice.</text>
  </svg>`
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export function buildAssetSvg(id) {
  const spec = ASSET_SPECS[id]
  if (!spec) throw new Error(`Unknown asset id: ${id}`)
  switch (id) {
    case 'logoIconDark':        return logoIconSvg({ size: spec.width, background: COLORS.navy.hex })
    case 'logoIconLight':       return logoIconSvg({ size: spec.width, background: COLORS.white.hex })
    case 'logoHorizontalDark':  return logoHorizontalSvg({ width: spec.width, height: spec.height, onDark: true })
    case 'logoHorizontalLight': return logoHorizontalSvg({ width: spec.width, height: spec.height, onDark: false })
    case 'logoStackedDark':     return logoStackedSvg({ width: spec.width, height: spec.height, onDark: true })

    case 'optCloudSym':
    case 'optCloudCheck':
    case 'optGradCap':
    case 'optFlask':
    case 'optBook':
      return conceptIconSvg(id, { size: spec.width, background: COLORS.navy.hex })

    case 'igPost1': return igPostSvg(1)
    case 'igPost2': return igPostSvg(2)
    case 'igPost3': return igPostSvg(3)
    case 'igStory': return igStorySvg()
    case 'profileAvatar': return avatarSvg()
    case 'xHeader': return xHeaderSvg()
    case 'linkedinCover': return linkedinCoverSvg()
    case 'ogCard': return ogCardSvg()

    case 'favicon512':
    case 'favicon192':
    case 'favicon180':
    case 'favicon32':
    case 'favicon16':
      return logoIconSvg({ size: spec.width, background: COLORS.navy.hex, squareRatio: 0.78 })

    default:
      // All Google Ads ids fall through to the adaptive banner template
      return adSvg(spec.width, spec.height)
  }
}

// ── Email signature (HTML) ──────────────────────────────────────────────────────
export function emailSignatureHtml({ name = 'Your Name', title = 'Cloud Exam Lab' } = {}) {
  return `<table cellpadding="0" cellspacing="0" style="font-family:${TYPOGRAPHY.fontStack};color:${COLORS.navy.hex};">
  <tr>
    <td style="padding-right:16px;vertical-align:middle;">
      <div style="width:48px;height:48px;border-radius:12px;background:${GRADIENTS.teal.css};display:inline-block;text-align:center;line-height:48px;font-weight:800;color:#06281F;font-size:15px;letter-spacing:0.5px;">CEL</div>
    </td>
    <td style="vertical-align:middle;border-left:2px solid ${COLORS.teal.hex};padding-left:16px;">
      <div style="font-size:16px;font-weight:700;color:${COLORS.navy.hex};">${esc(name)}</div>
      <div style="font-size:13px;color:${NEUTRALS.gray600};">${esc(title)}</div>
      <div style="font-size:13px;margin-top:4px;">
        <a href="${BRAND.url}" style="color:${COLORS.tealDark.hex};text-decoration:none;font-weight:600;">${esc(BRAND.domain)}</a>
      </div>
      <div style="font-size:12px;color:${NEUTRALS.gray400};margin-top:6px;">${esc(TAGLINES.short)}</div>
    </td>
  </tr>
</table>`
}
