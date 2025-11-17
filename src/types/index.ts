export type ProfileType =
  | 'salary_earner'
  | 'small_business'
  | 'seller'
  | 'pos_agent'
  | 'freelancer'
  | 'crypto_trader'
  | 'mixed_income'
  | 'student'

export type PaymentMethod =
  | 'cash'
  | 'transfer'
  | 'pos'
  | 'digital'
  | 'other'

export type SubscriptionTier = 'free' | 'trial' | 'pro'

export interface TransactionSplit {
  id: string
  category: string
  amount: number
  notes?: string
}

export interface TransactionAttachment {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  previewUrl?: string
  source: 'upload' | 'ocr' | 'whatsapp'
  status?: 'pending' | 'processed' | 'failed'
  confidence?: number
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  profileType: ProfileType
  industry?: string
  createdAt: Date
  updatedAt: Date
  onboardingCompleted?: boolean
  subscriptionTier?: SubscriptionTier
  businessName?: string
  businessType?: string
}

export type IncomeCategory =
  | 'personal_income'
  | 'business_income'
  | 'non_taxable'
  | 'capital_gains'
  | 'windfall'
  | 'salary'
  | 'freelance'
  | 'sales'
  | 'other'

export interface Income {
  id: string
  userId: string
  amount: number
  category: IncomeCategory
  source: string
  paymentMethod: PaymentMethod
  timestamp: Date
  notes?: string
  ocrText?: string
  attachmentUrl?: string
  tags?: string[]
  splits?: TransactionSplit[]
  attachments?: TransactionAttachment[]
  isBusiness?: boolean
  createdOffline?: boolean
  sourceSystem?: 'manual' | 'ocr' | 'whatsapp'
}

export interface Expense {
  id: string
  userId: string
  amount: number
  category: string
  isDeductible: boolean
  timestamp: Date
  notes?: string
  attachmentUrl?: string
  tags?: string[]
  splits?: TransactionSplit[]
  attachments?: TransactionAttachment[]
  isBusiness?: boolean
  createdOffline?: boolean
  sourceSystem?: 'manual' | 'ocr' | 'whatsapp'
}

export interface TaxRules {
  version: string
  pitBands: PitBand[]
  rentRelief: { percent: number; cap: number }
}

export interface PitBand {
  bandFrom: number
  bandTo: number | null
  rate: number
}

export interface TaxCalculationBandBreakdown {
  bandFrom: number
  bandTo: number | null
  rate: number
  taxableAmount: number
  taxForBand: number
}

export interface TaxCalculation {
  taxableIncome: number
  taxDue: number
  rentRelief: number
  ruleVersion: string
  effectiveTaxRate?: number
  monthlyTax?: number
  quarterlyTax?: number
  bandBreakdown?: TaxCalculationBandBreakdown[]
}

export interface BusinessTaxEstimate {
  profit: number
  corporateEstimatedTax?: number
  personalTax?: TaxCalculation
}

export interface OnboardingAnswers {
  incomeTypes: string[]
  goals: string[]
  businessName?: string
  businessType?: string
}
