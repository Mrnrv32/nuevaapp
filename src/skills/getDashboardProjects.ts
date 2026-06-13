import { supabase } from '../lib/supabase'
import type { ProjectWithProgress, ParaType } from '../types/projects'

export async function getDashboardProjects(paraType?: ParaType): Promise<ProjectWithProgress[]> {
  let query = supabase
    .from('projects')
    .select('*, tasks(id, status)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (paraType) query = query.eq('para_type', paraType)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row: any) => {
    const tasks: { status: string }[] = row.tasks ?? []
    return {
      ...row,
      tasks: undefined,
      total_count: tasks.length,
      done_count: tasks.filter(t => t.status === 'done').length,
    }
  }) as ProjectWithProgress[]
}
