export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  profileType: ProfileType
  industry?: string
  createdAt: Date
  updatedAt: Date
}

export type ProfileType = 
  | 'salary_earner'
  | 'small_business'
  | 'seller'
  | 'pos_agent'
  | 'freelancer'
  | 'crypto_trader'
  | 'mixed_income'
  | 'student'

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
}

export type IncomeCategory = 
  | 'personal_income'
  | 'business_income'
  | 'non_taxable'
  | 'capital_gains'
  | 'windfall'

export type PaymentMethod = 
  | 'cash'
  | 'transfer'
  | 'pos'
  | 'digital'
  | 'other'

export interface Expense {
  id: string
  userId: string
  amount: number
  category: string
  isDeductible: boolean
  timestamp: Date
  notes?: string
  attachmentUrl?: string
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

export interface TaxCalculation {
  taxableIncome: number
  taxDue: number
  rentRelief: number
  ruleVersion: string
}

export interface BusinessTaxEstimate {
  profit: number
  corporateEstimatedTax?: number
  personalTax?: TaxCalculation
}