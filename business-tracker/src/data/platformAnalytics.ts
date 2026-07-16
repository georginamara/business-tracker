export interface PlatformAnalytics {
  totalStores: number
  activeAccounts: number
  trialAccounts: number
  expiredAccounts: number
  suspendedAccounts: number
  disabledAccounts: number
  businessPlans: number
  proPlans: number
  starterPlans: number
  todaysLogins: number
  newStoresThisMonth: number
  monthlyGrowthRate: number | null
  trialConversionRate: number | null
  estimatedMonthlyRevenue: number
  monthlyRegistrations: MonthlyRegistration[]
  plansDistribution: PlanDistribution[]
  accountStatusDistribution: StatusDistribution[]
  businessTypeDistribution: BusinessTypeDistribution[]
  dailyLogins: DailyLogin[]
}

export interface BusinessTypeDistribution {
  name: string
  count: number
  fill: string
}

export interface MonthlyRegistration {
  month: string
  registrations: number
}

export interface PlanDistribution {
  name: string
  count: number
  fill: string
}

export interface StatusDistribution {
  name: string
  value: number
  color: string
}

export interface DailyLogin {
  date: string
  logins: number
}
