import { supabase } from '../lib/supabase'
import type { Area, NewArea } from '../types/areas'

export async function createArea(input: NewArea): Promise<Area> {
  const { data, error } = await supabase
    .from('areas')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}
