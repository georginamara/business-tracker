import type { Timestamp } from 'firebase/firestore'

export type ActorRole = 'owner' | 'admin' | 'superadmin'

export interface AuditChangeEntry {
  old: unknown
  new: unknown
}

export interface AuditChanges {
  [field: string]: AuditChangeEntry
}

export interface AuditLog {
  actorUid: string
  actorEmail: string
  actorRole: ActorRole
  action: string
  targetUid: string | null
  targetStore: string | null
  changes: AuditChanges | null
  metadata: {
    ip: string | null
    device: string | null
  }
  createdAt: Timestamp
}

export interface AuditLogWithId extends AuditLog {
  id: string
}
