import { supabase } from '../lib/supabase'
import type { Task } from '../types/tasks'

function parseTaskTitles(rawText: string): string[] {
  return rawText
    .split('\n')
    .map(line => line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(line => line.length > 0)
}

export async function importTasksFromText(projectId: string, rawText: string): Promise<Task[]> {
  const titles = parseTaskTitles(rawText)
  if (titles.length === 0) return []

  const rows = titles.map((title, index) => ({
    project_id: projectId,
    title,
    position: index,
  }))

  const { data, error } = await supabase
    .from('tasks')
    .insert(rows)
    .select()

  if (error) throw error
  return data as Task[]
}
