import { supabase } from '../lib/supabase'
import type { Project, ProjectPatch } from '../types/projects'

export async function updateProject(id: string, patch: ProjectPatch): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Project
}
