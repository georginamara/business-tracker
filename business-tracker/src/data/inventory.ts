export interface InventoryMovement {
  id: string
  ownerId: string
  productId: string
  productName: string
  type: 'restock'
  quantityAdded: number
  previousStock: number
  newStock: number
  supplier?: string
  notes?: string
  createdAt: string
}
