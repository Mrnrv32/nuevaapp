import { useState, useEffect, useCallback } from 'react'
import { getArchivedItems } from '../skills/getArchivedItems'
import { updateProject } from '../skills/updateProject'
import { deleteProject } from '../skills/deleteProject'
import { updateArea } from '../skills/updateArea'
import { deleteArea } from '../skills/deleteArea'
import { updateResource } from '../skills/updateResource'
import { deleteResource } from '../skills/deleteResource'
import type { Project } from '../types/projects'
import type { Area } from '../types/areas'
import type { Resource } from '../types/resources'
import './ArchivesPage.css'

const TYPE_LABEL: Record<string, string> = { link: 'link', book: 'libro', note: 'nota' }

function relativeDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 30) return `hace ${days} días`
  const months = Math.floor(days / 30)
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
}

interface SectionProps {
  title: string
  count: number
  children: React.ReactNode
}

function Section({ title, count, children }: SectionProps) {
  const [open, setOpen] = useState(count > 0)

  return (
    <div className="archive-section">
      <button
        type="button"
        className="archive-section-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="archive-section-arrow">{open ? '▾' : '▸'}</span>
        <span className="archive-section-title">{title}</span>
        <span className="archive-section-count">{count}</span>
      </button>
      {open && <div className="archive-section-body">{children}</div>}
    </div>
  )
}

interface ArchiveItemProps {
  title: string
  subtitle?: string
  date: string
  onRestore: () => void
  onDelete: () => void
}

function ArchiveItem({ title, subtitle, date, onRestore, onDelete }: ArchiveItemProps) {
  const [confirming, setConfirming] = useState(false)

  return (
    <div className="archive-item">
      <div className="archive-item-info">
        <span className="archive-item-title">{title}</span>
        {subtitle && <span className="archive-item-sub">{subtitle}</span>}
        <span className="archive-item-date">{relativeDate(date)}</span>
      </div>
      <div className="archive-item-actions">
        <button
          type="button"
          className="archive-btn archive-btn--restore"
          onClick={onRestore}
        >
          Restaurar
        </button>
        <button
          type="button"
          className={`archive-btn archive-btn--delete${confirming ? ' archive-btn--confirm' : ''}`}
          onClick={() => {
            if (!confirming) { setConfirming(true); return }
            onDelete()
          }}
          onBlur={() => setConfirming(false)}
        >
          {confirming ? '¿Eliminar?' : 'Eliminar'}
        </button>
      </div>
    </div>
  )
}

export default function ArchivesPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const data = await getArchivedItems()
    setProjects(data.projects)
    setAreas(data.areas)
    setResources(data.resources)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestoreProject = async (id: string) => {
    await updateProject(id, { status: 'active' })
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const handleRestoreArea = async (id: string) => {
    await updateArea(id, { status: 'active' })
    setAreas(prev => prev.filter(a => a.id !== id))
  }

  const handleDeleteArea = async (id: string) => {
    await deleteArea(id)
    setAreas(prev => prev.filter(a => a.id !== id))
  }

  const handleRestoreResource = async (id: string) => {
    await updateResource(id, { status: 'pending' })
    setResources(prev => prev.filter(r => r.id !== id))
  }

  const handleDeleteResource = async (id: string) => {
    await deleteResource(id)
    setResources(prev => prev.filter(r => r.id !== id))
  }

  if (loading) return null

  const total = projects.length + areas.length + resources.length

  return (
    <main className="archives-page">
      <div className="archives-container">
        <h1 className="archives-title">Archivos</h1>
        <p className="archives-subtitle">
          Todo lo que completaste o pausaste. Restaura lo que vuelva a ser relevante.
        </p>

        {total === 0 ? (
          <div className="archives-empty">
            <p className="archives-empty-text">
              No tienes nada archivado todavía.
            </p>
            <p className="archives-empty-hint">
              Cuando completes proyectos o áreas, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="archives-sections">
            <Section title="Proyectos" count={projects.length}>
              {projects.length === 0 ? (
                <p className="archive-section-empty">Sin proyectos archivados.</p>
              ) : (
                projects.map(p => (
                  <ArchiveItem
                    key={p.id}
                    title={p.title}
                    subtitle={p.description ?? undefined}
                    date={p.updated_at}
                    onRestore={() => handleRestoreProject(p.id)}
                    onDelete={() => handleDeleteProject(p.id)}
                  />
                ))
              )}
            </Section>

            <Section title="Áreas" count={areas.length}>
              {areas.length === 0 ? (
                <p className="archive-section-empty">Sin áreas archivadas.</p>
              ) : (
                areas.map(a => (
                  <ArchiveItem
                    key={a.id}
                    title={a.title}
                    subtitle={a.description ?? undefined}
                    date={a.created_at}
                    onRestore={() => handleRestoreArea(a.id)}
                    onDelete={() => handleDeleteArea(a.id)}
                  />
                ))
              )}
            </Section>

            <Section title="Resources" count={resources.length}>
              {resources.length === 0 ? (
                <p className="archive-section-empty">Sin resources archivados.</p>
              ) : (
                resources.map(r => (
                  <ArchiveItem
                    key={r.id}
                    title={r.title}
                    subtitle={TYPE_LABEL[r.type]}
                    date={r.updated_at}
                    onRestore={() => handleRestoreResource(r.id)}
                    onDelete={() => handleDeleteResource(r.id)}
                  />
                ))
              )}
            </Section>
          </div>
        )}
      </div>
    </main>
  )
}
