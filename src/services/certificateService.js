/**
 * Certificate Service
 * The "Proficiency" credential: earned by completing all study sessions for a
 * program AND passing that program's final mock exam (>=70%). Issuance and public
 * verification both go through SECURITY DEFINER RPCs so credentials can't be forged
 * or enumerated. See supabase/migrations/create_certificates_proficiency.sql.
 */

import supabase from './supabase'

/**
 * Canonical public verify path: /verify/<programSlug>/?id=<code>. The program
 * slug in the path drives the prerendered per-program OG card; the trailing slash
 * maps straight to the static file on GitHub Pages (avoids a redirect that could
 * drop the query). See the prerender plugin in vite.config.js.
 */
export function buildVerifyPath(programCode, credentialCode) {
  const slug = String(programCode || '').toLowerCase()
  return `/verify/${slug}/?id=${encodeURIComponent(credentialCode || '')}`
}

/** Normalize a row coming back from get_certificate_by_code / certificates table. */
function normalize(row) {
  if (!row) return null
  return {
    credentialCode: row.credential_code,
    recipientName: row.recipient_name,
    programCode: row.program_code,
    programName: row.program_name,
    percentageScore: row.percentage_score != null ? Number(row.percentage_score) : null,
    scaledScore: row.scaled_score ?? null,
    sessionsTotal: row.sessions_total ?? null,
    issuedAt: row.issued_at,
    revoked: !!row.revoked,
  }
}

export const certificateService = {
  /**
   * Public verification lookup by credential code. Works for anonymous visitors.
   * Returns the normalized certificate, or null if not found.
   */
  async getByCode(code) {
    if (!code) return null
    try {
      const { data, error } = await supabase.rpc('get_certificate_by_code', {
        p_code: code,
      })
      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      return normalize(row)
    } catch (error) {
      console.error('Error fetching certificate:', error)
      return null
    }
  },

  /**
   * Attempt to issue the credential for a program. Eligibility is enforced
   * server-side (final-exam pass + study completeness). Idempotent — returns the
   * existing certificate if already issued. Returns { certificate } on success or
   * { error } describing why issuance was refused (e.g. exam not passed yet).
   */
  async issue(programCode, sessionsTotal) {
    if (!programCode) return { error: 'Missing program' }
    try {
      const { data, error } = await supabase.rpc('issue_certificate', {
        p_program_code: programCode,
        p_sessions_total: sessionsTotal,
      })
      if (error) return { error: error.message }
      const row = Array.isArray(data) ? data[0] : data
      return { certificate: normalize(row) }
    } catch (error) {
      console.error('Error issuing certificate:', error)
      return { error: error.message || 'Could not issue certificate' }
    }
  },

  /** List the signed-in user's earned certificates (owner RLS policy). */
  async listMine() {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(
          'credential_code, recipient_name, program_code, program_name, percentage_score, scaled_score, sessions_total, issued_at, revoked'
        )
        .order('issued_at', { ascending: false })
      if (error) throw error
      return (data || []).map(normalize)
    } catch (error) {
      console.error('Error listing certificates:', error)
      return []
    }
  },
}

export default certificateService
