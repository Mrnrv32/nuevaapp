export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface Task {
  id: string
  project_id: string
  user_id: string
  title: string
  status: TaskStatus
  due_date: string | null
  time_estimate: string | null
  position: number
  created_at: string
  updated_at: string
}

export type NewTask = Pick<Task, 'title' | 'due_date' | 'time_estimate'>
export type TaskPatch = Partial<Pick<Task, 'title' | 'status' | 'due_date' | 'time_estimate' | 'position'>>
