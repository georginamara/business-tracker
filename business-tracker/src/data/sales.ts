export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Sale {
  id: string
  date: string
  items: SaleItem[]
  total: number
  discount?: number
  paid?: number
  change?: number
  paymentMethod?: 'cash' | 'credit'
}
