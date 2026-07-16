export type PlanName = 'Starter' | 'Business' | 'Pro' | 'Platform'

export type PermissionKey =
  | 'dashboard'
  | 'pos'
  | 'products'
  | 'sales'
  | 'inventory'
  | 'expenses'
  | 'credits'
  | 'reports'
  | 'advanced_analytics'
  | 'ai_insights'
  | 'sales_forecasting'

export interface PlanPermissions {
  dashboard: boolean
  pos: boolean
  products: boolean
  sales: boolean
  inventory: boolean
  expenses: boolean
  credits: boolean
  reports: boolean
  advanced_analytics: boolean
  ai_insights: boolean
  sales_forecasting: boolean
}

export interface PlanDef {
  id: PlanName
  label: string
  monthlyPrice: number
  currencySymbol: string
  priceLabel: string
  description: string
  permissions: PlanPermissions
  features: string[]
  recommended?: boolean
}

const STARTER_FEATURES = [
  'Dashboard',
  'Point of Sale (POS)',
  'Product Management',
  'Sales History',
  'Inventory History',
  'Expense Tracking',
]

const BUSINESS_FEATURES = [
  'Everything in Starter',
  'Credits Management',
  'Reports (CSV & PDF Export)',
  'Inventory Movement History',
  'Business Dashboard Reports',
]

const PRO_FEATURES = [
  'Everything in Business',
  'Advanced Analytics',
  'AI Insights',
  'Sales Forecasting',
  'Future Premium Features',
  'Priority Support',
]

const PLATFORM_FEATURES = [
  'Full Platform Access',
  'All Business Features',
  'Advanced Analytics',
  'AI Insights',
  'Sales Forecasting',
  'Platform Management',
]

export const PLANS: PlanDef[] = [
  {
    id: 'Starter',
    label: 'Starter',
    monthlyPrice: 199,
    currencySymbol: '₱',
    priceLabel: '₱199',
    description: 'Essential tools for small businesses getting started.',
    features: STARTER_FEATURES,
    permissions: {
      dashboard: true,
      pos: true,
      products: true,
      sales: true,
      inventory: true,
      expenses: true,
      credits: false,
      reports: false,
      advanced_analytics: false,
      ai_insights: false,
      sales_forecasting: false,
    },
  },
  {
    id: 'Business',
    label: 'Business',
    monthlyPrice: 299,
    currencySymbol: '₱',
    priceLabel: '₱299',
    description: 'Advanced features for growing businesses.',
    features: BUSINESS_FEATURES,
    recommended: true,
    permissions: {
      dashboard: true,
      pos: true,
      products: true,
      sales: true,
      inventory: true,
      expenses: true,
      credits: true,
      reports: true,
      advanced_analytics: false,
      ai_insights: false,
      sales_forecasting: false,
    },
  },
  {
    id: 'Pro',
    label: 'Pro',
    monthlyPrice: 499,
    currencySymbol: '₱',
    priceLabel: '₱499',
    description: 'Full power with AI and advanced analytics.',
    features: PRO_FEATURES,
    permissions: {
      dashboard: true,
      pos: true,
      products: true,
      sales: true,
      inventory: true,
      expenses: true,
      credits: true,
      reports: true,
      advanced_analytics: true,
      ai_insights: true,
      sales_forecasting: true,
    },
  },
  {
    id: 'Platform',
    label: 'Platform',
    monthlyPrice: 0,
    currencySymbol: '₱',
    priceLabel: '₱0',
    description: 'Platform owner account with full access.',
    features: PLATFORM_FEATURES,
    permissions: {
      dashboard: true,
      pos: true,
      products: true,
      sales: true,
      inventory: true,
      expenses: true,
      credits: true,
      reports: true,
      advanced_analytics: true,
      ai_insights: true,
      sales_forecasting: true,
    },
  },
]

export const PLAN_MAP: Record<PlanName, PlanDef> = {
  Starter: PLANS[0],
  Business: PLANS[1],
  Pro: PLANS[2],
  Platform: PLANS[3],
}

export const PLAN_NAMES: PlanName[] = ['Starter', 'Business', 'Pro', 'Platform']

export const PLAN_PRICES: Record<PlanName, number> = {
  Starter: 199,
  Business: 299,
  Pro: 499,
  Platform: 0,
}

export function getPermissionsForPlan(plan: string): PlanPermissions {
  const def = PLAN_MAP[plan as PlanName]
  if (def) return def.permissions
  return PLAN_MAP.Starter.permissions
}

export function isValidPlan(plan: string): plan is PlanName {
  return plan in PLAN_MAP
}

export function getMinPlanForFeature(feature: PermissionKey): PlanName | null {
  for (const plan of PLANS) {
    if (plan.permissions[feature]) return plan.id
  }
  return null
}
