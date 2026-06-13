import { supabase } from '../lib/supabase'
import type { Resource, ResourcePatch } from '../types/resources'

export async function updateResource(id: string, patch: ResourcePatch): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
