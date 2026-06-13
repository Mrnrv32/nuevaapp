import { supabase } from '../lib/supabase'
import type { Task, NewTask } from '../types/tasks'

export async function createTask(projectId: string, input: NewTask): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...input, project_id: projectId })
    .select()
    .single()

  if (error) throw error
  return data as Task
}
