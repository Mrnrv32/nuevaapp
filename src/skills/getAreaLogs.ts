import { supabase } from '../lib/supabase'
import type { AreaLog } from '../types/areas'

export async function getAreaLogs(areaId: string): Promise<AreaLog[]> {
  const { data, error } = await supabase
    .from('area_logs')
    .select('*')
    .eq('area_id', areaId)
    .order('logged_at', { ascending: false })

  if (error) throw error
  return data
}
