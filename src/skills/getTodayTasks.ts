import { supabase } from '../lib/supabase'
import type { Task } from '../types/tasks'

export interface TodayTask extends Task {
  project_title: string
}

export async function getTodayTasks(): Promise<TodayTask[]> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects!inner(title, status)')
    .eq('due_date', today)
    .eq('projects.status', 'active')
    .neq('status', 'done')
    .order('position', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    project_title: row.projects.title,
    projects: undefined,
  })) as TodayTask[]
}
