/**
 * brand.js — the single source of truth for the CloudExamLab brand.
 *
 * The admin Brand Guidelines page renders from these values, and every
 * downloadable asset template (logo, ads, social posts) is generated from
 * them too. Change a token here and both the guidelines and the generated
 * assets update together — they can never drift apart.
 *
 * Mirrors the live identity defined in tailwind.config.js, src/index.css,
 * and scripts/og-credential.svg.
 */

// ── Colors ──────────────────────────────────────────────────────────────────
export const COLORS = {
  navy:      { hex: '#0A2540', name: 'Navy',       role: 'Primary brand color — backgrounds, headings, the foundation of everything.' },
  navyMid:   { hex: '#1A3B5C', name: 'Navy Mid',   role: 'Gradient partner for navy; secondary surfaces.' },
  navyDark:  { hex: '#051423', name: 'Navy Dark',  role: 'Deepest navy for maximum contrast.' },
  teal:      { hex: '#00D4AA', name: 'Teal',       role: 'Primary accent — CTAs, highlights, the energy of the brand.' },
  tealLight: { hex: '#00E8BC', name: 'Teal Light', role: 'Hover states and bright highlights.' },
  tealDark:  { hex: '#00A884', name: 'Teal Dark',  role: 'Gradient partner for teal; pressed states and depth.' },
  white:     { hex: '#FFFFFF', name: 'White',      role: 'Text and the cloud mark on dark surfaces.' },
  ink:       { hex: '#06281F', name: 'Deep Ink',   role: 'Text that sits on top of teal (e.g. button labels).' },
}

export const NEUTRALS = {
  gray50:  '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
}

export const SEMANTIC = {
  success: { hex: '#10B981', name: 'Success' },
  error:   { hex: '#F87171', name: 'Error' },
  warning: { hex: '#FBBF24', name: 'Warning' },
  info:    { hex: '#3B82F6', name: 'Info' },
}

// ── Gradients ─────────────────────────────────────────────────────────────────
export const GRADIENTS = {
  brand: { css: 'linear-gradient(135deg, #0A2540 0%, #1A3B5C 100%)', stops: ['#0A2540', '#1A3B5C'], name: 'Brand gradient' },
  teal:  { css: 'linear-gradient(135deg, #00D4AA 0%, #00A884 100%)', stops: ['#00D4AA', '#00A884'], name: 'Teal gradient' },
}

// ── Typography ──────────────────────────────────────────────────────────────
export const TYPOGRAPHY = {
  // Web font stack (matches index.css / tailwind.config.js)
  fontStack: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, 'Helvetica Neue', Arial, sans-serif",
  // Safe family for SVG/canvas rasterization (system fonts only)
  svgFontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
  weights: [
    { weight: 400, label: 'Regular',    use: 'Body copy' },
    { weight: 500, label: 'Medium',     use: 'Labels, secondary text' },
    { weight: 600, label: 'Semibold',   use: 'Navigation, badges' },
    { weight: 700, label: 'Bold',       use: 'Section titles, card headers' },
    { weight: 800, label: 'Extrabold',  use: 'Hero headings' },
    { weight: 900, label: 'Black',      use: 'Large display text' },
  ],
}

// ── Brand identity & copy ─────────────────────────────────────────────────────
export const BRAND = {
  name: 'Cloud Exam Lab',
  nameCompact: 'CloudExamLab',
  domain: 'cloudexamlab.com',
  url: 'https://cloudexamlab.com',
}

export const TAGLINES = {
  primary: 'Learn the cloud the right way. Earn the certificate to prove it.',
  short: 'Skills first, certificate second.',
  method: 'The Teach to Learn method.',
  subhead: 'Structured sessions that build real understanding, active-recall practice, and our Teach to Learn method.',
  free: '10 free questions in any program. No credit card.',
  closing: 'Become genuinely good at AWS. The certificate follows.',
}

