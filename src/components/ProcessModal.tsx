import { useState, useRef, useEffect } from 'react'
import type { InboxItem } from '../types/inbox'
import './ProcessModal.css'

interface Props {
  item: InboxItem
  onConfirm: (destinationNote: string) => Promise<void>
  onClose: () => void
}

export default function ProcessModal({ item, onConfirm, onClose }: Props) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleConfirm = async () => {
    if (!note.trim() || saving) return
    setSaving(true)
    try {
      await onConfirm(note.trim())
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className="modal-idea-preview">"{item.text}"</p>
        <label className="modal-label" htmlFor="destination-note">
          ¿A dónde va esta idea?
        </label>
        <input
          ref={inputRef}
          id="destination-note"
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej: Proyecto trabajo, Lista de compras..."
          disabled={saving}
        />
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--confirm"
            onClick={handleConfirm}
            disabled={!note.trim() || saving}
          >
            Procesar
          </button>
        </div>
      </div>
    </div>
  )
}
