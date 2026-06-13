import { useNavigate } from 'react-router-dom'
import type { TodayTask } from '../skills/getTodayTasks'
import './TodayTasksList.css'

interface Props {
  tasks: TodayTask[]
}

export default function TodayTasksList({ tasks }: Props) {
  const navigate = useNavigate()
  if (tasks.length === 0) return null

  return (
    <section className="today-tasks">
      <h2 className="today-tasks-heading">Tareas de hoy</h2>
      <ul className="today-tasks-list">
        {tasks.map(task => (
          <li
            key={task.id}
            className="today-task-item"
            onClick={() => navigate(`/projects/${task.project_id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && navigate(`/projects/${task.project_id}`)}
          >
            <span className="today-task-project">{task.project_title}</span>
            <span className="today-task-sep">·</span>
            <span className="today-task-title">{task.title}</span>
            {task.time_estimate && (
              <span className="today-task-estimate">{task.time_estimate}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
