export interface DashboardStats {
  totalSales: number
  revenue: number
  expenses: number
  netProfit: number
  products: number
}

export interface RecentSale {
  id: string
  product: string
  customer: string
  date: string
  amount: number
}

export interface LowStockProduct {
  id: string
  name: string
  stock: number
  minStock: number
}
