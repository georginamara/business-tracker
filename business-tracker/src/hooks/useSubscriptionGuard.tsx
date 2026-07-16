import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import { useAuth } from './useAuth'
import { useSubscription } from './useSubscription'
import { useAdmin } from './useAdmin'

export function useSubscriptionGuard() {
  const { user } = useAuth()
  const { subscription, loading: subLoading, updateSubscription } = useSubscription()
  const { isSuperAdmin, loading: adminLoading } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const [trialDaysRemaining, setTrialDaysRemaining] = useState<number | null>(null)
  const [trialWarningDismissed, setTrialWarningDismissed] = useState(false)
  const updatingRef = useRef(false)

  useEffect(() => {
    if (subLoading || adminLoading || !user) return
    if (!subscription || isSuperAdmin) return

    let cancelled = false

    const run = async () => {
      if (subscription.accountStatus === 'disabled') {
        if (location.pathname !== '/account-disabled') {
          navigate('/account-disabled', { replace: true })
        }
        return
      }

      if (subscription.accountStatus === 'suspended') {
        if (location.pathname !== '/account-suspended') {
          navigate('/account-suspended', { replace: true })
        }
        return
      }

      const now = Timestamp.now()

      if (subscription.status === 'trial' && subscription.trialEndsAt.toMillis() < now.toMillis()) {
        if (location.pathname !== '/subscription-expired') {
          if (!updatingRef.current && !cancelled) {
            updatingRef.current = true
            try {
              await updateSubscription({ status: 'expired' })
            } finally {
              updatingRef.current = false
            }
          }
          if (!cancelled) navigate('/subscription-expired', { replace: true })
        }
        return
      }

      if (
        subscription.status === 'active' &&
        subscription.subscriptionEndsAt &&
        subscription.subscriptionEndsAt.toMillis() < now.toMillis()
      ) {
        if (location.pathname !== '/subscription-expired') {
          if (!updatingRef.current && !cancelled) {
            updatingRef.current = true
            try {
              await updateSubscription({ status: 'expired' })
            } finally {
              updatingRef.current = false
            }
          }
          if (!cancelled) navigate('/subscription-expired', { replace: true })
        }
        return
      }

      if (subscription.status === 'expired') {
        if (location.pathname !== '/subscription-expired') {
          navigate('/subscription-expired', { replace: true })
        }
        return
      }

      if (!cancelled) {
        if (subscription.status === 'trial') {
          const days = Math.ceil(
            (subscription.trialEndsAt.toMillis() - now.toMillis()) / (1000 * 60 * 60 * 24)
          )
          setTrialDaysRemaining(days)
        } else {
          setTrialDaysRemaining(null)
        }
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [subscription, subLoading, isSuperAdmin, adminLoading, user, navigate, location.pathname, updateSubscription])

  const showTrialWarning =
    !trialWarningDismissed && trialDaysRemaining !== null && trialDaysRemaining <= 3 && trialDaysRemaining >= 0

  const dismissTrialWarning = useCallback(() => {
    setTrialWarningDismissed(true)
  }, [])

  return {
    loading: subLoading || adminLoading,
    trialDaysRemaining,
    showTrialWarning,
    dismissTrialWarning,
  }
}
