import { supabase } from '../lib/supabase'

export async function checkInboxHasItems(): Promise<boolean> {
  const { count, error } = await supabase
    .from('inbox_items')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'inbox')

  if (error) throw error
  return (count ?? 0) > 0
}
