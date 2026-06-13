import { supabase } from '../lib/supabase'
import type { Resource, NewResource } from '../types/resources'

export async function createResource(input: NewResource): Promise<Resource> {
  const { data, error } = await supabase
    .from('resources')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}
