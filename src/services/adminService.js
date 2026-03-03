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

// ── Question Sets ─────────────────────────────────────────────────────────────

export async function getQuestionSets(examTypeId) {
  return callAdminApi({ action: 'getQuestionSets', exam_type_id: examTypeId })
}

export async function createQuestionSet(fields) {
  return callAdminApi({ action: 'createQuestionSet', ...fields })
}

export async function updateQuestionSet(id, fields) {
  return callAdminApi({ action: 'updateQuestionSet', id, ...fields })
}

// ── Question Items ────────────────────────────────────────────────────────────

export async function getQuestionItems(questionSetId) {
  return callAdminApi({ action: 'getQuestionItems', question_set_id: questionSetId })
}

export async function upsertQuestionItems(questionSetId, items) {
  return callAdminApi({ action: 'upsertQuestionItems', question_set_id: questionSetId, items })
}

export async function deleteQuestionItems(ids) {
  return callAdminApi({ action: 'deleteQuestionItems', ids })
}
