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
}

export default function TaskItem({ task, onStatusChange, onDelete }: Props) {
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

      <span className="task-title">{task.title}</span>

      <span className="task-meta">
        {task.time_estimate && <span className="task-estimate">{task.time_estimate}</span>}
        {task.due_date && <span className="task-date">{formatDate(task.due_date)}</span>}
      </span>

      {onDelete && (
        <button
          type="button"
          className="task-delete-btn"
          title="Eliminar tarea"
          onClick={() => onDelete(task.id)}
        >
          ×
        </button>
      )}
    </li>
  )
}
