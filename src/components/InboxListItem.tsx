import { useState, useRef } from 'react'
import type { InboxItem } from '../types/inbox'
import './InboxListItem.css'

interface Props {
  item: InboxItem
  onDelete: (id: string) => void
  onProcess: (item: InboxItem) => void
  onEdit: (id: string, text: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function InboxListItem({ item, onDelete, onProcess, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(item.text)
  const [confirming, setConfirming] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const startEdit = () => {
    setDraft(item.text)
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(item.text)
  }

  const saveEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== item.text) {
      onEdit(item.id, trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleDeleteClick = () => {
    if (confirming) {
      onDelete(item.id)
    } else {
      setConfirming(true)
    }
  }

  return (
    <li className="inbox-item">
      <div className="inbox-item-body">
        {editing ? (
          <textarea
            ref={textareaRef}
            className="inbox-item-edit"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={cancelEdit}
            rows={2}
          />
        ) : (
          <p className="inbox-item-text">{item.text}</p>
        )}
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
          className="action-btn action-btn--edit"
          onClick={startEdit}
          aria-label="Editar idea"
          title="Editar"
        >
          ✎
        </button>
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
          className={`action-btn action-btn--delete${confirming ? ' action-btn--confirm' : ''}`}
          onClick={handleDeleteClick}
          onBlur={() => setConfirming(false)}
          aria-label="Eliminar idea"
          title={confirming ? '¿Confirmar eliminación?' : 'Eliminar'}
        >
          {confirming ? '¿Eliminar?' : '×'}
        </button>
      </div>
    </li>
  )
}
