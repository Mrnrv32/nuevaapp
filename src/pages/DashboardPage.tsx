import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { ProjectWithProgress } from '../types/projects'
import type { AreaWithLastLog, NewAreaLog } from '../types/areas'
import { getDashboardProjects } from '../skills/getDashboardProjects'
import { getTodayTasks } from '../skills/getTodayTasks'
import { checkInboxHasItems } from '../skills/checkInboxHasItems'
import { getAreasWithLastLog } from '../skills/getAreasWithLastLog'
import { createAreaLog } from '../skills/createAreaLog'
import type { TodayTask } from '../skills/getTodayTasks'
import TodayTasksList from '../components/TodayTasksList'
import AreaLogModal from '../components/AreaLogModal'
import './DashboardPage.css'

function relativeDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const logged = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const days = Math.round((today.getTime() - logged.getTime()) / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  return `hace ${days} días`
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [totalProjectCount, setTotalProjectCount] = useState(0)
  const [todayTasks, setTodayTasks] = useState<TodayTask[]>([])
  const [areas, setAreas] = useState<AreaWithLastLog[]>([])
  const [hasInboxItems, setHasInboxItems] = useState(false)
  const [logTarget, setLogTarget] = useState<AreaWithLastLog | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    const [projs, today, inbox, areasList] = await Promise.all([
      getDashboardProjects('project'),
      getTodayTasks(),
      checkInboxHasItems(),
      getAreasWithLastLog(),
    ])
    setTotalProjectCount(projs.length)
    setProjects(projs.slice(0, 3))
    setTodayTasks(today)
    setHasInboxItems(inbox)
    setAreas(areasList)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleLog = async (log: NewAreaLog) => {
    if (!logTarget) return
    await createAreaLog(logTarget.id, log)
    setAreas(prev => prev.map(a =>
      a.id === logTarget.id ? { ...a, last_logged_at: log.logged_at } : a
    ))
    setLogTarget(null)
  }

  if (loading) return null

  return (
    <div className="dashboard-page">
      {hasInboxItems && (
        <button type="button" className="inbox-banner" onClick={() => navigate('/inbox')}>
          Tienes items sin procesar en el Inbox →
        </button>
      )}

      <TodayTasksList
        tasks={todayTasks}
        firstProject={projects[0] ? { id: projects[0].id, title: projects[0].title } : undefined}
      />

      {projects.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Proyectos activos</span>
            <button type="button" className="dash-section-link" onClick={() => navigate('/projects')}>
              {totalProjectCount > 3 ? `Ver todos (${totalProjectCount}) →` : 'Ver todos →'}
            </button>
          </div>
          {projects.map(p => (
            <div key={p.id} className="dash-proj-row" onClick={() => navigate(`/projects/${p.id}`)}>
              <span className="dash-proj-name">{p.title}</span>
              <div className="dash-proj-bar">
                <div
                  className="dash-proj-fill"
                  style={{ width: p.total_count > 0 ? `${Math.round((p.done_count / p.total_count) * 100)}%` : '0%' }}
                />
              </div>
              {p.total_count > 0
                ? <span className="dash-proj-count">{p.done_count}/{p.total_count}</span>
                : <span className="dash-proj-add">+ Añadir tarea</span>
              }
            </div>
          ))}
        </div>
      )}

      {areas.length > 0 && (
        <div className="dash-section">
          <div className="dash-section-head">
            <span className="dash-section-title">Áreas</span>
            <button type="button" className="dash-section-link" onClick={() => navigate('/areas')}>
              Ver áreas →
            </button>
          </div>
          {areas.map(a => (
            <div key={a.id} className="dash-area-row">
              <span className="dash-area-dot" style={{ background: a.color }} />
              <span className="dash-area-name">{a.title}</span>
              <span className="dash-area-log">
                {a.last_logged_at ? relativeDate(a.last_logged_at) : 'Sin avances aún'}
              </span>
              <button type="button" className="dash-area-btn" onClick={() => setLogTarget(a)}>
                Registrar
              </button>
            </div>
          ))}
        </div>
      )}

      {logTarget && (
        <AreaLogModal area={logTarget} onSave={handleLog} onClose={() => setLogTarget(null)} />
      )}
    </div>
  )
}
