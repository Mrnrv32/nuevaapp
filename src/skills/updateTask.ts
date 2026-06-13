import { supabase } from '../lib/supabase'
import type { Task, TaskPatch } from '../types/tasks'

export async function updateTask(id: string, patch: TaskPatch): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}
