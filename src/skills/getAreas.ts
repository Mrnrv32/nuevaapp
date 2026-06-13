import { supabase } from '../lib/supabase'
import type { Area } from '../types/areas'

export async function getAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
