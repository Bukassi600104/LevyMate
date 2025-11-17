import { create } from 'zustand'
import { User, Income, Expense, ProfileType } from '@/types'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Data state
  incomes: Income[]
  expenses: Expense[]
  
  // UI state
  activeTab: string
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (isAuthenticated: boolean) => void
  addIncome: (income: Income) => void
  addExpense: (expense: Expense) => void
  setActiveTab: (tab: string) => void
  setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  incomes: [],
  expenses: [],
  activeTab: 'dashboard',
  isLoading: false,
  
  // Actions
  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  setActiveTab: (activeTab) => set({ activeTab }),
  setLoading: (isLoading) => set({ isLoading }),
}))