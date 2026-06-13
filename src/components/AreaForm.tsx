import { useState } from 'react'
import type { Area, NewArea } from '../types/areas'
import { AREA_COLORS } from '../types/areas'
import './AreaForm.css'

interface Props {
  initial?: Area
  onSave: (data: NewArea) => Promise<void>
  onClose: () => void
}

export default function AreaForm({ initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [color, setColor] = useState(initial?.color ?? AREA_COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), description: description.trim() || null, color })
    onClose()
  }

  return (
    <div className="area-form-overlay" onClick={onClose}>
      <div className="area-form" onClick={e => e.stopPropagation()}>
        <h2 className="area-form-title">{initial ? 'Editar área' : 'Nueva área'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="area-form-field">
            <label htmlFor="area-title">Nombre</label>
            <input
              id="area-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej. Salud, Hogar, Carrera..."
              autoFocus
              required
            />
          </div>

          <div className="area-form-field">
            <label htmlFor="area-desc">Descripción (opcional)</label>
            <textarea
              id="area-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Qué abarca esta área..."
              rows={2}
            />
          </div>

          <div className="area-form-field">
            <label>Color</label>
            <div className="area-color-picker">
              {AREA_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`area-color-dot${color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="area-form-actions">
            <button type="button" className="area-form-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="area-form-submit" disabled={saving}>
              {saving ? 'Guardando...' : initial ? 'Guardar cambios' : 'Crear área'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
