import { useState, useRef } from 'react'
import type { Task, TaskStatus } from '../types/tasks'
import './TaskItem.css'

const STATUS_ICON: Record<TaskStatus, string> = {
  pending: '○',
  in_progress: '◑',
  done: '✓',
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: 'in_progress',
  in_progress: 'done',
  done: 'pending',
}

function formatDate(iso: string): string {
  const today = new Date().toISOString().split('T')[0]
  if (iso === today) return 'hoy'
  const [, month, day] = iso.split('-')
  return `${parseInt(day)} ${['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][parseInt(month) - 1]}`
}

interface Props {
  task: Task
  onStatusChange: (id: string, next: TaskStatus) => void
  onDelete?: (id: string) => void
  onEdit?: (id: string, title: string) => void
}

export default function TaskItem({ task, onStatusChange, onDelete, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = () => {
    setDraft(task.title)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancelEdit = () => {
    setEditing(false)
    setDraft(task.title)
  }

  const saveEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== task.title) {
      onEdit?.(task.id, trimmed)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleDeleteClick = () => {
    if (confirming) {
      onDelete?.(task.id)
    } else {
      setConfirming(true)
    }
  }

  return (
    <li className={`task-item task-item--${task.status}`}>
      <button
        type="button"
        className="task-status-btn"
        title={`Estado: ${task.status}`}
        onClick={() => onStatusChange(task.id, NEXT_STATUS[task.status])}
      >
        {STATUS_ICON[task.status]}
      </button>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="task-title-edit"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={cancelEdit}
        />
      ) : (
        <span className="task-title">{task.title}</span>
      )}

      <span className="task-meta">
        {task.time_estimate && <span className="task-estimate">{task.time_estimate}</span>}
        {task.due_date && <span className="task-date">{formatDate(task.due_date)}</span>}
      </span>

      {onEdit && (
        <button
          type="button"
          className="task-edit-btn"
          title="Editar tarea"
          onClick={startEdit}
        >
          ✎
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          className={`task-delete-btn${confirming ? ' task-delete-btn--confirm' : ''}`}
          title={confirming ? '¿Confirmar eliminación?' : 'Eliminar tarea'}
          onClick={handleDeleteClick}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? '¿Eliminar?' : '×'}
        </button>
      )}
    </li>
  )
}
