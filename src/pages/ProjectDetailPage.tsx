import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Project } from '../types/projects'
import type { Task, TaskStatus, NewTask } from '../types/tasks'
import { getTasks } from '../skills/getTasks'
import { createTask } from '../skills/createTask'
import { updateTask } from '../skills/updateTask'
import { deleteTask } from '../skills/deleteTask'
import { importTasksFromText } from '../skills/importTasksFromText'
import { getProjects } from '../skills/getProjects'
import TaskItem from '../components/TaskItem'
import TaskForm from '../components/TaskForm'
import AIPromptModal from '../components/AIPromptModal'
import './ProjectDetailPage.css'

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  on_hold: 'En pausa',
  completed: 'Completado',
  archived: 'Archivado',
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showAI, setShowAI] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    const [allProjects, taskList] = await Promise.all([
      getProjects(),
      getTasks(id),
    ])
    const found = allProjects.find(p => p.id === id) ?? null
    if (!found) { navigate('/dashboard'); return }
    setProject(found)
    setTasks(taskList)
    setLoading(false)
  }, [id, navigate])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (taskId: string, next: TaskStatus) => {
    const updated = await updateTask(taskId, { status: next })
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
  }

  const handleAddTask = async (input: NewTask) => {
    if (!id) return
    const created = await createTask(id, input)
    setTasks(prev => [...prev, created])
  }

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  const handleEditTask = async (taskId: string, title: string) => {
    const updated = await updateTask(taskId, { title })
    setTasks(prev => prev.map(t => t.id === taskId ? updated : t))
  }

  const handleImport = async (titles: string[]) => {
    if (!id) return
    const rawText = titles.map(t => `- ${t}`).join('\n')
    const imported = await importTasksFromText(id, rawText)
    setTasks(prev => [...prev, ...imported])
  }

  if (loading || !project) return null

  const pending = tasks.filter(t => t.status !== 'done')
  const done = tasks.filter(t => t.status === 'done')

  return (
    <div className="project-detail-page">
      <button type="button" className="back-btn" onClick={() => navigate('/dashboard')}>
        ← Dashboard
      </button>

      <header className="project-header">
        <div className="project-header-top">
          <h1 className="project-title">{project.title}</h1>
          <span className={`status-badge status-badge--${project.status}`}>
            {STATUS_LABEL[project.status]}
          </span>
        </div>
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
      </header>

      <div className="project-actions">
        <button type="button" className="btn-ai" onClick={() => setShowAI(true)}>
          ✦ Generar con IA
        </button>
      </div>

      <section className="task-section">
        <ul className="task-list">
          {pending.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
          {done.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </ul>

        <TaskForm onAdd={handleAddTask} />
      </section>

      {showAI && (
        <AIPromptModal
          project={project}
          onImport={handleImport}
          onClose={() => setShowAI(false)}
        />
      )}
    </div>
  )
}
