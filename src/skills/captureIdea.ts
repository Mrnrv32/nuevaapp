import { supabase } from '../lib/supabase'
import type { InboxItem, NewInboxItem } from '../types/inbox'

export async function captureIdea(input: NewInboxItem): Promise<InboxItem> {
  const { data, error } = await supabase
    .from('inbox_items')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data as InboxItem
}
