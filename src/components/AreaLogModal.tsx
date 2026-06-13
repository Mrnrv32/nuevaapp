import { useState } from 'react'
import type { Area, AreaWithLastLog, NewAreaLog } from '../types/areas'
import './AreaLogModal.css'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type DateOption = 'today' | 'yesterday' | 'custom'

interface Props {
  area: Area | AreaWithLastLog
  onSave: (log: NewAreaLog) => Promise<void>
  onClose: () => void
}

export default function AreaLogModal({ area, onSave, onClose }: Props) {
  const [content, setContent] = useState('')
  const [dateOption, setDateOption] = useState<DateOption>('today')
  const [customDate, setCustomDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)

  const resolvedDate =
    dateOption === 'today' ? todayISO() :
    dateOption === 'yesterday' ? yesterdayISO() :
    customDate

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSaving(true)
    await onSave({ content: content.trim(), logged_at: resolvedDate })
  }

  return (
    <div className="log-modal-overlay" onClick={onClose}>
      <div className="log-modal" onClick={e => e.stopPropagation()}>
        <div className="log-modal-header">
          <p className="log-modal-title">Registrar avance</p>
          <div className="log-modal-area">
            <span className="log-modal-dot" style={{ background: area.color }} />
            {area.title}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="log-modal-label" htmlFor="log-content">¿Qué hiciste?</label>
          <textarea
            id="log-content"
            className="log-modal-textarea"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Describe brevemente lo que hiciste..."
            autoFocus
            required
          />

          <div className="log-modal-date-row">
            <span className="log-modal-date-label">¿Cuándo?</span>
            {(['today', 'yesterday', 'custom'] as DateOption[]).map(opt => (
              <button
                key={opt}
                type="button"
                className={`log-chip${dateOption === opt ? ' selected' : ''}`}
                onClick={() => setDateOption(opt)}
              >
                {opt === 'today' ? 'Hoy' : opt === 'yesterday' ? 'Ayer' : 'Otra fecha'}
              </button>
            ))}
          </div>

          {dateOption === 'custom' && (
            <input
              type="date"
              className="log-modal-date-input"
              value={customDate}
              max={todayISO()}
              onChange={e => setCustomDate(e.target.value)}
            />
          )}

          <div className="log-modal-actions">
            <button type="button" className="log-btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="log-btn-save" disabled={saving || !content.trim()}>
              {saving ? 'Guardando...' : 'Guardar avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
