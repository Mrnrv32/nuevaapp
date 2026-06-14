import { supabase } from '../lib/supabase'
import type { Area, AreaPatch } from '../types/areas'

export async function updateArea(id: string, patch: AreaPatch): Promise<Area> {
  const { data, error } = await supabase
    .from('areas')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
