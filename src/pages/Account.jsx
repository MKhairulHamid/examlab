/**
 * Account & Billing — self-serve subscription management.
 *
 * Shows the user's current plan, status, billing source (PayPal) and the
 * renewal / expiry date, and lets a paying subscriber cancel. Cancelling keeps
 * access until the end of the already-paid period. Comp / manually-granted
 * accounts have no real PayPal subscription, so cancellation routes to support.
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardHeader from '../components/layout/DashboardHeader'
import useAuthStore from '../stores/authStore'
import usePurchaseStore from '../stores/purchaseStore'
import paymentService from '../services/paymentService'
import { Button, Card, Badge, Container, SectionHeader, Modal, ModalHeader, Spinner } from '../design-system'
import {
  CreditCard, CalendarDays, ShieldCheck, AlertTriangle, ArrowRight, Mail, ExternalLink,
} from 'lucide-react'

const SUPPORT_EMAIL = 'cloudexamlab@gmail.com'
const PAYPAL_BILLING_URL = 'https://www.paypal.com/myaccount/autopay/'

// Slug-derived display, mirroring EnrollmentModal's PLAN_DETAILS.
const PLAN_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual' }
const PLAN_INTERVALS = { monthly: 'month', quarterly: 'quarter', annual: 'year' }

const STATUS_META = {
  active:    { color: 'green', label: 'Active' },
  cancelled: { color: 'amber', label: 'Cancelled' },
  pending:   { color: 'blue',  label: 'Pending' },
  suspended: { color: 'amber', label: 'Suspended' },
  expired:   { color: 'gray',  label: 'Expired' },
}

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function InfoRow({ Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3.5">
      <span className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-400" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-semibold text-[#0A2540] mt-0.5">{children}</div>
      </div>
    </div>
  )
}

function Account() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { subscription, isSubscribed, fetchSubscription, cancelSubscription } = usePurchaseStore()

  const [loading, setLoading] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [result, setResult] = useState(null) // { type: 'success'|'manualGrant'|'error', message }

  useEffect(() => {
    let cancelled = false
    if (!user) { setLoading(false); return }
    ;(async () => {
      await fetchSubscription(user.id)
      if (!cancelled) setLoading(false)
    })()
    return () => { cancelled = true }
  }, [user, fetchSubscription])

  const plan = subscription?.subscription_plans || null
  const planLabel = (plan && (PLAN_LABELS[plan.slug] || plan.name)) || 'Subscription'
  const planPrice = plan?.price_cents != null ? (plan.price_cents / 100).toFixed(0) : null
  const planInterval = plan ? PLAN_INTERVALS[plan.slug] : null
  const status = subscription?.status || null
  const statusMeta = (status && STATUS_META[status]) || { color: 'gray', label: status || 'None' }
  const isManualGrant = paymentService.isManualGrantSubscription(subscription)
  const isCancelled = status === 'cancelled'
  const periodEnd = subscription?.current_period_end
  // Cancellable when there's a real, active/pending PayPal subscription.
  const canCancel = !!subscription && !isManualGrant && (status === 'active' || status === 'pending')

  const handleCancel = async () => {
    setCancelling(true)
    const res = await cancelSubscription()
    setCancelling(false)
    setConfirmOpen(false)

    if (res.manualGrant) {
      setResult({
        type: 'manualGrant',
        message: 'Your access was granted manually, so there is no PayPal subscription to cancel. Email us and we’ll sort it out.',
      })
    } else if (res.success) {
      setResult({
        type: 'success',
        message: res.accessUntil
          ? `Your subscription is cancelled. You keep full access until ${formatDate(res.accessUntil)}.`
          : 'Your subscription has been cancelled.',
      })
    } else {
      setResult({
        type: 'error',
        message: res.error || 'We couldn’t cancel your subscription. Please try again or contact support.',
      })
    }
  }

  return (
    <>
      <DashboardHeader />
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8 max-w-3xl">
          <SectionHeader
            label="Account"
            title="Account & Billing"
            description="View your subscription and manage billing."
            className="mb-6"
          />

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" className="text-[#00D4AA]" />
            </div>
          ) : !subscription ? (
            /* No subscription on record */
            <Card className="p-8 text-center">
              <span className="w-12 h-12 rounded-xl bg-[#00D4AA]/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-[#00A884]" />
              </span>
              <h3 className="text-lg font-bold text-[#0A2540]">No active subscription</h3>
              <p className="text-sm text-gray-500 mt-1.5 max-w-sm mx-auto">
                You don&rsquo;t have a subscription yet. Subscribe to unlock every certification path.
              </p>
              <Button variant="primary" className="mt-5" onClick={() => navigate('/dashboard')}>
                Browse plans <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          ) : (
            <div className="space-y-5">
              {/* Result banner (after a cancel attempt) */}
              {result && (
                <div
                  className={[
                    'rounded-xl border px-4 py-3 text-sm flex items-start gap-2.5',
                    result.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : result.type === 'error' ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800',
                  ].join(' ')}
                  role="status"
                >
                  {result.type === 'success'
                    ? <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                    : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>{result.message}</span>
                </div>
              )}

              {/* Subscription summary */}
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 pb-2 border-b border-gray-100">
                  <div>
                    <p className="text-[0.6875rem] font-bold text-[#00D4AA] uppercase tracking-[0.08em]">
                      Your plan
                    </p>
                    <h3 className="text-xl font-bold text-[#0A2540] mt-0.5">
                      {planLabel}
                    </h3>
                    {planPrice != null && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        ${planPrice}{planInterval ? ` / ${planInterval}` : ''}
                      </p>
                    )}
                  </div>
                  <Badge color={statusMeta.color}>{statusMeta.label}</Badge>
                </div>

                <div className="divide-y divide-gray-100">
                  <InfoRow Icon={CalendarDays} label={isCancelled || status === 'expired' ? 'Access until' : 'Renews on'}>
                    {formatDate(periodEnd)}
                    {isCancelled && periodEnd && new Date(periodEnd).getTime() > Date.now() && (
                      <span className="ml-2 text-xs font-medium text-amber-600">
                        won&rsquo;t renew
                      </span>
                    )}
                  </InfoRow>
                  {subscription.current_period_start && (
                    <InfoRow Icon={CalendarDays} label="Current period started">
                      {formatDate(subscription.current_period_start)}
                    </InfoRow>
                  )}
                  <InfoRow Icon={CreditCard} label="Billing">
                    {isManualGrant ? 'Granted by Cloud Exam Lab' : 'PayPal'}
                  </InfoRow>
                  <InfoRow Icon={ShieldCheck} label="Access">
                    {isSubscribed ? 'All certifications unlocked' : 'No active access'}
                  </InfoRow>
                </div>
              </Card>

              {/* Cancel / manage */}
              {canCancel ? (
                <Card variant="tinted" className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h4 className="text-sm font-bold text-[#0A2540]">Cancel subscription</h4>
                      <p className="text-sm text-gray-500 mt-0.5 max-w-md">
                        Cancel anytime. You&rsquo;ll keep full access until the end of your current
                        billing period{periodEnd ? ` (${formatDate(periodEnd)})` : ''}.
                      </p>
                    </div>
                    <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                      Cancel subscription
                    </Button>
                  </div>
                </Card>
              ) : isManualGrant ? (
                <Card variant="tinted" className="p-5">
                  <h4 className="text-sm font-bold text-[#0A2540]">Manage access</h4>
                  <p className="text-sm text-gray-500 mt-0.5 max-w-md">
                    Your access was granted manually — there&rsquo;s no PayPal subscription to manage
                    here. Need a change? Just reach out.
                  </p>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#00A884] hover:underline"
                  >
                    <Mail className="w-4 h-4" /> {SUPPORT_EMAIL}
                  </a>
                </Card>
              ) : isCancelled ? (
                <Card variant="tinted" className="p-5">
                  <h4 className="text-sm font-bold text-[#0A2540]">Subscription cancelled</h4>
                  <p className="text-sm text-gray-500 mt-0.5 max-w-md">
                    This subscription is cancelled and won&rsquo;t renew. You can resubscribe anytime
                    from your dashboard.
                  </p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/dashboard')}>
                    Resubscribe <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Card>
              ) : null}

              {!isManualGrant && (
                <p className="text-xs text-gray-400 px-1">
                  You can also manage or cancel directly from your{' '}
                  <a
                    href={PAYPAL_BILLING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-500 hover:text-gray-700 inline-flex items-center gap-0.5"
                  >
                    PayPal account <ExternalLink className="w-3 h-3" />
                  </a>.
                </p>
              )}
            </div>
          )}
        </Container>
      </div>

      {/* Cancel confirmation */}
      <Modal isOpen={confirmOpen} onClose={() => !cancelling && setConfirmOpen(false)}>
        <ModalHeader
          title="Cancel your subscription?"
          description="This stops future PayPal billing. You keep access until your current period ends."
          onClose={() => !cancelling && setConfirmOpen(false)}
        />
        <div className="px-6 py-5">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Your access continues until{' '}
              <strong>{formatDate(periodEnd)}</strong>. After that you&rsquo;ll lose access to all
              certifications unless you resubscribe.
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5 px-6 pb-6">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={cancelling}>
            Keep subscription
          </Button>
          <Button variant="danger" onClick={handleCancel} loading={cancelling} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Yes, cancel'}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Account
