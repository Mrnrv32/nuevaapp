import { useState, useEffect, useRef } from 'react'
import type { NewProject, ParaType } from '../types/projects'
import './ProjectForm.css'

interface Props {
  defaultParaType?: ParaType
  onSave: (project: NewProject) => Promise<void>
  onClose: () => void
}

export default function ProjectForm({ defaultParaType = 'project', onSave, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), description: description.trim() || null, para_type: defaultParaType })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="project-form-modal" onClick={e => e.stopPropagation()}>
        <h2 className="project-form-heading">Nuevo proyecto</h2>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="project-form-input"
            placeholder="Título del proyecto"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={saving}
          />
          <textarea
            className="project-form-textarea"
            placeholder="Descripción opcional — ¿qué resultado quieres lograr?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            disabled={saving}
          />
          <div className="project-form-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={!title.trim() || saving}>
              {saving ? 'Guardando…' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
