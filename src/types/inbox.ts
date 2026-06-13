export type InboxTag = 'idea' | 'tarea'

export type InboxStatus = 'inbox' | 'processed'

export interface InboxItem {
  id: string
  user_id: string
  text: string
  tags: InboxTag[]
  status: InboxStatus
  destination_note: string | null
  created_at: string
  updated_at: string
}

export type NewInboxItem = Pick<InboxItem, 'text' | 'tags'>
export type InboxPatch = Pick<InboxItem, 'text'>