// ── Voice & tone ──────────────────────────────────────────────────────────────
export const VOICE = {
  principles: [
    { title: 'Skills first', body: 'Lead with genuine understanding. The certificate is the natural result, not the pitch.' },
    { title: 'Plain and confident', body: 'Say it straight. No hype, no jargon walls, no fake urgency.' },
    { title: 'Respect the learner', body: 'Treat the reader as smart and busy. Earn attention; never manipulate it.' },
    { title: 'Calm, not loud', body: 'Quiet confidence beats exclamation marks. Let the substance carry the message.' },
  ],
  // Hard rules — enforced across marketing surfaces.
  rules: [
    { do: true,  text: 'Write in clear, complete sentences.' },
    { do: true,  text: 'Use "you" — speak directly to the learner.' },
    { do: true,  text: 'Capitalize the brand as "Cloud Exam Lab" (or "CloudExamLab" in URLs/handles).' },
    { do: false, text: 'Never use emoji in marketing copy or on the landing page.' },
    { do: false, text: 'No false urgency ("act now!", countdown timers) or hype superlatives.' },
    { do: false, text: 'Do not promise a guaranteed pass — promise understanding.' },
  ],
}

// ── Asset catalog ─────────────────────────────────────────────────────────────
// Every downloadable asset's exact pixel dimensions and grouping. Asset
// templates and the gallery both read from this map so sizes stay canonical.
export const ASSET_SPECS = {
  // Logo pack
  logoIconDark:        { label: 'Icon mark · on navy',     width: 512,  height: 512,  group: 'Logo' },
  logoIconLight:       { label: 'Icon mark · on white',    width: 512,  height: 512,  group: 'Logo' },
  logoHorizontalDark:  { label: 'Horizontal lockup · dark', width: 900,  height: 260,  group: 'Logo' },
  logoHorizontalLight: { label: 'Horizontal lockup · light', width: 900, height: 260,  group: 'Logo' },
  logoStackedDark:     { label: 'Stacked lockup · dark',   width: 600,  height: 520,  group: 'Logo' },

  // Google Ads — standard high-performing display sizes
  adMediumRectangle:   { label: 'Medium Rectangle',  width: 300,  height: 250,  group: 'Google Ads' },
  adLargeRectangle:    { label: 'Large Rectangle',   width: 336,  height: 280,  group: 'Google Ads' },
  adLeaderboard:       { label: 'Leaderboard',       width: 728,  height: 90,   group: 'Google Ads' },
  adHalfPage:          { label: 'Half Page',         width: 300,  height: 600,  group: 'Google Ads' },
  adWideSkyscraper:    { label: 'Wide Skyscraper',   width: 160,  height: 600,  group: 'Google Ads' },
  adLargeMobile:       { label: 'Large Mobile Banner', width: 320, height: 100,  group: 'Google Ads' },
  adMobileBanner:      { label: 'Mobile Banner',     width: 320,  height: 50,   group: 'Google Ads' },

  // Instagram intro grid (first 3 posts)
  igPost1: { label: 'IG Post 1 · Intro',  width: 1080, height: 1080, group: 'Instagram' },
  igPost2: { label: 'IG Post 2 · Method', width: 1080, height: 1080, group: 'Instagram' },
  igPost3: { label: 'IG Post 3 · CTA',    width: 1080, height: 1080, group: 'Instagram' },

  // Other social
  igStory:      { label: 'Instagram Story',   width: 1080, height: 1920, group: 'Social' },
  profileAvatar:{ label: 'Profile avatar',    width: 1080, height: 1080, group: 'Social' },
  xHeader:      { label: 'X / Twitter header', width: 1500, height: 500, group: 'Social' },
  linkedinCover:{ label: 'LinkedIn cover',    width: 1128, height: 191, group: 'Social' },
  ogCard:       { label: 'Social share / OG card', width: 1200, height: 630, group: 'Social' },

  // Favicon / app-icon set
  favicon512: { label: 'Icon 512', width: 512, height: 512, group: 'Favicon' },
  favicon192: { label: 'Icon 192', width: 192, height: 192, group: 'Favicon' },
  favicon180: { label: 'Apple touch 180', width: 180, height: 180, group: 'Favicon' },
  favicon32:  { label: 'Favicon 32', width: 32, height: 32, group: 'Favicon' },
  favicon16:  { label: 'Favicon 16', width: 16, height: 16, group: 'Favicon' },
}

// ── Logo mark glyph ───────────────────────────────────────────────────────────
// The Lucide "Cloud" icon path (24×24 grid) — the same mark used in the live
// header and footer. Rendered stroked in white inside the teal gradient square.
export const CLOUD_PATH = 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z'
