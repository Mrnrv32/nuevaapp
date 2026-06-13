import { supabase } from '../lib/supabase'
import type { Project, NewProject } from '../types/projects'

export async function createProject(input: NewProject): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as Project
}
