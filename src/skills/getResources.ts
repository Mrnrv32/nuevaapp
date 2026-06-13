import { supabase } from '../lib/supabase'
import type { Resource, ResourceFilters } from '../types/resources'

export async function getResources(filters?: ResourceFilters): Promise<Resource[]> {
  let query = supabase.from('resources').select('*')

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.tag) query = query.contains('tags', [filters.tag])
  if (filters?.search) {
    const s = filters.search.replace(/'/g, "''")
    query = query.or(`title.ilike.%${s}%,description.ilike.%${s}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
