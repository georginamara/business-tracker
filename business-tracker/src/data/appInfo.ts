export const APP_NAME = 'Business Tracker'
export const APP_VERSION = '1.0.0'
export const SUPPORT_EMAIL = 'support@businesstracker.app'
export const DEVELOPER = 'Georgina Mara'
export const COPYRIGHT_YEAR = new Date().getFullYear()

export const APP_DESCRIPTION =
  'Business Tracker is a comprehensive point-of-sale and business management system ' +
  'designed for small and medium enterprises — including sari-sari stores, food & beverage ' +
  'shops, restaurants, cafés, milk tea shops, bakeries, groceries, pharmacies, hardware ' +
  'stores, clothing shops, electronics stores, and service businesses. ' +
  'It streamlines daily operations including sales tracking, inventory management, expense ' +
  'monitoring, credit management, and detailed financial reporting — all in one place.'

export interface ReleaseNote {
  version: string
  date: string
  changes: string[]
}

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: '1.0.0',
    date: 'July 2026',
    changes: [
      'Initial public release',
      'Point of Sale (POS) system',
      'Product and inventory management',
      'Sales history and tracking',
      'Expense tracking with categories',
      'Credits management with payment recording',
      'Reports with CSV and PDF export',
      'Subscription-based plan access control',
      'Dark mode support',
      'Responsive design for mobile and desktop',
    ],
  },
]
