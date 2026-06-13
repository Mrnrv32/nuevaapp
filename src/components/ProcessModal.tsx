import { useState, useEffect, useRef } from 'react'
import type { InboxItem } from '../types/inbox'
import type { Project } from '../types/projects'
import type { Area } from '../types/areas'
import { getProjects } from '../skills/getProjects'
import { getAreas } from '../skills/getAreas'
import './ProcessModal.css'

type Step = 'choose' | 'project' | 'area' | 'archive'

export type Destination =
  | { type: 'project'; projectId: string; projectTitle: string; taskTitle: string }
  | { type: 'area'; areaId: string; areaTitle: string }
  | { type: 'archive'; note: string }

interface Props {
  item: InboxItem
  onConfirm: (dest: Destination) => Promise<void>
  onClose: () => void
}

export default function ProcessModal({ item, onConfirm, onClose }: Props) {
  const [step, setStep] = useState<Step>('choose')
  const [projects, setProjects] = useState<Project[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [projectId, setProjectId] = useState('')
  const [taskTitle, setTaskTitle] = useState(item.text)
  const [areaId, setAreaId] = useState('')
  const [archiveNote, setArchiveNote] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([getProjects(), getAreas()]).then(([projs, ars]) => {
      setProjects(projs)
      setAreas(ars)
      if (projs.length > 0) setProjectId(projs[0].id)
      if (ars.length > 0) setAreaId(ars[0].id)
    })
  }, [])

  useEffect(() => {
    if (step !== 'choose') inputRef.current?.focus()
  }, [step])

  const back = () => setStep('choose')

  const handleConfirm = async () => {
    if (saving) return
    let dest: Destination

    if (step === 'project') {
      if (!projectId || !taskTitle.trim()) return
      const project = projects.find(p => p.id === projectId)!
      dest = { type: 'project', projectId, projectTitle: project.title, taskTitle: taskTitle.trim() }
    } else if (step === 'area') {
      if (!areaId) return
      const area = areas.find(a => a.id === areaId)!
      dest = { type: 'area', areaId, areaTitle: area.title }
    } else {
      dest = { type: 'archive', note: archiveNote.trim() }
    }

    setSaving(true)
    try {
      await onConfirm(dest)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step !== 'choose') handleConfirm()
    if (e.key === 'Escape') step === 'choose' ? onClose() : back()
  }

  const canConfirm =
    step === 'project' ? Boolean(projectId && taskTitle.trim()) :
    step === 'area' ? Boolean(areaId) :
    true

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <p className="modal-idea-preview">"{item.text}"</p>

        {step === 'choose' && (
          <>
            <p className="modal-label">¿A dónde va esta idea?</p>
            <div className="dest-cards">
              <button type="button" className="dest-card" onClick={() => setStep('project')}>
                <span className="dest-card-icon">◆</span>
                <div className="dest-card-text">
                  <span className="dest-card-name">Proyecto</span>
                  <span className="dest-card-hint">Convertir en tarea</span>
                </div>
              </button>
              <button type="button" className="dest-card" onClick={() => setStep('area')}>
                <span className="dest-card-icon">▣</span>
                <div className="dest-card-text">
                  <span className="dest-card-name">Área</span>
                  <span className="dest-card-hint">Registrar avance</span>
                </div>
              </button>
              <button type="button" className="dest-card" onClick={() => setStep('archive')}>
                <span className="dest-card-icon">⊙</span>
                <div className="dest-card-text">
                  <span className="dest-card-name">Archivar</span>
                  <span className="dest-card-hint">Solo guardar</span>
                </div>
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </>
        )}

        {step === 'project' && (
          <>
            <button type="button" className="modal-back" onClick={back}>← Atrás</button>
            {projects.length === 0 ? (
              <p className="modal-empty">No hay proyectos activos.</p>
            ) : (
              <>
                <label className="modal-label" htmlFor="proj-select">Proyecto</label>
                <select
                  id="proj-select"
                  className="modal-select"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  disabled={saving}
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <label className="modal-label" htmlFor="task-title">Título de la tarea</label>
                <input
                  ref={inputRef}
                  id="task-title"
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  disabled={saving}
                />
              </>
            )}
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
              {projects.length > 0 && (
                <button
                  type="button"
                  className="modal-btn modal-btn--confirm"
                  onClick={handleConfirm}
                  disabled={!canConfirm || saving}
                >
                  Crear tarea
                </button>
              )}
            </div>
          </>
        )}

        {step === 'area' && (
          <>
            <button type="button" className="modal-back" onClick={back}>← Atrás</button>
            {areas.length === 0 ? (
              <p className="modal-empty">No hay áreas creadas.</p>
            ) : (
              <>
                <label className="modal-label" htmlFor="area-select">Área</label>
                <select
                  id="area-select"
                  className="modal-select"
                  value={areaId}
                  onChange={e => setAreaId(e.target.value)}
                  disabled={saving}
                >
                  {areas.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </>
            )}
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
              {areas.length > 0 && (
                <button
                  type="button"
                  className="modal-btn modal-btn--confirm"
                  onClick={handleConfirm}
                  disabled={!canConfirm || saving}
                >
                  Registrar en área
                </button>
              )}
            </div>
          </>
        )}

        {step === 'archive' && (
          <>
            <button type="button" className="modal-back" onClick={back}>← Atrás</button>
            <label className="modal-label" htmlFor="archive-note">Nota (opcional)</label>
            <input
              ref={inputRef}
              id="archive-note"
              type="text"
              value={archiveNote}
              onChange={e => setArchiveNote(e.target.value)}
              placeholder="Ej: referencia para más adelante..."
              disabled={saving}
            />
            <div className="modal-actions">
              <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose}>Cancelar</button>
              <button
                type="button"
                className="modal-btn modal-btn--confirm"
                onClick={handleConfirm}
                disabled={saving}
              >
                Archivar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
