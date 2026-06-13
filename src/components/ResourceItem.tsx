import { useState } from 'react'
import type { Resource } from '../types/resources'
import './ResourceItem.css'

const TYPE_ICON: Record<string, string> = {
  link: '🔗',
  book: '📖',
  note: '📝',
}

const TYPE_LABEL: Record<string, string> = {
  link: 'link',
  book: 'libro',
  note: 'nota',
}

function relativeDate(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.floor((today.getTime() - date.getTime()) / 86400000)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  return `hace ${days} días`
}

function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

interface Props {
  resource: Resource
  onToggleRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function ResourceItem({ resource, onToggleRead, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const isRead = resource.status === 'read'

  return (
    <article className={`resource-item${isRead ? ' resource-item--read' : ''}`}>
      <div
        className="resource-item-main"
        onClick={() => resource.description && setExpanded(e => !e)}
        role={resource.description ? 'button' : undefined}
        tabIndex={resource.description ? 0 : undefined}
        onKeyDown={e => e.key === 'Enter' && resource.description && setExpanded(ex => !ex)}
      >
        <span className="resource-item-icon" title={TYPE_LABEL[resource.type]}>
          {TYPE_ICON[resource.type]}
        </span>
        <div className="resource-item-body">
          <div className="resource-item-title-row">
            <span className="resource-item-title">{resource.title}</span>
            {resource.url && (
              <a
                className="resource-item-domain"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                {domain(resource.url)}
              </a>
            )}
          </div>
          {resource.tags.length > 0 && (
            <div className="resource-item-tags">
              {resource.tags.map(tag => (
                <span key={tag} className="resource-item-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <span className="resource-item-date">{relativeDate(resource.created_at)}</span>
      </div>

      {expanded && resource.description && (
        <p className="resource-item-desc">{resource.description}</p>
      )}

      <div className="resource-item-actions">
        <button
          type="button"
          className={`resource-action-btn${isRead ? ' resource-action-btn--active' : ''}`}
          title={isRead ? 'Marcar como pendiente' : 'Marcar como leído'}
          onClick={() => onToggleRead(resource.id)}
        >
          ✓
        </button>
        <button
          type="button"
          className="resource-action-btn resource-action-btn--delete"
          title="Eliminar"
          onClick={() => onDelete(resource.id)}
        >
          ×
        </button>
      </div>
    </article>
  )
}
