import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Area, AreaLog, NewAreaLog } from '../types/areas'
import { getAreas } from '../skills/getAreas'
import { getAreaLogs } from '../skills/getAreaLogs'
import { createAreaLog } from '../skills/createAreaLog'
import AreaLogItem from '../components/AreaLogItem'
import AreaLogModal from '../components/AreaLogModal'
import './AreaDetailPage.css'

export default function AreaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [area, setArea] = useState<Area | null>(null)
  const [logs, setLogs] = useState<AreaLog[]>([])
  const [showLogModal, setShowLogModal] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!id) return
    const [allAreas, areaLogs] = await Promise.all([getAreas(), getAreaLogs(id)])
    setArea(allAreas.find(a => a.id === id) ?? null)
    setLogs(areaLogs)
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleLog = async (log: NewAreaLog) => {
    if (!id) return
    const created = await createAreaLog(id, log)
    setLogs(prev => [created, ...prev])
    setShowLogModal(false)
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
    </div>
  )
}
