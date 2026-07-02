export interface MonthlySalesData {
  month: string
  sales: number
}

export interface MonthlyComparisonData {
  month: string
  revenue: number
  expenses: number
}

export interface ExpenseCategoryData {
  name: string
  value: number
  color: string
}

export const monthlySalesData: MonthlySalesData[] = [
  { month: 'Jan', sales: 28 },
  { month: 'Feb', sales: 35 },
  { month: 'Mar', sales: 42 },
  { month: 'Apr', sales: 38 },
  { month: 'May', sales: 51 },
  { month: 'Jun', sales: 45 },
  { month: 'Jul', sales: 55 },
  { month: 'Aug', sales: 48 },
  { month: 'Sep', sales: 62 },
  { month: 'Oct', sales: 58 },
  { month: 'Nov', sales: 70 },
  { month: 'Dec', sales: 65 },
]

export const monthlyRevenueExpenses: MonthlyComparisonData[] = [
  { month: 'Jan', revenue: 4200, expenses: 1800 },
  { month: 'Feb', revenue: 5100, expenses: 2100 },
  { month: 'Mar', revenue: 5800, expenses: 1900 },
  { month: 'Apr', revenue: 4900, expenses: 2200 },
  { month: 'May', revenue: 6500, expenses: 2400 },
  { month: 'Jun', revenue: 5700, expenses: 2000 },
  { month: 'Jul', revenue: 7100, expenses: 2600 },
  { month: 'Aug', revenue: 6300, expenses: 2300 },
  { month: 'Sep', revenue: 8200, expenses: 2800 },
  { month: 'Oct', revenue: 7600, expenses: 2500 },
  { month: 'Nov', revenue: 9500, expenses: 3100 },
  { month: 'Dec', revenue: 8900, expenses: 2900 },
]

export const expenseCategoryColors: Record<string, string> = {
  Rent: '#6366f1',
  Utilities: '#f59e0b',
  Supplies: '#10b981',
  Marketing: '#ec4899',
  Software: '#8b5cf6',
  Labor: '#f97316',
  Logistics: '#06b6d4',
  Other: '#6b7280',
}
