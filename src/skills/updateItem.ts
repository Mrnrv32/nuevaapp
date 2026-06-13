import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types/inbox'

export async function updateItem(id: string, patch: { text: string }): Promise<InboxItem> {
  const { data, error } = await supabase
    .from('inbox_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as InboxItem
}
