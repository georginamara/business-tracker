import type { Timestamp } from 'firebase/firestore'

export interface InventoryMovement {
  id: string
  ownerId: string
  productId: string
  productName: string
  type: 'restock' | 'adjustment' | 'sale'
  quantityAdded?: number
  adjustmentType?: 'increase' | 'decrease'
  quantity?: number
  reason?: string
  saleId?: string
  previousStock: number
  newStock: number
  supplier?: string
  notes?: string
  createdAt: Timestamp
}
