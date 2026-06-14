import { useNavigate } from 'react-router-dom'
import type { TodayTask } from '../skills/getTodayTasks'
import './TodayTasksList.css'

interface Props {
  tasks: TodayTask[]
  firstProject?: { id: string; title: string }
}

export default function TodayTasksList({ tasks, firstProject }: Props) {
  const navigate = useNavigate()

  return (
    <section className="today-tasks">
      <h2 className="today-tasks-heading">Tareas de hoy</h2>

      {tasks.length === 0 ? (
        <div className="today-tasks-empty">
          <p className="today-tasks-empty-msg">Sin tareas programadas para hoy.</p>
          <button
            type="button"
            className="today-tasks-empty-btn"
            onClick={() => firstProject ? navigate(`/projects/${firstProject.id}`) : navigate('/projects')}
          >
            {firstProject ? `Abrir "${firstProject.title}" →` : 'Ver proyectos →'}
          </button>
        </div>
      ) : (
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
      )}
    </section>
  )
}
