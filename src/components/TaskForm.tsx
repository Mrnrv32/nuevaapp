import { useState, useRef } from 'react'
import type { NewTask } from '../types/tasks'
import './TaskForm.css'

const TIME_OPTIONS = ['15min', '30min', '1h', '2h', '4h']

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
        <input
          type="date"
          className="task-form-date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          title="Fecha límite"
        />
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
