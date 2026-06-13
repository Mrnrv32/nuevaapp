import { supabase } from '../lib/supabase'
import type { InboxItem } from '../types/inbox'

export interface ProcessInput {
  id: string
  destinationNote: string
}

// Fase 1: marca como procesado con una nota de destino en texto libre.
// Fase 2 (cuando existan Proyectos): crear FK real al entity destino.
export async function processItem({ id, destinationNote }: ProcessInput): Promise<InboxItem> {
  const { data, error } = await supabase
    .from('inbox_items')
    .update({ status: 'processed', destination_note: destinationNote })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as InboxItem
}
