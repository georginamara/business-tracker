import { useMemo, useCallback } from 'react'
import { useSubscription } from './useSubscription'
import { useAdmin } from './useAdmin'
import {
  getPermissionsForPlan,
  getMinPlanForFeature,
  PLAN_MAP,
  PLAN_NAMES,
  isValidPlan,
  type PlanName,
  type PlanPermissions,
  type PermissionKey,
} from '../data/plans'

interface PlanAccessValue {
  plan: PlanName
  permissions: PlanPermissions
  hasAccess: (feature: PermissionKey) => boolean
  requiredPlan: (feature: PermissionKey) => PlanName | null
  isStarter: boolean
  isBusiness: boolean
  isPro: boolean
  isPlatform: boolean
}

export function usePlanAccess(): PlanAccessValue {
  const { subscription } = useSubscription()
  const { isSuperAdmin } = useAdmin()

  const plan: PlanName = useMemo(() => {
    const raw = subscription?.plan
    if (raw && isValidPlan(raw)) return raw
    return 'Starter'
  }, [subscription?.plan])

  const permissions = useMemo(() => getPermissionsForPlan(plan), [plan])

  const hasAccess = useCallback(
    (feature: PermissionKey): boolean => {
      if (isSuperAdmin) return true
      return permissions[feature] === true
    },
    [permissions, isSuperAdmin]
  )

  const requiredPlan = useCallback(
    (feature: PermissionKey): PlanName | null => {
      return getMinPlanForFeature(feature)
    },
    []
  )

  return {
    plan,
    permissions,
    hasAccess,
    requiredPlan,
    isStarter: plan === 'Starter',
    isBusiness: plan === 'Business',
    isPro: plan === 'Pro',
    isPlatform: plan === 'Platform',
  }
}

export function getNextPlan(currentPlan: PlanName): PlanName | null {
  const idx = PLAN_NAMES.indexOf(currentPlan)
  if (idx < PLAN_NAMES.length - 1) return PLAN_NAMES[idx + 1]
  return null
}

export function getRequiredPlanName(feature: PermissionKey): PlanName | null {
  return getMinPlanForFeature(feature)
}

export { PLAN_MAP, PLAN_NAMES, isValidPlan }
export type { PlanName, PlanPermissions, PermissionKey }
