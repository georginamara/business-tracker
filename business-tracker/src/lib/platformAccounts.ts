import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'

let cachedAdminUids: Set<string> | null = null

export async function fetchAdminUids(): Promise<Set<string>> {
  if (cachedAdminUids) return cachedAdminUids

  const snap = await getDocs(collection(db, 'admins'))
  const uids = new Set<string>()
  snap.forEach((doc) => uids.add(doc.id))
  cachedAdminUids = uids
  return uids
}

export function clearAdminUidCache() {
  cachedAdminUids = null
}
