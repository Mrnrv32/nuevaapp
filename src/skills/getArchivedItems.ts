import { supabase } from '../lib/supabase'
import type { Project } from '../types/projects'
import type { Area } from '../types/areas'
import type { Resource } from '../types/resources'

export interface ArchivedItems {
  projects: Project[]
  areas: Area[]
  resources: Resource[]
}

export async function getArchivedItems(): Promise<ArchivedItems> {
  const [{ data: projects, error: pe }, { data: areas, error: ae }, { data: resources, error: re }] =
    await Promise.all([
      supabase.from('projects').select('*').eq('status', 'archived').order('updated_at', { ascending: false }),
      supabase.from('areas').select('*').eq('status', 'archived').order('created_at', { ascending: false }),
      supabase.from('resources').select('*').eq('status', 'archived').order('updated_at', { ascending: false }),
    ])

  if (pe) throw pe
  if (ae) throw ae
  if (re) throw re

  return {
    projects: (projects ?? []) as Project[],
    areas: (areas ?? []) as Area[],
    resources: (resources ?? []) as Resource[],
  }
}
