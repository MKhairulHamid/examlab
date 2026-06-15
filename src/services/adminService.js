/**
 * Admin API service — calls the admin-api Supabase Edge Function.
 * All calls are rejected by the function unless the authenticated user's
 * email matches the ADMIN_EMAIL environment variable set in Supabase.
 */

import supabase from './supabase'
import { SUPABASE_URL } from '../utils/constants'

const ADMIN_API_URL = `${SUPABASE_URL}/functions/v1/admin-api`

async function callAdminApi(payload) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated.')

  const res = await fetch(ADMIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
  return json
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getUsers() {
  return callAdminApi({ action: 'getUsers' })
}

// ── Exam Types ────────────────────────────────────────────────────────────────

export async function getExamTypes() {
  return callAdminApi({ action: 'getExamTypes' })
}

export async function createExamType(fields) {
  return callAdminApi({ action: 'createExamType', ...fields })
}

export async function updateExamType(id, fields) {
  return callAdminApi({ action: 'updateExamType', id, ...fields })
}

// ── Promo Codes ───────────────────────────────────────────────────────────────

export async function getPromoCodes() {
  return callAdminApi({ action: 'getPromoCodes' })
}

export async function createPromoCode(fields) {
  return callAdminApi({ action: 'createPromoCode', ...fields })
}

export async function updatePromoCode(id, isActive) {
  return callAdminApi({ action: 'updatePromoCode', id, is_active: isActive })
}

export async function getPromoRedemptions(promoCodeId) {
  return callAdminApi({ action: 'getPromoRedemptions', promo_code_id: promoCodeId })
}

// ── Community Videos ────────────────────────────────────────────────────────────

export async function getCommunityVideos(status = 'pending') {
  return callAdminApi({ action: 'getCommunityVideos', status })
}

export async function reviewCommunityVideo(id, status, rejectionReason) {
  return callAdminApi({ action: 'reviewCommunityVideo', id, status, rejection_reason: rejectionReason })
}

export async function getCommunityVideoReports(status = 'open') {
  return callAdminApi({ action: 'getCommunityVideoReports', status })
}

export async function resolveReport(id, status, { videoId, videoAction, rejectionReason } = {}) {
  return callAdminApi({
    action: 'resolveReport',
    id,
    status,
    video_id: videoId,
    video_action: videoAction,
    rejection_reason: rejectionReason,
  })
}

// ── Admin Notes ───────────────────────────────────────────────────────────────

let _adminPingCache = null

export async function pingAdmin() {
  if (_adminPingCache !== null) return _adminPingCache
  try {
    await callAdminApi({ action: 'pingAdmin' })
    _adminPingCache = true
  } catch {
    _adminPingCache = false
  }
  return _adminPingCache
}

export async function getNotes(pagePath) {
  return callAdminApi({ action: 'getNotes', page_path: pagePath })
}

export async function getAllNotes() {
  return callAdminApi({ action: 'getNotes' })
}

export async function createNote(fields) {
  return callAdminApi({ action: 'createNote', ...fields })
}

export async function updateNote(id, fields) {
  return callAdminApi({ action: 'updateNote', id, ...fields })
}

export async function deleteNote(id) {
  return callAdminApi({ action: 'deleteNote', id })
}
