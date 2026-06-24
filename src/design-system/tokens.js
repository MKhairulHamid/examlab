/**
 * Design tokens for JS / inline-styled surfaces.
 *
 * Components built with Tailwind should prefer the class tokens
 * (`text-success`, `bg-danger/10`, `rounded-lg`, …) and the CSS variables in
 * index.css. These constants exist so the inline-styled surfaces (the study
 * course, exam, results screens) can reference ONE source of truth instead of
 * hardcoding hexes — keeping "pass / correct / error / warn / info" identical
 * everywhere.
 *
 * Keep these in sync with the `:root` semantic tokens in src/index.css and the
 * `success/danger/warning/info` colours in tailwind.config.js.
 */

// Brand identity — navy carries structure, teal is the primary/action accent.
export const BRAND = {
  navy:     '#0A2540',
  navyMid:  '#1A3B5C',
  navyDark: '#051423',
  teal:     '#00D4AA',
  tealLight:'#00E8BC',
  tealDark: '#00A884',
}

// Semantic status — one canonical colour per meaning. `dark` = text-on-light,
// `soft` = tinted background. Success is emerald (distinct from the teal accent
// so "primary action" and "success" never read as the same thing).
export const STATUS = {
  success: { base: '#10b981', dark: '#059669', soft: 'rgba(16, 185, 129, 0.10)' },
  danger:  { base: '#dc2626', dark: '#b91c1c', soft: 'rgba(220, 38, 38, 0.10)' },
  warning: { base: '#d97706', dark: '#b45309', soft: 'rgba(217, 119, 6, 0.10)' },
  info:    { base: '#2563eb', dark: '#1d4ed8', soft: 'rgba(37, 99, 235, 0.10)' },
}

// Radius scale — collapse the ad-hoc 0.3–1.25rem inline radii onto four steps.
export const RADIUS = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
}

// Categorical palette for exam-domain accents and data-viz series. This is a
// DISTINCT role from the semantic status colours above — do not use it to mean
// "success/error". Single source of truth shared by the dashboard domain cards
// and the course widgets.
export const DOMAIN_PALETTE = ['#0EA5E9', '#8B5CF6', '#00D4AA', '#F59E0B', '#EF4444', '#6366F1']
