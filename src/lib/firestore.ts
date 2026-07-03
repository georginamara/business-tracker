import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  type CollectionReference,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'

const collections = {
  products: collection(db, 'products'),
  sales: collection(db, 'sales'),
  expenses: collection(db, 'expenses'),
} as const satisfies Record<string, CollectionReference>

type CollectionName = keyof typeof collections

export async function fetchAll<T extends { id: string }>(
  name: CollectionName,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = constraints.length > 0 ? query(collections[name], ...constraints) : collections[name]
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T))
}

export async function createDocument<T extends Record<string, unknown>>(
  name: CollectionName,
  data: T
): Promise<string> {
  const ref = await addDoc(collections[name], data)
  return ref.id
}

export async function updateDocument(
  name: CollectionName,
  id: string,
  data: Record<string, unknown>
): Promise<void> {
  await updateDoc(doc(collections[name], id), data)
}

export async function deleteDocument(name: CollectionName, id: string): Promise<void> {
  await deleteDoc(doc(collections[name], id))
}

export function subscribeToCollection<T extends { id: string }>(
  name: CollectionName,
  onData: (items: T[]) => void,
  onError?: (error: Error) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  const q = constraints.length > 0 ? query(collections[name], ...constraints) : collections[name]
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T))
      onData(items)
    },
    onError
  )
}
