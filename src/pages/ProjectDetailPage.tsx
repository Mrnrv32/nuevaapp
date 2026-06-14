import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Project, NewProject } from '../types/projects'
import type { Task, TaskStatus, NewTask } from '../types/tasks'
import { getTasks } from '../skills/getTasks'
import { createTask } from '../skills/createTask'
import { updateTask } from '../skills/updateTask'
import { deleteTask } from '../skills/deleteTask'
import { updateProject } from '../skills/updateProject'
import { deleteProject } from '../skills/deleteProject'
import { importTasksFromText } from '../skills/importTasksFromText'
import { getProjects } from '../skills/getProjects'
import TaskItem from '../components/TaskItem'
import TaskForm from '../components/TaskForm'
import ProjectForm from '../components/ProjectForm'
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
  const [showMenu, setShowMenu] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!showMenu) return
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setShowMenu(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [showMenu])

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

  const handleEditProject = async (patch: NewProject) => {
    if (!id) return
    const updated = await updateProject(id, { title: patch.title, description: patch.description })
    setProject(updated)
  }

  const handleArchive = async () => {
    if (!id) return
    await updateProject(id, { status: 'archived' })
    navigate('/projects')
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!id) return
    await deleteProject(id)
    navigate('/projects')
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
          <div className="project-gear-wrap" ref={menuRef}>
            <button
              type="button"
              className="project-gear-btn"
              title="Opciones del proyecto"
              onClick={() => { setShowMenu(s => !s); setConfirmDelete(false) }}
            >
              ⚙
            </button>
            {showMenu && (
              <div className="project-gear-menu">
                <button
                  type="button"
                  className="project-menu-item"
                  onClick={() => { setShowMenu(false); setShowEditForm(true) }}
                >
                  ✏ Editar
                </button>
                <button
                  type="button"
                  className="project-menu-item"
                  onClick={handleArchive}
                >
                  📦 Archivar
                </button>
                <button
                  type="button"
                  className={`project-menu-item project-menu-item--danger${confirmDelete ? ' project-menu-item--confirm' : ''}`}
                  onClick={handleDelete}
                >
                  {confirmDelete ? '¿Eliminar proyecto?' : '🗑 Eliminar'}
                </button>
              </div>
            )}
          </div>
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

      {showEditForm && (
        <ProjectForm
          initial={project}
          onSave={handleEditProject}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}
