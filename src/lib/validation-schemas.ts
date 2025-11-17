import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Profile schemas
export const profileTypeEnum = z.enum([
  'salary_earner',
  'micro_business',
  'freelancer',
  'crypto_trader',
  'mixed',
])

export const profileSchema = z.object({
  fullName: z.string().min(2),
  profileType: profileTypeEnum,
  industry: z.string().optional(),
  email: z.string().email(),
})

// Income schemas
export const incomeSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  source: z.string().min(1, 'Source is required'),
  category: z.enum(['business', 'personal', 'crypto', 'capital_gains', 'salary']),
  paymentMethod: z.enum(['cash', 'transfer', 'pos', 'digital']),
  timestamp: z.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// Expense schemas
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  isDeductible: z.boolean().default(false),
  timestamp: z.date(),
  notes: z.string().optional(),
  attachmentUrl: z.string().url().optional(),
})

// Tax calculation schemas
export const taxCalculationSchema = z.object({
  totalIncome: z.number().nonnegative(),
  deductibleExpenses: z.number().nonnegative(),
  annualRentPaid: z.number().nonnegative(),
  profileType: profileTypeEnum,
})

export const cgtCalculationSchema = z.object({
  assetType: z.enum(['crypto', 'property', 'vehicle', 'shares', 'other']),
  buyPrice: z.number().positive(),
  sellPrice: z.number().positive(),
  buyDate: z.date(),
  sellDate: z.date(),
  fees: z.number().nonnegative().optional(),
  holdingPeriod: z.number().positive().optional(),
})

// Form types (derived from schemas)
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type IncomeFormData = z.infer<typeof incomeSchema>
export type ExpenseFormData = z.infer<typeof expenseSchema>
export type TaxCalculationData = z.infer<typeof taxCalculationSchema>
export type CGTCalculationData = z.infer<typeof cgtCalculationSchema>

// Export all schemas for form resolvers
export const schemas = {
  login: loginSchema,
  register: registerSchema,
  profile: profileSchema,
  income: incomeSchema,
  expense: expenseSchema,
  taxCalculation: taxCalculationSchema,
  cgtCalculation: cgtCalculationSchema,
}
