export type ResourceType = 'link' | 'book' | 'note'
export type ResourceStatus = 'pending' | 'read' | 'archived'

export interface Resource {
  id: string
  title: string
  url?: string
  description?: string
  type: ResourceType
  status: ResourceStatus
  tags: string[]
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

export type NewResource = {
  title: string
  type: ResourceType
  url?: string
  description?: string
  tags: string[]
  thumbnail_url?: string
}

export type ResourcePatch = Partial<Pick<Resource,
  'title' | 'description' | 'status' | 'tags' | 'url' | 'thumbnail_url'>>

export interface ResourceFilters {
  type?: ResourceType
  status?: ResourceStatus
  tag?: string
  search?: string
}

export interface UrlMetadata {
  title?: string
  description?: string
  thumbnail_url?: string
}
