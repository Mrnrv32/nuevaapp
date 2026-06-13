import { supabase } from '../lib/supabase'

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('inbox_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
