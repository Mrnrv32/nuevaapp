import { supabase } from '../lib/supabase'
import type { Project, ParaType } from '../types/projects'

export async function getProjects(paraType?: ParaType): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (paraType) query = query.eq('para_type', paraType)

  const { data, error } = await query
  if (error) throw error
  return data as Project[]
}
