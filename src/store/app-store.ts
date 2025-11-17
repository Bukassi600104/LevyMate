import { create } from 'zustand'
import { 
  User, 
  Income, 
  Expense, 
  ProfileType, 
  SubscriptionTier 
} from '@/types'
import { queueStorage } from '@/lib/storage'

export interface AppState {
  user: User | null
  isAuthenticated: boolean
  onboardingCompleted: boolean
  subscriptionTier: SubscriptionTier

  incomes: Income[]
  expenses: Expense[]

  activeTab: string
  isLoading: boolean
  syncQueueLength: number

  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  setOnboardingCompleted: (completed: boolean) => void
  setSubscriptionTier: (tier: SubscriptionTier) => void
  setIncomes: (incomes: Income[]) => void
  setExpenses: (expenses: Expense[]) => void
  addIncome: (income: Income) => void
  updateIncome: (incomeId: string, updates: Partial<Income>) => void
  deleteIncome: (incomeId: string) => void
  addExpense: (expense: Expense) => void
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void
  deleteExpense: (expenseId: string) => void
  setActiveTab: (tab: string) => void
  setLoading: (loading: boolean) => void
  refreshSyncQueueLength: () => void
}

const defaultUser: User = {
  id: 'guest',
  fullName: 'Guest User',
  email: 'guest@levymate.app',
  phone: '+2340000000000',
  profileType: 'small_business' as ProfileType,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const useAppStore = create<AppState>((set, get) => ({
  user: defaultUser,
  isAuthenticated: false,
  onboardingCompleted: false,
  subscriptionTier: 'free',
  incomes: [],
  expenses: [],
  activeTab: 'dashboard',
  isLoading: false,
  syncQueueLength: 0,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setOnboardingCompleted: (onboardingCompleted) => set({ onboardingCompleted }),
  setSubscriptionTier: (subscriptionTier) => set({ subscriptionTier }),
  setIncomes: (incomes) => set({ incomes }),
  setExpenses: (expenses) => set({ expenses }),
  addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
  updateIncome: (incomeId, updates) =>
    set((state) => ({
      incomes: state.incomes.map((income) =>
        income.id === incomeId ? { ...income, ...updates } : income
      ),
    })),
  deleteIncome: (incomeId) =>
    set((state) => ({ incomes: state.incomes.filter((income) => income.id !== incomeId) })),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  updateExpense: (expenseId, updates) =>
    set((state) => ({
      expenses: state.expenses.map((expense) =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      ),
    })),
  deleteExpense: (expenseId) =>
    set((state) => ({ expenses: state.expenses.filter((expense) => expense.id !== expenseId) })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
  refreshSyncQueueLength: () =>
    set({ syncQueueLength: queueStorage.getQueueLength() }),
}))
