import axios, { AxiosInstance, AxiosError } from 'axios'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  rule_version?: string
  calculated_at?: string
}

export interface ApiError {
  message: string
  status: number
  code?: string
}

class ApiClient {
  private client: AxiosInstance
  private requestId: string = ''

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor: add request ID
    this.client.interceptors.request.use((config) => {
      this.requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      config.headers['x-request-id'] = this.requestId
      
      // Add JWT token if available
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
      }
      
      return config
    })

    // Response interceptor: handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear auth and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async post<T>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async patch<T>(url: string, data?: any, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(url, data, config)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  async delete<T>(url: string, config = {}): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(url, config)
      return response.data
    } catch (error) {
      return this.handleError(error)
    }
  }

  private handleError(error: any): ApiResponse {
    const apiError: ApiError = {
      message: 'An error occurred',
      status: 500,
    }

    if (axios.isAxiosError(error)) {
      apiError.status = error.response?.status || 500
      apiError.message = error.response?.data?.error || error.message
      apiError.code = error.code
    } else if (error instanceof Error) {
      apiError.message = error.message
    }

    console.error(`[API Error] ${this.requestId}:`, apiError)

    return {
      success: false,
      error: apiError.message,
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Tax calculation API
export const taxApi = {
  calculatePIT: (payload: {
    totalIncome: number
    deductibleExpenses: number
    annualRentPaid: number
    profileType: string
  }) => apiClient.post('/tax/pit', payload),

  calculateCGT: (payload: {
    assetType: string
    buyPrice: number
    sellPrice: number
    holdingPeriod: number
    userIncomeContext: number
  }) => apiClient.post('/tax/cgt', payload),

  getRules: () => apiClient.get('/tax/rules'),
}

// Income API
export const incomeApi = {
  add: (payload: any) => apiClient.post('/income/add', payload),
  list: () => apiClient.get('/income/list'),
  summary: () => apiClient.get('/income/summary'),
  ocrUpload: (formData: FormData) =>
    apiClient.post('/income/ocr-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// Expense API
export const expenseApi = {
  add: (payload: any) => apiClient.post('/expense/add', payload),
  list: () => apiClient.get('/expense/list'),
  summary: () => apiClient.get('/expense/summary'),
  ocrUpload: (formData: FormData) =>
    apiClient.post('/expense/ocr-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

// User API
export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (payload: any) => apiClient.patch('/user/profile', payload),
  exportData: () => apiClient.get('/user/export-data'),
  deleteAccount: () => apiClient.delete('/user/account'),
}

// Reports API
export const reportsApi = {
  generate: (payload: { reportType: 'yearly' | 'monthly' | 'cgt' }) =>
    apiClient.post('/reports/generate', payload),
}
