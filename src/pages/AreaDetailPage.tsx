import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Area, AreaLog, NewAreaLog, NewArea } from '../types/areas'
import { getAreas } from '../skills/getAreas'
import { getAreaLogs } from '../skills/getAreaLogs'
import { createAreaLog } from '../skills/createAreaLog'
import { updateArea } from '../skills/updateArea'
import { deleteArea } from '../skills/deleteArea'
import AreaLogItem from '../components/AreaLogItem'
import AreaLogModal from '../components/AreaLogModal'
import AreaForm from '../components/AreaForm'
import './AreaDetailPage.css'

export default function AreaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [area, setArea] = useState<Area | null>(null)
  const [logs, setLogs] = useState<AreaLog[]>([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [loading, setLoading] = useState(true)
  const menuRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!id) return
    const [allAreas, areaLogs] = await Promise.all([getAreas(), getAreaLogs(id)])
    setArea(allAreas.find(a => a.id === id) ?? null)
    setLogs(areaLogs)
    setLoading(false)
  }, [id])

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

  const handleLog = async (log: NewAreaLog) => {
    if (!id) return
    const created = await createAreaLog(id, log)
    setLogs(prev => [created, ...prev])
    setShowLogModal(false)
  }

  const handleEditArea = async (patch: NewArea) => {
    if (!id) return
    const updated = await updateArea(id, { title: patch.title, description: patch.description, color: patch.color })
    setArea(updated)
  }

  const handleArchive = async () => {
    if (!id) return
    await updateArea(id, { status: 'archived' })
    navigate('/areas')
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    if (!id) return
    await deleteArea(id)
    navigate('/areas')
  }

  if (loading) return null
  if (!area) return <div className="area-detail-page"><p>Área no encontrada.</p></div>

  return (
    <div className="area-detail-page">
      <button type="button" className="area-back-btn" onClick={() => navigate('/areas')}>
        ← Áreas
      </button>

      <div className="area-detail-header">
        <div className="area-detail-accent" style={{ background: area.color }} />
        <div className="area-detail-info">
          <h1 className="area-detail-title">{area.title}</h1>
          {area.description && <p className="area-detail-desc">{area.description}</p>}
        </div>
        <div className="project-gear-wrap" ref={menuRef}>
          <button
            type="button"
            className="project-gear-btn"
            title="Opciones del área"
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
                Editar
              </button>
              <button
                type="button"
                className="project-menu-item"
                onClick={handleArchive}
              >
                Archivar
              </button>
              <button
                type="button"
                className={`project-menu-item project-menu-item--danger${confirmDelete ? ' project-menu-item--confirm' : ''}`}
                onClick={handleDelete}
              >
                {confirmDelete ? '¿Eliminar área?' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>
        <button type="button" className="area-log-trigger" onClick={() => setShowLogModal(true)}>
          + Registrar avance
        </button>
      </div>

      <div className="area-logs-list">
        {logs.length === 0 ? (
          <p className="area-logs-empty">
            Aún no hay avances registrados. ¡Empieza cuando quieras!
          </p>
        ) : (
          logs.map(log => <AreaLogItem key={log.id} log={log} />)
        )}
      </div>

      {showLogModal && (
        <AreaLogModal area={area} onSave={handleLog} onClose={() => setShowLogModal(false)} />
      )}

      {showEditForm && (
        <AreaForm
          initial={area}
          onSave={handleEditArea}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}
