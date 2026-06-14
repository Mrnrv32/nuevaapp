import { supabase } from '../lib/supabase'
import type { AreaWithLastLog } from '../types/areas'

export async function getAreasWithLastLog(): Promise<AreaWithLastLog[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*, area_logs(logged_at)')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) throw error

  return (data ?? []).map(area => {
    const logs: { logged_at: string }[] = area.area_logs ?? []
    const last = logs.reduce<string | null>((max, l) => {
      if (!max) return l.logged_at
      return l.logged_at > max ? l.logged_at : max
    }, null)

    const { area_logs: _, ...rest } = area
    return { ...rest, last_logged_at: last }
  })
}
