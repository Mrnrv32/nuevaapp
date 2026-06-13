import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types/inbox'

export async function getInboxItems(): Promise<InboxItem[]> {
  const { data, error } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('status', 'inbox')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as InboxItem[]
}
