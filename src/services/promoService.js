/**
 * Promo redemption service — calls the redeem_promo_code Postgres RPC.
 * The RPC runs as SECURITY DEFINER and uses auth.uid(), so it validates the
 * code, enforces the usage cap, and writes the redemption atomically. The
 * caller must be authenticated (a valid session is sent automatically).
 */

import supabase from './supabase'

export async function redeemCode(code) {
  const trimmed = (code || '').trim()
  if (!trimmed) {
    return { success: false, error: 'Please enter a code.' }
  }

  const { data, error } = await supabase.rpc('redeem_promo_code', { p_code: trimmed })

  if (error) {
    console.error('Redeem error:', error)
    return { success: false, error: 'Something went wrong redeeming that code. Please try again.' }
  }

  // The RPC returns a jsonb object: { success, error?, exam_slug?, exam_name?, ... }
  return data || { success: false, error: 'Unexpected response.' }
}

export default { redeemCode }
