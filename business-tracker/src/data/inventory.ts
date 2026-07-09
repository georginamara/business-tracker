export interface InventoryMovement {
  id: string
  ownerId: string
  productId: string
  productName: string
  type: 'restock' | 'adjustment'
  quantityAdded?: number
  adjustmentType?: 'increase' | 'decrease'
  quantity?: number
  reason?: string
  previousStock: number
  newStock: number
  supplier?: string
  notes?: string
  createdAt: string
}
