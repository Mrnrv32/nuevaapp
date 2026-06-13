import type { InboxItem } from '../types/inbox'
import './InboxListItem.css'

interface Props {
  item: InboxItem
  onDelete: (id: string) => void
  onProcess: (item: InboxItem) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function InboxListItem({ item, onDelete, onProcess }: Props) {
  return (
    <li className="inbox-item">
      <div className="inbox-item-body">
        <p className="inbox-item-text">{item.text}</p>
        <div className="inbox-item-meta">
          <span className="inbox-item-date">{formatDate(item.created_at)}</span>
          {item.tags.map(tag => (
            <span key={tag} className={`inbox-tag inbox-tag--${tag}`}>{tag}</span>
          ))}
        </div>
      </div>
      <div className="inbox-item-actions">
        <button
          type="button"
          className="action-btn action-btn--process"
          onClick={() => onProcess(item)}
          aria-label="Procesar idea"
          title="Procesar"
        >
          →
        </button>
        <button
          type="button"
          className="action-btn action-btn--delete"
          onClick={() => onDelete(item.id)}
          aria-label="Eliminar idea"
          title="Eliminar"
        >
          ×
        </button>
      </div>
    </li>
  )
}
