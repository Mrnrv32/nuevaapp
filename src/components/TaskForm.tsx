import { useState, useRef } from 'react'
import type { NewTask } from '../types/tasks'
import './TaskForm.css'

const TIME_OPTIONS = ['15min', '30min', '1h', '2h', '4h']

function toLocalDate(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

interface Props {
  onAdd: (task: NewTask) => Promise<void>
}

export default function TaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [estimate, setEstimate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSaving(true)
    try {
      await onAdd({
        title: title.trim(),
        time_estimate: estimate || null,
        due_date: dueDate || null,
      })
      setTitle('')
      setEstimate('')
      setDueDate('')
      inputRef.current?.focus()
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="task-form-input"
        placeholder="Nueva tarea… (verbo + objeto)"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={saving}
      />
      <div className="task-form-row">
        <div className="task-form-estimates">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              className={`task-estimate-chip${estimate === opt ? ' task-estimate-chip--active' : ''}`}
              onClick={() => setEstimate(prev => prev === opt ? '' : opt)}
            >
              {opt}
            </button>
          ))}
          <input
            className="task-estimate-custom"
            placeholder="otro"
            value={TIME_OPTIONS.includes(estimate) ? '' : estimate}
            onChange={e => setEstimate(e.target.value)}
            title="Estimado personalizado"
          />
        </div>
        <div className="task-form-date-shortcuts">
          <button
            type="button"
            className={`task-date-btn${dueDate === toLocalDate(0) ? ' task-date-btn--active' : ''}`}
            onClick={() => setDueDate(prev => prev === toLocalDate(0) ? '' : toLocalDate(0))}
            title="Hoy"
          >
            Hoy
          </button>
          <button
            type="button"
            className={`task-date-btn${dueDate === toLocalDate(1) ? ' task-date-btn--active' : ''}`}
            onClick={() => setDueDate(prev => prev === toLocalDate(1) ? '' : toLocalDate(1))}
            title="Mañana"
          >
            Mañana
          </button>
          {dueDate && (
            <button
              type="button"
              className="task-date-clear"
              onClick={() => setDueDate('')}
              aria-label="Quitar fecha"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          className="task-form-submit"
          disabled={!title.trim() || saving}
        >
          Añadir
        </button>
      </div>
    </form>
  )
}
