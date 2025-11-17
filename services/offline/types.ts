export type SyncEvent = {
  eventId: string
  clientId: string
  createdAt: string
  baseVersion?: number
  type: 'income_add' | 'expense_add' | 'income_update' | 'expense_update'
  payload: any
  status: 'queued' | 'syncing' | 'synced' | 'conflict' | 'failed'
  retries: number
  serverVersion?: number
  conflictInfo?: any
}
