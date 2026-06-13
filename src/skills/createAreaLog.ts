import { supabase } from '../lib/supabase'
import type { AreaLog, NewAreaLog } from '../types/areas'

export async function createAreaLog(areaId: string, input: NewAreaLog): Promise<AreaLog> {
  const { data, error } = await supabase
    .from('area_logs')
    .insert({ area_id: areaId, ...input })
    .select()
    .single()

  if (error) throw error
  return data
}
