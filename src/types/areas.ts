export type AreaStatus = 'active' | 'archived'

export interface Area {
  id: string
  title: string
  description: string | null
  color: string
  status: AreaStatus
  created_at: string
}

export type NewArea = Pick<Area, 'title' | 'description' | 'color'>
export type AreaPatch = Partial<Pick<Area, 'title' | 'description' | 'color' | 'status'>>

export interface AreaWithLastLog extends Area {
  last_logged_at: string | null
}

export interface AreaLog {
  id: string
  area_id: string
  content: string
  logged_at: string
  created_at: string
}

export type NewAreaLog = Pick<AreaLog, 'content' | 'logged_at'>

export const AREA_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
] as const
