import { seedFirestore } from "./utils/seedFirestore";

<button onClick={seedFirestore}>
  🌱 Seed Database
</button>

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

export const dashboardStats: DashboardStats = {
  totalSales: 342,
  revenue: 48250,
  expenses: 18730,
  netProfit: 29520,
  products: 64,
}

export const recentSales: RecentSale[] = [
  { id: '1', product: 'Wireless Mouse', customer: 'Alice Johnson', date: '2026-06-30', amount: 29.99 },
  { id: '2', product: 'Mechanical Keyboard', customer: 'Bob Smith', date: '2026-06-29', amount: 89.99 },
  { id: '3', product: 'USB-C Hub', customer: 'Carol White', date: '2026-06-28', amount: 45.00 },
  { id: '4', product: 'Monitor Stand', customer: 'David Brown', date: '2026-06-27', amount: 59.99 },
  { id: '5', product: 'Webcam HD', customer: 'Eve Davis', date: '2026-06-26', amount: 79.99 },
]

export const lowStockProducts: LowStockProduct[] = [
  { id: '1', name: 'Wireless Mouse', stock: 3, minStock: 10 },
  { id: '2', name: 'USB-C Cable', stock: 5, minStock: 20 },
  { id: '3', name: 'Laptop Sleeve', stock: 2, minStock: 15 },
  { id: '4', name: 'HDMI Adapter', stock: 4, minStock: 12 },
  { id: '5', name: 'Desk Lamp', stock: 1, minStock: 8 },
]


