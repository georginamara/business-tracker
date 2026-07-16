import { useCallback } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './useAuth'
import { useAdmin } from './useAdmin'
import type { AuditChanges } from '../data/audit'

export function useAudit() {
  const { user } = useAuth()
  const { isSuperAdmin, isAdmin } = useAdmin()

  const logAction = useCallback(
    async (params: {
      action: string
      targetUid: string | null
      targetStore: string | null
      changes: AuditChanges | null
    }) => {
      if (!user) throw new Error('Not authenticated')

      const actorRole = isSuperAdmin ? 'superadmin' : isAdmin ? 'admin' : 'owner'

      await addDoc(collection(db, 'audit_logs'), {
        actorUid: user.uid,
        actorEmail: user.email ?? '',
        actorRole,
        action: params.action,
        targetUid: params.targetUid,
        targetStore: params.targetStore,
        changes: params.changes,
        metadata: {
          ip: null,
          device: navigator.userAgent,
        },
        createdAt: serverTimestamp(),
      })
    },
    [user, isSuperAdmin, isAdmin]
  )

  return { logAction }
}
