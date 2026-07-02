export interface Sale {
  id: string
  date: string
  product: string
  quantity: number
  total: number
}

export const initialSales: Sale[] = [
  { id: '1', date: '2026-06-30', product: 'Wireless Mouse', quantity: 5, total: 149.95 },
  { id: '2', date: '2026-06-29', product: 'Mechanical Keyboard', quantity: 2, total: 179.98 },
  { id: '3', date: '2026-06-28', product: 'USB-C Hub', quantity: 8, total: 360.00 },
  { id: '4', date: '2026-06-28', product: 'Monitor Stand', quantity: 3, total: 179.97 },
  { id: '5', date: '2026-06-27', product: 'Webcam HD', quantity: 4, total: 319.96 },
  { id: '6', date: '2026-06-26', product: 'USB-C Cable', quantity: 15, total: 194.85 },
]
